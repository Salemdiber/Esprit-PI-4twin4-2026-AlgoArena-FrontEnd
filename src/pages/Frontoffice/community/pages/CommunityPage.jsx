import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
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
  Select,
  Spinner,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { m } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import {
  getComments,
  getPosts,
  getUsers,
  mergeCommunitySnapshot,
  saveComments,
  savePosts,
  saveUsers,
} from '../../../Backoffice/communityData';
import { communityService } from '../../../../services/communityService';
import { useAuth } from '../../auth/context/AuthContext';

const MotionBox = m.create(Box);
const COMMENT_PREVIEW_LIMIT = 3;
const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODELS = [
  'openrouter/auto',
  'mistralai/mistral-7b-instruct',
  'mistralai/mistral-7b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
];

const STORAGE_KEYS = {
  postReactions: 'discussion_post_reactions_v1',
  commentReactions: 'discussion_comment_reactions_v1',
  savedItems: 'discussion_saved_items_v1',
  bestAnswers: 'discussion_best_answers_v1',
  userNotifications: 'discussion_user_notifications_v1',
};

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

const toMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || /^data:/i.test(url)) return url;
  const apiOrigin = `${window.location.protocol}//${window.location.hostname}:3000`;
  return `${apiOrigin}${url.startsWith('/') ? url : `/${url}`}`;
};

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  if (!file) {
    resolve('');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error('Unable to read selected file.'));
  reader.readAsDataURL(file);
});

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

const flattenCommentsForStorage = (postId, comments, parentCommentId = null) => {
  if (!Array.isArray(comments)) return [];
  return comments.flatMap((comment) => {
    const current = {
      _id: String(comment?._id || ''),
      postId: String(postId || ''),
      parentCommentId,
      text: String(comment?.text || ''),
      authorId: String(comment?.authorId || ''),
      authorUsername: String(comment?.authorUsername || 'unknown'),
      authorAvatar: String(comment?.authorAvatar || ''),
      imageUrl: String(comment?.imageUrl || ''),
      videoUrl: String(comment?.videoUrl || ''),
      createdAt: String(comment?.createdAt || ''),
      updatedAt: String(comment?.updatedAt || ''),
      pinned: Boolean(comment?.pinned),
    };
    return [current, ...flattenCommentsForStorage(postId, comment?.replies || [], current._id)];
  });
};

const upsertCommentInTree = (comments, targetCommentId, updater) => {
  if (!Array.isArray(comments)) return [];
  return comments.map((comment) => {
    if (String(comment?._id || '') === String(targetCommentId)) {
      return updater(comment);
    }
    return {
      ...comment,
      replies: upsertCommentInTree(comment?.replies || [], targetCommentId, updater),
    };
  });
};

const deleteCommentInTree = (comments, targetCommentId) => {
  if (!Array.isArray(comments)) return [];
  return comments
    .filter((comment) => String(comment?._id || '') !== String(targetCommentId))
    .map((comment) => ({
      ...comment,
      replies: deleteCommentInTree(comment?.replies || [], targetCommentId),
    }));
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
  const { isLoggedIn, currentUser } = useAuth();

  const [posts, setPosts] = useState([]);
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
  const [lastAiSource, setLastAiSource] = useState('');
  const [discussionSummaries, setDiscussionSummaries] = useState({});
  const [summaryErrors, setSummaryErrors] = useState({});
  const [summarizingPostId, setSummarizingPostId] = useState('');
  const [postErrors, setPostErrors] = useState({});
  const [creatingPost, setCreatingPost] = useState(false);

  const [commentsVisible, setCommentsVisible] = useState({});
  const [showAllComments, setShowAllComments] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});

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
  const openRouterApiKey = String(
    import.meta.env.VITE_OPENROUTER_API_KEY
    || import.meta.env.VITE_OPEN_ROUTER_API_KEY
    || safeRead('openrouter_api_key', '')
    || safeRead('VITE_OPENROUTER_API_KEY', '')
    || ''
  ).trim();
  const openRouterModelOverride = String(import.meta.env.VITE_OPENROUTER_MODEL || '').trim();
  const isOpenRouterKeyDetected = Boolean(openRouterApiKey);

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

  const currentUserId = useMemo(
    () => String(currentUser?._id || currentUser?.id || currentUser?.userId || ''),
    [currentUser],
  );

  const currentRole = String(currentUser?.role || '').toUpperCase();
  const isAdmin = currentRole === 'ADMIN';

  const isOwner = (authorId) => currentUserId && String(authorId || '') === currentUserId;

  const persistPostsAndComments = (nextPosts) => {
    savePosts(nextPosts);
    const flatComments = nextPosts.flatMap((post) => flattenCommentsForStorage(post._id, post.comments || []));
    saveComments(flatComments);
  };

  const persistCurrentUser = () => {
    if (!currentUserId) return;
    const users = getUsers();
    const exists = users.some((user) => String(user?.id || user?._id || '') === currentUserId);
    if (exists) return;
    saveUsers([
      {
        id: currentUserId,
        username: String(currentUser?.username || 'unknown'),
        role: String(currentUser?.role || 'USER'),
        avatar: String(currentUser?.avatar || ''),
      },
      ...users,
    ]);
  };

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

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const localData = getPosts();
      setPosts(Array.isArray(localData) ? localData : []);
    } catch (err) {
      setError(err.message || 'Failed to load community posts.');
    } finally {
      setLoading(false);
    }

    // Keep first paint fast, then hydrate the local snapshot in idle time.
    const hydrateRemoteSnapshot = async () => {
      try {
        const remotePosts = await communityService.getPosts();
        if (!Array.isArray(remotePosts) || remotePosts.length === 0) return;
        mergeCommunitySnapshot(remotePosts);
        const mergedData = getPosts();
        setPosts(Array.isArray(mergedData) ? mergedData : []);
      } catch {
        // keep local store when remote source is unavailable
      }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        void hydrateRemoteSnapshot();
      }, { timeout: 2000 });
      return;
    }

    window.setTimeout(() => {
      void hydrateRemoteSnapshot();
    }, 250);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const allTags = useMemo(() => {
    const bag = new Set();
    posts.forEach((p) => {
      (p.tags || []).forEach((t) => {
        const normalized = String(t || '').trim().toLowerCase();
        if (normalized) bag.add(normalized);
      });
    });
    return [...bag].sort();
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
    setLastAiSource('');
    setPostErrors({});
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
    resetCreateForm();
  };

  const validatePostForm = () => {
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = 'Title is required.';
    if (!content.trim()) nextErrors.content = activeSection === 'problems' ? 'Description is required.' : 'Content is required.';
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
    if (!openRouterApiKey) {
      if (!silent) setAiTagError('Missing OpenRouter API key. Set VITE_OPENROUTER_API_KEY in your frontend env.');
      return;
    }

    if (!sourceText || sourceText.length < 20) {
      if (!silent) setAiTagError('Write a bit more title and description to generate useful tags.');
      return;
    }

    try {
      setIsFetchingAiTags(true);
      if (!silent) setAiTagError('');

      // Mark this source as attempted so auto mode doesn't repeatedly retry unchanged text.
      setLastAiSource(sourceText);

      const modelCandidates = openRouterModelOverride
        ? [openRouterModelOverride, ...OPENROUTER_MODELS]
        : OPENROUTER_MODELS;
      const modelsToTry = [...new Set(modelCandidates.map((model) => String(model || '').trim()).filter(Boolean))];
      const effectiveModels = silent
        ? ['openrouter/auto', ...modelsToTry.filter((model) => model !== 'openrouter/auto')].slice(0, 1)
        : modelsToTry;

      let payload = null;
      let lastErrorText = '';

      for (const model of effectiveModels) {
        const response = await fetch(OPENROUTER_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openRouterApiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'user',
                content: `Extract 3 to 5 relevant tags from this text. Return ONLY a JSON array like ['tag1','tag2'].\n\n${sourceText}`,
              },
            ],
            temperature: 0.2,
          }),
        });

        const result = await response.json().catch(() => null);
        if (response.ok) {
          payload = result;
          break;
        }

        const details = result?.error?.message || `HTTP ${response.status}`;
        lastErrorText = `${model}: ${details}`;

        if (response.status === 401 || response.status === 403) {
          throw new Error(`OpenRouter: ${lastErrorText}`);
        }
      }

      if (!payload) {
        throw new Error(`OpenRouter: ${lastErrorText || 'No available endpoint for configured models.'}`);
      }

      const modelText = String(payload?.choices?.[0]?.message?.content || '');
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
        setAiTagError(message.includes('HTTP') || message.includes('OpenRouter') || message.includes(':')
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

    if (!openRouterApiKey) {
      setSummaryErrors((prev) => ({ ...prev, [postId]: 'Missing OpenRouter API key.' }));
      return;
    }

    const commentTexts = flattenCommentTexts(post.comments || []);
    if (commentTexts.length === 0) {
      setSummaryErrors((prev) => ({ ...prev, [postId]: 'No comments to summarize yet.' }));
      return;
    }

    try {
      setSummarizingPostId(postId);
      setSummaryErrors((prev) => ({ ...prev, [postId]: '' }));

      const modelCandidates = openRouterModelOverride
        ? [openRouterModelOverride, ...OPENROUTER_MODELS]
        : OPENROUTER_MODELS;
      const modelsToTry = [...new Set(modelCandidates.map((model) => String(model || '').trim()).filter(Boolean))];

      let summary = '';
      let lastErrorText = '';

      const discussionText = commentTexts.join('\n- ');

      for (const model of modelsToTry) {
        const response = await fetch(OPENROUTER_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openRouterApiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'user',
                content: `Summarize this discussion in 1-2 short, very clear sentences (max 35 words total). Use simple language and include only the main point and current outcome.\n\n${discussionText}`,
              },
            ],
            temperature: 0.2,
          }),
        });

        const payload = await response.json().catch(() => null);
        if (response.ok) {
          summary = String(payload?.choices?.[0]?.message?.content || '').trim();
          if (summary) break;
          lastErrorText = `${model}: Empty summary response`;
          continue;
        }

        const details = payload?.error?.message || `HTTP ${response.status}`;
        lastErrorText = `${model}: ${details}`;
        if (response.status === 401 || response.status === 403) {
          throw new Error(lastErrorText);
        }
      }

      if (!summary) {
        throw new Error(lastErrorText || 'Unable to summarize discussion right now.');
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

  useEffect(() => {
    if (!isCreateModalOpen) return;

    const sourceText = `${title.trim()}\n${content.trim()}`.trim();
    if (sourceText.length < 20) {
      setAiSuggestedTags([]);
      setLastAiSource('');
      return;
    }

    if (sourceText === lastAiSource || !openRouterApiKey) return;

    const timer = setTimeout(() => {
      requestAiTags(sourceText, { silent: true });
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, content, isCreateModalOpen, lastAiSource, openRouterApiKey]);

  const handleCreatePost = async (event) => {
    event.preventDefault();

    if (!validatePostForm()) return;
    if (!isLoggedIn) {
      setError('Please sign in to create a post.');
      return;
    }

    try {
      setCreatingPost(true);
      setError('');

      let imageUrl;
      let videoUrl;

      if (imageFile) {
        imageUrl = await fileToDataUrl(imageFile);
      }

      if (videoFile) {
        videoUrl = await fileToDataUrl(videoFile);
      }

      const created = {
        _id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: title.trim(),
        content: content.trim(),
        type: activeSection === 'problems' ? 'problem' : 'normal',
        problemType: activeSection === 'problems' ? problemType : undefined,
        tags: parsedTagsInput,
        imageUrl,
        videoUrl,
        authorId: currentUserId,
        authorUsername: currentUser?.username || 'unknown',
        authorAvatar: currentUser?.avatar || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pinned: false,
        solved: false,
        comments: [],
      };

      persistCurrentUser();

      setPosts((prev) => {
        const next = [created, ...prev];
        persistPostsAndComments(next);
        return next;
      });
      handleCreateModalClose();
    } catch (err) {
      setError(err.message || 'Unable to create post.');
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
      updateCommentDraft(postId, { error: 'Comment is required.' });
      return;
    }

    if (!isLoggedIn) {
      setError('Please sign in to comment on posts.');
      return;
    }

    try {
      const targetPost = posts.find((post) => String(post._id) === String(postId));
      updateCommentDraft(postId, { isSubmitting: true });
      setError('');

      let imageUrl;
      let videoUrl;

      if (draft.imageFile) {
        imageUrl = await fileToDataUrl(draft.imageFile);
      }

      if (draft.videoFile) {
        videoUrl = await fileToDataUrl(draft.videoFile);
      }

      const newComment = {
        _id: `comment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        text,
        imageUrl,
        videoUrl,
        authorId: currentUserId,
        authorUsername: currentUser?.username || 'unknown',
        authorAvatar: currentUser?.avatar || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pinned: false,
        replies: [],
      };

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

      persistCurrentUser();
      const comments = getComments();
      saveComments([
        {
          _id: newComment._id,
          postId,
          parentCommentId: null,
          text,
          authorId: currentUserId,
          authorUsername: currentUser?.username || 'unknown',
          authorAvatar: currentUser?.avatar || '',
          imageUrl: imageUrl || '',
          videoUrl: videoUrl || '',
          createdAt: newComment.createdAt,
          updatedAt: newComment.updatedAt,
          pinned: false,
        },
        ...comments,
      ]);

      setPosts((prev) => {
        const next = prev.map((post) => {
          if (String(post._id) !== String(postId)) return post;
          return {
            ...post,
            comments: [newComment, ...(Array.isArray(post.comments) ? post.comments : [])],
            updatedAt: new Date().toISOString(),
          };
        });
        persistPostsAndComments(next);
        return next;
      });
      setCommentsVisible((prev) => ({ ...prev, [postId]: true }));
      setCommentDrafts((prev) => ({ ...prev, [postId]: emptyDraft() }));
    } catch (err) {
      setError(err.message || 'Unable to add comment.');
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
      updateReplyDraft(commentId, { error: 'Reply is required.' });
      return;
    }

    if (!isLoggedIn) {
      setError('Please sign in to reply.');
      return;
    }

    try {
      updateReplyDraft(commentId, { isSubmitting: true });
      setError('');

      let imageUrl;
      let videoUrl;

      if (draft.imageFile) {
        imageUrl = await fileToDataUrl(draft.imageFile);
      }

      if (draft.videoFile) {
        videoUrl = await fileToDataUrl(draft.videoFile);
      }

      const newReply = {
        _id: `reply_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        text,
        imageUrl,
        videoUrl,
        authorId: currentUserId,
        authorUsername: currentUser?.username || 'unknown',
        authorAvatar: currentUser?.avatar || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pinned: false,
        replies: [],
      };

      persistCurrentUser();
      const comments = getComments();
      saveComments([
        {
          _id: newReply._id,
          postId,
          parentCommentId: commentId,
          text,
          authorId: currentUserId,
          authorUsername: currentUser?.username || 'unknown',
          authorAvatar: currentUser?.avatar || '',
          imageUrl: imageUrl || '',
          videoUrl: videoUrl || '',
          createdAt: newReply.createdAt,
          updatedAt: newReply.updatedAt,
          pinned: false,
        },
        ...comments,
      ]);

      setPosts((prev) => {
        const next = prev.map((post) => {
          if (String(post._id) !== String(postId)) return post;
          return {
            ...post,
            comments: addReplyInTree(post.comments || [], commentId, newReply),
            updatedAt: new Date().toISOString(),
          };
        });
        persistPostsAndComments(next);
        return next;
      });
      setReplyDrafts((prev) => ({ ...prev, [commentId]: emptyDraft() }));
      setReplyVisibility((prev) => ({ ...prev, [commentId]: false }));
      setCommentsVisible((prev) => ({ ...prev, [postId]: true }));
    } catch (err) {
      setError(err.message || 'Unable to add reply.');
      updateReplyDraft(commentId, { isSubmitting: false });
      return;
    }

    updateReplyDraft(commentId, { isSubmitting: false });
  };

  const handleDeletePost = async (postId) => {
    try {
      setPosts((prev) => {
        const next = prev.filter((post) => String(post._id) !== String(postId));
        persistPostsAndComments(next);
        return next;
      });
    } catch (err) {
      setError(err.message || 'Unable to delete post.');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      setPosts((prev) => {
        const next = prev.map((post) => {
          if (String(post._id) !== String(postId)) return post;
          return {
            ...post,
            comments: deleteCommentInTree(post.comments || [], commentId),
            updatedAt: new Date().toISOString(),
          };
        });
        persistPostsAndComments(next);
        return next;
      });
    } catch (err) {
      setError(err.message || 'Unable to delete comment/reply.');
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
      setPosts((prev) => {
        const next = prev.map((x) => (
          String(x._id) === String(post._id)
            ? { ...x, solved: !x?.solved, updatedAt: new Date().toISOString() }
            : x
        ));
        persistPostsAndComments(next);
        return next;
      });
    } catch (err) {
      setError(err.message || 'Unable to update solved state.');
    }
  };

  const handleTogglePostPin = async (post) => {
    try {
      setPosts((prev) => {
        const next = prev.map((x) => (
          String(x._id) === String(post._id)
            ? { ...x, pinned: !x?.pinned, updatedAt: new Date().toISOString() }
            : x
        ));
        persistPostsAndComments(next);
        return next;
      });
    } catch (err) {
      setError(err.message || 'Unable to pin post.');
    }
  };

  const handleToggleCommentPin = async (postId, comment) => {
    if (!comment?._id) return;
    try {
      setPosts((prev) => {
        const next = prev.map((x) => {
          if (String(x._id) !== String(postId)) return x;
          return {
            ...x,
            comments: upsertCommentInTree(x.comments || [], comment._id, (target) => ({
              ...target,
              pinned: !target?.pinned,
              updatedAt: new Date().toISOString(),
            })),
            updatedAt: new Date().toISOString(),
          };
        });
        persistPostsAndComments(next);
        return next;
      });
    } catch (err) {
      setError(err.message || 'Unable to pin comment.');
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
      setError('Title and content are required.');
      return;
    }

    try {
      setSavingPostEditId(postId);
      setError('');
      setPosts((prev) => {
        const next = prev.map((post) => (
          String(post._id) === String(postId)
            ? {
              ...post,
              title: trimmedTitle,
              content: trimmedContent,
              updatedAt: new Date().toISOString(),
            }
            : post
        ));
        persistPostsAndComments(next);
        return next;
      });
      handleCancelPostEdit();
    } catch (err) {
      setError(err.message || 'Unable to modify post.');
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
      setError('Comment text is required.');
      return;
    }

    if (!commentId) {
      setError('Unable to modify this comment.');
      return;
    }

    try {
      setSavingCommentEditKey(`${postId}:${commentId}`);
      setError('');
      setPosts((prev) => {
        const next = prev.map((post) => {
          if (String(post._id) !== String(postId)) return post;
          return {
            ...post,
            comments: upsertCommentInTree(post.comments || [], commentId, (target) => ({
              ...target,
              text: trimmedText,
              updatedAt: new Date().toISOString(),
            })),
            updatedAt: new Date().toISOString(),
          };
        });
        persistPostsAndComments(next);
        return next;
      });
      handleCancelCommentEdit();
    } catch (err) {
      setError(err.message || 'Unable to modify comment.');
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
          bg={isBestAnswer ? 'rgba(16, 185, 129, 0.12)' : (comment?.pinned ? 'rgba(34, 211, 238, 0.08)' : 'var(--color-bg-primary)')}
          border="1px solid"
          borderColor={isBestAnswer ? 'rgba(16, 185, 129, 0.65)' : (comment?.pinned ? 'rgba(34, 211, 238, 0.65)' : 'rgba(148, 163, 184, 0.22)')}
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
              {comment?.pinned && (
                <Badge colorScheme="cyan" variant="subtle" fontSize="10px" px={1.5} py={0.5}>
                  Pinned
                </Badge>
              )}
              {isBestAnswer && (
                <Badge colorScheme="green" variant="subtle" fontSize="10px" px={1.5} py={0.5}>
                  Best Answer
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
                  {isBestAnswer ? 'Unmark Best' : 'Mark Best'}
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
                  {comment?.pinned ? 'Unpin' : 'Pin'}
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
                  Modify
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
                  Delete
                </Button>
              )}
            </HStack>
          </Flex>

          {!isEditing ? (
            <>
              <Text mt={2} color="var(--color-text-secondary)" fontSize="sm" whiteSpace="pre-wrap">{comment.text}</Text>
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
                <Button size="xs" variant="ghost" onClick={handleCancelCommentEdit}>Cancel</Button>
                <Button
                  size="xs"
                  variant="primary"
                  isLoading={savingCommentEditKey === `${postId}:${comment._id}`}
                  onClick={() => handleSaveCommentEdit(postId, comment._id)}
                >
                  Save
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
                  Reply
                </Button>
              </HStack>

              {repliesOpen && (
                <Box as="form" onSubmit={(event) => handleAddReply(event, postId, comment._id)}>
                  <VStack align="stretch" spacing={2}>
                    <Textarea
                      value={replyDraft.text}
                      onChange={(e) => updateReplyDraft(commentId, { text: e.target.value })}
                      placeholder={isLoggedIn ? 'Write a reply...' : 'Sign in to reply...'}
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
                        <Text ml={1}>Image</Text>
                        <Input type="file" accept="image/*" onChange={(e) => handleReplyMediaSelect(commentId, 'image', e)} hidden />
                      </Button>
                      <Button as="label" size="xs" variant="outline" borderColor="brand.500" color="brand.300" cursor="pointer">
                        <VideoIcon width={12} height={12} />
                        <Text ml={1}>Video</Text>
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
                      <Button size="xs" variant="ghost" onClick={() => setReplyVisibility((prev) => ({ ...prev, [commentId]: false }))}>Cancel</Button>
                      <Button
                        type="submit"
                        size="xs"
                        variant="primary"
                        isLoading={replyDraft.isSubmitting}
                        isDisabled={!isLoggedIn}
                      >
                        Post Reply
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
              Community
            </Text>
            <Text mt={2} color="var(--color-text-muted)" fontFamily="body">
              Ask questions, share ideas, and collaborate with other AlgoArena members.
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
                Community Dashboard
              </Button>
            )}

            <Button
              leftIcon={<BookmarkIcon width={14} height={14} />}
              variant={showSavedOnly ? 'solid' : 'outline'}
              colorScheme="cyan"
              size="sm"
              onClick={() => setShowSavedOnly((prev) => !prev)}
            >
              Saved Items
            </Button>

            <Button leftIcon={<PlusIcon width={16} height={16} />} variant="primary" onClick={() => setIsCreateModalOpen(true)} isDisabled={!isLoggedIn}>
              {activeSection === 'problems' ? 'Create Problem' : 'Create Community Post'}
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
              Discussion
            </Button>
            <Button
              size="sm"
              variant={activeSection === 'problems' ? 'solid' : 'outline'}
              colorScheme="cyan"
              onClick={() => setActiveSection('problems')}
              transition="all 0.2s ease"
            >
              Problems
            </Button>
          </HStack>

          <Flex direction={{ base: 'column', md: 'row' }} gap={3}>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or content"
              bg="var(--color-bg-secondary)"
              borderColor="var(--color-border)"
              color="var(--color-text-primary)"
              _hover={{ borderColor: 'brand.500' }}
              _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #22d3ee' }}
            />

            <Select
              aria-label="Sort community posts"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              bg="var(--color-bg-secondary)"
              borderColor="var(--color-border)"
              color="var(--color-text-primary)"
              w={{ base: 'full', md: '220px' }}
            >
              <option value="recent" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>Most Recent</option>
              <option value="liked" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>Most Liked</option>
              <option value="commented" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>Most Commented</option>
            </Select>

            <Select
              aria-label="Filter community posts by tag"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              bg="var(--color-bg-secondary)"
              borderColor="var(--color-border)"
              color="var(--color-text-primary)"
              w={{ base: 'full', md: '220px' }}
            >
              <option value="all" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>All Tags</option>
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
                    {activeSection === 'problems' ? 'No problems yet.' : 'No community posts yet.'}
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
                  const isTrendingPost = score >= 4 || totalComments >= 2;
                  const isHelpfulPost = (totalLikes >= 2 && likeRatio >= 0.65) || (totalLikes >= 1 && totalComments >= 2 && likeRatio >= 0.7);
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
                      sx={{ contentVisibility: 'auto', containIntrinsicSize: '560px' }}
                      transition="all 0.25s ease"
                      _hover={{
                        borderColor: 'rgba(34, 211, 238, 0.45)',
                        boxShadow: '0 8px 24px rgba(34, 211, 238, 0.15)',
                        transform: 'translateY(-2px)',
                      }}
                    >
                      <Flex justify="space-between" align={{ base: 'start', md: 'center' }} gap={3} direction={{ base: 'column', md: 'row' }}>
                        <Box flex="1">
                          {!isEditingPost ? (
                            <>
                              <HStack spacing={2} align="center" flexWrap="wrap">
                                <Text color="var(--color-text-heading)" fontFamily="heading" fontSize={{ base: 'md', md: 'lg' }} fontWeight="semibold">{post.title}</Text>
                                {post?.pinned && <Badge colorScheme="cyan" variant="subtle" fontSize="10px" px={1.5} py={0.5}>Pinned</Badge>}
                                {post?.solved && <Badge colorScheme="green" variant="subtle" fontSize="10px" px={1.5} py={0.5}>Solved</Badge>}
                                {post?.type === 'problem' && post?.problemType && <Badge colorScheme="orange" variant="subtle" fontSize="10px" px={1.5} py={0.5}>{post.problemType}</Badge>}
                                {isTrendingPost && <Badge colorScheme="red" variant="subtle" fontSize="10px" px={1.5} py={0.5}>🔥 Trending</Badge>}
                                {isHelpfulPost && <Badge colorScheme="yellow" variant="subtle" fontSize="10px" px={1.5} py={0.5}>⭐ Helpful</Badge>}
                                {hasSolutionFound && <Badge colorScheme="green" variant="subtle" fontSize="10px" px={1.5} py={0.5}>🧠 Solution Found</Badge>}
                              </HStack>

                              <HStack spacing={2} mt={2} flexWrap="wrap">
                                <Avatar size="xs" src={post.authorAvatar || undefined} name={post.authorUsername || 'unknown'} />
                                <Text color="brand.500" fontWeight="semibold" fontSize="sm">@{post.authorUsername || 'unknown'}</Text>
                                <Text color="var(--color-text-muted)" fontSize="xs">{relativeTime(post.createdAt)}</Text>
                                <Text color="var(--color-text-muted)" fontSize="xs">{totalComments} comments</Text>
                              </HStack>

                              <Text mt={3} color="var(--color-text-primary)" fontSize="sm" noOfLines={3}>
                                {post.content}
                              </Text>

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

                        <HStack spacing={2} alignSelf={{ base: 'stretch', md: 'center' }} flexWrap="wrap">
                          {!isEditingPost ? (
                            <>
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => toggleComments(postId)}
                                borderColor="rgba(34, 211, 238, 0.35)"
                                border="1px solid"
                              >
                                {commentsOpen ? 'Hide Comments' : 'View Comments'} ({allComments.length})
                              </Button>
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  size="xs"
                                  icon={<ThreeDotsIcon width={14} height={14} />}
                                  variant="ghost"
                                  aria-label="Options"
                                  _hover={{ bg: 'rgba(34, 211, 238, 0.1)' }}
                                />
                                <MenuList bg="var(--color-bg-secondary)" borderColor="var(--color-border)" py={1} border="1px solid" zIndex={10}>
                                  {isOwner(post.authorId) && (
                                    <MenuItem onClick={() => handleStartPostEdit(post)} icon={<Box as="span" fontSize="xs">✏️</Box>} bg="transparent" _hover={{ bg: 'rgba(34, 211, 238, 0.1)' }} color="var(--color-text-primary)">Edit Post</MenuItem>
                                  )}
                                  {canDeletePost && (
                                    <MenuItem onClick={() => openDeleteConfirm('post', postId)} icon={<Box as="span" fontSize="xs">🗑️</Box>} bg="transparent" _hover={{ bg: 'rgba(239, 68, 68, 0.1)' }} color="red.400">Delete Post</MenuItem>
                                  )}
                                  <MenuItem onClick={() => handleSummarizeDiscussion(post)} icon={<Box as="span" fontSize="xs">✨</Box>} bg="transparent" _hover={{ bg: 'rgba(34, 211, 238, 0.1)' }} color="cyan.300" isDisabled={summarizingPostId === postId}>
                                    {summarizingPostId === postId ? 'Summarizing...' : 'Summarize with AI'}
                                  </MenuItem>
                                  <MenuItem onClick={() => toggleSavePost(postId)} icon={<BookmarkIcon width={12} height={12} />} bg="transparent" _hover={{ bg: 'rgba(34, 211, 238, 0.1)' }} color={isPostSaved(postId) ? 'brand.500' : 'var(--color-text-primary)'}>
                                    {isPostSaved(postId) ? 'Unsave' : 'Save'}
                                  </MenuItem>
                                  {isAdmin && (
                                    <MenuItem onClick={() => handleTogglePostPin(post)} icon={<PinIcon width={12} height={12} />} bg="transparent" _hover={{ bg: 'rgba(34, 211, 238, 0.1)' }} color="cyan.300">
                                      {post?.pinned ? 'Unpin' : 'Pin'}
                                    </MenuItem>
                                  )}
                                  {post.type === 'problem' && isOwner(post.authorId) && (
                                    <MenuItem onClick={() => handleToggleSolved(post)} icon={<Box as="span" fontSize="xs">✅</Box>} bg="transparent" _hover={{ bg: 'rgba(34, 211, 238, 0.1)' }} color="green.400">
                                      Mark as {post?.solved ? 'Unsolved' : 'Solved'}
                                    </MenuItem>
                                  )}
                                </MenuList>
                              </Menu>
                            </>
                          ) : (
                            <HStack spacing={2}>
                              <Button size="xs" variant="primary" isLoading={savingPostEditId === postId} onClick={() => handleSavePostEdit(postId)}>Save</Button>
                              <Button size="xs" variant="ghost" onClick={handleCancelPostEdit}>Cancel</Button>
                            </HStack>
                          )}
                        </HStack>
                      </Flex>

                      {discussionSummaries[postId] && (
                        <Box mt={3} p={3} bg="rgba(34, 211, 238, 0.04)" borderRadius="10px" borderLeft="3px solid" borderLeftColor="brand.500">
                          <HStack spacing={2} mb={1}>
                            <Box as="span" fontSize="xs">✨</Box>
                            <Text fontSize="xs" fontWeight="bold" color="cyan.300" textTransform="uppercase" letterSpacing="wider">AI Summary</Text>
                          </HStack>
                          <Text color="var(--color-text-primary)" fontSize="sm" fontStyle="italic">"{discussionSummaries[postId]}"</Text>
                        </Box>
                      )}

                      {isLoggedIn && (
                        <Box as="form" mt={4} onSubmit={(e) => handleAddComment(e, postId)}>
                          <VStack align="stretch" spacing={2}>
                            <Textarea
                              value={draft.text}
                              onChange={(e) => updateCommentDraft(postId, { text: e.target.value })}
                              placeholder="Write a comment..."
                              minH="80px"
                              bg="var(--color-bg-primary)"
                              borderColor="var(--color-border)"
                              color="var(--color-text-primary)"
                              _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #22d3ee' }}
                            />
                            <Button type="submit" size="xs" variant="primary" isLoading={draft.isSubmitting} alignSelf="flex-end">Post Comment</Button>
                          </VStack>
                        </Box>
                      )}

                      {commentsOpen && (
                        <VStack align="stretch" spacing={4} mt={6} pt={4} borderTop="1px solid" borderColor="var(--color-border)">
                          {allComments.length === 0 ? (
                            <Text color="var(--color-text-muted)" fontSize="sm" textAlign="center" py={4}>No comments yet. Be the first to share your thoughts!</Text>
                          ) : (
                            <>
                              {renderCommentTree(visibleComments, postId, post.authorId)}
                              {hiddenCount > 0 && (
                                <Button size="sm" variant="ghost" onClick={() => setShowAllComments(prev => ({ ...prev, [postId]: true }))} color="brand.400">
                                  Show {hiddenCount} more comments
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
              {activeSection === 'problems' ? 'Create Problem' : 'Create Community Post'}
            </Text>
          </ModalHeader>
          <ModalCloseButton color="var(--color-text-muted)" _hover={{ color: 'brand.500' }} mt={2} />
          <ModalBody p={6}>
            <form onSubmit={handleCreatePost}>
              <VStack spacing={5} align="stretch">
                <FormControl isInvalid={Boolean(postErrors.title)} isRequired>
                  <FormLabel color="var(--color-text-muted)" fontSize="sm" fontWeight="medium">Title</FormLabel>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={activeSection === 'problems' ? 'Write a clear problem title' : 'Write a clear title'}
                    bg="var(--color-bg-primary)"
                    borderColor="var(--color-border)"
                    color="var(--color-text-primary)"
                    _hover={{ borderColor: 'brand.500' }}
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #22d3ee' }}
                  />
                  <FormErrorMessage>{postErrors.title}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={Boolean(postErrors.content)} isRequired>
                  <FormLabel color="var(--color-text-muted)" fontSize="sm" fontWeight="medium">{activeSection === 'problems' ? 'Description' : 'Content'}</FormLabel>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={activeSection === 'problems' ? 'Describe your issue or question' : 'Describe your idea, question, or issue'}
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
                    <FormLabel color="var(--color-text-muted)" fontSize="sm" fontWeight="medium">Problem Type</FormLabel>
                    <Select value={problemType} onChange={(e) => setProblemType(e.target.value)} bg="var(--color-bg-primary)" borderColor="var(--color-border)" color="var(--color-text-primary)">
                      <option value="bug" style={{ backgroundColor: 'var(--color-bg-primary)' }}>Bug</option>
                      <option value="algorithm" style={{ backgroundColor: 'var(--color-bg-primary)' }}>Algorithm</option>
                      <option value="help" style={{ backgroundColor: 'var(--color-bg-primary)' }}>Help</option>
                      <option value="optimization" style={{ backgroundColor: 'var(--color-bg-primary)' }}>Optimization</option>
                    </Select>
                  </FormControl>
                )}

                <FormControl>
                  <FormLabel color="var(--color-text-muted)" fontSize="sm" fontWeight="medium">Tags (comma separated)</FormLabel>
                  <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="javascript, help, bug" bg="var(--color-bg-primary)" borderColor="var(--color-border)" color="var(--color-text-primary)" />
                  <Flex mt={3} justify="space-between" align={{ base: 'start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap={2}>
                    <Text color="var(--color-text-muted)" fontSize="xs">AI can suggest 3 to 5 tags from your title and description.</Text>
                    <Button size="xs" variant="outline" borderColor="brand.500" color="brand.300" onClick={() => requestAiTags(`${title.trim()}\n${content.trim()}`.trim())} isLoading={isFetchingAiTags}>Suggest Tags</Button>
                  </Flex>
                </FormControl>

                <Flex justify="flex-end" gap={3} pt={4} borderTop="1px solid" borderColor="var(--color-border)">
                  <Button variant="ghost" onClick={handleCreateModalClose} color="var(--color-text-muted)">Cancel</Button>
                  <Button type="submit" variant="primary" isLoading={creatingPost} loadingText="Posting" px={8}>Publish Post</Button>
                </Flex>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={deleteConfirm.isOpen} onClose={closeDeleteConfirm} isCentered>
        <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" />
        <ModalContent bg="var(--color-bg-secondary)" border="1px solid rgba(239, 68, 68, 0.35)" borderRadius="16px">
          <ModalHeader color="var(--color-text-heading)" fontFamily="heading" fontSize="lg" fontWeight="semibold">Confirm Deletion</ModalHeader>
          <ModalCloseButton color="var(--color-text-muted)" _hover={{ color: 'red.300' }} />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              <Text color="var(--color-text-secondary)" fontSize="sm">
                {deleteConfirm.type === 'post' ? 'Are you sure you want to delete this post?' : 'Are you sure you want to delete this comment?'}
              </Text>
              <HStack justify="flex-end">
                <Button variant="ghost" onClick={closeDeleteConfirm}>Cancel</Button>
                <Button colorScheme="red" onClick={confirmDelete}>Delete</Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      </MotionBox>
  );
};

export default CommunityPage;
