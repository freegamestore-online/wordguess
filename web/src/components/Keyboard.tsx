

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

interface Props {
  guessed: string[];
  word: string;
  onGuess: (char: string) => void;
  disabled: boolean;
}

export function Keyboard({ guessed, word, onGuess, disabled }: Props) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-2xl mx-auto z-10 relative">
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1 sm:gap-2">
          {row.map((key) => {
            const isGuessed = guessed.includes(key);
            const isCorrect = isGuessed && word.includes(key);
            const isWrong = isGuessed && !word.includes(key);

            let bgClass = "bg-[var(--surface)] text-[var(--ink)] border-[var(--border)] hover:bg-[var(--line)]";
            if (isCorrect) bgClass = "bg-green-500 text-white border-green-600 shadow-[0_4px_14px_rgba(34,197,94,0.4)]";
            if (isWrong) bgClass = "bg-red-500 text-white border-red-600 opacity-60";

            return (
              <button key={key} onClick={() => onGuess(key)} disabled={disabled || isGuessed} className={`flex-1 h-12 sm:h-14 min-w-[2rem] sm:min-w-[2.75rem] rounded-xl border-b-4 font-black text-lg sm:text-xl transition-all duration-150 active:border-b-0 active:translate-y-1 focus:outline-none ${bgClass}`}>
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}