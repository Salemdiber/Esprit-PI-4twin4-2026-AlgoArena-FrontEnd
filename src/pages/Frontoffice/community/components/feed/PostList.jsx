import React from 'react';
import { Spinner, Button } from '@chakra-ui/react';
import PostRow from './PostRow';
import { MessageIcon, PlusIcon } from '../shared/icons';

// Renders the feed list with proper empty / loading / error / data states.
// The parent owns the filtered+sorted post array; this component only
// decides which state to show.
const SkeletonRow = () => (
  <div className="relative grid grid-cols-1 md:grid-cols-[auto,1fr,auto] gap-4 md:gap-5 px-5 md:px-6 py-5 rounded-2xl bg-[var(--cmty-card-bg)] ring-1 ring-[var(--cmty-card-ring)] overflow-hidden">
    <div className="absolute inset-0 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, var(--cmty-skeleton-shimmer), transparent)' }} />
    <div className="hidden md:flex flex-col gap-2 relative z-10">
      <div className="h-14 w-14 rounded-xl bg-[var(--cmty-skeleton-base)]" />
      <div className="h-14 w-14 rounded-xl bg-[var(--cmty-skeleton-base)]" />
    </div>
    <div className="flex flex-col gap-3 relative z-10">
      <div className="flex gap-2">
        <div className="h-4 w-16 rounded-full bg-[var(--cmty-skeleton-base)]" />
        <div className="h-4 w-20 rounded-full bg-[var(--cmty-skeleton-base)]" />
      </div>
      <div className="h-5 w-2/3 rounded-lg bg-[var(--cmty-skeleton-base)]" />
      <div className="h-3 w-full rounded-md bg-[var(--cmty-skeleton-shimmer)]" />
      <div className="h-3 w-5/6 rounded-md bg-[var(--cmty-skeleton-shimmer)]" />
      <div className="flex gap-1.5 mt-1">
        <div className="h-5 w-12 rounded-full bg-[var(--cmty-skeleton-base)]" />
        <div className="h-5 w-14 rounded-full bg-[var(--cmty-skeleton-base)]" />
      </div>
    </div>
    <div className="h-8 w-32 rounded-full bg-[var(--cmty-skeleton-base)] self-start relative z-10" />
  </div>
);

const EmptyState = ({ onCreate, isLoggedIn, hasFilters }) => (
  <div className="flex flex-col items-center text-center py-20 px-8 rounded-2xl bg-[var(--cmty-card-bg)] ring-1 ring-[var(--cmty-card-ring)] relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-cyan-500/[0.04] rounded-full blur-3xl pointer-events-none" />
    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/10 to-teal-400/5 ring-1 ring-cyan-400/25 shadow-lg shadow-cyan-900/10 flex items-center justify-center text-[var(--cmty-active-text)] mb-5">
      <MessageIcon size={24} className="drop-shadow-sm" />
    </div>
    <h2 className="relative text-lg font-bold text-[var(--color-text-heading)] tracking-tight">
      {hasFilters ? 'No posts match your filters' : 'No posts yet'}
    </h2>
    <p className="relative mt-2 text-sm text-[var(--color-text-muted)] max-w-sm leading-relaxed">
      {hasFilters
        ? 'Try clearing the search or tag filter.'
        : 'Be the first to start a discussion or ask a question. Share your knowledge with the community.'}
    </p>
    {!hasFilters && (
      <Button
        size="sm"
        mt={5}
        onClick={onCreate}
        isDisabled={!isLoggedIn}
        leftIcon={<PlusIcon size={14} />}
        className="!bg-gradient-to-r !from-cyan-400 !to-teal-400 !text-slate-950 hover:!from-cyan-300 hover:!to-teal-300 !font-bold !rounded-xl !shadow-lg !shadow-cyan-900/20 !transition-all"
      >
        Start the conversation
      </Button>
    )}
  </div>
);

const PostList = ({
  posts,
  loading,
  error,
  isLoggedIn,
  hasFilters,
  getPostReaction,
  onToggleReaction,
  isPostSaved,
  onToggleSave,
  onDeletePost,
  onTogglePin,
  onSummarizeDiscussion,
  summaryByPostId,
  summaryErrorByPostId,
  summarizingPostId,
  isAdmin,
  currentUserId,
  onCreate,
}) => {
  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-live="polite">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center text-center py-16 px-8 rounded-2xl bg-rose-500/[0.06] dark:bg-gradient-to-br dark:from-rose-400/[0.04] dark:to-rose-500/[0.01] ring-1 ring-rose-400/20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-rose-500/[0.05] rounded-full blur-3xl pointer-events-none" />
        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400/10 to-rose-500/5 ring-1 ring-rose-400/25 shadow-lg shadow-rose-900/10 flex items-center justify-center mb-4">
          <Spinner size="sm" color="rose.500" className="dark:!text-rose-300" />
        </div>
        <p className="relative text-base font-semibold text-rose-700 dark:text-rose-200">{error}</p>
        <p className="relative text-sm text-rose-600/70 dark:text-rose-300/60 mt-2 max-w-sm">
          Refresh the page to try again, or check your network connection.
        </p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        onCreate={onCreate}
        isLoggedIn={isLoggedIn}
        hasFilters={hasFilters}
      />
    );
  }

  return (
    <div id="community-feed-panel" role="tabpanel" className="space-y-2.5">
      {posts.map((post) => (
        <PostRow
          key={String(post._id)}
          post={post}
          reaction={getPostReaction?.(post._id)}
          onToggleReaction={onToggleReaction}
          isSaved={isPostSaved?.(post._id)}
          onToggleSave={onToggleSave}
          onDeletePost={onDeletePost}
          onTogglePin={onTogglePin}
          onSummarizeDiscussion={onSummarizeDiscussion}
          summary={summaryByPostId?.[post._id]}
          summaryError={summaryErrorByPostId?.[post._id]}
          isSummarizing={summarizingPostId === post._id}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};

export default PostList;
