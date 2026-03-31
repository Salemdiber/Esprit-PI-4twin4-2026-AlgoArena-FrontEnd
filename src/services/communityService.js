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

  updateComment: async (postId, commentId, data) => {
    return apiClient(`/community/posts/${postId}/comments/${commentId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};
