import type { Category } from '../data/words';

interface Props {
  category: Category;
  wordCount: number;
  progress?: { played: number; wins: number };
  onClick: () => void;
}

export function CategoryCard({ category, wordCount, progress, onClick }: Props) {
  const diffColors = {
    Easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center p-6 w-full rounded-3xl border border-[var(--border)] bg-[var(--glass)] shadow-sm transition-all hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-md active:scale-95 group focus:outline-none"
    >
      <div className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-lg ${diffColors[category.difficulty]}`}>
        {category.difficulty}
      </div>
      
      <div className="text-6xl sm:text-7xl mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm mt-4">
        {category.emoji}
      </div>
      <h3 className="text-xl font-black text-[var(--ink)] mb-1 tracking-wide font-sans">{category.name}</h3>
      <p className="text-xs text-[var(--muted)] font-medium mb-4 text-center px-2">{category.description}</p>
      
      <div className="flex gap-2 w-full justify-center text-xs font-bold">
        <span className="px-3 py-1.5 rounded-full bg-[var(--surface)] text-[var(--ink)] border border-[var(--border)]">
          {wordCount} Words
        </span>
        {progress && progress.played > 0 && (
          <span className="px-3 py-1.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20">
            {progress.wins} / {progress.played} Won
          </span>
        )}
      </div>
    </button>
  );
}