import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Menu, MenuButton, MenuItem, MenuList, Portal } from '@chakra-ui/react';
import UserChip from '../shared/UserChip';
import StatusBadge from '../shared/StatusBadge';
import Tag from '../shared/Tag';
import { BookmarkIcon, MessageIcon, ThreeDotsIcon, ThumbDownIcon, ThumbUpIcon } from '../shared/icons';
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
  onToggleReaction,
  isSaved,
  onToggleSave,
  onDeletePost,
  onTogglePin,
  onSummarizeDiscussion,
  summary,
  summaryError,
  isSummarizing,
  isAdmin,
  currentUserId,
}) => {
  const navigate = useNavigate();
  const postId = String(post?._id || '');
  const isOwner = currentUserId && String(currentUserId) === String(post?.authorId);
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

  const handleReaction = (e, type) => {
    e.stopPropagation();
    onToggleReaction?.(postId, type);
  };

  const handleMenuAction = (e, action) => {
    e.stopPropagation();
    action?.();
  };

  const answers = countCommentTree(post?.comments || []);
  const isProblem = post?.type === 'problem';
  const tags = Array.isArray(post?.tags) ? post.tags.filter(Boolean).slice(0, 4) : [];
  const titleId = `community-post-title-${postId || 'unknown'}`;
  const backendLikes = Number(post?.likesCount || (Array.isArray(post?.likes) ? post.likes.length : 0) || 0);
  const backendDislikes = Number(post?.dislikesCount || (Array.isArray(post?.dislikes) ? post.dislikes.length : 0) || 0);
  const totalLikes = Math.max(Number(reaction?.likes || 0), backendLikes);
  const totalDislikes = Math.max(Number(reaction?.dislikes || 0), backendDislikes);
  const likeActive = reaction?.userReaction === 'like';
  const dislikeActive = reaction?.userReaction === 'dislike';

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={onKeyDown}
      className={`group relative grid grid-cols-1 md:grid-cols-[1fr,auto] gap-3 md:gap-5 px-4 md:px-6 py-5 rounded-2xl bg-[var(--cmty-card-bg)] hover:bg-[var(--cmty-card-bg-hover)] ring-1 ring-[var(--cmty-card-ring)] hover:ring-[var(--cmty-card-ring-hover)] hover:shadow-xl hover:shadow-cyan-900/10 cursor-pointer transition-all duration-300 ${post?.pinned ? 'ring-cyan-400/40 shadow-[0_0_0_1px_rgba(34,211,238,0.3)]' : ''}`}
    >
      {/* Animated accent bar on the left */}
      <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-gradient-to-b from-cyan-400/0 via-cyan-400/0 to-cyan-400/0 group-hover:from-cyan-400/60 group-hover:via-teal-400/40 group-hover:to-transparent transition-all duration-500" />
      
      {/* Background glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/[0.02] to-teal-500/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

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
              <Tag key={tag} size="xs" className="hover:shadow-sm hover:shadow-cyan-900/10">
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

        {summary && (
          <div className="mt-2 rounded-lg bg-cyan-500/[0.06] ring-1 ring-cyan-400/15 px-3 py-2 text-xs text-[var(--color-text-secondary)]">
            <span className="font-semibold text-[var(--cmty-active-text)]">AI summary:</span>{' '}
            {summary}
          </div>
        )}
        {summaryError && (
          <div className="mt-2 rounded-lg bg-rose-500/[0.08] ring-1 ring-rose-400/20 px-3 py-2 text-xs text-rose-200">
            {summaryError}
          </div>
        )}

        {/* Interaction bar */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[var(--cmty-card-ring)] mt-1 text-[12px] text-[var(--cmty-text-subtle)]">
          <button
            type="button"
            onClick={(e) => handleReaction(e, 'like')}
            aria-pressed={likeActive}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ring-1 transition-all duration-200 ${likeActive ? 'bg-cyan-400/15 text-[var(--cmty-active-text)] ring-cyan-400/40 shadow-sm shadow-cyan-900/10' : 'bg-[var(--cmty-pill-bg)] ring-[var(--cmty-pill-ring)] hover:ring-cyan-400/30 hover:text-[var(--cmty-active-text)]'}`}
          >
            <ThumbUpIcon size={13} />
            <span className="tabular-nums font-semibold text-[var(--color-text-heading)]">
              {totalLikes}
            </span>
          </button>
          <button
            type="button"
            onClick={(e) => handleReaction(e, 'dislike')}
            aria-pressed={dislikeActive}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ring-1 transition-all duration-200 ${dislikeActive ? 'bg-rose-500/15 text-rose-200 ring-rose-400/40 shadow-sm shadow-rose-900/10' : 'bg-[var(--cmty-pill-bg)] ring-[var(--cmty-pill-ring)] hover:ring-rose-400/30 hover:text-rose-200'}`}
          >
            <ThumbDownIcon size={13} />
            <span className="tabular-nums font-semibold text-[var(--color-text-heading)]">
              {totalDislikes}
            </span>
          </button>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--cmty-pill-bg)] ring-1 ring-[var(--cmty-pill-ring)]">
            <MessageIcon size={12} />
            <span className="tabular-nums font-semibold text-[var(--color-text-heading)]">
              {answers}
            </span>
            <span>comments</span>
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

        <div className="flex items-center gap-2">
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

          <Menu placement="bottom-end">
            <MenuButton
              as={IconButton}
              aria-label="Post options"
              icon={<ThreeDotsIcon size={14} />}
              size="sm"
              variant="ghost"
              className="!min-w-0 !w-9 !h-9 rounded-lg !text-[var(--cmty-text-subtle)] hover:!text-[var(--cmty-active-text)] hover:!bg-[var(--cmty-card-bg-hover)] transition-all"
              onClick={(e) => e.stopPropagation()}
            />
            <Portal>
              <MenuList
                bg="var(--color-bg-secondary)"
                borderColor="var(--cmty-card-ring)"
                py={1}
                border="1px solid"
                zIndex="popover"
                onClick={(e) => e.stopPropagation()}
              >
                <MenuItem
                  onClick={(e) => handleMenuAction(e, () => navigate(`/community/post/${postId}?edit=1`))}
                  bg="transparent"
                  _hover={{ bg: 'rgba(34, 211, 238, 0.12)' }}
                  color="var(--color-text-primary)"
                  isDisabled={!isOwner}
                >
                  Edit post
                </MenuItem>
                <MenuItem
                  onClick={(e) => handleMenuAction(e, () => onDeletePost?.(postId))}
                  bg="transparent"
                  _hover={{ bg: 'rgba(239, 68, 68, 0.12)' }}
                  color="red.300"
                  isDisabled={!isOwner && !isAdmin}
                >
                  Delete post
                </MenuItem>
                <MenuItem
                  onClick={(e) => handleMenuAction(e, () => onSummarizeDiscussion?.(post))}
                  bg="transparent"
                  _hover={{ bg: 'rgba(34, 211, 238, 0.12)' }}
                  color="cyan.300"
                  isDisabled={Boolean(isSummarizing)}
                >
                  {isSummarizing ? 'Summarizing...' : 'Summarize discussion'}
                </MenuItem>
                <MenuItem
                  onClick={(e) => handleMenuAction(e, () => onTogglePin?.(post))}
                  bg="transparent"
                  _hover={{ bg: 'rgba(34, 211, 238, 0.12)' }}
                  color="cyan.300"
                  isDisabled={!isAdmin}
                >
                  {post?.pinned ? 'Unpin post' : 'Pin post'}
                </MenuItem>
                <MenuItem
                  onClick={(e) => handleMenuAction(e, () => onToggleSave?.(postId))}
                  bg="transparent"
                  _hover={{ bg: 'rgba(34, 211, 238, 0.12)' }}
                  color={isSaved ? 'cyan.300' : 'var(--color-text-primary)'}
                >
                  {isSaved ? 'Unsave post' : 'Save post'}
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default memo(PostRow);
