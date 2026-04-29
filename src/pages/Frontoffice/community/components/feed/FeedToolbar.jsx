import React from 'react';
import { BookmarkIcon, FilterIcon, SearchIcon, ChevronDownIcon } from '../shared/icons';

// Premium filter row above the feed list with glowing search focus states,
// refined select dropdowns, and gradient-accented filter buttons.
const FeedToolbar = ({
  searchTerm,
  onSearchChange,
  sortOrder,
  onSortChange,
  selectedTag,
  onTagChange,
  availableTags = [],
  showSavedOnly = false,
  onToggleSavedOnly,
  totalShown,
  totalAvailable,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--cmty-card-ring)] bg-[var(--cmty-card-bg)] p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="relative min-w-[16rem] flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <SearchIcon size={16} className="text-[var(--cmty-text-subtle)]" />
        </div>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search posts..."
          className="block h-11 w-full rounded-lg border border-[var(--cmty-card-ring)] bg-[var(--color-bg-secondary)] py-2 pl-10 pr-10 text-sm font-medium text-[var(--color-text-heading)] shadow-inner outline-none transition placeholder:text-[var(--cmty-text-subtle)] hover:border-cyan-400/35 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          aria-label="Search posts"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--cmty-text-subtle)] transition-colors hover:text-rose-400"
          >
            <span className="sr-only">Clear search</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[10rem]">
          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-[var(--cmty-card-ring)] bg-[var(--color-bg-secondary)] py-2 pl-3.5 pr-10 text-sm font-semibold text-[var(--color-text-secondary)] outline-none transition hover:border-cyan-400/35 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            aria-label="Sort posts"
          >
            <option value="recent">Most recent</option>
            <option value="liked">Most liked</option>
            <option value="commented">Most commented</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
            <ChevronDownIcon size={16} className="text-[var(--cmty-text-subtle)]" />
          </div>
        </div>

        <div className="relative min-w-[9rem]">
          <select
            value={selectedTag}
            onChange={(e) => onTagChange(e.target.value)}
            className="h-11 w-full max-w-[180px] cursor-pointer appearance-none rounded-lg border border-[var(--cmty-card-ring)] bg-[var(--color-bg-secondary)] py-2 pl-3.5 pr-10 text-sm font-semibold text-[var(--color-text-secondary)] outline-none transition hover:border-cyan-400/35 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            aria-label="Filter by tag"
          >
            <option value="all">All tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
            <ChevronDownIcon size={16} className="text-[var(--cmty-text-subtle)]" />
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleSavedOnly}
          aria-pressed={showSavedOnly}
          className={`inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-all duration-200 ${
            showSavedOnly
              ? 'border-cyan-400 bg-cyan-400 text-slate-950 shadow-md shadow-cyan-950/20'
              : 'border-[var(--cmty-card-ring)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:border-cyan-400/45 hover:text-[var(--cmty-active-text)]'
          }`}
        >
          <BookmarkIcon size={14} className={showSavedOnly ? 'fill-current' : ''} />
          <span>Saved</span>
        </button>
      </div>

      {(typeof totalShown === 'number' || typeof totalAvailable === 'number') && (
        <div className="inline-flex h-9 items-center rounded-lg border border-[var(--cmty-card-ring)] bg-[var(--color-bg-secondary)] px-3 text-xs font-semibold text-[var(--cmty-text-subtle)] lg:ml-auto">
          {typeof totalShown === 'number' && typeof totalAvailable === 'number'
            ? `${totalShown} of ${totalAvailable} posts`
            : totalShown ?? totalAvailable}
        </div>
      )}
    </div>
  );
};

export default FeedToolbar;
