// Inline SVG icons for the community feature. We keep these inline (and
// do NOT pull in a third-party icon set) because the rest of the app
// already ships its own iconography and adding a 200KB icon package for
// ~12 glyphs would dominate this route's bundle.
//
// All icons accept the standard SVG props so callers can pass
// `className`, `width`, `height`, `style`, etc. They default to
// `width=18 height=18` and inherit currentColor.
import React from 'react';

const Base = ({ children, size = 18, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
);

export const PlusIcon = (props) => (
  <Base {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Base>
);

export const SearchIcon = (props) => (
  <Base {...props}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Base>
);

export const PinIcon = (props) => (
  <Base {...props}>
    <path d="M12 17v5" />
    <path d="M6 3h12" />
    <path d="M8 3v4l-3 4v2h14v-2l-3-4V3" />
  </Base>
);

export const ImageIcon = (props) => (
  <Base {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </Base>
);

export const VideoIcon = (props) => (
  <Base {...props}>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </Base>
);

export const BookmarkIcon = (props) => (
  <Base {...props}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </Base>
);

export const ThumbUpIcon = (props) => (
  <Base {...props}>
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.66l1.38-9A2 2 0 0 0 19.69 9H14Z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </Base>
);

export const ThumbDownIcon = (props) => (
  <Base {...props}>
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.66l-1.38 9A2 2 0 0 0 4.31 15H10Z" />
    <path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
  </Base>
);

export const ThreeDotsIcon = (props) => (
  <Base {...props}>
    <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </Base>
);

export const CheckIcon = (props) => (
  <Base {...props}>
    <polyline points="20 6 9 17 4 12" />
  </Base>
);

export const MessageIcon = (props) => (
  <Base {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Base>
);

export const EyeIcon = (props) => (
  <Base {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);

export const SparkleIcon = (props) => (
  <Base {...props}>
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
  </Base>
);

export const TrendingIcon = (props) => (
  <Base {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </Base>
);

export const FilterIcon = (props) => (
  <Base {...props}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </Base>
);

export const CodeIcon = (props) => (
  <Base {...props}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </Base>
);

export const ArrowLeftIcon = (props) => (
  <Base {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </Base>
);

export const ShareIcon = (props) => (
  <Base {...props}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </Base>
);

export const CornerReplyIcon = (props) => (
  <Base {...props}>
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </Base>
);

export const ChevronDownIcon = (props) => (
  <Base {...props}>
    <polyline points="6 9 12 15 18 9" />
  </Base>
);
