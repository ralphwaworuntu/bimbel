export type CermatMode = 'NUMBER' | 'LETTER';

export type CermatQuestion = {
  sequence: string[];
  answer: string;
};

function shuffleArray<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = next[i]!;
    next[i] = next[j]!;
    next[j] = temp;
  }
  return next;
}

const LETTERS = Array.from({ length: 26 }, (_, idx) => String.fromCharCode(65 + idx));

function generateBaseSet(mode: CermatMode) {
  if (mode === 'LETTER') {
    return shuffleArray(LETTERS).slice(0, 5).sort();
  }
  const digits = shuffleArray(Array.from({ length: 10 }, (_, idx) => idx.toString()));
  return digits.slice(0, 5).sort((a, b) => Number(a) - Number(b));
}

export function generateSessionSet(totalQuestions: number, mode: CermatMode) {
  const baseSet = generateBaseSet(mode);
  const questions: CermatQuestion[] = Array.from({ length: totalQuestions }, () => {
    const missing = baseSet[Math.floor(Math.random() * baseSet.length)]!;
    const promptTokens = shuffleArray(baseSet.filter((token) => token !== missing));
    return { sequence: promptTokens, answer: missing } satisfies CermatQuestion;
  });
  return { baseSet, questions };
}
