import { jest } from '@jest/globals';

Object.defineProperty(import.meta, 'env', {
  value: { VITE_API_URL: '' },
  configurable: true,
});

const fetchMock = jest.fn();
global.fetch = fetchMock;

const makeResponse = async (body) => ({
  ok: true,
  status: 200,
  text: async () => JSON.stringify(body),
  json: async () => body,
});

fetchMock.mockImplementation(async () => makeResponse({ ok: true }));

const { communityService } = await import('../communityService.js');

describe('communityService', () => {
  beforeEach(() => {
    fetchMock.mockClear();
    fetchMock.mockImplementation(async () => makeResponse({ ok: true }));
  });

  it('rejects empty AI prompts before making a request', async () => {
    await expect(communityService.callAI('   ')).rejects.toThrow('Prompt is required.');
  });

  it('sends the expected API requests for posts and comments', async () => {
    await communityService.getPosts();
    await communityService.getComments('post-1');
    await communityService.getComments();
    await communityService.createPost({ title: 'Hello' });
    await communityService.addReply('post-1', 'comment-1', { text: 'Reply' });

    expect(fetchMock).toHaveBeenCalledWith('/api/posts', expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith('/api/comments/post-1', expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith('/api/comments', expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith('/api/posts', {
      method: 'POST',
      credentials: 'include',
      headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ title: 'Hello' }),
    });
    expect(fetchMock).toHaveBeenCalledWith('/api/community/posts/post-1/comments', {
      method: 'POST',
      credentials: 'include',
      headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ text: 'Reply', parentCommentId: 'comment-1' }),
    });
  });
});