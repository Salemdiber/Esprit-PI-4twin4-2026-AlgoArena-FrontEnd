import React from 'react';
import { CheckIcon, PinIcon } from './icons';

// Premium status badge used on PostRow / PostHeader. Each variant gets
// a unique gradient treatment with refined glow effects.
const VARIANTS = {
  pinned: {
    label: 'Pinned',
    className: 'bg-gradient-to-r from-cyan-400/15 to-teal-400/10 text-cyan-200 ring-1 ring-cyan-400/35 shadow-sm shadow-cyan-900/10',
    icon: PinIcon,
  },
  solved: {
    label: 'Solved',
    className: 'bg-gradient-to-r from-emerald-400/15 to-green-400/10 text-emerald-200 ring-1 ring-emerald-400/35 shadow-sm shadow-emerald-900/10',
    icon: CheckIcon,
  },
  problem: {
    label: 'Problem',
    className: 'bg-gradient-to-r from-amber-400/15 to-orange-400/10 text-amber-200 ring-1 ring-amber-400/35 shadow-sm shadow-amber-900/10',
  },
  bug: {
    label: 'Bug',
    className: 'bg-gradient-to-r from-rose-400/15 to-red-400/10 text-rose-200 ring-1 ring-rose-400/35 shadow-sm shadow-rose-900/10',
  },
  feature: {
    label: 'Feature',
    className: 'bg-gradient-to-r from-indigo-400/15 to-violet-400/10 text-indigo-200 ring-1 ring-indigo-400/35 shadow-sm shadow-indigo-900/10',
  },
  question: {
    label: 'Question',
    className: 'bg-gradient-to-r from-cyan-400/15 to-blue-400/10 text-cyan-200 ring-1 ring-cyan-400/35 shadow-sm shadow-cyan-900/10',
  },
  discussion: {
    label: 'Discussion',
    className: 'bg-gradient-to-r from-slate-400/10 to-slate-500/5 text-slate-300 ring-1 ring-slate-400/25',
  },
};

const StatusBadge = ({ variant = 'discussion', children, className = '' }) => {
  const meta = VARIANTS[variant] || VARIANTS.discussion;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[10px] font-bold uppercase tracking-[0.08em] ${meta.className} ${className}`}
    >
      {Icon && <Icon size={10} className="opacity-80" />}
      <span>{children || meta.label}</span>
    </span>
  );
};

export default StatusBadge;
