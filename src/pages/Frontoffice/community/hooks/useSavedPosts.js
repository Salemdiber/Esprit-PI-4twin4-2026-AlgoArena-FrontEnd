import { useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { usePersistentState } from './usePersistentState';

// Saved posts are stored as { [userId]: string[] } so multiple accounts
// signed in on the same browser don't pollute each other.
export const useSavedPosts = (currentUserId) => {
  const [savedItems, setSavedItems] = usePersistentState(
    STORAGE_KEYS.savedItems,
    {},
  );

  const isPostSaved = useCallback(
    (postId) => {
      if (!currentUserId) return false;
      return (savedItems[currentUserId] || []).includes(String(postId));
    },
    [currentUserId, savedItems],
  );

  const toggleSavePost = useCallback(
    (postId) => {
      if (!currentUserId) return;
      setSavedItems((prev) => {
        const current = new Set(prev[currentUserId] || []);
        const id = String(postId);
        if (current.has(id)) current.delete(id);
        else current.add(id);
        return { ...prev, [currentUserId]: [...current] };
      });
    },
    [currentUserId, setSavedItems],
  );

  return { savedItems, isPostSaved, toggleSavePost };
};
