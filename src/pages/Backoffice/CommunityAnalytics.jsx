import React, { useEffect, useMemo, useState } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { getComments, getPosts, getUsers } from './communityData';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BEST_ANSWER_KEY = 'discussion_best_answers_v1';

const safeReadObject = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const toMs = (value) => {
  const stamp = new Date(value || 0).getTime();
  return Number.isFinite(stamp) ? stamp : 0;
};

const buildLast7Days = () => {
  const days = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    days.push(d);
  }

  return days;
};

const CommunityAnalytics = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [bestAnswers, setBestAnswers] = useState({});

  const refreshData = () => {
    setPosts(getPosts());
    setComments(getComments());
    setUsers(getUsers());
    setBestAnswers(safeReadObject(BEST_ANSWER_KEY));
  };

  useEffect(() => {
    refreshData();

    const onStorage = () => refreshData();
    window.addEventListener('storage', onStorage);

    const timer = window.setInterval(refreshData, 2000);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.clearInterval(timer);
    };
  }, []);

  const metrics = useMemo(() => {
    const totalPosts = posts.length;
    const totalComments = comments.length;
    const problemPosts = posts.filter((post) => String(post?.type || '') === 'problem').length;
    const communityPosts = Math.max(totalPosts - problemPosts, 0);

    const activeUserIds = new Set();
    users.forEach((user) => {
      const id = String(user?.id || user?._id || '');
      if (id) activeUserIds.add(id);
    });
    posts.forEach((post) => {
      const id = String(post?.authorId || '');
      if (id) activeUserIds.add(id);
    });
    comments.forEach((comment) => {
      const id = String(comment?.authorId || '');
      if (id) activeUserIds.add(id);
    });

    const solvedCount = posts.filter((post) => {
      const id = String(post?._id || '');
      return Boolean(bestAnswers[id] || post?.bestAnswer);
    }).length;

    const solvedPercent = totalPosts > 0 ? Math.round((solvedCount / totalPosts) * 100) : 0;

    const tagCounts = {};
    posts.forEach((post) => {
      const tags = Array.isArray(post?.tags) ? post.tags : [];
      tags.forEach((tag) => {
        const key = String(tag || '').trim().toLowerCase();
        if (!key) return;
        tagCounts[key] = (tagCounts[key] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));

    const avgCommentsPerPost = totalPosts > 0
      ? (totalComments / totalPosts).toFixed(1)
      : '0.0';

    const engagementScore = Math.round((totalComments * 1.5) + (activeUserIds.size * 2) + (solvedCount * 3));

    const contributorMap = {};
    posts.forEach((post) => {
      const id = String(post?.authorId || 'unknown');
      if (!contributorMap[id]) {
        contributorMap[id] = {
          id,
          username: String(post?.authorUsername || 'unknown'),
          posts: 0,
          comments: 0,
        };
      }
      contributorMap[id].posts += 1;
    });
    comments.forEach((comment) => {
      const id = String(comment?.authorId || 'unknown');
      if (!contributorMap[id]) {
        contributorMap[id] = {
          id,
          username: String(comment?.authorUsername || 'unknown'),
          posts: 0,
          comments: 0,
        };
      }
      contributorMap[id].comments += 1;
    });

    const topContributors = Object.values(contributorMap)
      .sort((a, b) => ((b.posts + b.comments) - (a.posts + a.comments)))
      .slice(0, 5);

    const dayBuckets = buildLast7Days().map((date) => ({
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString(undefined, { weekday: 'short' }),
      posts: 0,
      comments: 0,
    }));

    const dayIndex = Object.fromEntries(dayBuckets.map((day, index) => [day.key, index]));

    posts.forEach((post) => {
      const dayKey = new Date(toMs(post?.createdAt)).toISOString().slice(0, 10);
      const idx = dayIndex[dayKey];
      if (idx !== undefined) dayBuckets[idx].posts += 1;
    });

    comments.forEach((comment) => {
      const dayKey = new Date(toMs(comment?.createdAt)).toISOString().slice(0, 10);
      const idx = dayIndex[dayKey];
      if (idx !== undefined) dayBuckets[idx].comments += 1;
    });

    return {
      totalPosts,
      totalComments,
      activeUsers: activeUserIds.size,
      problemPosts,
      communityPosts,
      solvedCount,
      unsolvedCount: Math.max(totalPosts - solvedCount, 0),
      solvedPercent,
      topTags,
      avgCommentsPerPost,
      engagementScore,
      topContributors,
      dayBuckets,
    };
  }, [posts, comments, users, bestAnswers]);

  const solvedChartData = {
    labels: ['Solved', 'Unsolved'],
    datasets: [
      {
        data: [metrics.solvedCount, metrics.unsolvedCount],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(245, 158, 11, 0.8)'],
        borderColor: ['#0f172a', '#0f172a'],
        borderWidth: 2,
      },
    ],
  };

  const tagsChartData = {
    labels: metrics.topTags.map((item) => `#${item.tag}`),
    datasets: [
      {
        label: 'Tag Count',
        data: metrics.topTags.map((item) => item.count),
        backgroundColor: 'rgba(34, 211, 238, 0.65)',
        borderColor: 'rgba(34, 211, 238, 1)',
        borderWidth: 1,
      },
    ],
  };

  const postTypeData = {
    labels: ['Problems', 'Community'],
    datasets: [
      {
        data: [metrics.problemPosts, metrics.communityPosts],
        backgroundColor: ['rgba(249, 115, 22, 0.8)', 'rgba(34, 211, 238, 0.8)'],
        borderColor: ['#0f172a', '#0f172a'],
        borderWidth: 2,
      },
    ],
  };

  const activityTrendData = {
    labels: metrics.dayBuckets.map((item) => item.label),
    datasets: [
      {
        label: 'Posts',
        data: metrics.dayBuckets.map((item) => item.posts),
        backgroundColor: 'rgba(34, 211, 238, 0.65)',
        borderColor: 'rgba(34, 211, 238, 1)',
        borderWidth: 1,
      },
      {
        label: 'Comments',
        data: metrics.dayBuckets.map((item) => item.comments),
        backgroundColor: 'rgba(16, 185, 129, 0.65)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-gray-100 mb-2">Community Analytics</h1>
        <p className="text-gray-400">Global operational view across activity, contributors, and content health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard label="Total Posts" value={metrics.totalPosts} accent="text-cyan-400" />
        <StatCard label="Total Comments" value={metrics.totalComments} accent="text-cyan-400" />
        <StatCard label="Active Users" value={metrics.activeUsers} accent="text-cyan-400" />
        <StatCard label="Solved Posts %" value={`${metrics.solvedPercent}%`} accent="text-green-400" />
        <StatCard label="Avg Comments/Post" value={metrics.avgCommentsPerPost} accent="text-blue-400" />
        <StatCard label="Engagement Score" value={metrics.engagementScore} accent="text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 shadow-custom">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold text-gray-100">Solved vs Unsolved Posts</h3>
          </div>
          <div className="h-[300px]">
            <Pie
              data={solvedChartData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: { color: '#cbd5e1' },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 shadow-custom">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold text-gray-100">Post Type Distribution</h3>
          </div>
          <div className="h-[300px]">
            <Pie
              data={postTypeData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: { color: '#cbd5e1' },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 shadow-custom">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold text-gray-100">Top Tags</h3>
          </div>
          <div className="h-[300px]">
            <Bar
              data={tagsChartData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                  },
                  y: {
                    ticks: { color: '#94a3b8', precision: 0 },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                  },
                },
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 shadow-custom">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold text-gray-100">7-Day Activity Trend</h3>
          </div>
          <div className="h-[300px]">
            <Bar
              data={activityTrendData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                  },
                  y: {
                    ticks: { color: '#94a3b8', precision: 0 },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                  },
                },
                plugins: {
                  legend: {
                    labels: { color: '#cbd5e1' },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 shadow-custom">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold text-gray-100">Top Contributors</h3>
          </div>
          <div className="space-y-3">
            {metrics.topContributors.length === 0 ? (
              <p className="text-sm text-gray-400">No contributor activity yet.</p>
            ) : (
              metrics.topContributors.map((contributor, idx) => (
                <div key={`${contributor.id}-${idx}`} className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg border border-gray-800">
                  <div>
                    <p className="text-sm text-gray-200 font-medium">@{contributor.username}</p>
                    <p className="text-xs text-gray-400">Posts: {contributor.posts} · Comments: {contributor.comments}</p>
                  </div>
                  <span className="text-cyan-400 font-semibold text-sm">{contributor.posts + contributor.comments}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, accent }) => (
  <div className="glass-panel rounded-2xl p-6 shadow-custom">
    <p className="text-gray-400 text-sm mb-2">{label}</p>
    <p className={`font-heading text-3xl font-bold ${accent}`}>{value}</p>
  </div>
);

export default CommunityAnalytics;
