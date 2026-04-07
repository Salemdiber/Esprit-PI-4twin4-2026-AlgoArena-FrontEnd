import { getAcceptLanguageHeader } from '../i18n';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const ENDPOINT = `${API_BASE}/challenges`;

const langHeaders = () => ({ 'Accept-Language': getAcceptLanguageHeader() });

async function handleResp(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = text || res.statusText || 'Request failed';
    throw new Error(err);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function getChallenges() {
  const res = await fetch(ENDPOINT, { credentials: 'same-origin', headers: { ...langHeaders() } });
  return handleResp(res);
}

export async function getChallenge(id) {
  const res = await fetch(`${ENDPOINT}/${id}`, { credentials: 'same-origin', headers: { ...langHeaders() } });
  return handleResp(res);
}

export async function createChallenge(payload) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...langHeaders() },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
  });
  return handleResp(res);
}

export async function updateChallenge(id, payload) {
  const res = await fetch(`${ENDPOINT}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...langHeaders() },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
  });
  return handleResp(res);
}

export async function deleteChallenge(id) {
  const res = await fetch(`${ENDPOINT}/${id}`, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: { ...langHeaders() },
  });
  return handleResp(res);
}

export default {
  getChallenges,
  getChallenge,
  createChallenge,
  updateChallenge,
  deleteChallenge,
};
