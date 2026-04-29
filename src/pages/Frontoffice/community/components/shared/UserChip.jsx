import React from 'react';
import { Avatar } from '@chakra-ui/react';
import { relativeTime } from '../../utils/relativeTime';
import { toMediaUrl } from '../../utils/media';

// Premium author + timestamp chip with gradient avatar ring and refined
// typography. Used in post rows, comment headers, and notifications.
const UserChip = ({
  authorUsername,
  authorAvatar,
  createdAt,
  size = 'sm',
  showTime = true,
  className = '',
}) => {
  const avatarSize = size === 'md' ? '2rem' : size === 'lg' ? '2.5rem' : '1.5rem';
  const username = String(authorUsername || 'unknown');

  return (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      <div className="relative shrink-0">
        <div className="absolute -inset-[2px] rounded-full bg-gradient-to-br from-cyan-400/20 to-teal-400/10" />
        <Avatar
          name={username}
          src={authorAvatar ? toMediaUrl(authorAvatar) : undefined}
          boxSize={avatarSize}
          className="relative"
        />
      </div>
      <div className="flex flex-col min-w-0 leading-tight">
        <span
          className="text-[12px] font-semibold text-[var(--color-text-heading)] truncate hover:text-[var(--cmty-active-text)] transition-colors"
          title={username}
        >
          {username}
        </span>
        {showTime && createdAt && (
          <span className="text-[10.5px] font-medium text-[var(--cmty-text-subtle)] tracking-wide">
            {relativeTime(createdAt)}
          </span>
        )}
      </div>
    </div>
  );
};

export default UserChip;
