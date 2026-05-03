import React from 'react';

// Tag pill used everywhere a `#topic` is rendered. `interactive` styles
// it as a clickable filter chip; otherwise it's display-only.
const Tag = ({
  children,
  active = false,
  interactive = false,
  onClick,
  className = '',
  size = 'sm',
  ...rest
}) => {
  const base =
    'inline-flex items-center gap-1 rounded-full font-semibold leading-none transition-all duration-200';
  const sizing =
    size === 'xs'
      ? 'px-2.5 py-[3px] text-[10px]'
      : size === 'md'
        ? 'px-3.5 py-[5px] text-xs'
        : 'px-3 py-1 text-[11px]';

  const palette = active
    ? 'bg-gradient-to-r from-cyan-400/15 to-teal-400/10 text-[var(--cmty-active-text)] ring-1 ring-cyan-400/40 shadow-sm shadow-cyan-900/10'
    : interactive
      ? 'bg-[var(--cmty-input-bg)] text-[var(--color-text-secondary)] ring-1 ring-[var(--cmty-input-ring)] hover:bg-[var(--cmty-card-bg-hover)] hover:ring-cyan-400/30 hover:text-[var(--cmty-active-text)] hover:shadow-sm hover:shadow-cyan-900/5'
      : 'bg-[var(--cmty-card-bg)] text-[var(--color-text-secondary)] ring-1 ring-[var(--cmty-card-ring)]';

  const Component = interactive ? 'button' : 'span';

  return (
    <Component
      type={interactive ? 'button' : undefined}
      onClick={interactive ? onClick : undefined}
      className={`${base} ${sizing} ${palette} ${interactive ? 'cursor-pointer' : ''} ${className}`}
      {...rest}
    >
      <span className="text-cyan-500/70 dark:text-cyan-300/60">#</span>
      <span className="lowercase tracking-wide">{children}</span>
    </Component>
  );
};

export default Tag;
