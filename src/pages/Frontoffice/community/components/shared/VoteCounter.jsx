import React from 'react';

// Three-stat block on the left of every post row in the SO-style feed.
// Redesigned with premium glassmorphism cards, gradient accents, and
// refined typography to match the upgraded feed aesthetic.
const Stat = ({ value, label, accent = false }) => (
  <div
    className={`flex flex-col items-center justify-center min-w-[3.5rem] py-2 px-2 rounded-xl transition-all duration-200 ${
      accent
        ? 'bg-gradient-to-b from-emerald-400/15 to-emerald-500/5 text-emerald-700 dark:text-emerald-200 ring-1 ring-emerald-400/30 shadow-lg shadow-emerald-900/10'
        : 'bg-[var(--cmty-stat-bg)] text-[var(--color-text-muted)] hover:bg-[var(--cmty-stat-bg-hover)]'
    }`}
  >
    <span
      className={`text-sm font-bold leading-none tabular-nums ${
        accent ? 'text-emerald-700 dark:text-emerald-100' : 'text-[var(--color-text-heading)]'
      }`}
    >
      {Number.isFinite(value) ? value : 0}
    </span>
    <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
      {label}
    </span>
  </div>
);

const VoteCounter = ({
  votes = 0,
  answers = 0,
  views,
  isSolved = false,
  className = '',
}) => (
  <div className={`flex flex-row md:flex-col gap-2 ${className}`}>
    <Stat value={votes} label="votes" />
    <Stat value={answers} label="answers" accent={isSolved && answers > 0} />
    {Number.isFinite(views) && <Stat value={views} label="views" />}
  </div>
);

export default VoteCounter;
