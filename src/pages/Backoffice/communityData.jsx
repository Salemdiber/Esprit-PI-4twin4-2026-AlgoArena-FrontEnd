const STORAGE_KEYS = {
  posts: 'bo_community_posts_v1',
  comments: 'bo_community_comments_v1',
  users: 'bo_community_users_v1',
};

const safeRead = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write errors
  }
};

const now = Date.now();

const sampleUsers = [
  { id: 'u-admin', username: 'admin', role: 'ADMIN', avatar: '' },
  { id: 'u-lina', username: 'lina', role: 'USER', avatar: '' },
  { id: 'u-omar', username: 'omar', role: 'USER', avatar: '' },
];

const sampleComments = [
  {
    _id: 'c-1',
    postId: 'p-1',
    parentCommentId: null,
    text: 'I hit the same issue with state updates not batching as expected.',
    authorId: 'u-omar',
    authorUsername: 'omar',
    authorAvatar: '',
    createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
    pinned: false,
  },
  {
    _id: 'c-2',
    postId: 'p-2',
    parentCommentId: null,
    text: 'The auth token is missing on refresh, maybe persisted state issue.',
    authorId: 'u-lina',
    authorUsername: 'lina',
    authorAvatar: '',
    createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    pinned: false,
  },
];

const samplePosts = [
  {
    _id: 'p-1',
    title: 'React state is not updating in my challenge form',
    content: 'My input values lag behind after submit. Any clean approach for stable state updates?',
    type: 'problem',
    problemType: 'bug',
    tags: ['react', 'state', 'form'],
    imageUrl: '',
    videoUrl: '',
    authorId: 'u-lina',
    authorUsername: 'lina',
    authorAvatar: '',
    createdAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
    pinned: false,
    solved: false,
    comments: [
      {
        _id: 'c-1',
        text: 'I hit the same issue with state updates not batching as expected.',
        authorId: 'u-omar',
        authorUsername: 'omar',
        authorAvatar: '',
        createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
        pinned: false,
        replies: [],
      },
    ],
  },
  {
    _id: 'p-2',
    title: 'API authorization keeps failing after reload',
    content: 'Calls work after login but fail after refreshing the page. How should I persist auth?',
    type: 'normal',
    tags: ['api', 'auth', 'token'],
    imageUrl: '',
    videoUrl: '',
    authorId: 'u-omar',
    authorUsername: 'omar',
    authorAvatar: '',
    createdAt: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
    updatedAt: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
    pinned: false,
    solved: false,
    comments: [
      {
        _id: 'c-2',
        text: 'The auth token is missing on refresh, maybe persisted state issue.',
        authorId: 'u-lina',
        authorUsername: 'lina',
        authorAvatar: '',
        createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
        pinned: false,
        replies: [],
      },
    ],
  },
];

const normalizeId = (value) => String(value || '');

const flattenCommentsFromPosts = (posts) => {
  const walk = (postId, comments, parentCommentId = null) => {
    if (!Array.isArray(comments)) return [];
    return comments.flatMap((comment) => {
      const current = {
        _id: normalizeId(comment?._id),
        postId: normalizeId(postId),
        parentCommentId,
        text: String(comment?.text || ''),
        authorId: normalizeId(comment?.authorId),
        authorUsername: String(comment?.authorUsername || 'unknown'),
        authorAvatar: String(comment?.authorAvatar || ''),
        imageUrl: String(comment?.imageUrl || ''),
        videoUrl: String(comment?.videoUrl || ''),
        createdAt: String(comment?.createdAt || ''),
        updatedAt: String(comment?.updatedAt || ''),
        pinned: Boolean(comment?.pinned),
      };
      return [current, ...walk(postId, comment?.replies || [], current._id)];
    });
  };

  if (!Array.isArray(posts)) return [];
  return posts.flatMap((post) => walk(post?._id, post?.comments || []));
};

const collectUsersFromPosts = (posts) => {
  if (!Array.isArray(posts)) return [];
  const byId = new Map();

  const upsert = (authorId, authorUsername, authorAvatar) => {
    const id = normalizeId(authorId);
    if (!id) return;
    byId.set(id, {
      id,
      username: String(authorUsername || 'unknown'),
      avatar: String(authorAvatar || ''),
      role: 'USER',
    });
  };

  const walkComments = (comments) => {
    if (!Array.isArray(comments)) return;
    comments.forEach((comment) => {
      upsert(comment?.authorId, comment?.authorUsername, comment?.authorAvatar);
      walkComments(comment?.replies || []);
    });
  };

  posts.forEach((post) => {
    upsert(post?.authorId, post?.authorUsername, post?.authorAvatar);
    walkComments(post?.comments || []);
  });

  return [...byId.values()];
};

const mergeById = (existingItems, incomingItems, idSelector) => {
  const map = new Map();

  (Array.isArray(existingItems) ? existingItems : []).forEach((item) => {
    const id = normalizeId(idSelector(item));
    if (!id) return;
    map.set(id, item);
  });

  (Array.isArray(incomingItems) ? incomingItems : []).forEach((item) => {
    const id = normalizeId(idSelector(item));
    if (!id) return;
    const previous = map.get(id) || {};
    map.set(id, { ...previous, ...item });
  });

  return [...map.values()];
};

const initializeDefaultData = () => {
  const hasPosts = localStorage.getItem(STORAGE_KEYS.posts);
  const hasComments = localStorage.getItem(STORAGE_KEYS.comments);
  const hasUsers = localStorage.getItem(STORAGE_KEYS.users);

  if (!hasPosts) safeWrite(STORAGE_KEYS.posts, samplePosts);
  if (!hasComments) safeWrite(STORAGE_KEYS.comments, sampleComments);
  if (!hasUsers) safeWrite(STORAGE_KEYS.users, sampleUsers);
};

export const getPosts = () => {
  initializeDefaultData();
  return safeRead(STORAGE_KEYS.posts, []);
};

export const savePosts = (posts) => {
  safeWrite(STORAGE_KEYS.posts, Array.isArray(posts) ? posts : []);
};

export const getComments = () => {
  initializeDefaultData();
  return safeRead(STORAGE_KEYS.comments, []);
};

export const saveComments = (comments) => {
  safeWrite(STORAGE_KEYS.comments, Array.isArray(comments) ? comments : []);
};

export const getUsers = () => {
  initializeDefaultData();
  return safeRead(STORAGE_KEYS.users, []);
};

export const saveUsers = (users) => {
  safeWrite(STORAGE_KEYS.users, Array.isArray(users) ? users : []);
};

export const mergeCommunitySnapshot = (incomingPosts) => {
  if (!Array.isArray(incomingPosts) || incomingPosts.length === 0) return;

  initializeDefaultData();

  const existingPosts = safeRead(STORAGE_KEYS.posts, []);
  const mergedPosts = mergeById(existingPosts, incomingPosts, (post) => post?._id);
  savePosts(mergedPosts);

  const existingComments = safeRead(STORAGE_KEYS.comments, []);
  const nextComments = flattenCommentsFromPosts(mergedPosts);
  const mergedComments = mergeById(existingComments, nextComments, (comment) => comment?._id);
  saveComments(mergedComments);

  const existingUsers = safeRead(STORAGE_KEYS.users, []);
  const snapshotUsers = collectUsersFromPosts(mergedPosts);
  const mergedUsers = mergeById(existingUsers, snapshotUsers, (user) => user?.id || user?._id);
  saveUsers(mergedUsers);
};
