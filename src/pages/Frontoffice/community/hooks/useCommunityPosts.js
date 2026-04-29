import { useCallback, useEffect, useState } from 'react';
import { communityService } from '../../../../services/communityService';

// Single source of truth for the list of posts and the flat `comments`
// projection. Components that mutate posts call setPosts directly with
// either a transformer or a fresh array; the hook does NOT try to be a
// full cache layer - that would obscure how mutations flow.
export const useCommunityPosts = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const remote = await communityService.getPosts();
      setPosts(Array.isArray(remote) ? remote : []);
    } catch (err) {
      setError(err?.message || 'Unable to load posts.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshComments = useCallback(async () => {
    try {
      const remote = await communityService.getComments();
      setComments(Array.isArray(remote) ? remote : []);
    } catch {
      // Comments are a derived view; on failure we keep the posts' nested
      // .comments arrays as the source of truth.
      setComments([]);
    }
  }, []);

  useEffect(() => {
    void refreshPosts();
  }, [refreshPosts]);

  return {
    posts,
    setPosts,
    comments,
    setComments,
    loading,
    error,
    setError,
    refreshPosts,
    refreshComments,
  };
};
