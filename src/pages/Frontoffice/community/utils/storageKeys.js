// Centralised localStorage keys used across the community feature.
// Keep the `_v1` suffix; bumping it invalidates older shapes in the wild.
export const STORAGE_KEYS = {
  postReactions: 'discussion_post_reactions_v1',
  commentReactions: 'discussion_comment_reactions_v1',
  savedItems: 'discussion_saved_items_v1',
  bestAnswers: 'discussion_best_answers_v1',
  userNotifications: 'discussion_user_notifications_v1',
  commentMeta: 'discussion_comment_meta_v1',
  sentimentCache: 'discussion_ai_sentiment_cache_v1',
};

export const safeRead = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const safeWrite = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / serialization errors - persistence is best-effort
  }
};
