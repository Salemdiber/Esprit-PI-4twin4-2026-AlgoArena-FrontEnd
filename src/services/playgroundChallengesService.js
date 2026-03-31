const API_BASE = '/api/playground/challenges';

/**
 * Handle API response with proper error handling
 * @param {Response} res - Fetch response
 * @returns {Promise<any>} Parsed JSON or null
 */
async function handleResp(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = text || res.statusText || 'Request failed';
    console.error(`[API Error] Status: ${res.status}`, err);
    throw new Error(err);
  }
  if (res.status === 204) return null;
  return res.json();
}

/**
 * Get all playground challenges
 * @returns {Promise<Array>} Array of challenges
 */
export async function getChallenges() {
  try {
    console.log('[API] Fetching challenges...');
    const res = await fetch(API_BASE, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await handleResp(res);
    console.log('[API] Challenges loaded:', data?.length || 0, 'items');
    return data || [];
  } catch (err) {
    console.error('[API Error] Failed to fetch challenges:', err.message);
    throw err;
  }
}

/**
 * Get a single challenge by ID
 * @param {string} id - Challenge ID
 * @returns {Promise<Object>} Challenge object
 */
export async function getChallenge(id) {
  try {
    if (!id) throw new Error('Challenge ID is required');
    console.log(`[API] Fetching challenge:`, id);
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await handleResp(res);
    console.log('[API] Challenge loaded:', data?.title || 'unknown');
    return data;
  } catch (err) {
    console.error(`[API Error] Failed to fetch challenge ${id}:`, err.message);
    throw err;
  }
}

/**
 * Get a random challenge
 * @returns {Promise<Object>} Random challenge object
 */
export async function getRandomChallenge() {
  try {
    console.log('[API] Fetching random challenge...');
    const res = await fetch(`${API_BASE}/random`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await handleResp(res);
    console.log('[API] Random challenge loaded:', data?.title || 'unknown');
    return data;
  } catch (err) {
    console.error('[API Error] Failed to fetch random challenge:', err.message);
    throw err;
  }
}

export default {
  getChallenges,
  getChallenge,
  getRandomChallenge,
};
