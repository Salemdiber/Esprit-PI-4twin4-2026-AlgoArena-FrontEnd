/**
 * Hook personnalisé pour gérer les challenges du Playground
 * Encapsule la logique de chargement, filtrage et pagination
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import playgroundChallengesService from '../../services/playgroundChallengesService';

export function usePlaygroundChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Charger tous les challenges au mount
  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await playgroundChallengesService.getChallenges();
      setChallenges(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load challenges');
      console.error('Error fetching challenges:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // Retry logic pour gérer les erreurs temporaires
  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    fetchChallenges();
  }, [fetchChallenges]);

  // Charger un challenge spécifique
  const fetchChallenge = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await playgroundChallengesService.getChallenge(id);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load challenge');
      console.error('Error fetching challenge:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger un challenge aléatoire
  const fetchRandomChallenge = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await playgroundChallengesService.getRandomChallenge();
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load random challenge');
      console.error('Error fetching random challenge:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Statistiques
  const stats = useMemo(() => {
    const easy = challenges.filter(c => c.difficulty === 'Easy').length;
    const medium = challenges.filter(c => c.difficulty === 'Medium').length;
    const hard = challenges.filter(c => c.difficulty === 'Hard').length;
    
    return {
      total: challenges.length,
      byDifficulty: { easy, medium, hard }
    };
  }, [challenges]);

  return {
    challenges,
    loading,
    error,
    retryCount,
    retry,
    fetchChallenge,
    fetchRandomChallenge,
    stats,
  };
}

export default usePlaygroundChallenges;
