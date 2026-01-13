import { prisma } from '../../config/prisma';
import { HttpError } from '../../middlewares/errorHandler';
import { generateSessionSet, type CermatMode } from '../../utils/cermat';

const DEFAULT_CONFIG = {
  questionCount: 60,
  durationSeconds: 60,
  totalSessions: 10,
  breakSeconds: 5,
};

async function getCermatConfig() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ['cermat_question_count', 'cermat_duration_seconds', 'cermat_total_sessions', 'cermat_break_seconds'] } },
  });
  const map = settings.reduce<Record<string, string>>((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});
  return {
    questionCount: Number(map.cermat_question_count || DEFAULT_CONFIG.questionCount),
    durationSeconds: Number(map.cermat_duration_seconds || DEFAULT_CONFIG.durationSeconds),
    totalSessions: Number(map.cermat_total_sessions || DEFAULT_CONFIG.totalSessions),
    breakSeconds: Number(map.cermat_break_seconds || DEFAULT_CONFIG.breakSeconds),
  };
}

async function createSession({
  userId,
  attemptId,
  sessionIndex,
  questionCount,
  durationSeconds,
  mode,
}: {
  userId: string;
  attemptId?: string | null;
  sessionIndex: number;
  questionCount: number;
  durationSeconds: number;
  mode: CermatMode;
}) {
  const generated = generateSessionSet(questionCount, mode);
  const session = await prisma.cermatSession.create({
    data: {
      userId,
      attemptId: attemptId ?? null,
      sessionIndex,
      totalQuestions: questionCount,
      correctCount: 0,
      durationSeconds,
      baseSet: JSON.stringify(generated.baseSet),
      mode,
    },
  });

  await prisma.cermatAnswer.createMany({
    data: generated.questions.map((item, idx) => ({
      sessionId: session.id,
      order: idx,
      sequence: JSON.stringify(item.sequence),
      correctAnswer: item.answer,
      userAnswer: null,
      isCorrect: false,
    })),
  });

  return {
    sessionId: session.id,
    baseSet: generated.baseSet,
    mode,
    questions: generated.questions.map((item, idx) => ({
      order: idx,
      sequence: item.sequence,
    })),
    timerSeconds: durationSeconds,
  };
}

export async function startCermatSession(userId: string, mode: CermatMode) {
  const config = await getCermatConfig();
  const attempt = await prisma.cermatAttempt.create({
    data: {
      userId,
      mode,
      totalSessions: config.totalSessions,
      questionCount: config.questionCount,
      durationSeconds: config.durationSeconds,
      breakSeconds: config.breakSeconds,
    },
  });
  const session = await createSession({
    userId,
    attemptId: attempt.id,
    sessionIndex: 1,
    questionCount: config.questionCount,
    durationSeconds: config.durationSeconds,
    mode,
  });
  return {
    attemptId: attempt.id,
    sessionIndex: 1,
    totalSessions: config.totalSessions,
    breakSeconds: config.breakSeconds,
    questionCount: config.questionCount,
    ...session,
  };
}

export async function submitCermatSession(
  userId: string,
  sessionId: string,
  answers: Array<{ order: number; value: string | null }>,
) {
  const session = await prisma.cermatSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) {
    throw new HttpError('Sesi tidak ditemukan', 404);
  }

  const storedAnswers = await prisma.cermatAnswer.findMany({ where: { sessionId }, orderBy: { order: 'asc' } });

  const updates = storedAnswers.map((question) => {
    const answer = answers.find((item) => item.order === question.order);
    const value = typeof answer?.value === 'string' ? answer.value : null;
    const isCorrect = value !== null && value === question.correctAnswer;
    return {
      id: question.id,
      data: {
        userAnswer: value,
        isCorrect,
      },
      isCorrect,
    };
  });

  const correctCount = updates.filter((item) => item.isCorrect).length;
  const score = Math.round((correctCount / session.totalQuestions) * 100);
  let category = 'Cukup';
  if (score >= 85) category = 'Sangat Baik';
  else if (score >= 70) category = 'Baik';

  await prisma.$transaction([
    ...updates.map((update) =>
      prisma.cermatAnswer.update({ where: { id: update.id }, data: update.data }),
    ),
    prisma.cermatSession.update({
      where: { id: sessionId },
      data: { correctCount, score, finishedAt: new Date() },
    }),
  ]);

  if (!session.attemptId) {
    return {
      completed: true,
      summary: {
        averageScore: score,
        totalCorrect: correctCount,
        totalQuestions: session.totalQuestions,
        sessions: [
          {
            sessionIndex: session.sessionIndex ?? 1,
            score,
            correct: correctCount,
            total: session.totalQuestions,
            category,
          },
        ],
      },
    };
  }

  const attempt = await prisma.cermatAttempt.findUnique({ where: { id: session.attemptId } });
  if (!attempt) {
    throw new HttpError('Sesi tidak ditemukan', 404);
  }

  if (session.sessionIndex < attempt.totalSessions) {
    const nextSessionIndex = session.sessionIndex + 1;
    const nextSession = await createSession({
      userId,
      attemptId: attempt.id,
      sessionIndex: nextSessionIndex,
      questionCount: attempt.questionCount,
      durationSeconds: attempt.durationSeconds,
      mode: attempt.mode,
    });

    return {
      completed: false,
      sessionSummary: {
        sessionIndex: session.sessionIndex,
        score,
        correct: correctCount,
        total: session.totalQuestions,
        category,
      },
      nextSession: {
        attemptId: attempt.id,
        sessionIndex: nextSessionIndex,
        totalSessions: attempt.totalSessions,
        breakSeconds: attempt.breakSeconds,
        questionCount: attempt.questionCount,
        ...nextSession,
      },
    };
  }

  const sessions = await prisma.cermatSession.findMany({
    where: { attemptId: attempt.id },
    orderBy: { sessionIndex: 'asc' },
  });
  const totalCorrect = sessions.reduce((acc, item) => acc + item.correctCount, 0);
  const totalQuestions = sessions.reduce((acc, item) => acc + item.totalQuestions, 0);
  const averageScore =
    sessions.length === 0 ? 0 : Math.round((sessions.reduce((acc, item) => acc + (item.score ?? 0), 0) / sessions.length) * 100) / 100;

  await prisma.cermatAttempt.update({
    where: { id: attempt.id },
    data: {
      finishedAt: new Date(),
      averageScore,
      totalAnswered: totalCorrect,
    },
  });

  return {
    completed: true,
    summary: {
      averageScore,
      totalCorrect,
      totalQuestions,
      sessions: sessions.map((item) => ({
        sessionIndex: item.sessionIndex,
        score: item.score ?? 0,
        correct: item.correctCount,
        total: item.totalQuestions,
      })),
    },
  };
}

export async function getCermatHistory(userId: string) {
  return prisma.cermatSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      mode: true,
      sessionIndex: true,
      totalQuestions: true,
      correctCount: true,
      score: true,
      finishedAt: true,
      createdAt: true,
    },
  });
}
