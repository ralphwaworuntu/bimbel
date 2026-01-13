import { Button } from '@/components/ui/button';

type QuestionNavigatorProps = {
  questions: Array<{ id: string }>;
  answers: Record<string, string | undefined>;
  activeIndex: number;
  onJump: (index: number) => void;
};

export function QuestionNavigator({ questions, answers, activeIndex, onJump }: QuestionNavigatorProps) {
  if (!questions.length) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">Navigasi Soal</p>
        <span className="text-xs text-slate-500">{questions.length} nomor</span>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-6">
        {questions.map((question, index) => {
          const answered = Boolean(answers[question.id]);
          const active = index === activeIndex;
          const baseClass = 'h-10 rounded-2xl border text-sm font-semibold transition-colors';
          const variantClass = active
            ? 'border-brand-500 bg-brand-500 text-white shadow-inner'
            : answered
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300';
          return (
            <Button
              key={question.id}
              type="button"
              variant="ghost"
              className={`${baseClass} ${variantClass}`}
              onClick={() => onJump(index)}
            >
              {index + 1}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
