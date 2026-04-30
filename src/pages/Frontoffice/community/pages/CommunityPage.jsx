import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Select,
  Spinner,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { m } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { communityService } from '../../../../services/communityService';
import { useAuth } from '../../auth/context/AuthContext';

const MotionBox = m.create(Box);
const COMMENT_PREVIEW_LIMIT = 3;
const GROQ_MAX_TOKENS = 100;

const STORAGE_KEYS = {
  postReactions: 'discussion_post_reactions_v1',
  commentReactions: 'discussion_comment_reactions_v1',
  savedItems: 'discussion_saved_items_v1',
  bestAnswers: 'discussion_best_answers_v1',
  userNotifications: 'discussion_user_notifications_v1',
  commentMeta: 'discussion_comment_meta_v1',
};

const CODE_LANGUAGES = ['javascript', 'python', 'cpp'];

const safeRead = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const safeWrite = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
};

const PlusIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M12 17v5" />
    <path d="M6 3h12" />
    <path d="M8 3v4l-3 4v2h14v-2l-3-4V3" />
  </svg>
);

const ImageIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const VideoIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const BookmarkIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const ThumbUpIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.66l1.38-9A2 2 0 0 0 19.69 9H14Z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const ThumbDownIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.66l-1.38 9A2 2 0 0 0 4.31 15H10Z" />
    <path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
  </svg>
);

const ThreeDotsIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);


const relativeTime = (value) => {
  if (!value) return 'Just now';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return 'Just now';

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (hours < 24) {
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  return `${Math.max(1, days)} day${days === 1 ? '' : 's'} ago`;
};

const getApiOrigin = () => {
  const raw = String(import.meta.env.VITE_API_URL || '').trim();

  if (/^https?:\/\//i.test(raw)) {
    try {
      return new URL(raw).origin;
    } catch {
      // ignore malformed URLs and use fallback below
    }
  }

  if (raw.startsWith('/')) {
    return window.location.origin;
  }

  return `${window.location.protocol}//${window.location.hostname}:3000`;
};

const toMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || /^data:/i.test(url)) return url;
  const apiOrigin = getApiOrigin();
  return `${apiOrigin}${url.startsWith('/') ? url : `/${url}`}`;
};

const uploadMediaAndGetUrl = async (file) => {
  if (!file) return '';
  const result = await communityService.uploadMedia(file);
  return String(result?.url || result?.absoluteUrl || '');
};

const keyOf = (comment) => String(comment?._id || `${comment?.createdAt || ''}:${comment?.text || ''}`);

const emptyDraft = () => ({
  text: '',
  imageFile: null,
  videoFile: null,
  imagePreviewUrl: '',
  videoPreviewUrl: '',
  error: '',
  isSubmitting: false,
});

const sortCommentsPinnedFirst = (comments) => {
  if (!Array.isArray(comments)) return [];
  return [...comments].sort((a, b) => {
    const aPinned = a?.pinned ? 1 : 0;
    const bPinned = b?.pinned ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    const aDate = new Date(a?.createdAt || 0).getTime();
    const bDate = new Date(b?.createdAt || 0).getTime();
    return bDate - aDate;
  });
};

const countCommentTree = (comments) => {
  if (!Array.isArray(comments)) return 0;
  return comments.reduce((acc, c) => acc + 1 + countCommentTree(c?.replies || []), 0);
};

const flattenCommentTexts = (comments) => {
  if (!Array.isArray(comments)) return [];
  return comments.reduce((acc, comment) => {
    const text = String(comment?.text || '').trim();
    if (text) acc.push(text);
    const replyTexts = flattenCommentTexts(comment?.replies || []);
    return acc.concat(replyTexts);
  }, []);
};

const findCommentById = (comments, targetId) => {
  if (!Array.isArray(comments) || !targetId) return null;
  for (const comment of comments) {
    if (String(comment?._id || '') === String(targetId)) return comment;
    const nested = findCommentById(comment?.replies || [], targetId);
    if (nested) return nested;
  }
  return null;
};

const moveCommentToTopById = (comments, targetId) => {
  if (!Array.isArray(comments) || !targetId) return comments || [];
  const idx = comments.findIndex((comment) => String(comment?._id || '') === String(targetId));
  if (idx <= 0) return comments;
  const picked = comments[idx];
  const rest = comments.filter((_, i) => i !== idx);
  return [picked, ...rest];
};

const addReplyInTree = (comments, parentCommentId, reply) => {
  if (!Array.isArray(comments)) return [];
  return comments.map((comment) => {
    if (String(comment?._id || '') === String(parentCommentId)) {
      return {
        ...comment,
        replies: [reply, ...(Array.isArray(comment?.replies) ? comment.replies : [])],
      };
    }
    return {
      ...comment,
      replies: addReplyInTree(comment?.replies || [], parentCommentId, reply),
    };
  });
};


const CommunityPage = () => {
  const { t, i18n } = useTranslation();
  const { isLoggedIn, currentUser } = useAuth();

  const [posts, setPosts] = useState([]);
  const [, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeSection, setActiveSection] = useState('discussion');
  const [sortOrder, setSortOrder] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [selectedTag, setSelectedTag] = useState('all');
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [problemType, setProblemType] = useState('bug');
  const [tagsInput, setTagsInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [aiSuggestedTags, setAiSuggestedTags] = useState([]);
  const [isFetchingAiTags, setIsFetchingAiTags] = useState(false);
  const [aiTagError, setAiTagError] = useState('');
  const [discussionSummaries, setDiscussionSummaries] = useState({});
  const [summaryErrors, setSummaryErrors] = useState({});
  const [summarizingPostId, setSummarizingPostId] = useState('');
  const [postErrors, setPostErrors] = useState({});
  const [creatingPost, setCreatingPost] = useState(false);

  const [commentsVisible, setCommentsVisible] = useState({});
  const [showAllComments, setShowAllComments] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentType, setCommentType] = useState('text');
  const [commentLanguage, setCommentLanguage] = useState('javascript');
  const [commentMeta, setCommentMeta] = useState(() => safeRead(STORAGE_KEYS.commentMeta, {}));
  const [codeOutputModal, setCodeOutputModal] = useState({
    isOpen: false,
    language: 'javascript',
    output: '',
    isError: false,
  });

  const [replyVisibility, setReplyVisibility] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});

  const [editingPost, setEditingPost] = useState({ postId: '', title: '', content: '' });
  const [savingPostEditId, setSavingPostEditId] = useState('');
  const [editingComment, setEditingComment] = useState({ postId: '', commentId: '', text: '' });
  const [savingCommentEditKey, setSavingCommentEditKey] = useState('');
  const [postReactions, setPostReactions] = useState(() => safeRead(STORAGE_KEYS.postReactions, {}));
  const [commentReactions, setCommentReactions] = useState(() => safeRead(STORAGE_KEYS.commentReactions, {}));
  const [savedItems, setSavedItems] = useState(() => safeRead(STORAGE_KEYS.savedItems, {}));
  const [bestAnswerByPost, setBestAnswerByPost] = useState(() => safeRead(STORAGE_KEYS.bestAnswers, {}));
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: '', postId: '', commentId: '' });

  useEffect(() => {
    void i18n.reloadResources([i18n.language], ['translation']);
  }, [i18n, i18n.language]);

  useEffect(() => {
    safeWrite(STORAGE_KEYS.postReactions, postReactions);
  }, [postReactions]);

  useEffect(() => {
    safeWrite(STORAGE_KEYS.commentReactions, commentReactions);
  }, [commentReactions]);

  useEffect(() => {
    safeWrite(STORAGE_KEYS.savedItems, savedItems);
  }, [savedItems]);

  useEffect(() => {
    safeWrite(STORAGE_KEYS.bestAnswers, bestAnswerByPost);
  }, [bestAnswerByPost]);

  useEffect(() => {
    safeWrite(STORAGE_KEYS.commentMeta, commentMeta);
  }, [commentMeta]);

  const currentUserId = useMemo(
    () => String(currentUser?._id || currentUser?.id || currentUser?.userId || ''),
    [currentUser],
  );

  const currentRole = String(currentUser?.role || '').toUpperCase();
  const isAdmin = currentRole === 'ADMIN';

  const isOwner = (authorId) => currentUserId && String(authorId || '') === currentUserId;

  const pushNotificationForUser = (userId, payload) => {
    if (!userId || !payload) return;
    const all = safeRead(STORAGE_KEYS.userNotifications, {});
    const existing = Array.isArray(all[userId]) ? all[userId] : [];

    const event = {
      actorId: String(payload.actorId || ''),
      actorUsername: String(payload.actorUsername || 'Someone'),
      actorAvatar: String(payload.actorAvatar || ''),
      actionText: String(payload.actionText || 'interacted with your post'),
      postId: String(payload.postId || ''),
      commentId: String(payload.commentId || ''),
      preview: String(payload.preview || '').slice(0, 220),
      createdAt: Date.now(),
      read: false,
    };

    safeWrite(STORAGE_KEYS.userNotifications, {
      ...all,
      [userId]: [event, ...existing].slice(0, 200),
    });
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const remotePosts = await communityService.getPosts();
      setPosts(Array.isArray(remotePosts) ? remotePosts : []);
    } catch (err) {
      setError(err.message || t('communityPage.errors.failedLoadPosts'));
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const remoteComments = await communityService.getComments();
      setComments(Array.isArray(remoteComments) ? remoteComments : []);
    } catch {
      setComments([]);
    }
  };

  useEffect(() => {
    void fetchPosts();
    void fetchComments();
  }, []);

  const allTags = useMemo(() => {
    const bag = new Set();
    posts.forEach((p) => {
      (p.tags || []).forEach((t) => {
        const normalized = String(t || '').trim().toLowerCase();
        if (normalized) bag.add(normalized);
      });
    });
    return [...bag].sort((a, b) => String(a).localeCompare(String(b)));
  }, [posts]);

  const getPostReaction = (postId) => postReactions[postId] || { likes: 0, dislikes: 0, userReaction: null };
  const getCommentReaction = (postId, commentId) =>
    commentReactions[`${postId}:${commentId}`] || { likes: 0, dislikes: 0, userReaction: null };

  const filteredAndSortedPosts = useMemo(() => {
    let list = [...posts];

    list = list.filter((post) => (activeSection === 'problems' ? post.type === 'problem' : post.type !== 'problem'));

    const q = deferredSearchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter((post) => {
        const titleHit = String(post.title || '').toLowerCase().includes(q);
        const contentHit = String(post.content || '').toLowerCase().includes(q);
        return titleHit || contentHit;
      });
    }

    if (selectedTag !== 'all') {
      list = list.filter((post) => (post.tags || []).map((t) => String(t).toLowerCase()).includes(selectedTag));
    }

    if (showSavedOnly && currentUserId) {
      const userSaved = new Set(savedItems[currentUserId] || []);
      list = list.filter((post) => userSaved.has(post._id));
    }

    list.sort((a, b) => {
      if ((a?.pinned ? 1 : 0) !== (b?.pinned ? 1 : 0)) {
        return (b?.pinned ? 1 : 0) - (a?.pinned ? 1 : 0);
      }

      if (sortOrder === 'liked') {
        return getPostReaction(b._id).likes - getPostReaction(a._id).likes;
      }

      if (sortOrder === 'commented') {
        return countCommentTree(b.comments || []) - countCommentTree(a.comments || []);
      }

      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();
      return bDate - aDate;
    });

    return list;
  }, [posts, activeSection, deferredSearchTerm, selectedTag, sortOrder, savedItems, showSavedOnly, currentUserId, postReactions, commentReactions]);

  const resetCreateForm = () => {
    setTitle('');
    setContent('');
    setProblemType('bug');
    setTagsInput('');
    setImageFile(null);
    setVideoFile(null);
    setImagePreviewUrl('');
    setVideoPreviewUrl('');
    setAiSuggestedTags([]);
    setAiTagError('');
    setPostErrors({});
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    resetCreateForm();
  };

  const validatePostForm = () => {
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = t('communityPage.errors.titleRequired');
    if (!content.trim()) nextErrors.content = activeSection === 'problems' ? t('communityPage.errors.descriptionRequired') : t('communityPage.errors.contentRequired');
    setPostErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleVideoSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const parseTags = (raw) => {
    return raw
      .split(',')
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 8);
  };

  const parsedTagsInput = useMemo(() => parseTags(tagsInput), [tagsInput]);

  const normalizeTagList = (list) => {
    if (!Array.isArray(list)) return [];
    const unique = [];
    const seen = new Set();

    list.forEach((entry) => {
      const tag = String(entry || '')
        .trim()
        .replace(/^#+/, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .slice(0, 24);

      if (!tag || seen.has(tag)) return;
      seen.add(tag);
      unique.push(tag);
    });

    return unique.slice(0, 8);
  };

  const mergeTagsToInput = (tags) => {
    const merged = normalizeTagList([...parsedTagsInput, ...tags]);
    setTagsInput(merged.join(', '));
  };

  const removeTagFromInput = (tagToRemove) => {
    const next = parsedTagsInput.filter((tag) => tag !== tagToRemove);
    setTagsInput(next.join(', '));
  };

  const toggleSuggestedTag = (tag) => {
    if (parsedTagsInput.includes(tag)) {
      removeTagFromInput(tag);
      return;
    }
    mergeTagsToInput([tag]);
  };

  const extractJsonArray = (text) => {
    const raw = String(text || '').trim();
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      const match = raw.match(/\[[\s\S]*\]/);
      if (!match) return [];
      try {
        const fallback = JSON.parse(match[0]);
        return Array.isArray(fallback) ? fallback : [];
      } catch {
        try {
          const normalizedQuotes = match[0].replace(/'/g, '"');
          const fallbackQuoted = JSON.parse(normalizedQuotes);
          return Array.isArray(fallbackQuoted) ? fallbackQuoted : [];
        } catch {
          return [];
        }
      }
    }
  };

  const requestAiTags = async (sourceText, { silent = false } = {}) => {
    if (!sourceText || sourceText.length < 20) {
      if (!silent) setAiTagError('Write a bit more title and description to generate useful tags.');
      return;
    }

    try {
      setIsFetchingAiTags(true);
      if (!silent) setAiTagError('');

      const modelText = await communityService.generateAiText({
        prompt: `Extract 3 to 5 relevant tags from this text. Return ONLY a JSON array like ['tag1','tag2'].\n\n${sourceText}`,
        maxTokens: GROQ_MAX_TOKENS,
        temperature: 0.2,
      });

      const rawTags = extractJsonArray(modelText);
      const normalized = normalizeTagList(rawTags).slice(0, 5);

      if (!normalized.length) {
        throw new Error('No valid tags returned');
      }

      setAiSuggestedTags(normalized);
      if (!silent) setAiTagError('');
    } catch (err) {
      if (!silent) {
        const message = String(err?.message || 'Unable to generate AI tags right now. Please try again.');
        setAiTagError(message.includes('HTTP') || message.includes('GROQ') || message.includes(':')
          ? message
          : 'Unable to generate AI tags right now. Please try again.');
      }
    } finally {
      setIsFetchingAiTags(false);
    }
  };

  const handleSummarizeDiscussion = async (post) => {
    const postId = post?._id;
    if (!postId) return;

    const commentTexts = flattenCommentTexts(post.comments || []);
    if (commentTexts.length === 0) {
      setSummaryErrors((prev) => ({ ...prev, [postId]: 'No comments to summarize yet.' }));
      return;
    }

    try {
      setSummarizingPostId(postId);
      setSummaryErrors((prev) => ({ ...prev, [postId]: '' }));

      const discussionText = commentTexts.join('\n- ');
      const summary = await communityService.generateAiText({
        prompt: `Summarize this discussion in 1-2 short, very clear sentences (max 35 words total). Use simple language and include only the main point and current outcome.\n\n${discussionText}`,
        maxTokens: GROQ_MAX_TOKENS,
        temperature: 0.2,
      });
      if (!summary) {
        throw new Error('Unable to summarize discussion right now.');
      }

      const cleanSummary = summary
        .replace(/^[\-*\d\.)\s]+/gm, '')
        .replace(/\s+/g, ' ')
        .trim();
      const sentenceParts = cleanSummary.match(/[^.!?]+[.!?]?/g) || [cleanSummary];

      const compactSummary = sentenceParts
        .slice(0, 2)
        .join(' ')
        .trim()
        .slice(0, 220)
        .trim();

      setDiscussionSummaries((prev) => ({ ...prev, [postId]: compactSummary || cleanSummary }));
    } catch (err) {
      setSummaryErrors((prev) => ({
        ...prev,
        [postId]: String(err?.message || 'Unable to summarize discussion right now.'),
      }));
    } finally {
      setSummarizingPostId('');
    }
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();

    if (!validatePostForm()) return;
    if (!isLoggedIn) {
      setError(t('communityPage.errors.signInCreatePost'));
      return;
    }

    try {
      setCreatingPost(true);
      setError('');

      const imageUrl = await uploadMediaAndGetUrl(imageFile);
      const videoUrl = await uploadMediaAndGetUrl(videoFile);

      const newPost = {
        title: title.trim(),
        content: content.trim(),
        type: activeSection === 'problems' ? 'problem' : 'normal',
        problemType: activeSection === 'problems' ? problemType : undefined,
        tags: parsedTagsInput,
        imageUrl,
        videoUrl,
      };
      console.log('Creating post:', newPost);
      const savedPost = await communityService.createPost(newPost);

      setPosts((prev) => [savedPost, ...prev]);
      handleCreateModalClose();
    } catch (err) {
      setError(err.message || t('communityPage.errors.unableCreatePost'));
    } finally {
      setCreatingPost(false);
    }
  };

  const toggleComments = (postId) => {
    setCommentsVisible((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const updateCommentDraft = (postId, update) => {
    setCommentDrafts((prev) => {
      const current = prev[postId] || emptyDraft();
      return {
        ...prev,
        [postId]: {
          ...current,
          ...update,
          error: update.error ?? '',
        },
      };
    });
  };

  const updateReplyDraft = (commentId, update) => {
    setReplyDrafts((prev) => {
      const current = prev[commentId] || emptyDraft();
      return {
        ...prev,
        [commentId]: {
          ...current,
          ...update,
          error: update.error ?? '',
        },
      };
    });
  };

  const handleCommentMediaSelect = (postId, field, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (field === 'image') {
      updateCommentDraft(postId, {
        imageFile: file,
        imagePreviewUrl: URL.createObjectURL(file),
      });
    } else {
      updateCommentDraft(postId, {
        videoFile: file,
        videoPreviewUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleReplyMediaSelect = (commentId, field, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (field === 'image') {
      updateReplyDraft(commentId, {
        imageFile: file,
        imagePreviewUrl: URL.createObjectURL(file),
      });
    } else {
      updateReplyDraft(commentId, {
        videoFile: file,
        videoPreviewUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleAddComment = async (event, postId) => {
    event.preventDefault();

    const draft = commentDrafts[postId] || emptyDraft();
    const text = (draft.text || '').trim();

    if (!text) {
      updateCommentDraft(postId, { error: t('communityPage.errors.commentRequired') });
      return;
    }

    if (!isLoggedIn) {
      setError(t('communityPage.errors.signInComment'));
      return;
    }

    try {
      const targetPost = posts.find((post) => String(post._id) === String(postId));
      const selectedType = targetPost?.type === 'problem' ? commentType : 'text';
      const selectedLanguage = selectedType === 'code' ? commentLanguage : '';
      updateCommentDraft(postId, { isSubmitting: true });
      setError('');

      const imageUrl = await uploadMediaAndGetUrl(draft.imageFile);
      const videoUrl = await uploadMediaAndGetUrl(draft.videoFile);

      const newComment = {
        postId,
        text,
        imageUrl,
        videoUrl,
      };
      const savedComment = await communityService.createComment(newComment);

      const savedCommentId = String(savedComment?._id || keyOf(savedComment));
      setCommentMeta((prev) => ({
        ...prev,
        [savedCommentId]: {
          id: savedCommentId,
          postId: String(postId),
          user: String(currentUser?.username || currentUser?.email || currentUserId || 'unknown'),
          type: selectedType,
          content: text,
          language: selectedLanguage,
          likes: 0,
        },
      }));

      if (targetPost?.authorId && !isOwner(targetPost.authorId)) {
        pushNotificationForUser(String(targetPost.authorId), {
          actorId: currentUserId,
          actorUsername: currentUser?.username || 'Someone',
          actorAvatar: currentUser?.avatar || '',
          actionText: 'commented on your post',
          postId,
          preview: text,
        });
      }
      setComments((prev) => [savedComment, ...prev]);

      setPosts((prev) => {
        return prev.map((post) => {
          if (String(post._id) !== String(postId)) return post;
          return {
            ...post,
            comments: [savedComment, ...(Array.isArray(post.comments) ? post.comments : [])],
            updatedAt: new Date().toISOString(),
          };
        });
      });
      setCommentsVisible((prev) => ({ ...prev, [postId]: true }));
      setCommentDrafts((prev) => ({ ...prev, [postId]: emptyDraft() }));
    } catch (err) {
      setError(err.message || t('communityPage.errors.unableAddComment'));
      updateCommentDraft(postId, { isSubmitting: false });
      return;
    }

    updateCommentDraft(postId, { isSubmitting: false });
  };

  const handleAddReply = async (event, postId, commentId) => {
    event.preventDefault();

    const draft = replyDrafts[commentId] || emptyDraft();
    const text = (draft.text || '').trim();

    if (!text) {
      updateReplyDraft(commentId, { error: t('communityPage.errors.replyRequired') });
      return;
    }

    if (!isLoggedIn) {
      setError(t('communityPage.errors.signInReply'));
      return;
    }

    try {
      updateReplyDraft(commentId, { isSubmitting: true });
      setError('');

      const imageUrl = await uploadMediaAndGetUrl(draft.imageFile);
      const videoUrl = await uploadMediaAndGetUrl(draft.videoFile);

      const newReply = {
        postId,
        parentCommentId: commentId,
        text,
        imageUrl,
        videoUrl,
      };
      const savedReply = await communityService.createComment(newReply);

      setComments((prev) => [savedReply, ...prev]);

      setPosts((prev) => {
        return prev.map((post) => {
          if (String(post._id) !== String(postId)) return post;
          return {
            ...post,
            comments: addReplyInTree(post.comments || [], commentId, savedReply),
            updatedAt: new Date().toISOString(),
          };
        });
      });
      setReplyDrafts((prev) => ({ ...prev, [commentId]: emptyDraft() }));
      setReplyVisibility((prev) => ({ ...prev, [commentId]: false }));
      setCommentsVisible((prev) => ({ ...prev, [postId]: true }));
    } catch (err) {
      setError(err.message || t('communityPage.errors.unableAddReply'));
      updateReplyDraft(commentId, { isSubmitting: false });
      return;
    }

    updateReplyDraft(commentId, { isSubmitting: false });
  };

  const handleDeletePost = async (postId) => {
    try {
      await communityService.deletePost(postId);
      setPosts((prev) => prev.filter((post) => String(post._id) !== String(postId)));
      await fetchComments();
    } catch (err) {
      setError(err.message || t('communityPage.errors.unableDeletePost'));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const updatedPost = await communityService.deleteComment(postId, commentId);
      setPosts((prev) => prev.map((post) => (String(post._id) === String(postId) ? updatedPost : post)));
      await fetchComments();
    } catch (err) {
      setError(err.message || t('communityPage.errors.unableDeleteComment'));
    }
  };

  const openDeleteConfirm = (type, postId, commentId = '') => {
    setDeleteConfirm({ isOpen: true, type, postId, commentId });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: false, type: '', postId: '', commentId: '' });
  };

  const confirmDelete = async () => {
    const { type, postId, commentId } = deleteConfirm;
    if (!type || !postId) return;

    if (type === 'post') {
      await handleDeletePost(postId);
    }

    if (type === 'comment' && commentId) {
      await handleDeleteComment(postId, commentId);
    }

    closeDeleteConfirm();
  };

  const handleToggleSolved = async (post) => {
    try {
      const updatedPost = await communityService.setPostSolved(post._id, !post?.solved);
      setPosts((prev) => prev.map((x) => (String(x._id) === String(post._id) ? updatedPost : x)));
    } catch (err) {
      setError(err.message || t('communityPage.errors.unableUpdateSolved'));
    }
  };

  const handleTogglePostPin = async (post) => {
    try {
      const updatedPost = await communityService.setPostPinned(post._id, !post?.pinned);
      setPosts((prev) => prev.map((x) => (String(x._id) === String(post._id) ? updatedPost : x)));
    } catch (err) {
      setError(err.message || t('communityPage.errors.unablePinPost'));
    }
  };

  const handleToggleCommentPin = async (postId, comment) => {
    if (!comment?._id) return;
    try {
      const updatedPost = await communityService.setCommentPinned(postId, comment._id, !comment?.pinned);
      setPosts((prev) => prev.map((x) => (String(x._id) === String(postId) ? updatedPost : x)));
      await fetchComments();
    } catch (err) {
      setError(err.message || t('communityPage.errors.unablePinComment'));
    }
  };

  const handleStartPostEdit = (post) => {
    setEditingPost({ postId: post._id, title: post.title || '', content: post.content || '' });
  };

  const handleCancelPostEdit = () => {
    setEditingPost({ postId: '', title: '', content: '' });
  };

  const handleSavePostEdit = async (postId) => {
    const trimmedTitle = editingPost.title.trim();
    const trimmedContent = editingPost.content.trim();

    if (!trimmedTitle || !trimmedContent) {
      setError(t('communityPage.errors.titleAndContentRequired'));
      return;
    }

    try {
      setSavingPostEditId(postId);
      setError('');
      const updatedPost = await communityService.updatePost(postId, {
        title: trimmedTitle,
        content: trimmedContent,
      });
      setPosts((prev) => prev.map((post) => (String(post._id) === String(postId) ? updatedPost : post)));
      handleCancelPostEdit();
    } catch (err) {
      setError(err.message || t('communityPage.errors.unableModifyPost'));
    } finally {
      setSavingPostEditId('');
    }
  };

  const handleStartCommentEdit = (postId, comment) => {
    setEditingComment({ postId, commentId: comment._id || '', text: comment.text || '' });
  };

  const handleCancelCommentEdit = () => {
    setEditingComment({ postId: '', commentId: '', text: '' });
  };

  const handleSaveCommentEdit = async (postId, commentId) => {
    const trimmedText = editingComment.text.trim();
    if (!trimmedText) {
      setError(t('communityPage.errors.commentTextRequired'));
      return;
    }

    if (!commentId) {
      setError(t('communityPage.errors.unableModifyThisComment'));
      return;
    }

    try {
      setSavingCommentEditKey(`${postId}:${commentId}`);
      setError('');
      const updatedPost = await communityService.updateComment(postId, commentId, { text: trimmedText });
      setPosts((prev) => prev.map((post) => (String(post._id) === String(postId) ? updatedPost : post)));
      await fetchComments();
      handleCancelCommentEdit();
    } catch (err) {
      setError(err.message || t('communityPage.errors.unableModifyComment'));
    } finally {
      setSavingCommentEditKey('');
    }
  };

  const toggleSavePost = (postId) => {
    if (!currentUserId) return;
    setSavedItems((prev) => {
      const current = new Set(prev[currentUserId] || []);
      if (current.has(postId)) {
        current.delete(postId);
      } else {
        current.add(postId);
      }
      return {
        ...prev,
        [currentUserId]: [...current],
      };
    });
  };

  const isPostSaved = (postId) => {
    if (!currentUserId) return false;
    return (savedItems[currentUserId] || []).includes(postId);
  };

  const togglePostReaction = (postId, reaction) => {
    const current = postReactions[postId] || { likes: 0, dislikes: 0, userReaction: null };
    const targetPost = posts.find((post) => String(post._id) === String(postId));
    const isNewReaction =
      (reaction === 'like' && current.userReaction !== 'like')
      || (reaction === 'dislike' && current.userReaction !== 'dislike');

    setPostReactions((prev) => {
      const localCurrent = prev[postId] || { likes: 0, dislikes: 0, userReaction: null };
      const next = { ...localCurrent };

      if (reaction === 'like') {
        if (localCurrent.userReaction === 'like') {
          next.likes = Math.max(0, next.likes - 1);
          next.userReaction = null;
        } else {
          if (localCurrent.userReaction === 'dislike') next.dislikes = Math.max(0, next.dislikes - 1);
          next.likes += 1;
          next.userReaction = 'like';
        }
      }

      if (reaction === 'dislike') {
        if (localCurrent.userReaction === 'dislike') {
          next.dislikes = Math.max(0, next.dislikes - 1);
          next.userReaction = null;
        } else {
          if (localCurrent.userReaction === 'like') next.likes = Math.max(0, next.likes - 1);
          next.dislikes += 1;
          next.userReaction = 'dislike';
        }
      }

      return {
        ...prev,
        [postId]: next,
      };
    });

    if (isNewReaction && targetPost?.authorId && !isOwner(targetPost.authorId)) {
      pushNotificationForUser(String(targetPost.authorId), {
        actorId: currentUserId,
        actorUsername: currentUser?.username || 'Someone',
        actorAvatar: currentUser?.avatar || '',
        actionText: `${reaction}d your post`,
        postId,
        preview: String(targetPost?.content || '').slice(0, 120),
      });
    }
  };

  const toggleCommentReaction = (postId, commentId, reaction) => {
    const key = `${postId}:${commentId}`;
    const current = commentReactions[key] || { likes: 0, dislikes: 0, userReaction: null };
    const targetPost = posts.find((post) => String(post._id) === String(postId));
    const targetComment = findCommentById(targetPost?.comments || [], commentId);
    const isNewReaction =
      (reaction === 'like' && current.userReaction !== 'like')
      || (reaction === 'dislike' && current.userReaction !== 'dislike');

    setCommentReactions((prev) => {
      const localCurrent = prev[key] || { likes: 0, dislikes: 0, userReaction: null };
      const next = { ...localCurrent };

      if (reaction === 'like') {
        if (localCurrent.userReaction === 'like') {
          next.likes = Math.max(0, next.likes - 1);
          next.userReaction = null;
        } else {
          if (localCurrent.userReaction === 'dislike') next.dislikes = Math.max(0, next.dislikes - 1);
          next.likes += 1;
          next.userReaction = 'like';
        }
      }

      if (reaction === 'dislike') {
        if (localCurrent.userReaction === 'dislike') {
          next.dislikes = Math.max(0, next.dislikes - 1);
          next.userReaction = null;
        } else {
          if (localCurrent.userReaction === 'like') next.likes = Math.max(0, next.likes - 1);
          next.dislikes += 1;
          next.userReaction = 'dislike';
        }
      }

      return {
        ...prev,
        [key]: next,
      };
    });

    if (isNewReaction && targetComment?.authorId && !isOwner(targetComment.authorId)) {
      pushNotificationForUser(String(targetComment.authorId), {
        actorId: currentUserId,
        actorUsername: currentUser?.username || 'Someone',
        actorAvatar: currentUser?.avatar || '',
        actionText: `${reaction}d your comment`,
        postId,
        commentId,
        preview: String(targetComment?.text || '').slice(0, 120),
      });
    }
  };

  const handleMarkBestAnswer = (postId, postAuthorId, comment) => {
    const normalizedPostId = String(postId || '');
    const commentId = String(comment?._id || '');
    if (!normalizedPostId || !commentId) return;
    if (!isOwner(postAuthorId)) return;

    const isAlreadyBest = String(bestAnswerByPost[normalizedPostId] || '') === commentId;

    setBestAnswerByPost((prev) => ({
      ...prev,
      [normalizedPostId]: isAlreadyBest ? '' : commentId,
    }));

  };

  const resolveCommentMeta = (comment, postId) => {
    const commentId = String(comment?._id || keyOf(comment));
    const stored = commentMeta[commentId] || {};
    const type = stored?.type === 'code' ? 'code' : 'text';
    const language = type === 'code'
      ? String(stored?.language || 'javascript').toLowerCase()
      : '';

    return {
      id: commentId,
      postId: String(postId || stored?.postId || ''),
      user: String(stored?.user || comment?.authorUsername || 'unknown'),
      type,
      content: String(comment?.text || stored?.content || ''),
      language,
      likes: Number(stored?.likes || 0),
    };
  };

  const handleRunCode = (commentRecord) => {
    if (!commentRecord || commentRecord.type !== 'code') return;

    const serializeValue = (value) => {
      if (typeof value === 'function') {
        return `[Function${value.name ? `: ${value.name}` : ''}]`;
      }
      if (typeof value === 'string') return value;
      if (typeof value === 'number' || typeof value === 'boolean' || value == null) {
        return String(value);
      }
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    };

    const buildHint = (message, sourceCode) => {
      const msg = String(message || '').toLowerCase();
      if (msg.includes('illegal return')) {
        return 'Hint: Put return inside a function body, or just write an expression like 2 + 2.';
      }
      if (msg.includes('is not defined')) {
        return 'Hint: A variable/function name is missing. Check spelling and declaration scope.';
      }
      if (msg.includes('unexpected token')) {
        return 'Hint: Check for syntax typos near punctuation, brackets, or commas.';
      }
      if (msg.includes('missing') && (msg.includes(')') || msg.includes(']') || msg.includes('}'))) {
        return 'Hint: One closing bracket might be missing.';
      }
      if (!String(sourceCode || '').trim()) {
        return 'Hint: Add code before running.';
      }
      return 'Hint: Check syntax and variable names near the reported line.';
    };

    const extractUserLine = (errorObj) => {
      const stack = String(errorObj?.stack || '');
      const match = stack.match(/<anonymous>:(\d+):(\d+)/);
      if (!match) return null;

      // Function wrapper adds one line for "use strict".
      const rawLine = Number(match[1]);
      const column = Number(match[2]);
      const line = Number.isFinite(rawLine) ? Math.max(1, rawLine - 1) : null;
      return line ? { line, column } : null;
    };

    const formatTerminalOutput = ({ logs = [], resultText = '', errorText = '', hintText = '', lineInfo = null, language = 'javascript', exitCode = 0 }) => {
      const rows = [];
      rows.push(`[terminal] language=${language}`);
      rows.push('[terminal] executing...');

      if (logs.length > 0) {
        rows.push('[stdout]');
        logs.forEach((line) => rows.push(serializeValue(line)));
      }

      if (lineInfo?.line) {
        rows.push(`[error-line] line ${lineInfo.line}${lineInfo.column ? `, column ${lineInfo.column}` : ''}`);
      }

      if (errorText) {
        rows.push(`[stderr] ${errorText}`);
      }

      if (resultText && !errorText) {
        rows.push(`[result] ${resultText}`);
      }

      if (hintText) {
        rows.push(hintText);
      }

      rows.push(`[terminal] exited with code ${exitCode}`);
      return rows.join('\n');
    };

    const handleFunctionResult = (fn, sourceCode) => {
      if (typeof fn !== 'function') {
        return {
          result: fn,
          hint: '',
        };
      }

      const code = String(sourceCode || '');
      const fnName = String(fn.name || '').trim();
      const looksLikeTwoSum = /two\s*sum|twoSum|nums|target/i.test(code) || fnName === 'twoSum';

      if (looksLikeTwoSum) {
        try {
          const demoResult = fn([2, 7, 11, 15], 9);
          return {
            result: `Demo call ${fnName || 'solution'}([2,7,11,15], 9) => ${serializeValue(demoResult)}`,
            hint: 'Hint: Your code returned a function, so demo inputs were used automatically.',
          };
        } catch (invokeError) {
          return {
            result: '[Function detected]',
            hint: `Hint: Function detected but demo execution failed: ${String(invokeError?.message || 'Unknown error')}`,
          };
        }
      }

      return {
        result: '[Function detected]',
        hint: `Hint: Call the function with inputs to get a solution value, e.g. ${fnName || 'yourFunction'}(...)`,
      };
    };

    if (commentRecord.language !== 'javascript') {
      setCodeOutputModal({
        isOpen: true,
        language: commentRecord.language,
        output: formatTerminalOutput({
          language: commentRecord.language,
          errorText: 'Execution not supported for this language (demo mode)',
          hintText: 'Hint: Switch language to JavaScript to run in this demo terminal.',
          exitCode: 1,
        }),
        isError: false,
      });
      return;
    }

    const capturedLogs = [];
    const originalLog = console.log;

    try {

      console.log = (...args) => {
        capturedLogs.push(args.map((arg) => serializeValue(arg)).join(' '));
      };

      // Execute as a function body so `return` statements are valid in demo runner.
      const runAsBody = new Function(`"use strict";\n${commentRecord.content}`);
      let result = runAsBody();

      // If no explicit return was used, try treating input as a single expression.
      if (result === undefined) {
        try {
          const runAsExpression = new Function(`"use strict";\nreturn (${commentRecord.content});`);
          result = runAsExpression();
        } catch {
          // Keep undefined from body execution.
        }
      }

      if (result === undefined) {
        const lines = String(commentRecord.content || '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);
        const lastLine = lines[lines.length - 1] || '';
        const prefix = lines.slice(0, -1).join('\n');

        if (lastLine) {
          try {
            const runLastExpression = new Function(`"use strict";\n${prefix}\nreturn (${lastLine});`);
            result = runLastExpression();
          } catch {
            // Keep previous result.
          }
        }
      }

      const functionResult = handleFunctionResult(result, commentRecord.content);
      const finalResultText = serializeValue(functionResult.result ?? 'undefined');
      const finalHintText = functionResult.hint || '';

      setCodeOutputModal({
        isOpen: true,
        language: 'javascript',
        output: formatTerminalOutput({
          logs: capturedLogs,
          resultText: finalResultText,
          hintText: finalHintText,
          language: 'javascript',
          exitCode: 0,
        }),
        isError: false,
      });
    } catch (runError) {
      const lineInfo = extractUserLine(runError);
      const errorMessage = String(runError?.message || 'Execution failed');
      const hintText = buildHint(errorMessage, commentRecord.content);

      setCodeOutputModal({
        isOpen: true,
        language: 'javascript',
        output: formatTerminalOutput({
          errorText: errorMessage,
          hintText,
          lineInfo,
          language: 'javascript',
          exitCode: 1,
        }),
        isError: true,
      });
    } finally {
      console.log = originalLog;
    }
  };

  const renderMedia = (mediaUrl, isVideo = false) => {
    if (!mediaUrl) return null;
    const mediaSrc = toMediaUrl(mediaUrl);

    if (isVideo) {
      return (
        <Box mt={2} borderRadius="8px" overflow="hidden" border="1px solid rgba(34, 211, 238, 0.2)">
          <video
            src={mediaSrc}
            controls
            preload="metadata"
            style={{ width: '100%', maxHeight: '220px', background: 'var(--color-terminal-bg)' }}
          />
        </Box>
      );
    }
    return (
      <Box
        w="full"
        h="180px"
        borderRadius="8px"
        overflow="hidden"
        bg="rgba(0, 0, 0, 0.3)"
        border="1px solid rgba(34, 211, 238, 0.2)"
      >
        <Box
          as="img"
          src={mediaSrc}
          alt=""
          loading="lazy"
          decoding="async"
          width="100%"
          height="100%"
          objectFit="cover"
        />
      </Box>
    );
  };

  const renderCommentTree = (items, postId, postAuthorId, depth = 0) => {
    if (!Array.isArray(items) || items.length === 0) return null;

    const bestAnswerId = String(bestAnswerByPost[postId] || '');
    const sorted = moveCommentToTopById(sortCommentsPinnedFirst(items), bestAnswerId);

    return sorted.map((comment) => {
      const commentId = keyOf(comment);
      const commentRecord = resolveCommentMeta(comment, postId);
      const isCodeComment = commentRecord.type === 'code';
      const isEditing = editingComment.postId === postId && editingComment.commentId === (comment._id || '');
      const replyDraft = replyDrafts[commentId] || emptyDraft();
      const repliesOpen = Boolean(replyVisibility[commentId]);
      const canDelete = isOwner(comment.authorId) || isAdmin;
      const commentReaction = getCommentReaction(postId, comment._id || commentId);
      const isBestAnswer = String(comment?._id || '') && String(comment._id) === bestAnswerId;
      const canMarkBestAnswer = isOwner(postAuthorId) && comment?._id;

      return (
        <Box
          key={commentId}
          bg={isBestAnswer ? 'rgba(16, 185, 129, 0.12)' : (isCodeComment ? 'rgba(59, 130, 246, 0.08)' : (comment?.pinned ? 'rgba(34, 211, 238, 0.08)' : 'var(--color-bg-primary)'))}
          border="1px solid"
          borderColor={isBestAnswer ? 'rgba(16, 185, 129, 0.65)' : (isCodeComment ? 'rgba(59, 130, 246, 0.45)' : (comment?.pinned ? 'rgba(34, 211, 238, 0.65)' : 'rgba(148, 163, 184, 0.22)'))}
          borderRadius="10px"
          p={2.5}
          ml={depth > 0 ? `${Math.min(depth, 5) * 20}px` : '0'}
          mt={2}
          sx={{ contentVisibility: 'auto', containIntrinsicSize: '220px' }}
        >
          <Flex justify="space-between" align={{ base: 'start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap={2}>
            <HStack spacing={2}>
              <Avatar size="xs" src={comment.authorAvatar || undefined} name={comment.authorUsername || 'unknown'} />
              <Text color="brand.500" fontWeight="semibold" fontSize="sm">@{comment.authorUsername || 'unknown'}</Text>
              <Badge colorScheme={isCodeComment ? 'blue' : 'gray'} variant="subtle" fontSize="10px" px={1.5} py={0.5}>
                {isCodeComment ? '💻 Code Solution' : '💬 Comment'}
              </Badge>
              {isCodeComment && (
                <Badge colorScheme="purple" variant="subtle" fontSize="10px" px={1.5} py={0.5} textTransform="uppercase">
                  {commentRecord.language || 'javascript'}
                </Badge>
              )}
              {comment?.pinned && (
                <Badge colorScheme="cyan" variant="subtle" fontSize="10px" px={1.5} py={0.5}>
                  {t('communityPage.pinned')}
                </Badge>
              )}
              {isBestAnswer && (
                <Badge colorScheme="green" variant="subtle" fontSize="10px" px={1.5} py={0.5}>
                  {t('communityPage.bestAnswer')}
                </Badge>
              )}
            </HStack>
            <HStack spacing={2} flexWrap="wrap">
              <Text color="gray.500" fontSize="xs">{relativeTime(comment.createdAt)}</Text>
              {canMarkBestAnswer && (
                <Button
                  size="xs"
                  variant="ghost"
                  border="1px solid"
                  borderColor="rgba(16, 185, 129, 0.55)"
                  color="green.300"
                  onClick={() => handleMarkBestAnswer(postId, postAuthorId, comment)}
                >
                  {isBestAnswer ? t('communityPage.unmarkBest') : t('communityPage.markBest')}
                </Button>
              )}
              {isAdmin && comment._id && (
                <Button
                  size="xs"
                  variant="ghost"
                  border="1px solid"
                  borderColor="rgba(34, 211, 238, 0.35)"
                  onClick={() => handleToggleCommentPin(postId, comment)}
                >
                  {comment?.pinned ? t('communityPage.unpin') : t('communityPage.pin')}
                </Button>
              )}
              {isOwner(comment.authorId) && comment._id && (
                <Button
                  size="xs"
                  variant="ghost"
                  border="1px solid"
                  borderColor="rgba(34, 211, 238, 0.35)"
                  onClick={() => handleStartCommentEdit(postId, comment)}
                >
                  {t('communityPage.modify')}
                </Button>
              )}
              {canDelete && comment._id && (
                <Button
                  size="xs"
                  variant="ghost"
                  border="1px solid"
                  borderColor="rgba(239, 68, 68, 0.5)"
                  color="red.300"
                  onClick={() => openDeleteConfirm('comment', postId, comment._id)}
                >
                  {t('communityPage.delete')}
                </Button>
              )}
            </HStack>
          </Flex>

          {!isEditing ? (
            <>
              {!isCodeComment ? (
                <Text mt={2} color="var(--color-text-secondary)" fontSize="sm" whiteSpace="pre-wrap">{comment.text}</Text>
              ) : (
                <VStack align="stretch" spacing={2} mt={2}>
                  <Box
                    as="pre"
                    p={3}
                    borderRadius="8px"
                    bg="rgba(2, 6, 23, 0.9)"
                    border="1px solid rgba(59, 130, 246, 0.35)"
                    color="blue.100"
                    fontFamily="mono"
                    fontSize="xs"
                    whiteSpace="pre-wrap"
                    overflowX="auto"
                  >
                    <Box as="code">{comment.text}</Box>
                  </Box>
                  <Button
                    size="xs"
                    alignSelf="flex-start"
                    variant="outline"
                    colorScheme="blue"
                    onClick={() => handleRunCode(commentRecord)}
                  >
                    ▶ Run Code
                  </Button>
                </VStack>
              )}
              {renderMedia(comment.imageUrl, false)}
              {renderMedia(comment.videoUrl, true)}
            </>
          ) : (
            <VStack align="stretch" spacing={2} mt={2}>
              <Textarea
                value={editingComment.text}
                onChange={(e) => setEditingComment((prev) => ({ ...prev, text: e.target.value }))}
                minH="80px"
                bg="#0b1220"
                borderColor="var(--color-border)"
                color="var(--color-text-primary)"
              />
              <HStack justify="flex-end">
                <Button size="xs" variant="ghost" onClick={handleCancelCommentEdit}>{t('communityPage.cancel')}</Button>
                <Button
                  size="xs"
                  variant="primary"
                  isLoading={savingCommentEditKey === `${postId}:${comment._id}`}
                  onClick={() => handleSaveCommentEdit(postId, comment._id)}
                >
                  {t('communityPage.save')}
                </Button>
              </HStack>
            </VStack>
          )}

          {!isEditing && (
            <VStack align="stretch" spacing={2} mt={2}>
              <HStack spacing={2}>
                <Button
                  size="xs"
                  variant={commentReaction.userReaction === 'like' ? 'solid' : 'ghost'}
                  colorScheme="cyan"
                  border="1px solid"
                  borderColor="rgba(34, 211, 238, 0.35)"
                  leftIcon={<ThumbUpIcon width={11} height={11} />}
                  onClick={() => toggleCommentReaction(postId, comment._id || commentId, 'like')}
                >
                  {commentReaction.likes}
                </Button>
                <Button
                  size="xs"
                  variant={commentReaction.userReaction === 'dislike' ? 'solid' : 'ghost'}
                  colorScheme="red"
                  border="1px solid"
                  borderColor="rgba(239, 68, 68, 0.45)"
                  leftIcon={<ThumbDownIcon width={11} height={11} />}
                  onClick={() => toggleCommentReaction(postId, comment._id || commentId, 'dislike')}
                >
                  {commentReaction.dislikes}
                </Button>
              </HStack>

              <HStack spacing={2}>
                <Button
                  size="xs"
                  variant="ghost"
                  border="1px solid"
                  borderColor="rgba(34, 211, 238, 0.35)"
                  onClick={() => setReplyVisibility((prev) => ({ ...prev, [commentId]: !prev[commentId] }))}
                >
                  {t('communityPage.reply')}
                </Button>
              </HStack>

              {repliesOpen && (
                <Box as="form" onSubmit={(event) => handleAddReply(event, postId, comment._id)}>
                  <VStack align="stretch" spacing={2}>
                    <Textarea
                      value={replyDraft.text}
                      onChange={(e) => updateReplyDraft(commentId, { text: e.target.value })}
                      placeholder={isLoggedIn ? t('communityPage.writeReply') : t('communityPage.signInToReply')}
                      minH="70px"
                      resize="vertical"
                      bg="#0b1220"
                      borderColor="var(--color-border)"
                      color="var(--color-text-primary)"
                      isDisabled={!isLoggedIn}
                    />

                    <HStack spacing={2}>
                      <Button as="label" size="xs" variant="outline" borderColor="brand.500" color="brand.300" cursor="pointer">
                        <ImageIcon width={12} height={12} />
                        <Text ml={1}>{t('communityPage.image')}</Text>
                        <Input type="file" accept="image/*" onChange={(e) => handleReplyMediaSelect(commentId, 'image', e)} hidden />
                      </Button>
                      <Button as="label" size="xs" variant="outline" borderColor="brand.500" color="brand.300" cursor="pointer">
                        <VideoIcon width={12} height={12} />
                        <Text ml={1}>{t('communityPage.video')}</Text>
                        <Input type="file" accept="video/*" onChange={(e) => handleReplyMediaSelect(commentId, 'video', e)} hidden />
                      </Button>
                    </HStack>

                    {replyDraft.imagePreviewUrl && (
                      <Box
                        w="full"
                        h="120px"
                        borderRadius="8px"
                        border="1px solid rgba(34, 211, 238, 0.2)"
                        backgroundImage={`url(${replyDraft.imagePreviewUrl})`}
                        backgroundSize="cover"
                        backgroundPosition="center"
                      />
                    )}
                    {replyDraft.videoPreviewUrl && (
                      <Box borderRadius="8px" overflow="hidden" border="1px solid rgba(34, 211, 238, 0.2)">
                        <video src={replyDraft.videoPreviewUrl} controls style={{ width: '100%', maxHeight: '160px', background: '#020617' }} />
                      </Box>
                    )}

                    {replyDraft.error && <Text color="red.300" fontSize="xs">{replyDraft.error}</Text>}

                    <HStack justify="flex-end">
                      <Button size="xs" variant="ghost" onClick={() => setReplyVisibility((prev) => ({ ...prev, [commentId]: false }))}>{t('communityPage.cancel')}</Button>
                      <Button
                        type="submit"
                        size="xs"
                        variant="primary"
                        isLoading={replyDraft.isSubmitting}
                        isDisabled={!isLoggedIn}
                      >
                        {t('communityPage.postReply')}
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              )}

              {Array.isArray(comment.replies) && comment.replies.length > 0 && renderCommentTree(comment.replies, postId, postAuthorId, depth + 1)}
            </VStack>
          )}
        </Box>
      );
    });
  };

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      minH="100vh"
      pt={{ base: 24, md: 28 }}
      pb={{ base: 10, md: 16 }}
      px={{ base: 4, sm: 6, lg: 8 }}
      bg="var(--color-bg-primary)"
      bgImage="linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)"
      bgSize="50px 50px"
    >
      <Box maxW="7xl" mx="auto">
        <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'start', md: 'center' }} justify="space-between" gap={4} mb={6}>
          <Box>
            <Text fontFamily="heading" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold" color="var(--color-text-heading)">
              {t('communityPage.title')}
            </Text>
            <Text mt={2} color="var(--color-text-muted)" fontFamily="body">
              {t('communityPage.subtitle')}
            </Text>
          </Box>

          <HStack spacing={3} w={{ base: 'full', md: 'auto' }} align="center" flexWrap="wrap">
            {isAdmin && (
              <Button
                as={RouterLink}
                to="/community/dashboard"
                variant="outline"
                colorScheme="cyan"
                size="sm"
              >
                {t('communityPage.communityDashboard')}
              </Button>
            )}

            <Button
              leftIcon={<BookmarkIcon width={14} height={14} />}
              variant={showSavedOnly ? 'solid' : 'outline'}
              colorScheme="cyan"
              size="sm"
              onClick={() => setShowSavedOnly((prev) => !prev)}
            >
              {t('communityPage.savedItems')}
            </Button>

            <Button leftIcon={<PlusIcon width={16} height={16} />} variant="primary" onClick={() => setIsCreateModalOpen(true)} isDisabled={!isLoggedIn}>
              {activeSection === 'problems' ? t('communityPage.createProblem') : t('communityPage.createPost')}
            </Button>
          </HStack>
        </Flex>

        <VStack align="stretch" spacing={3} mb={6}>
          <HStack spacing={3}>
            <Button
              size="sm"
              variant={activeSection === 'discussion' ? 'solid' : 'outline'}
              colorScheme="cyan"
              onClick={() => setActiveSection('discussion')}
              transition="all 0.2s ease"
            >
              {t('communityPage.discussion')}
            </Button>
            <Button
              size="sm"
              variant={activeSection === 'problems' ? 'solid' : 'outline'}
              colorScheme="cyan"
              onClick={() => setActiveSection('problems')}
              transition="all 0.2s ease"
            >
              {t('communityPage.problems')}
            </Button>
          </HStack>

          <Flex direction={{ base: 'column', md: 'row' }} gap={3}>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('communityPage.searchPlaceholder')}
              bg="var(--color-bg-secondary)"
              borderColor="var(--color-border)"
              color="var(--color-text-primary)"
              _hover={{ borderColor: 'brand.500' }}
              _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #22d3ee' }}
            />

            <Select
              aria-label={t('communityPage.sortAria')}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              bg="var(--color-bg-secondary)"
              borderColor="var(--color-border)"
              color="var(--color-text-primary)"
              w={{ base: 'full', md: '220px' }}
            >
              <option value="recent" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>{t('communityPage.sortMostRecent')}</option>
              <option value="liked" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>{t('communityPage.sortMostLiked')}</option>
              <option value="commented" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>{t('communityPage.sortMostCommented')}</option>
            </Select>

            <Select
              aria-label={t('communityPage.filterTagsAria')}
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              bg="var(--color-bg-secondary)"
              borderColor="var(--color-border)"
              color="var(--color-text-primary)"
              w={{ base: 'full', md: '220px' }}
            >
              <option value="all" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>{t('communityPage.allTags')}</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag} style={{ backgroundColor: 'var(--color-bg-secondary)' }}>#{tag}</option>
              ))}
            </Select>
          </Flex>
        </VStack>

        {error && (
          <Box mb={6} bg="rgba(239, 68, 68, 0.12)" border="1px solid rgba(239, 68, 68, 0.4)" borderRadius="12px" px={4} py={3}>
            <Text color="red.300" fontSize="sm">{error}</Text>
          </Box>
        )}

        <MotionBox key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
{loading ? (
            <Flex justify="center" py={14}>
              <Spinner size="lg" color="brand.500" thickness="3px" />
            </Flex>
          ) : (
            <VStack spacing={4} align="stretch">
              {filteredAndSortedPosts.length === 0 ? (
                <Box bg="var(--color-bg-secondary)" border="1px solid" borderColor="var(--color-border)" borderRadius="14px" p={7} textAlign="center">
                  <Text color="var(--color-text-muted)" fontSize="lg" fontFamily="heading">
                    {activeSection === 'problems' ? t('communityPage.noProblemsYet') : t('communityPage.noPostsYet')}
                  </Text>
                </Box>
              ) : (
                filteredAndSortedPosts.map((post) => {
                  const postId = post._id;
                  const commentsOpen = Boolean(commentsVisible[postId]);
                  const baseComments = Array.isArray(post.comments) ? post.comments : [];
                  const allComments = commentsOpen
                    ? moveCommentToTopById(sortCommentsPinnedFirst(baseComments), bestAnswerByPost[postId])
                    : baseComments;
                  const expanded = Boolean(showAllComments[postId]);
                  const visibleComments = expanded ? allComments : allComments.slice(0, COMMENT_PREVIEW_LIMIT);
                  const hiddenCount = Math.max(0, allComments.length - visibleComments.length);
                  const draft = commentDrafts[postId] || emptyDraft();
                  const isEditingPost = editingPost.postId === postId;
                  const canDeletePost = isOwner(post.authorId) || isAdmin;
                  const postReaction = getPostReaction(postId);
                  const totalComments = countCommentTree(post.comments || []);
                  const backendLikes = Number(post?.likesCount || (Array.isArray(post?.likes) ? post.likes.length : 0) || 0);
                  const backendDislikes = Number(post?.dislikesCount || (Array.isArray(post?.dislikes) ? post.dislikes.length : 0) || 0);
                  const totalLikes = Math.max(Number(postReaction.likes || 0), backendLikes);
                  const totalDislikes = Math.max(Number(postReaction.dislikes || 0), backendDislikes);
                  const score = totalLikes + (totalComments * 2);
                  const likeRatio = totalLikes + totalDislikes > 0 ? totalLikes / (totalLikes + totalDislikes) : 0;
                  const hasMinimumDiscussion = totalComments >= 3;
                  const isTrendingPost = hasMinimumDiscussion && (
                    (score >= 10 && likeRatio >= 0.6) ||
                    (totalComments >= 6 && totalLikes >= 3)
                  );
                  const isHelpfulPost = hasMinimumDiscussion && (
                    (totalLikes >= 4 && likeRatio >= 0.7) ||
                    (totalLikes >= 3 && totalComments >= 5 && likeRatio >= 0.65)
                  );
                  const hasSolutionFound = Boolean(bestAnswerByPost[postId]);

                  return (
                    <Box
                      key={postId}
                      maxW={{ base: '100%', md: '86%', lg: '56%' }}
                      mx="auto"
                      w="full"
                      bg={post?.pinned ? 'rgba(30, 41, 59, 0.96)' : 'var(--color-bg-secondary)'}
                      border="1px solid"
                      borderColor={post?.pinned ? 'rgba(34, 211, 238, 0.75)' : 'rgba(34, 211, 238, 0.12)'}
                      borderRadius="14px"
                      p={{ base: 3, md: 4 }}
                      transition="all 0.25s ease"
                      _hover={{
                        borderColor: 'rgba(34, 211, 238, 0.45)',
                        boxShadow: '0 8px 24px rgba(34, 211, 238, 0.15)',
                        transform: 'translateY(-2px)',
                      }}
                    >
                      <Flex justify="space-between" align="start" gap={3} direction="row">
                        <Box flex="1" minW="0">
                          {!isEditingPost ? (
                            <>
                              <HStack spacing={2} align="center" flexWrap="wrap">
                                <Text color="var(--color-text-heading)" fontFamily="heading" fontSize={{ base: 'md', md: 'lg' }} fontWeight="semibold">{post.title}</Text>
                                {post?.pinned && <Badge colorScheme="cyan" variant="subtle" fontSize="10px" px={1.5} py={0.5}>{t('communityPage.pinned')}</Badge>}
                                {post?.solved && <Badge colorScheme="green" variant="subtle" fontSize="10px" px={1.5} py={0.5}>{t('communityPage.solved')}</Badge>}
                                {post?.type === 'problem' && post?.problemType && <Badge colorScheme="orange" variant="subtle" fontSize="10px" px={1.5} py={0.5}>{post.problemType}</Badge>}
                                {isTrendingPost && <Badge colorScheme="red" variant="subtle" fontSize="10px" px={1.5} py={0.5}>{t('communityPage.trending')}</Badge>}
                                {isHelpfulPost && <Badge colorScheme="yellow" variant="subtle" fontSize="10px" px={1.5} py={0.5}>{t('communityPage.helpful')}</Badge>}
                                {hasSolutionFound && <Badge colorScheme="green" variant="subtle" fontSize="10px" px={1.5} py={0.5}>{t('communityPage.solutionFound')}</Badge>}
                              </HStack>

                              <HStack spacing={2} mt={2} flexWrap="wrap">
                                <Avatar size="xs" src={post.authorAvatar || undefined} name={post.authorUsername || 'unknown'} />
                                <Text color="brand.500" fontWeight="semibold" fontSize="sm">@{post.authorUsername || 'unknown'}</Text>
                                <Text color="var(--color-text-muted)" fontSize="xs">{relativeTime(post.createdAt)}</Text>
                                <Text color="var(--color-text-muted)" fontSize="xs">{t('communityPage.commentsCount', { count: totalComments })}</Text>
                              </HStack>

                              <Text mt={3} color="var(--color-text-primary)" fontSize="sm" noOfLines={3}>
                                {post.content}
                              </Text>

                              {renderMedia(post.imageUrl, false)}
                              {renderMedia(post.videoUrl, true)}

                              {(post.tags || []).length > 0 && (
                                <HStack spacing={2} mt={2} flexWrap="wrap">
                                  {post.tags.map((tag) => (
                                    <Badge
                                      key={`${postId}:${tag}`}
                                      colorScheme="cyan"
                                      variant="subtle"
                                      px={2}
                                      py={1}
                                      borderRadius="md"
                                      cursor="pointer"
                                      onClick={() => setSelectedTag(String(tag).toLowerCase())}
                                    >
                                      #{tag}
                                    </Badge>
                                  ))}
                                </HStack>
                              )}
                            </>
                          ) : (
                            <VStack align="stretch" spacing={2}>
                              <Input
                                value={editingPost.title}
                                onChange={(e) => setEditingPost((prev) => ({ ...prev, title: e.target.value }))}
                                bg="var(--color-bg-primary)"
                                borderColor="var(--color-border)"
                                color="var(--color-text-primary)"
                              />
                              <Textarea
                                value={editingPost.content}
                                onChange={(e) => setEditingPost((prev) => ({ ...prev, content: e.target.value }))}
                                minH="110px"
                                bg="var(--color-bg-primary)"
                                borderColor="var(--color-border)"
                                color="var(--color-text-primary)"
                              />
                            </VStack>
                          )}
                        </Box>

                        <HStack
                          spacing={2}
                          w="auto"
                          justify="flex-end"
                          alignSelf="flex-start"
                          flexWrap="nowrap"
                          whiteSpace="nowrap"
                          flexShrink={0}
                        >
                          {!isEditingPost ? (
                            <>
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => toggleComments(postId)}
                                borderColor="rgba(34, 211, 238, 0.35)"
                                border="1px solid"
                                whiteSpace="nowrap"
                              >
                                {commentsOpen ? t('communityPage.hideComments') : t('communityPage.viewComments')} ({allComments.length})
                              </Button>
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  size="xs"
                                  icon={<ThreeDotsIcon width={14} height={14} />}
                                  variant="ghost"
                                  aria-label={t('communityPage.options')}
                                  _hover={{ bg: 'rgba(34, 211, 238, 0.1)' }}
                                />
                                <Portal>
                                  <MenuList bg="var(--color-bg-secondary)" borderColor="var(--color-border)" py={1} border="1px solid" zIndex="popover">
                                  {isOwner(post.authorId) && (
                                    <MenuItem onClick={() => handleStartPostEdit(post)} icon={<Box as="span" fontSize="xs">✏️</Box>} bg="transparent" _hover={{ bg: 'rgba(34, 211, 238, 0.1)' }} color="var(--color-text-primary)">{t('communityPage.editPost')}</MenuItem>
                                  )}
                                  {canDeletePost && (
                                    <MenuItem onClick={() => openDeleteConfirm('post', postId)} icon={<Box as="span" fontSize="xs">🗑️</Box>} bg="transparent" _hover={{ bg: 'rgba(239, 68, 68, 0.1)' }} color="red.400">{t('communityPage.deletePost')}</MenuItem>
                                  )}
                                  <MenuItem onClick={() => handleSummarizeDiscussion(post)} icon={<Box as="span" fontSize="xs">✨</Box>} bg="transparent" _hover={{ bg: 'rgba(34, 211, 238, 0.1)' }} color="cyan.300" isDisabled={summarizingPostId === postId}>
                                    {summarizingPostId === postId ? t('communityPage.summarizing') : t('communityPage.summarizeWithAi')}
                                  </MenuItem>
                                  <MenuItem onClick={() => toggleSavePost(postId)} icon={<BookmarkIcon width={12} height={12} />} bg="transparent" _hover={{ bg: 'rgba(34, 211, 238, 0.1)' }} color={isPostSaved(postId) ? 'brand.500' : 'var(--color-text-primary)'}>
                                    {isPostSaved(postId) ? t('communityPage.unsave') : t('communityPage.save')}
                                  </MenuItem>
                                  {isAdmin && (
                                    <MenuItem onClick={() => handleTogglePostPin(post)} icon={<PinIcon width={12} height={12} />} bg="transparent" _hover={{ bg: 'rgba(34, 211, 238, 0.1)' }} color="cyan.300">
                                      {post?.pinned ? t('communityPage.unpin') : t('communityPage.pin')}
                                    </MenuItem>
                                  )}
                                  {post.type === 'problem' && isOwner(post.authorId) && (
                                    <MenuItem onClick={() => handleToggleSolved(post)} icon={<Box as="span" fontSize="xs">✅</Box>} bg="transparent" _hover={{ bg: 'rgba(34, 211, 238, 0.1)' }} color="green.400">
                                      {t('communityPage.markAs')} {post?.solved ? t('communityPage.unsolved') : t('communityPage.solved')}
                                    </MenuItem>
                                  )}
                                  </MenuList>
                                </Portal>
                              </Menu>
                            </>
                          ) : (
                            <HStack spacing={2}>
                              <Button size="xs" variant="primary" isLoading={savingPostEditId === postId} onClick={() => handleSavePostEdit(postId)}>{t('communityPage.save')}</Button>
                              <Button size="xs" variant="ghost" onClick={handleCancelPostEdit}>{t('communityPage.cancel')}</Button>
                            </HStack>
                          )}
                        </HStack>
                      </Flex>

                      {discussionSummaries[postId] && (
                        <Box mt={3} p={3} bg="rgba(34, 211, 238, 0.04)" borderRadius="10px" borderLeft="3px solid" borderLeftColor="brand.500">
                          <HStack spacing={2} mb={1}>
                            <Box as="span" fontSize="xs">✨</Box>
                            <Text fontSize="xs" fontWeight="bold" color="cyan.300" textTransform="uppercase" letterSpacing="wider">{t('communityPage.aiSummary')}</Text>
                          </HStack>
                          <Text color="var(--color-text-primary)" fontSize="sm" fontStyle="italic">"{discussionSummaries[postId]}"</Text>
                        </Box>
                      )}

                      {isLoggedIn && (
                        <Box as="form" mt={4} onSubmit={(e) => handleAddComment(e, postId)}>
                          <VStack align="stretch" spacing={2}>
                            {post.type === 'problem' && (
                              <HStack spacing={2}>
                                <Select
                                  size="sm"
                                  value={commentType}
                                  onChange={(e) => setCommentType(e.target.value)}
                                  maxW="220px"
                                  bg="var(--color-bg-primary)"
                                  borderColor="var(--color-border)"
                                  color="var(--color-text-primary)"
                                >
                                  <option value="text" style={{ backgroundColor: 'var(--color-bg-primary)' }}>💬 Comment</option>
                                  <option value="code" style={{ backgroundColor: 'var(--color-bg-primary)' }}>💻 Code Solution</option>
                                </Select>

                                {commentType === 'code' && (
                                  <Select
                                    size="sm"
                                    value={commentLanguage}
                                    onChange={(e) => setCommentLanguage(e.target.value)}
                                    maxW="180px"
                                    bg="var(--color-bg-primary)"
                                    borderColor="var(--color-border)"
                                    color="var(--color-text-primary)"
                                  >
                                    {CODE_LANGUAGES.map((lang) => (
                                      <option key={lang} value={lang} style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                                        {lang === 'javascript' ? 'JavaScript' : lang === 'python' ? 'Python' : 'C++'}
                                      </option>
                                    ))}
                                  </Select>
                                )}
                              </HStack>
                            )}

                            <Textarea
                              value={draft.text}
                              onChange={(e) => updateCommentDraft(postId, { text: e.target.value })}
                              placeholder={commentType === 'code' && post.type === 'problem' ? 'Write your code solution...' : t('communityPage.writeComment')}
                              minH={commentType === 'code' && post.type === 'problem' ? '130px' : '80px'}
                              bg="var(--color-bg-primary)"
                              borderColor="var(--color-border)"
                              color="var(--color-text-primary)"
                              fontFamily={commentType === 'code' && post.type === 'problem' ? 'mono' : 'body'}
                              _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #22d3ee' }}
                            />
                            <Button type="submit" size="xs" variant="primary" isLoading={draft.isSubmitting} alignSelf="flex-end">{t('communityPage.postComment')}</Button>
                          </VStack>
                        </Box>
                      )}

                      {commentsOpen && (
                        <VStack align="stretch" spacing={4} mt={6} pt={4} borderTop="1px solid" borderColor="var(--color-border)">
                          {allComments.length === 0 ? (
                            <Text color="var(--color-text-muted)" fontSize="sm" textAlign="center" py={4}>{t('communityPage.noCommentsYet')}</Text>
                          ) : (
                            <>
                              {renderCommentTree(visibleComments, postId, post.authorId)}
                              {hiddenCount > 0 && (
                                <Button size="sm" variant="ghost" onClick={() => setShowAllComments(prev => ({ ...prev, [postId]: true }))} color="brand.400">
                                  {t('communityPage.showMoreComments', { count: hiddenCount })}
                                </Button>
                              )}
                            </>
                          )}
                        </VStack>
                      )}
                    </Box>
                  );
                })
              )}
            </VStack>
          )}
        </MotionBox>
      </Box>

      <Modal isOpen={isCreateModalOpen} onClose={handleCreateModalClose} size="xl">
        <ModalOverlay bg="rgba(0, 0, 0, 0.85)" backdropFilter="blur(8px)" />
        <ModalContent bg="var(--color-bg-secondary)" border="1px solid" borderColor="rgba(34, 211, 238, 0.3)" borderRadius="16px" overflow="hidden">
          <ModalHeader borderBottom="1px solid" borderColor="var(--color-border)" px={6} py={4}>
            <Text color="var(--color-text-heading)" fontFamily="heading" fontSize="xl" fontWeight="bold">
              {activeSection === 'problems' ? t('communityPage.createProblem') : t('communityPage.createPost')}
            </Text>
          </ModalHeader>
          <ModalCloseButton color="var(--color-text-muted)" _hover={{ color: 'brand.500' }} mt={2} />
          <ModalBody p={6}>
            <form onSubmit={handleCreatePost}>
              <VStack spacing={5} align="stretch">
                <FormControl isInvalid={Boolean(postErrors.title)} isRequired>
                  <FormLabel color="var(--color-text-muted)" fontSize="sm" fontWeight="medium">{t('communityPage.postTitle')}</FormLabel>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={activeSection === 'problems' ? t('communityPage.problemTitlePlaceholder') : t('communityPage.titlePlaceholder')}
                    bg="var(--color-bg-primary)"
                    borderColor="var(--color-border)"
                    color="var(--color-text-primary)"
                    _hover={{ borderColor: 'brand.500' }}
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #22d3ee' }}
                  />
                  <FormErrorMessage>{postErrors.title}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={Boolean(postErrors.content)} isRequired>
                  <FormLabel color="var(--color-text-muted)" fontSize="sm" fontWeight="medium">{activeSection === 'problems' ? t('communityPage.description') : t('communityPage.content')}</FormLabel>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={activeSection === 'problems' ? t('communityPage.problemDescriptionPlaceholder') : t('communityPage.contentPlaceholder')}
                    minH="150px"
                    resize="vertical"
                    bg="var(--color-bg-primary)"
                    borderColor="var(--color-border)"
                    color="var(--color-text-primary)"
                    _hover={{ borderColor: 'brand.500' }}
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #22d3ee' }}
                  />
                  <FormErrorMessage>{postErrors.content}</FormErrorMessage>
                </FormControl>

                {activeSection === 'problems' && (
                  <FormControl>
                    <FormLabel color="var(--color-text-muted)" fontSize="sm" fontWeight="medium">{t('communityPage.problemType')}</FormLabel>
                    <Select value={problemType} onChange={(e) => setProblemType(e.target.value)} bg="var(--color-bg-primary)" borderColor="var(--color-border)" color="var(--color-text-primary)">
                      <option value="bug" style={{ backgroundColor: 'var(--color-bg-primary)' }}>{t('communityPage.problemTypeBug')}</option>
                      <option value="algorithm" style={{ backgroundColor: 'var(--color-bg-primary)' }}>{t('communityPage.problemTypeAlgorithm')}</option>
                      <option value="help" style={{ backgroundColor: 'var(--color-bg-primary)' }}>{t('communityPage.problemTypeHelp')}</option>
                      <option value="optimization" style={{ backgroundColor: 'var(--color-bg-primary)' }}>{t('communityPage.problemTypeOptimization')}</option>
                    </Select>
                  </FormControl>
                )}

                <FormControl>
                  <FormLabel color="var(--color-text-muted)" fontSize="sm" fontWeight="medium">{t('communityPage.tagsLabel')}</FormLabel>
                  <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder={t('communityPage.tagsPlaceholder')} bg="var(--color-bg-primary)" borderColor="var(--color-border)" color="var(--color-text-primary)" />
                  <Flex mt={3} justify="space-between" align={{ base: 'start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap={2}>
                    <Text color="var(--color-text-muted)" fontSize="xs">{t('communityPage.aiSuggestTagsHint')}</Text>
                    <Button size="xs" variant="outline" borderColor="brand.500" color="brand.300" onClick={() => requestAiTags(`${title.trim()}\n${content.trim()}`.trim())} isLoading={isFetchingAiTags} isDisabled={`${title.trim()}\n${content.trim()}`.trim().length < 20}>{t('communityPage.suggestTags')}</Button>
                  </Flex>

                  {aiTagError && (
                    <Text mt={2} color="red.300" fontSize="xs">
                      {aiTagError}
                    </Text>
                  )}

                  {aiSuggestedTags.length > 0 && (
                    <VStack align="stretch" spacing={2} mt={3}>
                      <Text color="var(--color-text-muted)" fontSize="xs">Suggested tags (click to add/remove):</Text>
                      <HStack spacing={2} flexWrap="wrap">
                        {aiSuggestedTags.map((tag) => {
                          const selected = parsedTagsInput.includes(tag);
                          return (
                            <Badge
                              key={`suggested-${tag}`}
                              px={2}
                              py={1}
                              borderRadius="md"
                              cursor="pointer"
                              colorScheme={selected ? 'cyan' : 'gray'}
                              variant={selected ? 'solid' : 'subtle'}
                              onClick={() => toggleSuggestedTag(tag)}
                            >
                              #{tag}
                            </Badge>
                          );
                        })}
                      </HStack>
                    </VStack>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel color="var(--color-text-muted)" fontSize="sm" fontWeight="medium">Media (optional)</FormLabel>
                  <HStack spacing={2}>
                    <Button as="label" size="sm" variant="outline" borderColor="brand.500" color="brand.300" cursor="pointer">
                      <ImageIcon width={14} height={14} />
                      <Text ml={1}>Insert Image</Text>
                      <Input type="file" accept="image/*" onChange={handleImageSelect} hidden />
                    </Button>
                    <Button as="label" size="sm" variant="outline" borderColor="brand.500" color="brand.300" cursor="pointer">
                      <VideoIcon width={14} height={14} />
                      <Text ml={1}>Insert Video</Text>
                      <Input type="file" accept="video/*" onChange={handleVideoSelect} hidden />
                    </Button>
                  </HStack>

                  {imagePreviewUrl && (
                    <Box
                      mt={3}
                      w="full"
                      h="160px"
                      borderRadius="10px"
                      border="1px solid rgba(34, 211, 238, 0.2)"
                      backgroundImage={`url(${imagePreviewUrl})`}
                      backgroundSize="cover"
                      backgroundPosition="center"
                    />
                  )}

                  {videoPreviewUrl && (
                    <Box mt={3} borderRadius="10px" overflow="hidden" border="1px solid rgba(34, 211, 238, 0.2)">
                      <video src={videoPreviewUrl} controls style={{ width: '100%', maxHeight: '220px', background: '#020617' }} />
                    </Box>
                  )}
                </FormControl>

                <Flex justify="flex-end" gap={3} pt={4} borderTop="1px solid" borderColor="var(--color-border)">
                  <Button variant="ghost" onClick={handleCreateModalClose} color="var(--color-text-muted)">{t('communityPage.cancel')}</Button>
                  <Button type="submit" variant="primary" isLoading={creatingPost} loadingText={t('communityPage.posting')} px={8}>{t('communityPage.publishPost')}</Button>
                </Flex>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={deleteConfirm.isOpen} onClose={closeDeleteConfirm} isCentered>
        <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" />
        <ModalContent bg="var(--color-bg-secondary)" border="1px solid rgba(239, 68, 68, 0.35)" borderRadius="16px">
          <ModalHeader color="var(--color-text-heading)" fontFamily="heading" fontSize="lg" fontWeight="semibold">{t('communityPage.confirmDeletion')}</ModalHeader>
          <ModalCloseButton color="var(--color-text-muted)" _hover={{ color: 'red.300' }} />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              <Text color="var(--color-text-secondary)" fontSize="sm">
                {deleteConfirm.type === 'post' ? t('communityPage.confirmDeletePost') : t('communityPage.confirmDeleteComment')}
              </Text>
              <HStack justify="flex-end">
                <Button variant="ghost" onClick={closeDeleteConfirm}>{t('communityPage.cancel')}</Button>
                <Button colorScheme="red" onClick={confirmDelete}>{t('communityPage.delete')}</Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={codeOutputModal.isOpen} onClose={() => setCodeOutputModal((prev) => ({ ...prev, isOpen: false }))} isCentered size="lg">
        <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" />
        <ModalContent bg="#020617" border="1px solid rgba(56, 189, 248, 0.45)" borderRadius="14px">
          <ModalHeader color="cyan.300" fontFamily="mono" fontSize="sm">
            Output ({codeOutputModal.language || 'javascript'})
          </ModalHeader>
          <ModalCloseButton color="gray.300" />
          <ModalBody pb={5}>
            <Box
              as="pre"
              p={3}
              borderRadius="10px"
              bg="#010409"
              border="1px solid rgba(148, 163, 184, 0.25)"
              color={codeOutputModal.isError ? 'red.300' : 'green.300'}
              fontFamily="mono"
              fontSize="sm"
              whiteSpace="pre-wrap"
              minH="90px"
            >
              {String(codeOutputModal.output || '')}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
      </MotionBox>
  );
};

export default CommunityPage;
