

interface Props {
  hint: string;
  emoji: string;
}

export function HintCard({ hint, emoji }: Props) {
  return (
    <div className="mb-6 w-full animate-fade-in-up">
      <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-[var(--glass)] border border-[var(--border)] shadow-sm">
        <div className="text-5xl mb-3 drop-shadow-md">{emoji}</div>
        <p className="text-center font-bold text-lg md:text-xl text-[var(--ink)] max-w-md">Hint: {hint}</p>
      </div>
    </div>
  );
}