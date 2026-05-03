// Helpers for the recursive comment structure returned by the API.
// Comments may have nested `replies` arrays of arbitrary depth.

export const keyOf = (comment) =>
  String(comment?._id || `${comment?.createdAt || ''}:${comment?.text || ''}`);

export const sortCommentsPinnedFirst = (comments) => {
  if (!Array.isArray(comments)) return [];
  return [...comments].sort((a, b) => {
    const aPinned = a?.pinned ? 1 : 0;
    const bPinned = b?.pinned ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    const aDate = new Date(a?.createdAt || 0).getTime();
    const bDate = new Date(b?.createdAt || 0).getTime();
    return bDate - aDate;
  });
};

export const countCommentTree = (comments) => {
  if (!Array.isArray(comments)) return 0;
  return comments.reduce(
    (acc, c) => acc + 1 + countCommentTree(c?.replies || []),
    0,
  );
};

export const flattenCommentTexts = (comments) => {
  if (!Array.isArray(comments)) return [];
  return comments.reduce((acc, comment) => {
    const text = String(comment?.text || '').trim();
    if (text) acc.push(text);
    return acc.concat(flattenCommentTexts(comment?.replies || []));
  }, []);
};

export const flattenComments = (comments) => {
  if (!Array.isArray(comments)) return [];
  return comments.reduce((acc, c) => {
    acc.push(c);
    return acc.concat(flattenComments(c?.replies || []));
  }, []);
};

export const findCommentById = (comments, targetId) => {
  if (!Array.isArray(comments) || !targetId) return null;
  for (const comment of comments) {
    if (String(comment?._id || '') === String(targetId)) return comment;
    const nested = findCommentById(comment?.replies || [], targetId);
    if (nested) return nested;
  }
  return null;
};

export const moveCommentToTopById = (comments, targetId) => {
  if (!Array.isArray(comments) || !targetId) return comments || [];
  const idx = comments.findIndex(
    (comment) => String(comment?._id || '') === String(targetId),
  );
  if (idx <= 0) return comments;
  const picked = comments[idx];
  const rest = comments.filter((_, i) => i !== idx);
  return [picked, ...rest];
};

export const addReplyInTree = (comments, parentCommentId, reply) => {
  if (!Array.isArray(comments)) return [];
  return comments.map((comment) => {
    if (String(comment?._id || '') === String(parentCommentId)) {
      return {
        ...comment,
        replies: [reply, ...(Array.isArray(comment?.replies) ? comment.replies : [])],
      };
    }
    return {
      ...comment,
      replies: addReplyInTree(comment?.replies || [], parentCommentId, reply),
    };
  });
};
