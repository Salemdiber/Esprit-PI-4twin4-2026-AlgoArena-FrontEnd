import { useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { usePersistentState } from './usePersistentState';

const emptyReaction = () => ({ likes: 0, dislikes: 0, userReaction: null });

// Per-user reactions are persisted client-side only (the backend doesn't
// model them yet). Two stores:
//   - postReactions:    { [postId]: { likes, dislikes, userReaction } }
//   - commentReactions: { [`${postId}:${commentId}`]: { ... } }
export const usePostReactions = ({ onReactToPost } = {}) => {
  const [postReactions, setPostReactions] = usePersistentState(
    STORAGE_KEYS.postReactions,
    {},
  );
  const [commentReactions, setCommentReactions] = usePersistentState(
    STORAGE_KEYS.commentReactions,
    {},
  );

  const getPostReaction = useCallback(
    (postId) => postReactions[postId] || emptyReaction(),
    [postReactions],
  );

  const getCommentReaction = useCallback(
    (postId, commentId) =>
      commentReactions[`${postId}:${commentId}`] || emptyReaction(),
    [commentReactions],
  );

  const togglePostReaction = useCallback(
    (postId, reaction) => {
      const current = postReactions[postId] || emptyReaction();
      const isNewReaction =
        (reaction === 'like' && current.userReaction !== 'like') ||
        (reaction === 'dislike' && current.userReaction !== 'dislike');

      setPostReactions((prev) => {
        const localCurrent = prev[postId] || emptyReaction();
        const next = { ...localCurrent };

        if (reaction === 'like') {
          if (localCurrent.userReaction === 'like') {
            next.likes = Math.max(0, next.likes - 1);
            next.userReaction = null;
          } else {
            if (localCurrent.userReaction === 'dislike') {
              next.dislikes = Math.max(0, next.dislikes - 1);
            }
            next.likes += 1;
            next.userReaction = 'like';
          }
        }

        if (reaction === 'dislike') {
          if (localCurrent.userReaction === 'dislike') {
            next.dislikes = Math.max(0, next.dislikes - 1);
            next.userReaction = null;
          } else {
            if (localCurrent.userReaction === 'like') {
              next.likes = Math.max(0, next.likes - 1);
            }
            next.dislikes += 1;
            next.userReaction = 'dislike';
          }
        }

        return { ...prev, [postId]: next };
      });

      if (isNewReaction && typeof onReactToPost === 'function') {
        onReactToPost(postId, reaction);
      }
    },
    [postReactions, setPostReactions, onReactToPost],
  );

  const toggleCommentReaction = useCallback(
    (postId, commentId, reaction) => {
      setCommentReactions((prev) => {
        const key = `${postId}:${commentId}`;
        const localCurrent = prev[key] || emptyReaction();
        const next = { ...localCurrent };

        if (reaction === 'like') {
          if (localCurrent.userReaction === 'like') {
            next.likes = Math.max(0, next.likes - 1);
            next.userReaction = null;
          } else {
            if (localCurrent.userReaction === 'dislike') {
              next.dislikes = Math.max(0, next.dislikes - 1);
            }
            next.likes += 1;
            next.userReaction = 'like';
          }
        }

        if (reaction === 'dislike') {
          if (localCurrent.userReaction === 'dislike') {
            next.dislikes = Math.max(0, next.dislikes - 1);
            next.userReaction = null;
          } else {
            if (localCurrent.userReaction === 'like') {
              next.likes = Math.max(0, next.likes - 1);
            }
            next.dislikes += 1;
            next.userReaction = 'dislike';
          }
        }

        return { ...prev, [key]: next };
      });
    },
    [setCommentReactions],
  );

  return {
    postReactions,
    commentReactions,
    getPostReaction,
    getCommentReaction,
    togglePostReaction,
    toggleCommentReaction,
  };
};
