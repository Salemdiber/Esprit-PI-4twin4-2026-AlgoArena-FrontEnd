const networkFailureListeners = new Set();

const sanitizeUrl = (url) => {
  if (!url) return '';
  const asString = String(url);
  return asString.split('?')[0];
};

export const recordNetworkFailure = ({ url, method, status }) => {
  const event = {
    url: sanitizeUrl(url),
    method: String(method || 'GET').toUpperCase(),
    status: Number.isFinite(Number(status)) ? Number(status) : 0,
    timestamp: Date.now(),
  };
  networkFailureListeners.forEach((listener) => {
    try {
      listener(event);
    } catch {
      // no-op: diagnostics must never break request flow
    }
  });
};

export const subscribeNetworkFailure = (listener) => {
  if (typeof listener !== 'function') return () => {};
  networkFailureListeners.add(listener);
  return () => networkFailureListeners.delete(listener);
};

