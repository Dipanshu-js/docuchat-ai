"use client";

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (q: string) => void;
  loading: boolean;
}

export function SuggestedQuestions({
  questions,
  onSelect,
  loading,
}: SuggestedQuestionsProps) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-2 px-4 pb-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-8 rounded-full bg-zinc-800 animate-pulse"
            style={{ width: `${120 + i * 30}px` }}
          />
        ))}
      </div>
    );
  }

  if (!questions.length) return null;

  return (
    <div className="px-4 pb-3">
      <p className="text-zinc-600 text-xs mb-2">Suggested questions</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="text-xs bg-zinc-800/80 hover:bg-violet-900/40 border border-zinc-700
                       hover:border-violet-600 text-zinc-300 hover:text-violet-300
                       px-3 py-1.5 rounded-full transition-all text-left"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
