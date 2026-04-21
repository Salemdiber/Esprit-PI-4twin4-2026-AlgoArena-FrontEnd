import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { m } from 'framer-motion';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import { communityService } from '../../../../services/communityService';
import { useAuth } from '../../auth/context/AuthContext';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const MotionBox = m.create(Box);
const GROQ_MAX_TOKENS = 100;
const STORAGE_KEYS = {
  bestAnswers: 'discussion_best_answers_v1',
  sentimentCache: 'discussion_ai_sentiment_cache_v1',
};

const safeRead = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const safeWrite = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
};

const countCommentTree = (comments) => {
  if (!Array.isArray(comments)) return 0;
  return comments.reduce((acc, c) => acc + 1 + countCommentTree(c?.replies || []), 0);
};

const flattenComments = (comments) => {
  if (!Array.isArray(comments)) return [];
  return comments.reduce((acc, c) => {
    acc.push(c);
    return acc.concat(flattenComments(c?.replies || []));
  }, []);
};

const normalizeSentiment = (value) => {
  const text = String(value || '').trim().toLowerCase();
  if (text.startsWith('positive')) return 'Positive';
  if (text.startsWith('negative')) return 'Negative';
  return 'Neutral';
};

const buildCommentId = (postId, comment) => {
  if (comment?._id) return String(comment._id);
  const createdAt = String(comment?.createdAt || '');
  const authorId = String(comment?.authorId || '');
  const textPreview = String(comment?.text || '').slice(0, 60);
  return `${postId}:${createdAt}:${authorId}:${textPreview}`;
};

const collectUsers = (posts, comments) => {
  const userMap = new Map();

  const upsert = (authorId, authorUsername, authorAvatar) => {
    const id = String(authorId || '');
    if (!id) return;
    userMap.set(id, {
      id,
      username: String(authorUsername || 'unknown'),
      avatar: String(authorAvatar || ''),
      role: 'USER',
    });
  };

  posts.forEach((post) => {
    upsert(post?.authorId, post?.authorUsername, post?.authorAvatar);
  });
  comments.forEach((comment) => {
    upsert(comment?.authorId, comment?.authorUsername, comment?.authorAvatar);
  });

  return [...userMap.values()];
};

const collectSentimentTargets = (posts) => {
  const targets = [];
  posts.forEach((post) => {
    const postId = String(post?._id || '');
    const postText = `${String(post?.title || '').trim()}\n${String(post?.content || '').trim()}`.trim();
    if (postId && postText) {
      const stamp = String(post?.updatedAt || post?.createdAt || '');
      targets.push({
        id: `post:${postId}`,
        cacheKey: `post:${postId}:${stamp}:${postText.length}`,
        text: postText,
      });
    }

    flattenComments(post?.comments || []).forEach((comment) => {
      const commentText = String(comment?.text || '').trim();
      if (!commentText) return;
      const commentId = buildCommentId(postId, comment);
      const stamp = String(comment?.updatedAt || comment?.createdAt || '');
      targets.push({
        id: `comment:${commentId}`,
        cacheKey: `comment:${commentId}:${stamp}:${commentText.length}`,
        text: commentText,
      });
    });
  });
  return targets;
};

const parseBatchSentiments = (rawText, expectedCount) => {
  const text = String(rawText || '').trim();
  if (!text) return Array.from({ length: expectedCount }, () => 'Neutral');

  const sanitized = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(sanitized);
  } catch {
    const bracketStart = sanitized.indexOf('[');
    const bracketEnd = sanitized.lastIndexOf(']');
    if (bracketStart >= 0 && bracketEnd > bracketStart) {
      try {
        parsed = JSON.parse(sanitized.slice(bracketStart, bracketEnd + 1));
      } catch {
        parsed = null;
      }
    }
  }

  if (!Array.isArray(parsed)) {
    return Array.from({ length: expectedCount }, () => normalizeSentiment(sanitized));
  }

  const mapped = parsed.map((item) => normalizeSentiment(item));
  if (mapped.length >= expectedCount) return mapped.slice(0, expectedCount);
  return [...mapped, ...Array.from({ length: expectedCount - mapped.length }, () => 'Neutral')];
};

const CommunityDashboardPage = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [insights, setInsights] = useState('');
  const [insightsError, setInsightsError] = useState('');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [lastGeneratedAt, setLastGeneratedAt] = useState(0);
  const [bestAnswerByPost, setBestAnswerByPost] = useState(() => safeRead(STORAGE_KEYS.bestAnswers, {}));
  const [sentimentCounts, setSentimentCounts] = useState({ Positive: 0, Neutral: 0, Negative: 0 });
  const [sentimentError, setSentimentError] = useState('');
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false);
  const [analyzedItems, setAnalyzedItems] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [lastSentimentRunAt, setLastSentimentRunAt] = useState(0);
  const [lastAnalyzedCount, setLastAnalyzedCount] = useState(0);

  const role = String(currentUser?.role || '').toUpperCase();
  const isAdmin = role === 'ADMIN' || role === 'ORGANIZER';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const remotePosts = await communityService.getPosts();
        const remoteComments = await communityService.getComments();
        const normalizedPosts = Array.isArray(remotePosts) ? remotePosts : [];
        const normalizedComments = Array.isArray(remoteComments) ? remoteComments : [];
        setPosts(normalizedPosts);
        setComments(normalizedComments);
        setUsers(collectUsers(normalizedPosts, normalizedComments));
      } catch (err) {
        setError(err.message || 'Unable to load dashboard analytics.');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  useEffect(() => {
    const syncFromBackend = async () => {
      try {
        const remotePosts = await communityService.getPosts();
        const remoteComments = await communityService.getComments();
        const normalizedPosts = Array.isArray(remotePosts) ? remotePosts : [];
        const normalizedComments = Array.isArray(remoteComments) ? remoteComments : [];
        setPosts(normalizedPosts);
        setComments(normalizedComments);
        setUsers(collectUsers(normalizedPosts, normalizedComments));
      } catch {
        // Ignore periodic refresh failures and keep last good state.
      }
    };

    const timer = window.setInterval(() => {
      void syncFromBackend();
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const onStorage = (event) => {
      if (!event.key || event.key === STORAGE_KEYS.bestAnswers) {
        setBestAnswerByPost(safeRead(STORAGE_KEYS.bestAnswers, {}));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const runSentimentAnalysis = async () => {
    if (comments.length === lastAnalyzedCount) {
      setSentimentError('No new data to analyze');
      return;
    }

    const targets = collectSentimentTargets(posts);
    setTotalItems(targets.length);
    setAnalyzedItems(0);

    try {
      setIsAnalyzingSentiment(true);
      setSentimentError('');

      const cache = safeRead(STORAGE_KEYS.sentimentCache, {});
      const nextCache = { ...cache };
      const nextCounts = { Positive: 0, Neutral: 0, Negative: 0 };
      const pendingTargets = [];

      for (let i = 0; i < targets.length; i += 1) {
        const target = targets[i];
        const cached = normalizeSentiment(cache[target.cacheKey]);

        if (cache[target.cacheKey]) {
          nextCounts[cached] += 1;
        } else {
          pendingTargets.push(target);
        }

        setAnalyzedItems(i + 1);
      }

      if (pendingTargets.length > 0) {
        const shortItems = pendingTargets.map((target, index) => {
          const oneLine = target.text.replace(/\s+/g, ' ').trim();
          return `${index + 1}. ${oneLine.slice(0, 220)}`;
        });

        const prompt = `Classify each item sentiment as Positive, Neutral, or Negative. Return ONLY a JSON array of labels in the same order.\nItems:\n${shortItems.join('\n')}`;

        const raw = await communityService.callAI(prompt, {
          maxTokens: GROQ_MAX_TOKENS,
          temperature: 0,
        });

        const sentiments = parseBatchSentiments(raw, pendingTargets.length);

        pendingTargets.forEach((target, index) => {
          const sentiment = normalizeSentiment(sentiments[index]);
          nextCache[target.cacheKey] = sentiment;
          nextCounts[sentiment] += 1;
        });
      }

      safeWrite(STORAGE_KEYS.sentimentCache, nextCache);
      setSentimentCounts(nextCounts);
      setLastSentimentRunAt(Date.now());
      setLastAnalyzedCount(comments.length);
    } catch (err) {
      setSentimentError(String(err?.message || 'Unable to complete sentiment analysis.'));
    } finally {
      setIsAnalyzingSentiment(false);
    }
  };

  const analytics = useMemo(() => {
    const problemPosts = posts.filter((p) => p?.type === 'problem');
    const communityPosts = posts.filter((p) => p?.type !== 'problem');
    const totalComments = comments.length > 0
      ? comments.length
      : posts.reduce((acc, post) => acc + countCommentTree(post?.comments || []), 0);

    const activeUsers = new Set();
    posts.forEach((post) => {
      if (post?.authorId) activeUsers.add(String(post.authorId));
      flattenComments(post?.comments || []).forEach((comment) => {
        if (comment?.authorId) activeUsers.add(String(comment.authorId));
      });
    });
    users.forEach((user) => {
      const userId = String(user?.id || user?._id || '');
      if (userId) activeUsers.add(userId);
    });

    const solvedCount = posts.filter((post) => Boolean(bestAnswerByPost[String(post?._id || '')])).length;
    const solvedPercent = posts.length > 0
      ? Math.round((solvedCount / posts.length) * 100)
      : 0;

    const topicMap = {};
    posts.forEach((post) => {
      const tags = Array.isArray(post?.tags) ? post.tags : [];
      tags.forEach((tag) => {
        const key = String(tag || '').trim().toLowerCase();
        if (!key) return;
        topicMap[key] = (topicMap[key] || 0) + 1;
      });
    });

    const trendingTopics = Object.entries(topicMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([topic, count]) => ({ topic, count }));

    const totalSentiment = sentimentCounts.Positive + sentimentCounts.Neutral + sentimentCounts.Negative;
    const positiveRatio = totalSentiment > 0 ? sentimentCounts.Positive / totalSentiment : 0;
    const negativeRatio = totalSentiment > 0 ? sentimentCounts.Negative / totalSentiment : 0;

    let mood = '🟡 Neutral Activity';
    if (positiveRatio > negativeRatio && positiveRatio >= 0.45) mood = '🟢 Healthy Community';
    else if (negativeRatio > positiveRatio && negativeRatio >= 0.45) mood = '🔴 Needs Attention';

    return {
      problemPosts: problemPosts.length,
      communityPosts: communityPosts.length,
      totalComments,
      activeUsers: activeUsers.size,
      solvedCount,
      unsolvedCount: Math.max(posts.length - solvedCount, 0),
      solvedPercent,
      sentimentBucket: sentimentCounts,
      trendingTopics,
      mood,
    };
  }, [posts, comments, users, bestAnswerByPost, sentimentCounts]);

  const sentimentData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [
          analytics.sentimentBucket.Positive,
          analytics.sentimentBucket.Neutral,
          analytics.sentimentBucket.Negative,
        ],
        backgroundColor: ['#14b8a6', '#38bdf8', '#f87171'],
        borderColor: ['#0f172a', '#0f172a', '#0f172a'],
        borderWidth: 2,
      },
    ],
  };

  const trendingData = {
    labels: analytics.trendingTopics.map((item) => `#${item.topic}`),
    datasets: [
      {
        label: 'Mentions',
        data: analytics.trendingTopics.map((item) => item.count),
        backgroundColor: 'rgba(34, 211, 238, 0.65)',
        borderColor: 'rgba(34, 211, 238, 1)',
        borderWidth: 1,
      },
    ],
  };

  const solvedData = {
    labels: ['Solved', 'Unsolved'],
    datasets: [
      {
        data: [analytics.solvedCount, analytics.unsolvedCount],
        backgroundColor: ['#22c55e', '#f59e0b'],
        borderColor: ['#0f172a', '#0f172a'],
        borderWidth: 2,
      },
    ],
  };

  const statCards = [
    { label: 'Problem Posts', value: analytics.problemPosts },
    { label: 'Community Posts', value: analytics.communityPosts },
    { label: 'Total Comments', value: analytics.totalComments },
    { label: 'Active Users', value: analytics.activeUsers },
    { label: 'Solved Posts %', value: `${analytics.solvedPercent}%` },
  ];

  const generateAiInsights = async () => {
    try {
      setIsGeneratingInsights(true);
      setInsightsError('');

      const compactAnalytics = {
        posts: {
          problems: analytics.problemPosts,
          community: analytics.communityPosts,
        },
        comments: analytics.totalComments,
        activeUsers: analytics.activeUsers,
        solvedPercent: analytics.solvedPercent,
        sentiment: analytics.sentimentBucket,
        trendingTopics: analytics.trendingTopics,
      };

      const aiText = await communityService.generateAiText({
        prompt: `Summarize this community dashboard in 2 short paragraphs, then list 3 admin actions. Keep it concise. Data: ${JSON.stringify(compactAnalytics)}`,
        maxTokens: GROQ_MAX_TOKENS,
        temperature: 0.2,
      });
      if (!aiText) {
        throw new Error('Unable to generate insights.');
      }

      setInsights(aiText);
      setLastGeneratedAt(Date.now());
    } catch (err) {
      setInsightsError(String(err?.message || 'Unable to generate insights right now.'));
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const moodColor = analytics.mood.includes('Healthy')
    ? 'green'
    : analytics.mood.includes('Neutral')
      ? 'yellow'
      : 'red';

  if (!isAdmin) {
    return (
      <MotionBox
        minH="100vh"
        pt={{ base: 24, md: 28 }}
        pb={{ base: 10, md: 16 }}
        px={{ base: 4, sm: 6, lg: 8 }}
        bg="var(--color-bg-primary)"
        bgImage="linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)"
        bgSize="50px 50px"
      >
        <Box maxW="4xl" mx="auto" bg="var(--color-bg-secondary)" border="1px solid rgba(239, 68, 68, 0.4)" borderRadius="14px" p={6}>
          <Text color="var(--color-text-heading)" fontSize="2xl" fontWeight="bold">Community Dashboard</Text>
          <Text color="gray.300" mt={2}>This section is available for admins and organizers only.</Text>
          <Button as={RouterLink} to="/community" mt={5} variant="outline" colorScheme="cyan">
            Back to Discussion
          </Button>
        </Box>
      </MotionBox>
    );
  }

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      minH="100vh"
      pt={{ base: 24, md: 28 }}
      pb={{ base: 10, md: 16 }}
      px={{ base: 4, sm: 6, lg: 8 }}
      bg="var(--color-bg-primary)"
      bgImage="linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)"
      bgSize="50px 50px"
    >
      <Box maxW="7xl" mx="auto">
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} mb={6} gap={3}>
          <Box>
            <Text color="var(--color-text-heading)" fontFamily="heading" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold">
              Community Dashboard
            </Text>
            <Text color="var(--color-text-muted)" mt={2}>Analytics and AI insights for discussion moderation and growth.</Text>
          </Box>
          <HStack spacing={3}>
            <Badge colorScheme={moodColor} px={3} py={1.5} borderRadius="full" fontSize="12px">
              {analytics.mood}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              colorScheme="cyan"
              onClick={() => runSentimentAnalysis()}
              isLoading={isAnalyzingSentiment}
              loadingText="Analyzing"
            >
              Analyze Sentiment
            </Button>
            <Button as={RouterLink} to="/community" size="sm" variant="outline" colorScheme="cyan">
              Back to Discussion
            </Button>
          </HStack>
        </Flex>

        {sentimentError && (
          <Box mb={5} bg="rgba(239, 68, 68, 0.12)" border="1px solid rgba(239, 68, 68, 0.4)" borderRadius="12px" px={4} py={3}>
            <Text color="red.300" fontSize="sm">{sentimentError}</Text>
          </Box>
        )}

        {isAnalyzingSentiment && (
          <Box mb={5} bg="rgba(34, 211, 238, 0.08)" border="1px solid rgba(34, 211, 238, 0.35)" borderRadius="12px" px={4} py={3}>
            <Text color="cyan.200" fontSize="sm">
              Running AI sentiment analysis: {analyzedItems}/{totalItems || analyzedItems} items classified.
            </Text>
          </Box>
        )}

        {error && (
          <Box mb={5} bg="rgba(239, 68, 68, 0.12)" border="1px solid rgba(239, 68, 68, 0.4)" borderRadius="12px" px={4} py={3}>
            <Text color="red.300" fontSize="sm">{error}</Text>
          </Box>
        )}

        {loading ? (
          <Flex justify="center" py={14}>
            <Spinner size="lg" color="brand.500" thickness="3px" />
          </Flex>
        ) : (
          <VStack align="stretch" spacing={6}>
            <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', xl: 'repeat(5, 1fr)' }} gap={4}>
              {statCards.map((card) => (
                <GridItem key={card.label}>
                  <Box bg="var(--color-bg-secondary)" border="1px solid rgba(34, 211, 238, 0.2)" borderRadius="14px" p={4}>
                    <Text color="var(--color-text-muted)" fontSize="xs" textTransform="uppercase" letterSpacing="0.05em">{card.label}</Text>
                    <Text color="var(--color-text-heading)" fontSize="2xl" mt={1} fontWeight="bold">{card.value}</Text>
                  </Box>
                </GridItem>
              ))}
            </Grid>

            <Grid templateColumns={{ base: '1fr', xl: 'repeat(2, 1fr)' }} gap={4}>
              <Box bg="var(--color-bg-secondary)" border="1px solid rgba(34, 211, 238, 0.2)" borderRadius="14px" p={4}>
                <Text color="var(--color-text-heading)" fontWeight="semibold" mb={3}>Sentiment Analysis</Text>
                <Box h="280px">
                  <Pie
                    data={sentimentData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: { color: '#cbd5e1' },
                        },
                      },
                    }}
                  />
                </Box>
                {lastSentimentRunAt > 0 && (
                  <Text color="gray.500" fontSize="xs" mt={2}>
                    Sentiment updated: {new Date(lastSentimentRunAt).toLocaleString()}
                  </Text>
                )}
              </Box>

              <Box bg="var(--color-bg-secondary)" border="1px solid rgba(34, 211, 238, 0.2)" borderRadius="14px" p={4}>
                <Text color="var(--color-text-heading)" fontWeight="semibold" mb={3}>Trending Topics</Text>
                <Box h="280px">
                  <Bar
                    data={trendingData}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } },
                        y: { ticks: { color: '#94a3b8', precision: 0 }, grid: { color: 'rgba(148, 163, 184, 0.1)' } },
                      },
                      plugins: {
                        legend: { display: false },
                      },
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            <Grid templateColumns={{ base: '1fr', xl: '1fr 1.1fr' }} gap={4}>
              <Box bg="var(--color-bg-secondary)" border="1px solid rgba(34, 211, 238, 0.2)" borderRadius="14px" p={4}>
                <Text color="var(--color-text-heading)" fontWeight="semibold" mb={3}>Solved vs Unsolved Posts</Text>
                <Box h="280px">
                  <Doughnut
                    data={solvedData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: { color: '#cbd5e1' },
                        },
                      },
                    }}
                  />
                </Box>
              </Box>

              <Box bg="var(--color-bg-secondary)" border="1px solid rgba(34, 211, 238, 0.2)" borderRadius="14px" p={4}>
                <HStack justify="space-between" align="start" mb={3}>
                  <Box>
                    <Text color="var(--color-text-heading)" fontWeight="semibold">AI Insights Panel</Text>
                    <Text color="var(--color-text-muted)" fontSize="sm">GROQ-powered moderation and growth insights.</Text>
                  </Box>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={generateAiInsights}
                    isLoading={isGeneratingInsights}
                    loadingText="Generating"
                  >
                    Generate Insights
                  </Button>
                </HStack>

                {insightsError && (
                  <Box bg="rgba(239, 68, 68, 0.12)" border="1px solid rgba(239, 68, 68, 0.4)" borderRadius="10px" px={3} py={2} mb={3}>
                    <Text color="red.300" fontSize="sm">{insightsError}</Text>
                  </Box>
                )}

                {!insights && !insightsError && (
                  <Box bg="rgba(34, 211, 238, 0.08)" border="1px solid rgba(34, 211, 238, 0.3)" borderRadius="10px" px={3} py={2}>
                    <Text color="gray.300" fontSize="sm">
                      Generate insights to get an AI summary of community health, trends, and suggested actions.
                    </Text>
                  </Box>
                )}

                {insights && (
                  <Box bg="var(--color-bg-primary)" border="1px solid rgba(34, 211, 238, 0.2)" borderRadius="10px" p={3} maxH="280px" overflowY="auto">
                    <Text color="gray.200" fontSize="sm" whiteSpace="pre-wrap">{insights}</Text>
                  </Box>
                )}

                {lastGeneratedAt > 0 && (
                  <Text color="gray.500" fontSize="xs" mt={3}>
                    Last updated: {new Date(lastGeneratedAt).toLocaleString()}
                  </Text>
                )}
              </Box>
            </Grid>
          </VStack>
        )}
      </Box>
    </MotionBox>
  );
};

export default CommunityDashboardPage;