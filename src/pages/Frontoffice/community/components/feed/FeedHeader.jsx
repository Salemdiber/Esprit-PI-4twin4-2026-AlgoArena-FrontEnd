import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { PlusIcon, SparkleIcon, TrendingIcon } from '../shared/icons';

// Top of the feed: brand line, KPI strip, section tabs, primary CTA.
// Redesigned for a more premium, creative look with gradient accents,
// glassmorphism cards, and refined typography.
const SectionTab = ({ active, onClick, count, label, panelId }) => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    aria-controls={panelId}
    onClick={onClick}
    className={`inline-flex h-11 min-w-[9rem] items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-all duration-200 ${
      active
        ? 'border-cyan-400/50 bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/20'
        : 'border-[var(--cmty-card-ring)] bg-[var(--cmty-card-bg)] text-[var(--color-text-secondary)] hover:border-cyan-400/45 hover:bg-[var(--cmty-card-bg-hover)] hover:text-[var(--color-text-heading)]'
    }`}
  >
    <span>{label}</span>
    <span
      className={`inline-flex min-w-6 items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-bold tabular-nums ${
        active ? 'bg-slate-950/15 text-slate-950' : 'bg-[var(--cmty-pill-bg)] text-[var(--cmty-text-subtle)]'
      }`}
    >
      {count}
    </span>
  </button>
);

const Kpi = ({ label, value, accent }) => (
  <div
    className={`group relative flex flex-col px-4 py-3 rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
      accent
        ? 'bg-gradient-to-br from-cyan-500/10 via-cyan-400/5 to-transparent ring-1 ring-cyan-400/30 shadow-lg shadow-cyan-900/10'
        : 'bg-[var(--cmty-card-bg)] ring-1 ring-[var(--cmty-card-ring)] hover:ring-[var(--cmty-card-ring-hover)]'
    }`}
  >
    {accent && (
      <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
    )}
    <span className="relative text-[11px] uppercase tracking-[0.15em] text-[var(--cmty-text-subtle)] font-medium">
      {label}
    </span>
    <span
      className={`relative text-lg font-bold tabular-nums leading-tight mt-1 ${
        accent
          ? 'bg-gradient-to-r from-cyan-500 to-teal-500 dark:from-cyan-200 dark:to-teal-200 bg-clip-text text-transparent'
          : 'text-[var(--color-text-heading)]'
      }`}
    >
      {value}
    </span>
  </div>
);

const FeedHeader = ({
  activeSection,
  onChangeSection,
  sectionCounts = { discussion: 0, problems: 0 },
  kpis = [],
  isAdmin = false,
  isLoggedIn = false,
  onCreate,
}) => {
  return (
    <header className="space-y-6">
      {/* Hero section with gradient backdrop */}
      <div
        className="relative rounded-2xl overflow-hidden ring-1 ring-[var(--cmty-card-ring)] p-6 md:p-8"
        style={{ background: 'var(--cmty-hero-bg)' }}
      >
        {/* Subtle background decoration */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at top right, var(--cmty-hero-glow), transparent 60%)',
          }}
        />
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl"
          style={{ background: 'var(--cmty-hero-glow)' }}
        />
        
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 ring-1 ring-cyan-400/20 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--cmty-active-text)] mb-4">
              <SparkleIcon size={12} className="animate-pulse" />
              <span>AlgoArena Community</span>
            </div>
            <h1 className="text-3xl md:text-[2.75rem] font-extrabold text-[var(--color-text-heading)] leading-[1.1] tracking-tight">
              Talk through the{' '}
              <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 dark:from-cyan-300 dark:via-teal-300 dark:to-emerald-300 bg-clip-text text-transparent">
                hard parts
              </span>
            </h1>
            <p className="mt-3 text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed max-w-lg">
              Ask questions, share solutions, and unblock each other on the
              problems you're working through. Pinned and solved threads stay
              on top.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isAdmin && (
              <RouterLink
                to="/community/dashboard"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--cmty-card-ring)] bg-[var(--cmty-card-bg)] px-4 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:border-cyan-400/45 hover:bg-[var(--cmty-card-bg-hover)] hover:text-[var(--color-text-heading)]"
              >
                <TrendingIcon size={14} />
                Analytics
              </RouterLink>
            )}
            <button
              type="button"
              onClick={onCreate}
              disabled={!isLoggedIn}
              title={isLoggedIn ? 'Create a post' : 'Sign in to create a post'}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-cyan-400 px-4 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/25 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-55"
            >
              <PlusIcon size={14} />
              New Post
            </button>
          </div>
        </div>
      </div>

      {kpis.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kpis.map((k) => (
            <Kpi key={k.label} label={k.label} value={k.value} accent={k.accent} />
          ))}
        </div>
      )}

      <div
        role="tablist"
        aria-label="Community sections"
        className="flex flex-wrap items-center gap-2 border-b border-[var(--cmty-card-ring)] pb-3"
      >
        <SectionTab
          active={activeSection === 'discussion'}
          onClick={() => onChangeSection('discussion')}
          label="Discussion"
          count={sectionCounts.discussion ?? 0}
          panelId="community-feed-panel"
        />
        <SectionTab
          active={activeSection === 'problems'}
          onClick={() => onChangeSection('problems')}
          label="Problems"
          count={sectionCounts.problems ?? 0}
          panelId="community-feed-panel"
        />
      </div>
    </header>
  );
};

export default FeedHeader;
