import { apiClient } from "./apiClient";

export const communityService = {
  getPosts: async () => {
    return apiClient("/community/posts", {
      method: "GET",
    });
  },

  uploadMedia: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient("/community/uploads", {
      method: "POST",
      body: formData,
    });
  },

  createPost: async (data) => {
    return apiClient("/community/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updatePost: async (postId, data) => {
    return apiClient(`/community/posts/${postId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  addComment: async (postId, data) => {
    return apiClient(`/community/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  addReply: async (postId, parentCommentId, data) => {
    return apiClient(`/community/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({
        ...data,
        parentCommentId,
      }),
    });
  },

  updateComment: async (postId, commentId, data) => {
    return apiClient(`/community/posts/${postId}/comments/${commentId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deletePost: async (postId) => {
    return apiClient(`/community/posts/${postId}`, {
      method: "DELETE",
    });
  },

  deleteComment: async (postId, commentId) => {
    return apiClient(`/community/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    });
  },

  setPostSolved: async (postId, solved) => {
    return apiClient(`/community/posts/${postId}/solve`, {
      method: "PATCH",
      body: JSON.stringify({ solved }),
    });
  },

  setPostPinned: async (postId, pinned) => {
    return apiClient(`/community/posts/${postId}/pin`, {
      method: "PATCH",
      body: JSON.stringify({ pinned }),
    });
  },

  setCommentPinned: async (postId, commentId, pinned) => {
    return apiClient(`/community/posts/${postId}/comments/${commentId}/pin`, {
      method: "PATCH",
      body: JSON.stringify({ pinned }),
    });
  },
};
