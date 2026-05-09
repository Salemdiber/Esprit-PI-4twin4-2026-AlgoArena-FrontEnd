import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Avatar,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Spinner,
} from '@chakra-ui/react';
import { callAI, communityService } from '../../../../services/communityService';
import { useAuth } from '../../auth/context/AuthContext';
import { usePostReactions } from '../hooks/usePostReactions';
import { useSavedPosts } from '../hooks/useSavedPosts';
import UserChip from '../components/shared/UserChip';
import StatusBadge from '../components/shared/StatusBadge';
import Tag from '../components/shared/Tag';
import {
  ArrowLeftIcon,
  BookmarkIcon,
  MessageIcon,
  SparkleIcon,
  ThreeDotsIcon,
  ThumbDownIcon,
  ThumbUpIcon,
} from '../components/shared/icons';
import {
  addReplyInTree,
  countCommentTree,
  flattenCommentTexts,
  keyOf,
  sortCommentsPinnedFirst,
} from '../utils/commentTree';
import { toMediaUrl } from '../utils/media';
import { relativeTime } from '../utils/relativeTime';

const removeCommentById = (comments, targetId) => {
  if (!Array.isArray(comments)) return [];
  return comments.reduce((acc, comment) => {
    const commentId = String(comment?._id || '');
    if (commentId && commentId === String(targetId)) return acc;
    const replies = removeCommentById(comment?.replies || [], targetId);
    acc.push({ ...comment, replies });
    return acc;
  }, []);
};

const PostDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, currentUser } = useAuth();
  const { getPostReaction, togglePostReaction, getCommentReaction, toggleCommentReaction } = usePostReactions();
  const { isPostSaved, toggleSavePost } = useSavedPosts(currentUser?._id);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyOpen, setReplyOpen] = useState({});
  const [editingPost, setEditingPost] = useState({ active: false, title: '', content: '' });
  const [editingComment, setEditingComment] = useState({ commentId: '', text: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [summary, setSummary] = useState('');
  const [summaryError, setSummaryError] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  const isAdmin = String(currentUser?.role || '').toUpperCase() === 'ADMIN'
    || String(currentUser?.role || '').toUpperCase() === 'ORGANIZER';
  const isOwner = String(post?.authorId || '') && String(post?.authorId) === String(currentUser?._id || '');

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
        if (found && new URLSearchParams(location.search).get('edit') === '1') {
          setEditingPost({
            active: true,
            title: String(found?.title || ''),
            content: String(found?.content || ''),
          });
        }
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
  }, [id, location.search]);

  useEffect(() => {
    if (!post?.title) return;
    const previous = document.title;
    document.title = `${post.title} · AlgoArena Community`;
    return () => {
      document.title = previous;
    };
  }, [post?.title]);

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

  const handleAddReply = async (event, parentCommentId) => {
    event.preventDefault();
    if (!isLoggedIn || !post?._id) return;
    const draft = replyDrafts[parentCommentId] || '';
    if (!draft.trim()) return;

    try {
      const reply = await communityService.addReply(post._id, parentCommentId, {
        text: draft.trim(),
        kind: 'text',
      });
      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments: addReplyInTree(prev.comments || [], parentCommentId, reply),
            }
          : prev,
      );
      setReplyDrafts((prev) => ({ ...prev, [parentCommentId]: '' }));
      setReplyOpen((prev) => ({ ...prev, [parentCommentId]: false }));
    } catch (err) {
      setError(err?.message || 'Unable to add reply.');
    }
  };

  const handleStartPostEdit = () => {
    setEditingPost({
      active: true,
      title: String(post?.title || ''),
      content: String(post?.content || ''),
    });
  };

  const handleCancelPostEdit = () => {
    setEditingPost({ active: false, title: '', content: '' });
  };

  const handleSavePostEdit = async () => {
    if (!post?._id || !editingPost.title.trim()) return;
    try {
      setSavingEdit(true);
      const updated = await communityService.updatePost(post._id, {
        title: editingPost.title.trim(),
        content: editingPost.content.trim(),
      });
      setPost(updated);
      setEditingPost({ active: false, title: '', content: '' });
    } catch (err) {
      setError(err?.message || 'Unable to update post.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post?._id) return;
    const confirmed = window.confirm('Delete this post? This cannot be undone.');
    if (!confirmed) return;
    try {
      await communityService.deletePost(post._id);
      navigate('/community');
    } catch (err) {
      setError(err?.message || 'Unable to delete post.');
    }
  };

  const handleTogglePin = async () => {
    if (!post?._id) return;
    try {
      const updated = await communityService.setPostPinned(post._id, !post?.pinned);
      setPost(updated);
    } catch (err) {
      setError(err?.message || 'Unable to update pin.');
    }
  };

  const handleSummarizeDiscussion = async () => {
    if (summarizing || !post?._id) return;
    const commentTexts = flattenCommentTexts(post?.comments || []);
    if (commentTexts.length === 0) {
      setSummaryError('No comments to summarize yet.');
      return;
    }

    try {
      setSummarizing(true);
      setSummaryError('');
      const discussionText = commentTexts.join('\n- ');
      const result = await callAI(
        `Summarize this discussion in 1-2 short, clear sentences (max 35 words total). Use simple language and include only the main point and current outcome.\n\n${discussionText}`,
        { maxTokens: 70, temperature: 0.2 },
      );
      setSummary(result.trim());
    } catch (err) {
      setSummaryError(err?.message || 'Unable to summarize discussion right now.');
    } finally {
      setSummarizing(false);
    }
  };

  const handleToggleCommentPin = async (commentId) => {
    if (!post?._id || !commentId) return;
    const current = findComment(post?.comments || [], commentId);
    if (!current?._id) return;

    try {
      const updated = await communityService.setCommentPinned(post._id, commentId, !current?.pinned);
      setPost(updated);
    } catch (err) {
      setError(err?.message || 'Unable to update comment pin.');
    }
  };

  const handleStartCommentEdit = (comment) => {
    if (!comment?._id) return;
    setEditingComment({ commentId: String(comment._id), text: String(comment?.text || '') });
  };

  const handleCancelCommentEdit = () => {
    setEditingComment({ commentId: '', text: '' });
  };

  const handleSaveCommentEdit = async () => {
    if (!post?._id || !editingComment.commentId) return;
    try {
      setSavingEdit(true);
      const updated = await communityService.updateComment(
        post._id,
        editingComment.commentId,
        { text: editingComment.text.trim() },
      );
      setPost(updated);
      setEditingComment({ commentId: '', text: '' });
    } catch (err) {
      setError(err?.message || 'Unable to update comment.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!post?._id || !commentId) return;
    const confirmed = window.confirm('Delete this comment? This cannot be undone.');
    if (!confirmed) return;
    try {
      await communityService.deleteComment(post._id, commentId);
      setPost((prev) =>
        prev ? { ...prev, comments: removeCommentById(prev.comments || [], commentId) } : prev,
      );
    } catch (err) {
      setError(err?.message || 'Unable to delete comment.');
    }
  };

  const findComment = (comments, targetId) => {
    if (!Array.isArray(comments) || !targetId) return null;
    for (const comment of comments) {
      if (String(comment?._id || '') === String(targetId)) return comment;
      const nested = findComment(comment?.replies || [], targetId);
      if (nested) return nested;
    }
    return null;
  };

  const renderMedia = (mediaUrl, isVideo = false) => {
    if (!mediaUrl) return null;
    const mediaSrc = toMediaUrl(mediaUrl);
    if (isVideo) {
      return (
        <video
          src={mediaSrc}
          controls
          className="w-full rounded-xl ring-1 ring-[var(--cmty-card-ring)] max-h-[420px] bg-black/40"
        />
      );
    }
    return (
      <img
        src={mediaSrc}
        alt="Post media"
        className="w-full rounded-xl ring-1 ring-[var(--cmty-card-ring)] object-cover max-h-[420px]"
      />
    );
  };

  const renderCommentTree = (items, depth = 0) => {
    if (!Array.isArray(items) || items.length === 0) return null;

    return items.map((comment) => {
      const commentId = String(comment?._id || keyOf(comment));
      const isEditing = editingComment.commentId === String(comment?._id || '');
      const reaction = getCommentReaction(post?._id, commentId);
      const likeActive = reaction?.userReaction === 'like';
      const dislikeActive = reaction?.userReaction === 'dislike';
      const canEdit = isLoggedIn && String(comment?.authorId || '') === String(currentUser?._id || '');
      const canDelete = canEdit || isAdmin;
      const replies = sortCommentsPinnedFirst(comment?.replies || []);

      return (
        <div
          key={commentId}
          className="rounded-xl bg-[var(--cmty-card-bg)] ring-1 ring-[var(--cmty-card-ring)] p-4"
          style={{ marginLeft: depth > 0 ? `${Math.min(depth, 5) * 16}px` : '0' }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar
                size="sm"
                name={comment?.authorUsername || 'unknown'}
                src={comment?.authorAvatar ? toMediaUrl(comment.authorAvatar) : undefined}
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[var(--color-text-heading)]">
                  {comment?.authorUsername || 'unknown'}
                </span>
                <span className="text-[11px] text-[var(--cmty-text-subtle)]">
                  {relativeTime(comment?.createdAt)}
                </span>
              </div>
              {comment?.pinned && (
                <span className="text-[10px] uppercase tracking-wider text-cyan-200 bg-cyan-500/10 ring-1 ring-cyan-400/30 px-2 py-0.5 rounded-full">
                  Pinned
                </span>
              )}
            </div>

            <Menu placement="bottom-end">
              <MenuButton
                as={IconButton}
                aria-label="Comment options"
                icon={<ThreeDotsIcon size={14} />}
                size="sm"
                variant="ghost"
                className="!min-w-0 !w-8 !h-8 rounded-lg !text-[var(--cmty-text-subtle)] hover:!text-[var(--cmty-active-text)] hover:!bg-[var(--cmty-card-bg-hover)] transition-all"
              />
              <Portal>
                <MenuList
                  bg="var(--color-bg-secondary)"
                  borderColor="var(--cmty-card-ring)"
                  py={1}
                  border="1px solid"
                  zIndex="popover"
                >
                  <MenuItem
                    onClick={() => handleStartCommentEdit(comment)}
                    bg="transparent"
                    _hover={{ bg: 'rgba(34, 211, 238, 0.12)' }}
                    color="var(--color-text-primary)"
                    isDisabled={!canEdit}
                  >
                    Edit comment
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleDeleteComment(comment?._id)}
                    bg="transparent"
                    _hover={{ bg: 'rgba(239, 68, 68, 0.12)' }}
                    color="red.300"
                    isDisabled={!canDelete}
                  >
                    Delete comment
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleToggleCommentPin(comment?._id)}
                    bg="transparent"
                    _hover={{ bg: 'rgba(34, 211, 238, 0.12)' }}
                    color="cyan.300"
                    isDisabled={!isAdmin}
                  >
                    {comment?.pinned ? 'Unpin comment' : 'Pin comment'}
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </div>

          {!isEditing ? (
            <p className="mt-3 text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed">
              {comment?.text}
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              <textarea
                value={editingComment.text}
                onChange={(e) => setEditingComment((prev) => ({ ...prev, text: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-[var(--cmty-input-bg)] ring-1 ring-[var(--cmty-input-ring)] focus:ring-cyan-400/50 focus:outline-none text-sm text-[var(--color-text-heading)]"
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={handleCancelCommentEdit}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  isLoading={savingEdit}
                  className="!bg-cyan-400 !text-slate-950 hover:!bg-cyan-300 !font-semibold"
                  onClick={handleSaveCommentEdit}
                >
                  Save
                </Button>
              </div>
            </div>
          )}

          {comment?.imageUrl && (
            <div className="mt-3">{renderMedia(comment.imageUrl, false)}</div>
          )}
          {comment?.videoUrl && (
            <div className="mt-3">{renderMedia(comment.videoUrl, true)}</div>
          )}

          {!isEditing && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => toggleCommentReaction(post?._id, commentId, 'like')}
                aria-pressed={likeActive}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ring-1 transition-all duration-200 ${likeActive ? 'bg-cyan-400/15 text-[var(--cmty-active-text)] ring-cyan-400/40' : 'bg-[var(--cmty-pill-bg)] ring-[var(--cmty-pill-ring)] hover:ring-cyan-400/30'}`}
              >
                <ThumbUpIcon size={12} />
                <span className="tabular-nums font-semibold text-[var(--color-text-heading)]">
                  {reaction?.likes || 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => toggleCommentReaction(post?._id, commentId, 'dislike')}
                aria-pressed={dislikeActive}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ring-1 transition-all duration-200 ${dislikeActive ? 'bg-rose-500/15 text-rose-200 ring-rose-400/40' : 'bg-[var(--cmty-pill-bg)] ring-[var(--cmty-pill-ring)] hover:ring-rose-400/30'}`}
              >
                <ThumbDownIcon size={12} />
                <span className="tabular-nums font-semibold text-[var(--color-text-heading)]">
                  {reaction?.dislikes || 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setReplyOpen((prev) => ({ ...prev, [commentId]: !prev[commentId] }))}
                className="text-[12px] font-semibold text-[var(--cmty-active-text)] hover:opacity-80"
              >
                Reply
              </button>
            </div>
          )}

          {replyOpen[commentId] && (
            <form className="mt-3" onSubmit={(event) => handleAddReply(event, comment?._id)}>
              <textarea
                value={replyDrafts[commentId] || ''}
                onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [commentId]: e.target.value }))}
                placeholder={isLoggedIn ? 'Write a reply...' : 'Sign in to reply'}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-[var(--cmty-input-bg)] ring-1 ring-[var(--cmty-input-ring)] focus:ring-cyan-400/50 focus:outline-none text-sm text-[var(--color-text-heading)]"
                disabled={!isLoggedIn}
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setReplyOpen((prev) => ({ ...prev, [commentId]: false }))}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="!bg-cyan-400 !text-slate-950 hover:!bg-cyan-300 !font-semibold"
                  isDisabled={!isLoggedIn || !(replyDrafts[commentId] || '').trim()}
                >
                  Post reply
                </Button>
              </div>
            </form>
          )}

          {replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {renderCommentTree(replies, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

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
  const postReaction = getPostReaction(post._id);
  const backendLikes = Number(post?.likesCount || (Array.isArray(post?.likes) ? post.likes.length : 0) || 0);
  const backendDislikes = Number(post?.dislikesCount || (Array.isArray(post?.dislikes) ? post.dislikes.length : 0) || 0);
  const totalLikes = Math.max(Number(postReaction?.likes || 0), backendLikes);
  const totalDislikes = Math.max(Number(postReaction?.dislikes || 0), backendDislikes);
  const likeActive = postReaction?.userReaction === 'like';
  const dislikeActive = postReaction?.userReaction === 'dislike';

  return (
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
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {post.pinned && <StatusBadge variant="pinned" />}
              {post.solved && <StatusBadge variant="solved" />}
              <StatusBadge variant={isProblem ? (post.problemType || 'problem') : 'discussion'} />
            </div>

            <Menu placement="bottom-end">
              <MenuButton
                as={IconButton}
                aria-label="Post options"
                icon={<ThreeDotsIcon size={14} />}
                size="sm"
                variant="ghost"
                className="!min-w-0 !w-9 !h-9 rounded-lg !text-[var(--cmty-text-subtle)] hover:!text-[var(--cmty-active-text)] hover:!bg-[var(--cmty-card-bg-hover)] transition-all"
              />
              <Portal>
                <MenuList
                  bg="var(--color-bg-secondary)"
                  borderColor="var(--cmty-card-ring)"
                  py={1}
                  border="1px solid"
                  zIndex="popover"
                >
                  <MenuItem
                    onClick={handleStartPostEdit}
                    bg="transparent"
                    _hover={{ bg: 'rgba(34, 211, 238, 0.12)' }}
                    color="var(--color-text-primary)"
                    isDisabled={!isOwner}
                  >
                    Edit post
                  </MenuItem>
                  <MenuItem
                    onClick={handleDeletePost}
                    bg="transparent"
                    _hover={{ bg: 'rgba(239, 68, 68, 0.12)' }}
                    color="red.300"
                    isDisabled={!isOwner && !isAdmin}
                  >
                    Delete post
                  </MenuItem>
                  <MenuItem
                    onClick={handleSummarizeDiscussion}
                    bg="transparent"
                    _hover={{ bg: 'rgba(34, 211, 238, 0.12)' }}
                    color="cyan.300"
                    isDisabled={summarizing}
                  >
                    {summarizing ? 'Summarizing...' : 'Summarize discussion'}
                  </MenuItem>
                  <MenuItem
                    onClick={handleTogglePin}
                    bg="transparent"
                    _hover={{ bg: 'rgba(34, 211, 238, 0.12)' }}
                    color="cyan.300"
                    isDisabled={!isAdmin}
                  >
                    {post?.pinned ? 'Unpin post' : 'Pin post'}
                  </MenuItem>
                  <MenuItem
                    onClick={() => toggleSavePost(post._id)}
                    bg="transparent"
                    _hover={{ bg: 'rgba(34, 211, 238, 0.12)' }}
                    color={isPostSaved(post._id) ? 'cyan.300' : 'var(--color-text-primary)'}
                  >
                    {isPostSaved(post._id) ? 'Unsave post' : 'Save post'}
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </div>

          {!editingPost.active ? (
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-heading)] leading-tight">
              {post.title}
            </h1>
          ) : (
            <div className="space-y-2">
              <input
                value={editingPost.title}
                onChange={(e) => setEditingPost((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[var(--cmty-input-bg)] ring-1 ring-[var(--cmty-input-ring)] focus:ring-cyan-400/50 focus:outline-none text-sm text-[var(--color-text-heading)]"
              />
              <textarea
                value={editingPost.content}
                onChange={(e) => setEditingPost((prev) => ({ ...prev, content: e.target.value }))}
                rows={5}
                className="w-full px-3 py-2 rounded-lg bg-[var(--cmty-input-bg)] ring-1 ring-[var(--cmty-input-ring)] focus:ring-cyan-400/50 focus:outline-none text-sm text-[var(--color-text-heading)]"
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={handleCancelPostEdit}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  isLoading={savingEdit}
                  className="!bg-cyan-400 !text-slate-950 hover:!bg-cyan-300 !font-semibold"
                  onClick={handleSavePostEdit}
                >
                  Save changes
                </Button>
              </div>
            </div>
          )}

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
              <span>{totalAnswers === 1 ? 'comment' : 'comments'}</span>
            </span>
          </div>

          {!editingPost.active && post.content && (
            <div className="max-w-none text-sm md:text-[15px] leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-wrap">
              {post.content}
            </div>
          )}

          {post.imageUrl && renderMedia(post.imageUrl, false)}
          {post.videoUrl && renderMedia(post.videoUrl, true)}

          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.map((tag) => (
                <Tag key={tag} size="sm">
                  {tag}
                </Tag>
              ))}
            </div>
          )}

          {summary && (
            <div className="rounded-lg bg-cyan-500/[0.06] ring-1 ring-cyan-400/15 px-3 py-2 text-xs text-[var(--color-text-secondary)]">
              <span className="font-semibold text-[var(--cmty-active-text)]">AI summary:</span>{' '}
              {summary}
            </div>
          )}
          {summaryError && (
            <div className="rounded-lg bg-rose-500/[0.08] ring-1 ring-rose-400/20 px-3 py-2 text-xs text-rose-200">
              {summaryError}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[var(--cmty-card-ring)]">
            <button
              type="button"
              onClick={() => togglePostReaction(post._id, 'like')}
              aria-pressed={likeActive}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ring-1 transition-all duration-200 ${likeActive ? 'bg-cyan-400/15 text-[var(--cmty-active-text)] ring-cyan-400/40' : 'bg-[var(--cmty-pill-bg)] ring-[var(--cmty-pill-ring)] hover:ring-cyan-400/30'}`}
            >
              <ThumbUpIcon size={13} />
              <span className="tabular-nums font-semibold text-[var(--color-text-heading)]">
                {totalLikes}
              </span>
            </button>
            <button
              type="button"
              onClick={() => togglePostReaction(post._id, 'dislike')}
              aria-pressed={dislikeActive}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ring-1 transition-all duration-200 ${dislikeActive ? 'bg-rose-500/15 text-rose-200 ring-rose-400/40' : 'bg-[var(--cmty-pill-bg)] ring-[var(--cmty-pill-ring)] hover:ring-rose-400/30'}`}
            >
              <ThumbDownIcon size={13} />
              <span className="tabular-nums font-semibold text-[var(--color-text-heading)]">
                {totalDislikes}
              </span>
            </button>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--cmty-pill-bg)] ring-1 ring-[var(--cmty-pill-ring)]">
              <MessageIcon size={12} />
              <span className="tabular-nums font-semibold text-[var(--color-text-heading)]">
                {totalAnswers}
              </span>
              <span>comments</span>
            </span>
            <button
              type="button"
              onClick={() => toggleSavePost(post._id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ring-1 transition-all duration-200 ${isPostSaved(post._id) ? 'bg-cyan-400/15 text-[var(--cmty-active-text)] ring-cyan-400/40' : 'bg-[var(--cmty-pill-bg)] ring-[var(--cmty-pill-ring)] hover:ring-cyan-400/30'}`}
            >
              <BookmarkIcon size={13} />
              <span>{isPostSaved(post._id) ? 'Saved' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={handleSummarizeDiscussion}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--cmty-pill-bg)] ring-1 ring-[var(--cmty-pill-ring)] hover:ring-cyan-400/30 transition-all"
            >
              <SparkleIcon size={13} />
              <span>{summarizing ? 'Summarizing...' : 'Summarize'}</span>
            </button>
          </div>
        </article>

        <section className="rounded-xl bg-[var(--cmty-card-bg)] ring-1 ring-[var(--cmty-card-ring)] p-5 md:p-6 space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-text-heading)] uppercase tracking-wider">
              {totalAnswers} {totalAnswers === 1 ? 'comment' : 'comments'}
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
                placeholder="Write your comment..."
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
                  Post comment
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
              No comments yet. Be the first to reply.
            </p>
          ) : (
            <div className="space-y-4">
              {renderCommentTree(orderedComments)}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default PostDetailPage;
