import { readFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { describe, expect, it } from 'vitest';

const webRoot = join(__dirname, '..');

const read = (file: string) => readFileSync(file, 'utf8');

const srcFiles = readdirSync(join(webRoot, 'src'), { recursive: true })
  .map(String)
  .filter(f => ['.ts', '.tsx', '.css'].includes(extname(f)) && !/\.test\.ts$/.test(f))
  .map(f => join(webRoot, 'src', f));

// Everything a player or the install prompt can see, plus the stylesheets.
const sources = [
  ...srcFiles,
  join(webRoot, 'index.html'),
  join(webRoot, 'vite.config.ts'),
  join(webRoot, '..', 'index.css'),
];

// Display text: the title, manifest, and the UI components. Comments and
// code identifiers (e.g. `wordguess-stats` storage keys) are not checked.
const displaySources = [
  join(webRoot, 'index.html'),
  join(webRoot, 'vite.config.ts'),
  join(webRoot, 'src', 'App.tsx'),
  ...srcFiles.filter(f => f.includes('/components/')),
];

describe('display name', () => {
  it('does not show the Wordle name', () => {
    for (const file of displaySources) {
      expect(read(file), file).not.toMatch(/\bwordle\b/i);
    }
  });

  it('does not show the old WordGuess display name', () => {
    for (const file of displaySources) {
      expect(read(file), file).not.toContain('WordGuess');
    }
  });

  it('uses Five-Letter Word in the page title', () => {
    expect(read(join(webRoot, 'index.html'))).toContain('<title>Five-Letter Word');
  });
});

describe('colours', () => {
  it('has no NYT tile hex colours in the stylesheets or components', () => {
    const nytHexes = ['#6aaa64', '#c9b458', '#787c7e'];
    for (const file of sources) {
      const text = read(file).toLowerCase();
      for (const hex of nytHexes) {
        expect(text, `${hex} in ${file}`).not.toContain(hex);
      }
    }
  });
});
