// Tag parsing / normalisation helpers shared by the create dialog and
// the AI tag suggestion flow.

export const parseTags = (raw) =>
  String(raw || '')
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);

export const normalizeTagList = (list) => {
  if (!Array.isArray(list)) return [];
  const unique = [];
  const seen = new Set();

  list.forEach((entry) => {
    const tag = String(entry || '')
      .trim()
      .replace(/^#+/, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .slice(0, 24);

    if (!tag || seen.has(tag)) return;
    seen.add(tag);
    unique.push(tag);
  });

  return unique.slice(0, 8);
};

// The Groq model occasionally wraps its JSON output in prose or single
// quotes. Be liberal in what we accept here so the create flow rarely
// shows the user a parse error.
export const extractJsonArray = (text) => {
  const raw = String(text || '').trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return [];
    try {
      const fallback = JSON.parse(match[0]);
      return Array.isArray(fallback) ? fallback : [];
    } catch {
      try {
        const normalizedQuotes = match[0].replace(/'/g, '"');
        const fallbackQuoted = JSON.parse(normalizedQuotes);
        return Array.isArray(fallbackQuoted) ? fallbackQuoted : [];
      } catch {
        return [];
      }
    }
  }
};
