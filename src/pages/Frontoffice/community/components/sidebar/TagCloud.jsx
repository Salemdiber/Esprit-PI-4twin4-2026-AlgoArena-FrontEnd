import React from 'react';
import Tag from '../shared/Tag';
import { TrendingIcon } from '../shared/icons';

// Right-rail card listing the most-used tags across the loaded posts.
// Premium glassmorphism design with gradient heading and interactive chips.
const TagCloud = ({
  trendingTags = [],
  selectedTag = 'all',
  onSelectTag,
}) => {
  if (!trendingTags.length) return null;

  return (
    <aside className="rounded-2xl bg-[var(--cmty-card-bg)] ring-1 ring-[var(--cmty-card-ring)] p-5 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-teal-500/[0.04] rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      
      <h4 className="relative text-[11px] uppercase tracking-[0.15em] text-[var(--color-text-secondary)] font-bold mb-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400" />
        Trending tags
      </h4>
      <div className="flex flex-wrap gap-2">
        {trendingTags.map(({ tag, count }) => (
          <Tag
            key={tag}
            interactive
            active={selectedTag === tag}
            onClick={() => onSelectTag(selectedTag === tag ? 'all' : tag)}
            size="sm"
          >
            {tag}
            <span className="text-[10px] font-bold opacity-50 ml-0.5 tabular-nums">{count}</span>
          </Tag>
        ))}
      </div>
    </aside>
  );
};

export default TagCloud;
