# ⚙️ Configuration avancée

## Environment Variables

Créez un fichier `.env.local` à la racine du projet:

```env
# .env.local
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=AlgoArena Playground
VITE_APP_MODE=development
VITE_ENABLE_LOGGING=true
```

### Utilisation dans le code

```javascript
// playgroundChallengesService.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_BASE = `${API_BASE_URL}/playground/challenges`;
```

---

## Package.json Scripts Avancés

Considérez ajouter ces scripts au `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:playground": "vite -- --open /playground/challenges",
    "build": "vite build",
    "build:analyze": "vite build --analyze",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "start": "npm run dev",
    "start:playground": "npm run dev:playground",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "type-check": "tsc --noEmit"
  }
}
```

### Utilisation

```bash
npm run dev               # Mode dev normal
npm run dev:playground   # Ouvre directement la page playground
npm run start           # Alias pour dev
npm run test            # Exécute les tests
```

---

## Vite Configuration Avancée

File: `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  // Alias pour imports plus courts
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@services': path.resolve(__dirname, './src/services'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
    },
  },
  
  server: {
    // Dev server
    port: 5173,
    open: false,
    
    // Proxy API calls
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },
      '/uploads': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
  
  // Build optimization
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chakra': ['@chakra-ui/react', '@emotion/react'],
        },
      },
    },
  },
})
```

### Utilisation des Alias

Avant:
```javascript
import ChallengeList from '../../components/ChallengeList';
import { getChallenges } from '../../services/playgroundChallengesService';
```

Après:
```javascript
import ChallengeList from '@components/ChallengeList';
import { getChallenges } from '@services/playgroundChallengesService';
```

---

## Environment Configurations par Mode

Créez des fichiers `.env`:

```env
# .env.local (Development)
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_MODE=development
VITE_ENABLE_LOGGING=true

# .env.staging
VITE_API_BASE_URL=https://staging-api.algoarena.com
VITE_APP_MODE=staging
VITE_ENABLE_LOGGING=true

# .env.production
VITE_API_BASE_URL=https://api.algoarena.com
VITE_APP_MODE=production
VITE_ENABLE_LOGGING=false
```

Deployez avec:
```bash
npm run build -- --mode staging
npm run build -- --mode production
```

---

## Chakra UI Theme Personnalisé

File: `src/theme/index.js`

```javascript
import { extendTheme } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

const theme = extendTheme({
  // Colors
  colors: {
    brand: {
      50: '#f0f9ff',
      500: '#0ea5e9',
      900: '#0c4a6e',
    },
    difficulty: {
      easy: '#22c55e',
      medium: '#f97316',
      hard: '#ef4444',
    },
  },

  // Styles globales
  styles: {
    global: (props) => ({
      body: {
        bg: mode('white', 'gray.900')(props),
        color: mode('black', 'white')(props),
      },
    }),
  },

  // Composants personnalisés
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'md',
      },
      variants: {
        'playground': {
          bg: 'brand.500',
          color: 'white',
          _hover: { bg: 'brand.600' },
        },
      },
    },
    Card: {
      baseStyle: {
        borderRadius: 'lg',
        boxShadow: 'md',
      },
    },
  },
})

export default theme
```

Utilisation:
```jsx
<Box bg={mode('white', 'gray.900')} />
<Button variant="playground">Practice</Button>
```

---

## Logging & Debugging

File: `src/utils/logger.js`

```javascript
const isDev = import.meta.env.DEV;
const enableLogging = import.meta.env.VITE_ENABLE_LOGGING === 'true';

export const logger = {
  log: (...args) => {
    if (isDev && enableLogging) console.log('[LOG]', ...args);
  },
  
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },
  
  warn: (...args) => {
    if (isDev && enableLogging) console.warn('[WARN]', ...args);
  },
  
  debug: (label, data) => {
    if (isDev && enableLogging) console.table({ [label]: data });
  },
  
  time: (label) => {
    if (enableLogging) console.time(label);
  },
  
  timeEnd: (label) => {
    if (enableLogging) console.timeEnd(label);
  },
};

export default logger;
```

Utilisation:
```javascript
import logger from '@/utils/logger';

logger.log('Loading challenges...');
logger.debug('Challenge data', challenge);
logger.error('Failed to load');
```

---

## API Error Handling

File: `src/services/errorHandler.js`

```javascript
export class APIError extends Error {
  constructor(status, message, details = {}) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const handleAPIError = (error) => {
  if (error instanceof APIError) {
    switch (error.status) {
      case 400:
        return 'Invalid request';
      case 404:
        return 'Resource not found';
      case 500:
        return 'Server error. Try again later.';
      default:
        return error.message;
    }
  }
  
  if (error instanceof TypeError) {
    return 'Network error. Check your connection.';
  }
  
  return 'An unexpected error occurred';
};

export default { APIError, handleAPIError };
```

Utilisation:
```javascript
try {
  await getChallenges();
} catch (err) {
  const userMessage = handleAPIError(err);
  setError(userMessage);  // Affiche à l'utilisateur
}
```

---

## Cache Management

File: `src/utils/cache.js`

```javascript
class Cache {
  constructor(ttl = 5 * 60 * 1000) { // 5 min default
    this.store = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.store.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.store.get(key);
    
    if (!item) return null;
    
    // Vérifier expiration
    if (Date.now() - item.timestamp > this.ttl) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.store.clear();
  }

  has(key) {
    return this.get(key) !== null;
  }
}

// Instance globale
export const apiCache = new Cache(5 * 60 * 1000); // 5 min

// Utilisation
export const getChallengesWithCache = async () => {
  const cached = apiCache.get('challenges');
  if (cached) return cached;
  
  const data = await playgroundChallengesService.getChallenges();
  apiCache.set('challenges', data);
  return data;
};
```

---

## Performance Monitoring

File: `src/utils/performanceMonitor.js`

```javascript
export const monitorPerformance = (label) => {
  return async (fn) => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    console.log(`⏱️  ${label}: ${duration.toFixed(2)}ms`);
    return result;
  };
};

// Utilisation
const data = await monitorPerformance('Fetch Challenges')(
  () => playgroundChallengesService.getChallenges()
);
```

---

## Stale-While-Revalidate Pattern

File: `src/hooks/useSWR.js`

```javascript
import { useState, useEffect } from 'react';

export function useSWR(key, fetcher, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { 
    dedupingInterval = 2000,  // Ne re-fetch pas si < 2s
    focusThrottleInterval = 5000,
    revalidateOnFocus = true,
  } = options;

  let lastFetchTime = 0;

  const fetchData = async () => {
    const now = Date.now();
    if (now - lastFetchTime < dedupingInterval) return;

    lastFetchTime = now;
    try {
      const result = await fetcher(key);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (revalidateOnFocus) {
      window.addEventListener('focus', fetchData);
      return () => window.removeEventListener('focus', fetchData);
    }
  }, [key]);

  return { data, loading, error, mutate: fetchData };
}

// Utilisation
const { data: challenges } = useSWR('challenges', 
  () => playgroundChallengesService.getChallenges()
);
```

---

## Deployment Checklist

Avant de déployer, vérifiez:

- [ ] Les variables d'environnement sont configurées
- [ ] `npm run build` s'exécute sans erreurs
- [ ] Les logs console.log sont supprimés en prod
- [ ] CORS est configuré sur le backend
- [ ] L'API URL pointe vers le bon domaine
- [ ] SSL/HTTPS est activé
- [ ] Les images sont optimisées
- [ ] Le cache est bien géré
- [ ] Les erreurs sont loguées (Sentry, etc.)

---

## Production Optimization

```javascript
// vite.config.js - Production optimization
export default defineConfig({
  build: {
    // Code splitting par route
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'ui': ['@chakra-ui/react'],
          'challenges': [
            './src/pages/Frontoffice/PlaygroundChallengesPage'
          ],
        },
      },
    },
    
    // Compression
    chunkSizeWarningLimit: 1000,
    
    // Sourcemaps (production)
    sourcemap: false,
    minify: 'terser',
  },
})
```

---

**Configuration robuste et prête pour production ! 🚀**
