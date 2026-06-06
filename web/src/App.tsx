import { useState, useEffect, useCallback } from 'react';
import { GameShell, GameTopbar, GameAuth } from '@freegamestore/games';
import { ThemeToggle } from './components/ThemeToggle';
import { CategoryCard } from './components/CategoryCard';
import { HintCard } from './components/HintCard';
import { Keyboard } from './components/Keyboard';
import { ScoreBoard } from './components/ScoreBoard';
import { words, categories, type Word, type Category, type CategoryId } from './data/words';

const MAX_GUESSES = 6;
type GameState = 'menu' | 'playing' | 'won' | 'lost';

type Stats = {
  highScore: number;
  totalGames: number;
  wins: number;
  lastCategory: CategoryId | null;
  progress: Record<string, { played: number; wins: number }>;
};

const defaultStats: Stats = {
  highScore: 0,
  totalGames: 0,
  wins: 0,
  lastCategory: null,
  progress: {},
};

export default function App() {
  const [stats, setStats] = useState<Stats>(() => {
    if (typeof window === 'undefined') return defaultStats;
    try {
      const item = window.localStorage.getItem('wordguess-stats');
      return item ? (JSON.parse(item) as Stats) : defaultStats;
    } catch {
      return defaultStats;
    }
  });

  useEffect(() => {
    window.localStorage.setItem('wordguess-stats', JSON.stringify(stats));
  }, [stats]);

  const [gameState, setGameState] = useState<GameState>('menu');
  const [category, setCategory] = useState<Category | null>(null);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [score, setScore] = useState(0);
  const [search, setSearch] = useState('');

  const getCategoryWords = (catId: CategoryId) => words.filter(w => w.category === catId);

  const startCategory = (cat: Category) => {
    setCategory(cat);
    setScore(0);
    nextWord(cat.id);
  };

  const nextWord = (catId: CategoryId) => {
    const catWords = getCategoryWords(catId);
    const randomWord = catWords[Math.floor(Math.random() * catWords.length)];
    if (randomWord) {
      setCurrentWord(randomWord);
      setGuessedLetters([]);
      setWrongGuesses(0);
      setGameState('playing');
    }
  };

  const handleKeyPress = useCallback((key: string) => {
    if (gameState !== 'playing' || !currentWord) return;
    
    const letter = key.toUpperCase();
    if (guessedLetters.includes(letter)) return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    const wordLetters = currentWord.word.toUpperCase();
    const currentCategory = currentWord.category;

    if (!wordLetters.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      if (newWrongGuesses >= MAX_GUESSES) {
        setGameState('lost');
        setStats(prev => ({
          ...prev,
          totalGames: prev.totalGames + 1,
          lastCategory: currentCategory,
          progress: {
            ...prev.progress,
            [currentCategory]: {
              played: (prev.progress[currentCategory]?.played || 0) + 1,
              wins: prev.progress[currentCategory]?.wins || 0
            }
          }
        }));
      }
    } else {
      const wordLettersArray = wordLetters.replace(/[^A-Z]/g, '').split('');
      const isWon = wordLettersArray.every(l => newGuessedLetters.includes(l));
      if (isWon) {
        setGameState('won');
        const points = 100 + ((MAX_GUESSES - wrongGuesses) * 20);
        const newScore = score + points;
        setScore(newScore);
        setStats(prev => ({
          ...prev,
          highScore: Math.max(prev.highScore, newScore),
          totalGames: prev.totalGames + 1,
          wins: prev.wins + 1,
          lastCategory: currentCategory,
          progress: {
            ...prev.progress,
            [currentCategory]: {
              played: (prev.progress[currentCategory]?.played || 0) + 1,
              wins: (prev.progress[currentCategory]?.wins || 0) + 1
            }
          }
        }));
      }
    }
  }, [currentWord, gameState, guessedLetters, wrongGuesses, score]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.match(/^[a-z]$/i)) {
        handleKeyPress(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  
  const bestCategory = Object.entries(stats.progress).reduce((best, [catId, p]) => {
    return p.wins > best.wins ? { id: catId as CategoryId, wins: p.wins } : best;
  }, { id: 'None' as string, wins: -1 });

  const renderWord = () => {
    if (!currentWord) return null;
    return (
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
        {currentWord.word.toUpperCase().split('').map((char, index) => {
          const isLetter = /[A-Z]/.test(char);
          const isGuessed = !isLetter || guessedLetters.includes(char) || gameState === 'lost' || gameState === 'won';
          const isLostReveal = gameState === 'lost' && isLetter && !guessedLetters.includes(char);

          return (
            <div key={index} className={`w-10 h-14 sm:w-14 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl font-bold rounded-xl border-2 transition-colors
                ${isLetter ? (isGuessed ? 'bg-[var(--bg)] border-[var(--accent)] text-[var(--ink)] shadow-md' : 'bg-[var(--wg-card)] border-[var(--border)] text-transparent') : 'border-transparent text-[var(--ink)] w-4'}
                ${isLostReveal ? 'text-[var(--error)] border-[var(--error)] bg-red-500/10' : ''}
              `}>
              {isGuessed ? char : (isLetter ? '_' : char)}
            </div>
          );
        })}
      </div>
    );
  };

  const appContent = (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 flex flex-col pt-safe">
      <header className="mb-8 text-center relative">
        <h1 className="text-4xl md:text-5xl font-['Fraunces'] font-black text-[var(--ink)] tracking-tight">Word<span className="text-[var(--accent)]">Guess</span></h1>
        {gameState === 'menu' && <p className="mt-3 text-[var(--muted)] font-medium text-lg">Choose a category to start playing</p>}
      </header>

          {gameState === 'menu' ? (
            <>
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 px-2">
                <div className="flex gap-4 items-center w-full md:w-auto">
                  <div className="bg-[var(--surface)] px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-bold shadow-sm flex gap-4">
                    <span className="text-[var(--muted)]">Best: <span className="text-[var(--accent)]">{stats.highScore}</span></span>
                    <span className="text-[var(--muted)]">Wins: <span className="text-[var(--ink)]">{stats.wins}</span></span>
                    <span className="text-[var(--muted)] hidden sm:inline">Fav: <span className="text-[var(--ink)]">{bestCategory.id}</span></span>
                  </div>
                  
                  <button 
                    onClick={() => {
                      const randomCat = categories[Math.floor(Math.random() * categories.length)];
                      if (randomCat) startCategory(randomCat);
                    }}
                    className="bg-[var(--accent)] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
                  >
                    🎲 Random
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full md:w-64 px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--ink)] shadow-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8 animate-fade-in-up">
                {filteredCategories.map(cat => (
                  <CategoryCard key={cat.id} category={cat} wordCount={getCategoryWords(cat.id).length} progress={stats.progress[cat.id]} onClick={() => startCategory(cat)} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto relative z-10 animate-fade-in">
              <ScoreBoard score={score} highScore={stats.highScore} wrong={wrongGuesses} maxWrong={MAX_GUESSES} />
              
              {currentWord && <HintCard hint={currentWord.hint} emoji={currentWord.emoji} />}

              {renderWord()}
              
              {(gameState === 'won' || gameState === 'lost') && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[var(--ink)]/40 backdrop-blur-sm rounded-3xl">
                  <div className="bg-[var(--bg)] border border-[var(--border)] p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center flex flex-col items-center animate-pop-in">
                    <div className="text-7xl mb-4">{gameState === 'won' ? '🎉' : '💀'}</div>
                    <h2 className={`text-3xl font-black mb-2 tracking-tight ${gameState === 'won' ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                      {gameState === 'won' ? 'Incredible!' : 'Game Over'}
                    </h2>
                    <p className="text-[var(--muted)] font-medium mb-8 text-lg">
                      The word was <br /> <strong className="text-[var(--ink)] text-2xl tracking-widest block mt-2 p-2 bg-[var(--surface)] rounded-xl border border-[var(--border)]">{currentWord?.word.toUpperCase()}</strong>
                    </p>
                    <div className="flex flex-col gap-3 w-full">
                      <button onClick={() => category && nextWord(category.id)} className="w-full py-4 rounded-2xl font-bold text-lg bg-[var(--accent)] text-white hover:opacity-90 active:scale-95 transition-transform">
                        {gameState === 'won' ? 'Next Word' : 'Try Again'}
                      </button>
                      <button onClick={() => setGameState('menu')} className="w-full py-4 rounded-2xl font-bold text-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--wg-card-strong)] active:scale-95 transition-all">
                        Change Category
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-auto pt-6">
                <Keyboard guessed={guessedLetters} word={currentWord?.word.toUpperCase() || ''} onGuess={handleKeyPress} disabled={gameState !== 'playing'} />
              </div>
            </div>
          )}
        </div>
  );

  return (
    <GameShell topbar={<GameTopbar title="WordGuess" score={gameState !== 'menu' ? score : undefined} actions={<ThemeToggle />} />}>
      <GameAuth />
      <div className="h-full w-full overflow-y-auto overflow-x-hidden selection:bg-[var(--accent)] selection:text-white pb-safe bg-[var(--bg)] text-[var(--ink)] transition-colors duration-300">
        <div className="min-h-full flex flex-col relative">
          {appContent}
          {gameState === 'menu' && (
            <footer className="text-center py-6 mt-auto">
              <a
                href="https://freegamestore.online"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--muted)] text-sm font-medium hover:text-[var(--accent)] transition-colors"
              >
                Built for FreeGameStore by Kiran tikoo
              </a>
            </footer>
          )}
        </div>
      </div>
    </GameShell>
  );
}