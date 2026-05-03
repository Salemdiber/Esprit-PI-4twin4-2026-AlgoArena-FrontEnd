import { apiClient } from "./apiClient";
import { getToken } from "./cookieUtils";
import { getAcceptLanguageHeader } from "../i18n";

const BASE_URL = import.meta?.env?.VITE_API_URL || "/api";
const AI_CACHE_TTL_MS = 30 * 60 * 1000;
const AI_CACHE_MAX_ENTRIES = 300;

export const aiCache = {};
const aiCacheMeta = {};
const aiInFlight = {};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseRetryDelayMs = (message = "") => {
  const retryAfterSeconds = message.match(/try again in\s*(\d+)s/i);
  if (retryAfterSeconds) {
    return Number(retryAfterSeconds[1]) * 1000;
  }
  return 2000;
};

const isGroqRateLimitError = (error) => {
  const message = String(error?.message || error || "");
  return /rate limit reached|requests per minute|groq:/i.test(message);
};

const buildAiCacheKey = ({ prompt, systemPrompt, maxTokens, temperature }) => {
  const payload = {
    prompt: String(prompt || "").trim(),
    systemPrompt: String(systemPrompt || "").trim(),
    maxTokens: Math.min(100, Math.max(20, Number(maxTokens) || 100)),
    temperature: Number.isFinite(Number(temperature))
      ? Number(temperature)
      : 0.2,
  };
  return JSON.stringify(payload);
};

const pruneAiCache = () => {
  const keys = Object.keys(aiCacheMeta);
  if (keys.length <= AI_CACHE_MAX_ENTRIES) return;

  const overflow = keys.length - AI_CACHE_MAX_ENTRIES;
  const oldestKeys = keys
    .sort((a, b) => Number(aiCacheMeta[a] || 0) - Number(aiCacheMeta[b] || 0))
    .slice(0, overflow);

  oldestKeys.forEach((key) => {
    delete aiCache[key];
    delete aiCacheMeta[key];
    delete aiInFlight[key];
  });
};

export async function callAI(
  prompt,
  { systemPrompt, maxTokens = 100, temperature = 0.2 } = {},
) {
  const normalizedPrompt = String(prompt || "").trim();
  if (!normalizedPrompt) {
    throw new Error("Prompt is required.");
  }

  const cacheKey = buildAiCacheKey({
    prompt: normalizedPrompt,
    systemPrompt,
    maxTokens,
    temperature,
  });

  const cacheTimestamp = Number(aiCacheMeta[cacheKey] || 0);
  const isFresh =
    cacheTimestamp > 0 && Date.now() - cacheTimestamp < AI_CACHE_TTL_MS;
  if (isFresh && typeof aiCache[cacheKey] === "string") {
    return aiCache[cacheKey];
  }

  if (aiInFlight[cacheKey]) {
    return aiInFlight[cacheKey];
  }

  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    "Accept-Language": getAcceptLanguageHeader(),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const normalizedMaxTokens = Math.min(
    100,
    Math.max(20, Number(maxTokens) || 100),
  );

  const requestPayload = {
    prompt: normalizedPrompt,
    systemPrompt,
    maxTokens: normalizedMaxTokens,
    temperature,
  };

  const runOnce = async () => {
    await sleep(1500);
    const response = await fetch(`${BASE_URL}/community/ai/generate`, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(requestPayload),
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message = String(
        payload?.message || payload?.error || `HTTP ${response.status}`,
      );
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    return String(payload?.text || "");
  };

  const runTask = (async () => {
    try {
      const text = await runOnce();
      aiCache[cacheKey] = text;
      aiCacheMeta[cacheKey] = Date.now();
      pruneAiCache();
      return text;
    } catch (error) {
      if (!isGroqRateLimitError(error)) {
        throw error;
      }

      // Safe retry once on rate limit.
      const retryDelay = parseRetryDelayMs(String(error?.message || ""));
      await sleep(Math.max(2000, retryDelay));
      const text = await runOnce();
      aiCache[cacheKey] = text;
      aiCacheMeta[cacheKey] = Date.now();
      pruneAiCache();
      return text;
    } finally {
      delete aiInFlight[cacheKey];
    }
  })();

  aiInFlight[cacheKey] = runTask;
  return runTask;
}

export const communityService = {
  callAI,

  getPosts: async () => {
    return apiClient("/posts", {
      method: "GET",
    });
  },

  getComments: async (postId) => {
    const endpoint = postId ? `/comments/${postId}` : "/comments";
    return apiClient(endpoint, {
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
    return apiClient("/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  createComment: async (data) => {
    return apiClient("/comments", {
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

  generateAiText: async ({
    prompt,
    systemPrompt,
    maxTokens = 100,
    temperature = 0.2,
  }) => {
    return callAI(prompt, {
      systemPrompt,
      maxTokens,
      temperature,
    });
  },
};
