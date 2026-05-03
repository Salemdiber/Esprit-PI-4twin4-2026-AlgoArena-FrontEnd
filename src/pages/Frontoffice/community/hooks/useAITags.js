import { useCallback, useState } from 'react';
import { communityService } from '../../../../services/communityService';
import { extractJsonArray, normalizeTagList } from '../utils/tags';

const GROQ_MAX_TOKENS = 100;

// Wraps the AI tag suggestion call with loading/error state. The dialog
// owns the *currently selected* tags; this hook just produces candidates.
export const useAITags = () => {
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');

  const reset = useCallback(() => {
    setSuggestedTags([]);
    setError('');
  }, []);

  const requestTags = useCallback(async (sourceText, { silent = false } = {}) => {
    if (!sourceText || sourceText.length < 20) {
      if (!silent) {
        setError('Write a bit more title and description to generate useful tags.');
      }
      return [];
    }

    try {
      setIsFetching(true);
      if (!silent) setError('');

      const modelText = await communityService.generateAiText({
        prompt: `Extract 3 to 5 relevant tags from this text. Return ONLY a JSON array like ['tag1','tag2'].\n\n${sourceText}`,
        maxTokens: GROQ_MAX_TOKENS,
        temperature: 0.2,
      });

      const rawTags = extractJsonArray(modelText);
      const normalized = normalizeTagList(rawTags).slice(0, 5);

      if (!normalized.length) {
        throw new Error('No valid tags returned');
      }

      setSuggestedTags(normalized);
      return normalized;
    } catch (err) {
      if (!silent) {
        const message = String(err?.message || 'Unable to generate AI tags right now. Please try again.');
        setError(
          message.includes('HTTP') || message.includes('GROQ') || message.includes(':')
            ? message
            : 'Unable to generate AI tags right now. Please try again.',
        );
      }
      return [];
    } finally {
      setIsFetching(false);
    }
  }, []);

  return { suggestedTags, isFetching, error, requestTags, reset };
};
