import React from 'react';
import { Avatar } from '@chakra-ui/react';
import { toMediaUrl } from '../../utils/media';

// Right-rail card summarising community size and showing the most active
// authors. Premium glassmorphism design with gradient accents.
const StatRow = ({ label, value, accent }) => (
  <div className="flex items-center justify-between py-2 px-2 -mx-2 rounded-lg hover:bg-[var(--cmty-card-bg)] transition-colors duration-150 group">
    <span className="text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] transition-colors">{label}</span>
    <span
      className={`text-sm font-bold tabular-nums ${
        accent
          ? 'bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-200 dark:to-teal-200 bg-clip-text text-transparent'
          : 'text-[var(--color-text-heading)]'
      }`}
    >
      {value}
    </span>
  </div>
);

const CommunityStats = ({
  totalPosts = 0,
  totalDiscussions = 0,
  totalProblems = 0,
  totalSolved = 0,
  totalContributors = 0,
  topContributors = [],
}) => {
  const solvedPct =
    totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  return (
    <aside className="rounded-2xl bg-[var(--cmty-card-bg)] ring-1 ring-[var(--cmty-card-ring)] p-5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/[0.04] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <h4 className="relative text-[11px] uppercase tracking-[0.15em] text-[var(--color-text-secondary)] font-bold mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400" />
        Community pulse
      </h4>
      <div className="relative divide-y divide-[var(--cmty-card-ring)]">
        <StatRow label="Total posts" value={totalPosts} />
        <StatRow label="Discussions" value={totalDiscussions} />
        <StatRow label="Problems" value={totalProblems} />
        <StatRow label="Solved" value={`${solvedPct}%`} accent />
        <StatRow label="Contributors" value={totalContributors} />
      </div>

      {topContributors.length > 0 && (
        <div className="relative mt-4 pt-4 border-t border-[var(--cmty-card-ring)]">
          <h5 className="text-[10px] uppercase tracking-[0.12em] text-[var(--cmty-text-subtle)] font-bold mb-3 flex items-center gap-1.5">
            <span className="text-cyan-500/70 dark:text-cyan-400/60">★</span>
            Top contributors
          </h5>
          <ul className="space-y-2.5">
            {topContributors.slice(0, 5).map((c, i) => (
              <li
                key={c.id}
                className="flex items-center gap-2.5 min-w-0 group/row cursor-default"
                title={`${c.username} · ${c.posts} posts`}
              >
                <div className={`relative ${i === 0 ? 'ring-1 ring-cyan-400/30 rounded-full p-[1px]' : ''}`}>
                  <Avatar
                    size="xs"
                    name={c.username}
                    src={c.avatar ? toMediaUrl(c.avatar) : undefined}
                    className={`${i === 0 ? 'ring-0' : ''}`}
                  />
                  {i === 0 && (
                    <span className="absolute -top-1 -right-1 text-[9px] leading-none">
                      🏆
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-[var(--color-text-secondary)] truncate flex-1 group-hover/row:text-[var(--cmty-active-text)] transition-colors">
                  {c.username}
                </span>
                <span className="text-[10px] font-bold text-[var(--cmty-text-subtle)] bg-[var(--cmty-pill-bg)] px-1.5 py-0.5 rounded-full tabular-nums group-hover/row:bg-cyan-400/10 group-hover/row:text-[var(--cmty-active-text)] transition-all">
                  {c.posts}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
};

export default CommunityStats;
