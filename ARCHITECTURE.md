# 🏗️ AlgoArena Playground - Architecture & Components

## 📋 Table des matières
- [Vue d'ensemble](#vue-densemble)
- [Structure des fichiers](#structure-des-fichiers)
- [Composants](#composants)
- [Services](#services)
- [Hooks](#hooks)
- [Flow de données](#flow-de-données)
- [Pages](#pages)
- [Configuration](#configuration)

---

## 🎯 Vue d'ensemble

### Ce que présentons

```
┌─────────────────────────────────────────────┐
│      AlgoArena Playground Frontend          │
├─────────────────────────────────────────────┤
│  Port: http://localhost:5173                │
│  Route: /playground/challenges              │
└─────────────────────────────────────────────┘
              ↓ (Vite Proxy)
┌─────────────────────────────────────────────┐
│    NestJS Backend API (Port 3000)           │
├─────────────────────────────────────────────┤
│  GET /playground/challenges                 │
│  GET /playground/challenges/:id             │
│  GET /playground/challenges/random          │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│         Database (MongoDB)                  │
├─────────────────────────────────────────────┤
│  Collections.challenges                     │
└─────────────────────────────────────────────┘
```

---

## 📁 Structure des fichiers

### Nouvelle structure après améliorations

```
src/
├── pages/Frontoffice/
│   └── PlaygroundChallengesPage.jsx      ⭐ Main Page (EXISTANT)
│       ├── <ChallengeList>               Component pour liste
│       └── <ChallengeDetail>             Component pour détail
│
├── services/
│   ├── playgroundChallengesService.js    ⭐ API Service (AMÉLIORÉ)
│   │   ├── getChallenges()               Récupère liste
│   │   ├── getChallenge(id)              Récupère détail
│   │   └── getRandomChallenge()          Récupère aléatoire
│   └── [autres services...]
│
├── editor/hooks/
│   ├── useEditorState.js                 Hook existant
│   └── usePlaygroundChallenges.js        ⭐ NOUVEAU Hook
│       ├── challenges & loading state
│       ├── fetchChallenge()
│       ├── fetchRandomChallenge()
│       └── stats
│
├── utils/
│   └── apiTestUtils.js                   ⭐ NOUVEAU Test Utils
│       ├── testAPIHealth()
│       ├── testGetChallenges()
│       ├── testGetChallenge()
│       ├── testRandomChallenge()
│       └── testPlaygroundAPI()           Main function
│
└── [autres fichiers...]

📄 Fichiers de documentation (ROOT):
├── QUICK_START.md                        ⭐ NOUVEAU - Quick Start (30s)
├── PLAYGROUND_SETUP.md                   ⭐ NOUVEAU - Installation complète
├── PLAYGROUND_FAQ.md                     ⭐ NOUVEAU - FAQ
├── API_TEST_EXAMPLES.md                  ⭐ NOUVEAU - Tests
│
🔧 Scripts (ROOT):
├── start.sh                              ⭐ NOUVEAU - Start script (Mac/Linux)
└── start.bat                             ⭐ NOUVEAU - Start script (Windows)

📄 Configuration (EXISTANT):
├── vite.config.js                        ✅ Proxy configured
├── package.json                          ✅ Dependencies
├── index.html                            ✅ Entry point
└── tailwind.config.js                    ✅ Styling
```

---

## ⚙️ Composants

### PlaygroundChallengesPage.jsx

**Composant parent** qui gère l'état global et la navigation

```jsx
┌──────────────────────────────────────┐
│  PlaygroundChallengesPage            │
├──────────────────────────────────────┤
│  State:                              │
│  • challenges (array)                │
│  • selectedChallenge (object | null) │
│  • loading (boolean)                 │
│  • error (string)                    │
│                                      │
│  Handlers:                           │
│  • handleSelect(id)                  │
│  • handleRandom()                    │
│  • handleBack()                      │
└──────────────────────────────────────┘
        ↙                ↖
   No selection      Selected
        ↓                ↓
┌──────────────────  ──────────────────┐
│  <ChallengeList>  │ <ChallengeDetail>│
└──────────────────  ──────────────────┘
```

### ChallengeList

**Compose:**
- Recherche par titre/tags
- Filtrage par difficulté
- Pagination (6 items par page)
- Grid d'affichage
- Bouton "Random Challenge"

**Props:**
```javascript
{
  onSelect: (id) => void,       // Clique sur card
  onRandom: () => void,         // Bouton aléatoire
  loading: boolean,             // État chargement
  error: string,                // Message d'erreur
  challenges: Challenge[]       // Liste challenges
}
```

### ChallengeDetail

**Affiche:**
- Titre + Difficulté (Badge)
- Tags
- Description (avec formatage)
- Exemples détaillés
- Bouton "Back"

**Props:**
```javascript
{
  challenge: Challenge | null,  // Challenge sélectionné
  onBack: () => void           // Retour à la liste
}
```

---

## 🔌 Services

### playgroundChallengesService.js

Centralise les appels API et gère les erreurs.

```javascript
// Export functions:
export async function getChallenges()      // → GET /api/playground/challenges
export async function getChallenge(id)     // → GET /api/playground/challenges/:id
export async function getRandomChallenge() // → GET /api/playground/challenges/random
```

**Features:**
- ✅ Logging console (développement)
- ✅ Gestion d'erreur
- ✅ Typage JSDoc
- ✅ Validation des paramètres
- ✅ Return type normalisée

### API URLs

| Frontend | Via Proxy | Backend |
|----------|-----------|---------|
| `/api/playground/challenges` | → | `http://localhost:3000/playground/challenges` |
| `/api/playground/challenges/:id` | → | `http://localhost:3000/playground/challenges/:id` |
| `/api/playground/challenges/random` | → | `http://localhost:3000/playground/challenges/random` |

---

## 🪝 Hooks

### usePlaygroundChallenges() ⭐ NOUVEAU

Hook personnalisé pour gérer la logique Playground

```javascript
const {
  challenges,                // Array de challenges
  loading,                   // Boolean
  error,                     // Error string | null
  retryCount,               // Number
  retry,                    // () => void - Retry logic
  fetchChallenge,           // (id) => Promise<Challenge>
  fetchRandomChallenge,     // () => Promise<Challenge>
  stats                     // { total, byDifficulty }
} = usePlaygroundChallenges();
```

**Utilisation simplifiée:**
```jsx
function MyComponent() {
  const { challenges, loading, error } = usePlaygroundChallenges();
  
  if (loading) return <Spinner />;
  if (error) return <Alert status="error">{error}</Alert>;
  
  return challenges.map(ch => <ChallengeCard key={ch._id} {...ch} />);
}
```

---

## 🔄 Flow de données

### 1. Initial Load

```
Page Mount
    ↓
useEffect(() => fetchChallenges())
    ↓
playgroundChallengesService.getChallenges()
    ↓
fetch('/api/playground/challenges')
    ↓
[Vite Proxy] → http://localhost:3000/playground/challenges
    ↓
Backend returns array of Challenges
    ↓
setChallenges(data)
    ↓
<ChallengeList challenges={challenges} />
    ↓
Render Grid with pagination
```

### 2. Selection Flow

```
User clicks Challenge Card
    ↓
onSelect(challengeId)
    ↓
handleSelect(id)
    ↓
playgroundChallengesService.getChallenge(id)
    ↓
fetch('/api/playground/challenges/:id')
    ↓
Backend returns Challenge object
    ↓
setSelectedChallenge(data)
    ↓
Switch view to <ChallengeDetail>
```

### 3. Random Challenge Flow

```
User clicks "Practice Random Challenge"
    ↓
onRandom()
    ↓
handleRandom()
    ↓
playgroundChallengesService.getRandomChallenge()
    ↓
fetch('/api/playground/challenges/random')
    ↓
Backend returns random Challenge
    ↓
setSelectedChallenge(data), setSelectedId(id)
    ↓
Display detail view
```

---

## 📄 Pages

### PlaygroundChallengesPage

**Route:** `/playground/challenges`

**Features:**
- 📋 Liste paginée & filtrée
- 🔍 Recherche en temps réel
- 🎯 Filtrage par difficulté
- 📤 Vue détail responsive
- 🎲 Challenge aléatoire

**Entry Point:**
```javascript
// src/App.jsx
<Route path="/playground/challenges" 
  element={<PlaygroundChallengesPage />} 
/>
```

---

## ⚙️ Configuration

### vite.config.js (Proxy Setup)

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',    // Backend URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    }
  }
})
```

### Chakra UI Configuration

```javascript
// src/main.jsx
import { ChakraProvider } from '@chakra-ui/react'
export default function App() {
  return (
    <ChakraProvider>
      <YourApp />
    </ChakraProvider>
  )
}
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

---

## 🎨 Styling

### Utilisé:
- **Chakra UI** - Composants & Layout
- **Emotion** - CSS-in-JS
- **Framer Motion** - Animations

### Couleurs par Difficulté:
```javascript
Easy:   colorScheme="green"    // 🟢
Medium: colorScheme="orange"   // 🟠
Hard:   colorScheme="red"      // 🔴
```

---

## 📊 Structure de données

### Challenge Object

```typescript
interface Challenge {
  _id: string;                          // MongoDB ID
  title: string;                        // "Two Sum"
  description: string;                  // Full description
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];                       // ["array", "two-pointers"]
  examples: Example[];                  // Solutions examples
  createdAt?: string;                   // ISO date
  updatedAt?: string;                   // ISO date
}

interface Example {
  input: string;                        // "nums = [2,7,11,15], target = 9"
  output: string;                       // "[0,1]"
  explanation?: string;                 // Why this works
}
```

---

## 🚀 Démarrage

### Development

```bash
npm run dev                    # Start Vite on :5173
# Navigate to: http://localhost:5173/playground/challenges
```

### Production

```bash
npm run build                  # Build to dist/
npm run preview               # Test build locally
# Deploy dist/ folder
```

### Scripts

```bash
bash start.sh                 # Mac/Linux auto-starter
start.bat                     # Windows auto-starter
```

---

## 🔍 Testing

### Browser Console

```javascript
// Charger et lancer les tests
import { testPlaygroundAPI } from './src/utils/apiTestUtils.js';
testPlaygroundAPI();
```

### Manual Testing

```bash
# cURL
curl http://localhost:3000/playground/challenges

# Postman
Import AlgoArena-Playground.postman_collection.json
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `QUICK_START.md` | 30s launch guide |
| `PLAYGROUND_SETUP.md` | Complete setup (troubleshooting included) |
| `PLAYGROUND_FAQ.md` | Common errors & fixes |
| `API_TEST_EXAMPLES.md` | Test examples (cURL, Postman, Browser) |

---

## ✨ Prochaines améliorations

1. **Code Editor** - Exécuter du code directement
2. **User Stats** - Challenges résolus par utilisateur
3. **Favoris** - Sauvegarder challenges favoris
4. **Suggestions** - Recommandations basées sur niveau
5. **Historique** - Tracer les challenges tentés

---

**Architecture prête pour production ! 🚀**
