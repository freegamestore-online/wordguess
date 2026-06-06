

interface Props {
  score: number;
  highScore: number;
  wrong: number;
  maxWrong: number;
}

export function ScoreBoard({ score, highScore, wrong, maxWrong }: Props) {
  const hearts = Array.from({ length: maxWrong }).map((_, i) => i < maxWrong - wrong);

  return (
    <div className="flex items-center justify-between p-4 px-6 mb-6 rounded-2xl bg-[var(--glass)] border border-[var(--border)] shadow-sm w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[var(--accent)] to-blue-500 opacity-50" />
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wider font-bold text-[var(--muted)]">High Score</span>
        <span className="text-xl sm:text-2xl font-black text-[var(--accent)]">{highScore}</span>
      </div>
      <div className="flex gap-1 items-center justify-center">
        {hearts.map((alive, i) => (
          <span key={i} className={`text-lg sm:text-xl transition-all duration-500 transform ${alive ? 'opacity-100 scale-100 drop-shadow-md text-red-500' : 'opacity-20 scale-75 grayscale'}`}>❤️</span>
        ))}
      </div>
      <div className="flex flex-col text-right">
        <span className="text-xs uppercase tracking-wider font-bold text-[var(--muted)]">Score</span>
        <span className="text-xl sm:text-2xl font-black text-[var(--ink)]">{score}</span>
      </div>
    </div>
  );
}