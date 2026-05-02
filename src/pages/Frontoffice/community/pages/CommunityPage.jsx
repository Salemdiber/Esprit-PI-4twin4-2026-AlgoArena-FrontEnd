import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useCommunityPosts } from '../hooks/useCommunityPosts';
import { usePostReactions } from '../hooks/usePostReactions';
import { useSavedPosts } from '../hooks/useSavedPosts';
import FeedHeader from '../components/feed/FeedHeader';
import FeedToolbar from '../components/feed/FeedToolbar';
import PostList from '../components/feed/PostList';
import TagCloud from '../components/sidebar/TagCloud';
import CommunityStats from '../components/sidebar/CommunityStats';
import { countCommentTree } from '../utils/commentTree';

const CreatePostDialog = lazy(() => import('../components/create/CreatePostDialog'));

const useIdleReady = (delayMs = 1200) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mount = () => setReady(true);
    const idleId = typeof window !== 'undefined' && 'requestIdleCallback' in window
      ? window.requestIdleCallback(mount, { timeout: delayMs })
      : window.setTimeout(mount, delayMs);

    return () => {
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, [delayMs]);

  return ready;
};

// New slim shell for /community.
//
// Design direction: forum / Q&A (StackOverflow + GitHub Discussions).
// The page is a thin orchestrator: it loads data via hooks, computes the
// filtered + sorted view, and hands the result to dumb child components.
// All heavy interactions (comments, replies, reactions, edit, AI summary)
// have moved to /community/post/:id - this page only lists threads.
const CommunityPage = () => {
  const { currentUser, isLoggedIn } = useAuth();
  const role = String(currentUser?.role || '').toUpperCase();
  const isAdmin = role === 'ADMIN' || role === 'ORGANIZER';

  const { posts, setPosts, loading, error } = useCommunityPosts();
  const { getPostReaction } = usePostReactions();
  const { isPostSaved, toggleSavePost } = useSavedPosts(currentUser?._id);

  const [activeSection, setActiveSection] = useState('discussion');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortOrder, setSortOrder] = useState('recent');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const showSidebarDetails = useIdleReady();

  // Section split: "discussion" = anything that isn't flagged as a problem.
  const sectioned = useMemo(() => {
    const discussion = posts.filter((p) => p?.type !== 'problem');
    const problems = posts.filter((p) => p?.type === 'problem');
    return { discussion, problems };
  }, [posts]);

  const sourcePosts = sectioned[activeSection] || [];

  const availableTags = useMemo(() => {
    const tagSet = new Set();
    posts.forEach((p) => {
      (Array.isArray(p?.tags) ? p.tags : []).forEach((t) => {
        if (t) tagSet.add(String(t).toLowerCase());
      });
    });
    return [...tagSet].sort();
  }, [posts]);

  const trendingTags = useMemo(() => {
    const counts = {};
    posts.forEach((p) => {
      (Array.isArray(p?.tags) ? p.tags : []).forEach((t) => {
        const key = String(t || '').trim().toLowerCase();
        if (!key) return;
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [posts]);

  const topContributors = useMemo(() => {
    const map = new Map();
    posts.forEach((p) => {
      const id = String(p?.authorId || '');
      if (!id) return;
      const existing = map.get(id) || {
        id,
        username: p?.authorUsername || 'unknown',
        avatar: p?.authorAvatar || '',
        posts: 0,
      };
      existing.posts += 1;
      map.set(id, existing);
    });
    return [...map.values()]
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 5);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const trimmedQuery = searchTerm.trim().toLowerCase();
    let view = sourcePosts;

    if (trimmedQuery) {
      view = view.filter((p) => {
        const haystack = `${p?.title || ''} ${p?.content || ''}`.toLowerCase();
        return haystack.includes(trimmedQuery);
      });
    }

    if (selectedTag !== 'all') {
      view = view.filter((p) =>
        Array.isArray(p?.tags) ? p.tags.includes(selectedTag) : false,
      );
    }

    if (showSavedOnly && currentUser?._id) {
      view = view.filter((p) => isPostSaved(p?._id));
    }

    const sorted = [...view].sort((a, b) => {
      // Pinned posts always float to the top regardless of sort.
      const aPinned = a?.pinned ? 1 : 0;
      const bPinned = b?.pinned ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;

      if (sortOrder === 'liked') {
        const aLikes = getPostReaction(a?._id)?.likes || 0;
        const bLikes = getPostReaction(b?._id)?.likes || 0;
        return bLikes - aLikes;
      }
      if (sortOrder === 'commented') {
        return countCommentTree(b?.comments || []) - countCommentTree(a?.comments || []);
      }
      const aDate = new Date(a?.createdAt || 0).getTime();
      const bDate = new Date(b?.createdAt || 0).getTime();
      return bDate - aDate;
    });

    return sorted;
  }, [
    sourcePosts,
    searchTerm,
    selectedTag,
    showSavedOnly,
    currentUser?._id,
    isPostSaved,
    sortOrder,
    getPostReaction,
  ]);

  const totalSolved = useMemo(
    () => sectioned.problems.filter((p) => p?.solved).length,
    [sectioned.problems],
  );

  const kpis = useMemo(
    () => [
      { label: 'Total posts', value: posts.length },
      {
        label: 'Open problems',
        value: sectioned.problems.filter((p) => !p?.solved).length,
      },
      { label: 'Tags in use', value: availableTags.length, accent: true },
      { label: 'Contributors', value: topContributors.length },
    ],
    [posts.length, sectioned.problems, availableTags.length, topContributors.length],
  );

  const hasFilters =
    Boolean(searchTerm.trim()) || selectedTag !== 'all' || showSavedOnly;

  const handleCreated = (savedPost) => {
    if (!savedPost) return;
    setPosts((prev) => [savedPost, ...prev]);
  };

  const handleOpenCreate = () => setCreateDialogOpen(true);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Community · AlgoArena';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <>
      <main
        className="min-h-screen pt-24 md:pt-28 pb-12 px-4 sm:px-6 lg:px-8"
        style={{ background: 'var(--color-bg-primary, #0b0f1a)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr,18rem] gap-8">
            <section className="min-w-0 space-y-6">
              <FeedHeader
                activeSection={activeSection}
                onChangeSection={setActiveSection}
                sectionCounts={{
                  discussion: sectioned.discussion.length,
                  problems: sectioned.problems.length,
                }}
                kpis={kpis}
                isAdmin={isAdmin}
                isLoggedIn={isLoggedIn}
                onCreate={handleOpenCreate}
              />

              <FeedToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
                selectedTag={selectedTag}
                onTagChange={setSelectedTag}
                availableTags={availableTags}
                showSavedOnly={showSavedOnly}
                onToggleSavedOnly={() => setShowSavedOnly((v) => !v)}
                totalShown={filteredPosts.length}
                totalAvailable={sourcePosts.length}
              />

              <PostList
                posts={filteredPosts}
                loading={loading}
                error={error}
                isLoggedIn={isLoggedIn}
                hasFilters={hasFilters}
                getPostReaction={getPostReaction}
                isPostSaved={(id) =>
                  Boolean(currentUser?._id) && isPostSaved(id)
                }
                onToggleSave={toggleSavePost}
                onCreate={handleOpenCreate}
              />
            </section>

            <aside className="hidden xl:flex flex-col gap-4 sticky top-28 h-fit">
              {showSidebarDetails && (
                <>
                  <CommunityStats
                    totalPosts={posts.length}
                    totalDiscussions={sectioned.discussion.length}
                    totalProblems={sectioned.problems.length}
                    totalSolved={totalSolved}
                    totalContributors={topContributors.length}
                    topContributors={topContributors}
                  />
                  <TagCloud
                    trendingTags={trendingTags}
                    selectedTag={selectedTag}
                    onSelectTag={setSelectedTag}
                  />
                </>
              )}
            </aside>
          </div>
        </div>
      </main>

      {createDialogOpen && (
        <Suspense fallback={null}>
          <CreatePostDialog
            isOpen={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
            defaultSection={activeSection}
            onCreated={handleCreated}
          />
        </Suspense>
      )}
    </>
  );
};

export default CommunityPage;
