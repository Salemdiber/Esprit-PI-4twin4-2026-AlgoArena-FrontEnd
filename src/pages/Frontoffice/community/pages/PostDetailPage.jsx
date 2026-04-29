import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, Spinner } from '@chakra-ui/react';
import { communityService } from '../../../../services/communityService';
import { useAuth } from '../../auth/context/AuthContext';
import UserChip from '../components/shared/UserChip';
import StatusBadge from '../components/shared/StatusBadge';
import Tag from '../components/shared/Tag';
import { ArrowLeftIcon, MessageIcon } from '../components/shared/icons';
import { toMediaUrl } from '../utils/media';
import { countCommentTree, sortCommentsPinnedFirst } from '../utils/commentTree';
import { relativeTime } from '../utils/relativeTime';

// Stub detail page. Step 3 of the redesign replaces this with the full
// thread experience (reactions, replies, edit/delete, AI summary, code
// comments). Kept intentionally minimal so the feed -> detail navigation
// works end-to-end while the polished version is being built.
const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, currentUser } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const all = await communityService.getPosts();
        if (cancelled) return;
        const found = (Array.isArray(all) ? all : []).find(
          (p) => String(p?._id) === String(id),
        );
        setPost(found || null);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Unable to load post.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const orderedComments = useMemo(
    () => sortCommentsPinnedFirst(post?.comments || []),
    [post?.comments],
  );

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;

    try {
      setSubmitting(true);
      const newComment = await communityService.addComment(post._id, {
        text: commentText.trim(),
        kind: 'text',
      });
      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: [newComment, ...(prev.comments || [])],
            }
          : prev,
      );
      setCommentText('');
    } catch (err) {
      setError(err?.message || 'Unable to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!post?.title) return;
    const previous = document.title;
    document.title = `${post.title} · AlgoArena Community`;
    return () => {
      document.title = previous;
    };
  }, [post?.title]);

  if (loading) {
    return (
      <main
        className="min-h-screen pt-24 md:pt-28 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
        style={{ background: 'var(--color-bg-primary, #0b0f1a)' }}
      >
        <Spinner size="lg" color="cyan.300" />
      </main>
    );
  }

  if (error || !post) {
    return (
      <main
        className="min-h-screen pt-24 md:pt-28 pb-12 px-4 sm:px-6 lg:px-8"
        style={{ background: 'var(--color-bg-primary, #0b0f1a)' }}
      >
        <div className="max-w-3xl mx-auto rounded-xl bg-rose-500/10 ring-1 ring-rose-400/30 p-6">
          <h2 className="text-base font-semibold text-rose-700 dark:text-rose-200">
            {error || 'Post not found'}
          </h2>
          <p className="mt-1 text-sm text-rose-600/80 dark:text-rose-300/80">
            It may have been deleted, or you may not have access.
          </p>
          <Button
            as={RouterLink}
            to="/community"
            mt={4}
            size="sm"
            variant="outline"
            leftIcon={<ArrowLeftIcon size={14} />}
          >
            Back to community
          </Button>
        </div>
      </main>
    );
  }

  const isProblem = post.type === 'problem';
  const totalAnswers = countCommentTree(post.comments || []);

  return (
    <>
      <main
        className="min-h-screen pt-24 md:pt-28 pb-12 px-4 sm:px-6 lg:px-8"
        style={{ background: 'var(--color-bg-primary, #0b0f1a)' }}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <button
            type="button"
            onClick={() => navigate('/community')}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--cmty-active-text)] transition-colors"
          >
            <ArrowLeftIcon size={14} />
            <span>Back to community</span>
          </button>

          <article className="rounded-xl bg-[var(--cmty-card-bg)] ring-1 ring-[var(--cmty-card-ring)] p-5 md:p-7 space-y-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {post.pinned && <StatusBadge variant="pinned" />}
              {post.solved && <StatusBadge variant="solved" />}
              <StatusBadge variant={isProblem ? (post.problemType || 'problem') : 'discussion'} />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-heading)] leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--cmty-text-subtle)]">
              <UserChip
                authorUsername={post.authorUsername}
                authorAvatar={post.authorAvatar}
                createdAt={post.createdAt}
                size="md"
              />
              <span className="opacity-60">·</span>
              <span className="inline-flex items-center gap-1">
                <MessageIcon size={12} />
                <span className="tabular-nums font-semibold text-[var(--color-text-secondary)]">
                  {totalAnswers}
                </span>
                <span>{totalAnswers === 1 ? 'answer' : 'answers'}</span>
              </span>
            </div>

            {post.content && (
              <div className="max-w-none text-sm md:text-[15px] leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-wrap">
                {post.content}
              </div>
            )}

            {post.imageUrl && (
              <img
                src={toMediaUrl(post.imageUrl)}
                alt="Post"
                className="w-full rounded-lg ring-1 ring-[var(--cmty-card-ring)]"
              />
            )}
            {post.videoUrl && (
              <video
                src={toMediaUrl(post.videoUrl)}
                controls
                className="w-full rounded-lg ring-1 ring-[var(--cmty-card-ring)]"
              />
            )}

            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {post.tags.map((tag) => (
                  <Tag key={tag} size="sm">
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
          </article>

          <section className="rounded-xl bg-[var(--cmty-card-bg)] ring-1 ring-[var(--cmty-card-ring)] p-5 md:p-6 space-y-4">
            <header className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--color-text-heading)] uppercase tracking-wider">
                {totalAnswers} {totalAnswers === 1 ? 'answer' : 'answers'}
              </h2>
            </header>

            {isLoggedIn ? (
              <form
                onSubmit={handlePostComment}
                className="flex flex-col gap-2 pb-4 border-b border-[var(--cmty-card-ring)]"
              >
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write your answer or comment..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--cmty-input-bg)] ring-1 ring-[var(--cmty-input-ring)] focus:ring-cyan-400/50 focus:outline-none text-sm text-[var(--color-text-heading)] placeholder:text-[var(--cmty-text-subtle)] resize-y"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={submitting}
                    isDisabled={!commentText.trim()}
                    loadingText="Posting"
                    className="!bg-cyan-400 !text-slate-950 hover:!bg-cyan-300 !font-semibold"
                  >
                    Post answer
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">
                <RouterLink
                  to="/signin"
                  className="text-[var(--cmty-active-text)] hover:opacity-80 underline-offset-2 hover:underline"
                >
                  Sign in
                </RouterLink>{' '}
                to join the discussion.
              </p>
            )}

            {orderedComments.length === 0 ? (
              <p className="text-sm text-[var(--cmty-text-subtle)] py-6 text-center">
                No answers yet — be the first to reply.
              </p>
            ) : (
              <ul className="space-y-4">
                {orderedComments.map((c, i) => (
                  <li
                    key={String(c?._id || i)}
                    className="flex gap-3 pt-2"
                  >
                    <Avatar
                      size="sm"
                      name={c?.authorUsername || 'unknown'}
                      src={c?.authorAvatar ? toMediaUrl(c.authorAvatar) : undefined}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-[var(--cmty-text-subtle)] mb-1">
                        <span className="font-medium text-[var(--color-text-heading)]">
                          {c?.authorUsername || 'unknown'}
                        </span>
                        <span className="opacity-60">·</span>
                        <span>{relativeTime(c?.createdAt)}</span>
                        {c?.pinned && <StatusBadge variant="pinned" />}
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed">
                        {c?.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-[11px] text-[var(--cmty-text-subtle)] italic pt-2 border-t border-[var(--cmty-card-ring)]">
              Note: full thread experience (reactions, replies, edit, AI
              summary, code answers) is rolling out in the next update.
              Visiting{' '}
              <RouterLink
                to={`/community/legacy?postId=${post._id}`}
                className="text-[var(--cmty-active-text)] hover:opacity-80 underline"
              >
                the legacy view
              </RouterLink>{' '}
              gives you all of those for now.
            </p>
          </section>
        </div>
      </main>
    </>
  );
};

export default PostDetailPage;
