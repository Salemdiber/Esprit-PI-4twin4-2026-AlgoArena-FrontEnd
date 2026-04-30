const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

process.on('uncaughtException', (error) => {
  console.error(error);
});

const root = path.join(process.cwd(), 'dist');
const user = {
  userId: 'adam',
  _id: 'adam',
  id: 'adam',
  username: 'adam',
  email: 'adam@example.com',
  role: 'Player',
  speedChallengeCompleted: true,
  hintCredits: 1,
  rank: 'BRONZE',
  xp: 500,
  totalXP: 500,
};

const communityPosts = [
  {
    _id: 'community-1',
    title: 'How do you reason about sliding window edge cases?',
    content: 'I keep missing the shrinking condition when duplicate values enter the window. What checklist do you use before submitting?',
    type: 'discussion',
    tags: ['arrays', 'patterns'],
    authorId: 'adam',
    authorUsername: 'adam',
    authorAvatar: '',
    comments: [],
    pinned: true,
    solved: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    _id: 'community-2',
    title: 'Binary search answer space for capacity planning',
    content: 'This thread collects examples where the value is not in the array but still searchable with a monotonic predicate.',
    type: 'problem',
    problemType: 'algorithm',
    tags: ['binary-search', 'greedy'],
    authorId: 'mentor',
    authorUsername: 'mentor',
    authorAvatar: '',
    comments: [{ _id: 'comment-1', content: 'Start by proving the predicate is monotonic.', children: [] }],
    pinned: false,
    solved: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    _id: 'community-3',
    title: 'Share your favorite dynamic programming state names',
    content: 'Clear state naming makes recurrence reviews much faster. Drop examples that helped you explain a solution.',
    type: 'discussion',
    tags: ['dp', 'learning'],
    authorId: 'sam',
    authorUsername: 'sam',
    authorAvatar: '',
    comments: [],
    pinned: false,
    solved: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
];

const sendJson = (res, data) => {
  res.writeHead(200, {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  });
  res.end(JSON.stringify(data));
};

const sendFile = (req, res, file) => {
  const ext = path.extname(file).toLowerCase();
  const types = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.webmanifest': 'application/manifest+json',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
  };

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('not found');
      return;
    }

    let body = data;
    if (ext === '.html') {
      const bootstrap = `<script>
localStorage.setItem('fo_auth', ${JSON.stringify(JSON.stringify({ user }))});
localStorage.setItem('chakra-ui-color-mode', 'dark');
localStorage.setItem('algoarena-theme-preference', 'dark');
document.cookie = 'access_token=lighthouse-token; path=/; max-age=900; SameSite=Lax';
</script>`;
      body = Buffer.from(String(data).replace('<script type="module"', `${bootstrap}<script type="module"`));
    }

    const headers = {
      'content-type': types[ext] || 'application/octet-stream',
      'cache-control': ext === '.html' ? 'no-store' : 'public, max-age=31536000, immutable',
    };

    const canGzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '')
      && ['.html', '.js', '.css', '.json', '.webmanifest', '.svg'].includes(ext);

    if (canGzip) {
      zlib.gzip(body, (gzipErr, compressed) => {
        if (gzipErr) {
          res.writeHead(200, headers);
          res.end(body);
          return;
        }
        res.writeHead(200, { ...headers, 'content-encoding': 'gzip', vary: 'Accept-Encoding' });
        res.end(compressed);
      });
      return;
    }

    res.writeHead(200, headers);
    res.end(body);
  });
};

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:4180');
  const p = url.pathname;

  if (p === '/api/user/me') return sendJson(res, user);
  if (p === '/api/user/me/rank-stats') {
    return sendJson(res, {
      rank: 'BRONZE',
      rankDetails: { title: 'Bronze Coder' },
      nextRank: { name: 'SILVER', title: 'Silver Coder', xpRequired: 1000 },
      totalXP: 500,
      xp: 500,
      nextRankXp: 1000,
      progressPercentage: 50,
      progressPercent: 50,
      streak: 7,
      isMaxRank: false,
    });
  }
  if (p === '/api/user/me/streak') {
    return sendJson(res, {
      currentStreak: 7,
      longestStreak: 12,
      streakMessage: 'Seven-day practice streak.',
      recentActivity: [true, true, true, true, true, true, true],
    });
  }
  if (p === '/api/judge/progress') return sendJson(res, { progress: [] });
  if (p === '/api/settings' || p === '/settings') {
    return sendJson(res, { aiBattles: true, maintenanceMode: false, disableSpeedChallenges: true });
  }
  if (p === '/api/challenges' || p === '/challenges') {
    return sendJson(res, {
      challenges: [{
        _id: 'challenge-1',
        title: 'Two Sum Sprint',
        difficulty: 'EASY',
        tags: ['arrays'],
        description: 'Find two numbers that add to target.',
        examples: [{ input: '[2,7,11,15], 9', output: '[0,1]' }],
        constraints: [],
        hints: [],
        xpReward: 50,
        status: 'published',
      }],
    });
  }
  if (p === '/api/battles') {
    return sendJson(res, {
      battles: [{
        _id: 'battle-1',
        userId: 'adam',
        roundNumber: 3,
        battleStatus: 'PENDING',
        challengeId: 'challenge-1',
        battleType: '1VS1',
        createdAt: new Date().toISOString(),
      }],
    });
  }
  if (p === '/api/posts') return sendJson(res, communityPosts);
  if (p === '/api/comments') {
    return sendJson(res, communityPosts.flatMap((post) => post.comments || []));
  }

  let file = path.join(root, decodeURIComponent(p));
  if (p === '/' || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(root, 'index.html');
  }
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }
  sendFile(req, res, file);
}).listen(4180, '127.0.0.1', () => {
  console.log('lighthouse auth server on 4180');
});
