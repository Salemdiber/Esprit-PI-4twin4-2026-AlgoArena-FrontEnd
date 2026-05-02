import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@chakra-ui/react';
import VoteCounter from '../shared/VoteCounter';
import UserChip from '../shared/UserChip';
import StatusBadge from '../shared/StatusBadge';
import Tag from '../shared/Tag';
import { BookmarkIcon, MessageIcon } from '../shared/icons';
import { countCommentTree } from '../../utils/commentTree';

// One row in the SO/GitHub Discussions style feed.
//
// Layout (desktop):
//   [stats block] [title + excerpt + tags] [author chip + status badges]
// On mobile we stack: badges above title, then title+excerpt+tags, then a
// horizontal row of stats + author at the bottom.
//
// The whole row is keyboard- and mouse-clickable; bookmark button stops
// propagation so saving doesn't navigate.

const buildExcerpt = (content, max = 220) => {
  const raw = String(content || '').replace(/\s+/g, ' ').trim();
  if (!raw) return '';
  return raw.length > max ? `${raw.slice(0, max - 1).trimEnd()}…` : raw;
};

const PostRow = ({
  post,
  reaction,
  isSaved,
  onToggleSave,
}) => {
  const navigate = useNavigate();
  const postId = String(post?._id || '');
  const goToDetail = () => {
    if (!postId) return;
    navigate(`/community/post/${postId}`);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goToDetail();
    }
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    onToggleSave?.(postId);
  };

  const votes = (reaction?.likes || 0) - (reaction?.dislikes || 0);
  const answers = countCommentTree(post?.comments || []);
  const isProblem = post?.type === 'problem';
  const tags = Array.isArray(post?.tags) ? post.tags.filter(Boolean).slice(0, 4) : [];
  const titleId = `community-post-title-${postId || 'unknown'}`;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={onKeyDown}
      className="group relative grid grid-cols-1 md:grid-cols-[auto,1fr,auto] gap-3 md:gap-5 px-4 md:px-6 py-5 rounded-2xl bg-[var(--cmty-card-bg)] hover:bg-[var(--cmty-card-bg-hover)] ring-1 ring-[var(--cmty-card-ring)] hover:ring-[var(--cmty-card-ring-hover)] hover:shadow-xl hover:shadow-cyan-900/10 cursor-pointer transition-all duration-300"
    >
      {/* Animated accent bar on the left */}
      <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-gradient-to-b from-cyan-400/0 via-cyan-400/0 to-cyan-400/0 group-hover:from-cyan-400/60 group-hover:via-teal-400/40 group-hover:to-transparent transition-all duration-500" />
      
      {/* Background glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/[0.02] to-teal-500/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Left rail: stats block. On mobile this drops below the title. */}
      <div className="hidden md:flex flex-shrink-0 relative z-10">
        <VoteCounter
          votes={votes}
          answers={answers}
          isSolved={Boolean(post?.solved)}
        />
      </div>

      {/* Center: title + excerpt + tags */}
      <div className="min-w-0 flex flex-col gap-2.5 relative z-10">
        <div className="flex flex-wrap items-center gap-1.5">
          {post?.pinned && <StatusBadge variant="pinned" />}
          {post?.solved && <StatusBadge variant="solved" />}
          <StatusBadge variant={isProblem ? (post?.problemType || 'problem') : 'discussion'} />
        </div>

        <h2 id={titleId} className="text-base md:text-lg font-bold text-[var(--color-text-heading)] group-hover:text-[var(--cmty-active-text)] transition-colors duration-200 leading-snug tracking-tight">
          {post?.title || 'Untitled post'}
        </h2>

        {post?.content && (
          <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed line-clamp-2 group-hover:text-[var(--color-text-secondary)] transition-colors duration-200">
            {buildExcerpt(post.content)}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {tags.map((tag) => (
              <Tag key={tag} size="xs">
                {tag}
              </Tag>
            ))}
            {Array.isArray(post?.tags) && post.tags.length > tags.length && (
              <span className="text-[10px] text-[var(--cmty-text-subtle)] bg-[var(--cmty-pill-bg)] px-1.5 py-0.5 rounded-full">
                +{post.tags.length - tags.length}
              </span>
            )}
          </div>
        )}

        {/* Mobile-only stats strip */}
        <div className="md:hidden flex items-center gap-4 text-[11px] text-[var(--cmty-text-subtle)] pt-2 border-t border-[var(--cmty-card-ring)] mt-1">
          <span className="inline-flex items-center gap-1">
            <span className="font-bold text-[var(--color-text-heading)] tabular-nums text-xs">
              {votes}
            </span>
            votes
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageIcon size={11} />
            <span className="font-bold text-[var(--color-text-heading)] tabular-nums text-xs">
              {answers}
            </span>
            answers
          </span>
        </div>
      </div>

      {/* Right rail: author + actions */}
      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 md:gap-2.5 md:min-w-[10rem] relative z-10">
        <UserChip
          authorUsername={post?.authorUsername}
          authorAvatar={post?.authorAvatar}
          createdAt={post?.createdAt}
          size="sm"
        />

        <IconButton
          aria-label={isSaved ? 'Remove from saved' : 'Save post'}
          onClick={handleSaveClick}
          size="sm"
          variant="ghost"
          icon={<BookmarkIcon size={14} />}
          className={`!min-w-0 !w-9 !h-9 rounded-lg ${
            isSaved
              ? '!text-[var(--cmty-active-text)] !bg-cyan-400/10 !ring-1 !ring-cyan-400/20'
              : '!text-[var(--cmty-text-subtle)] hover:!text-[var(--cmty-active-text)] hover:!bg-[var(--cmty-card-bg-hover)]'
          } transition-all duration-200`}
        />
      </div>
    </div>
  );
};

export default memo(PostRow);
