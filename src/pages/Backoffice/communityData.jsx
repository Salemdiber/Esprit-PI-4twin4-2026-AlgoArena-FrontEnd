import { communityService } from '../../services/communityService';

const collectUsersFromData = (posts, comments) => {
  const userMap = new Map();

  const upsert = (authorId, authorUsername, authorAvatar) => {
    const id = String(authorId || '');
    if (!id) return;
    userMap.set(id, {
      id,
      username: String(authorUsername || 'unknown'),
      avatar: String(authorAvatar || ''),
      role: 'USER',
    });
  };

  (Array.isArray(posts) ? posts : []).forEach((post) => {
    upsert(post?.authorId, post?.authorUsername, post?.authorAvatar);
  });
  (Array.isArray(comments) ? comments : []).forEach((comment) => {
    upsert(comment?.authorId, comment?.authorUsername, comment?.authorAvatar);
  });

  return [...userMap.values()];
};

export const getPosts = async () => {
  const posts = await communityService.getPosts();
  return Array.isArray(posts) ? posts : [];
};

export const getComments = async (postId) => {
  const comments = await communityService.getComments(postId);
  return Array.isArray(comments) ? comments : [];
};

export const getUsers = async () => {
  const [posts, comments] = await Promise.all([getPosts(), getComments()]);
  return collectUsersFromData(posts, comments);
};

export const savePosts = async () => {};
export const saveComments = async () => {};
export const saveUsers = async () => {};
export const mergeCommunitySnapshot = async () => {};
