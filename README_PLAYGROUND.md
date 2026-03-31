# 🎮 AlgoArena Playground - Frontend Complete

> **Frontend React complet pour consommer l'API NestJS `/playground/challenges`**

[![React](https://img.shields.io/badge/React-19.2+-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-latest-646CFF?logo=vite)](https://vitejs.dev)
[![Chakra UI](https://img.shields.io/badge/Chakra%20UI-2.8+-319795?logo=chakraui)](https://chakra-ui.com)

## 📚 Documentation Rapide

| Besoin | Document |
|--------|----------|
| 🚀 **Démarrer en 30 secondes** | [QUICK_START.md](QUICK_START.md) |
| 📖 **Installation complète** | [PLAYGROUND_SETUP.md](PLAYGROUND_SETUP.md) |
| ❓ **Questions fréquentes** | [PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md) |
| 🧪 **Tests API** | [API_TEST_EXAMPLES.md](API_TEST_EXAMPLES.md) |
| 🏗️ **Architecture & composants** | [ARCHITECTURE.md](ARCHITECTURE.md) |

---

## 🎯 Ce que vous pouvez faire

### ✨ Fonctionnalités principales

```
🎮 Playground Challenges
├── 📋 Liste des challenges avec:
│   ├── 🔍 Recherche en temps réel (titre + tags)
│   ├── 🎯 Filtrage par difficulté (Easy/Medium/Hard)
│   ├── 📄 Pagination (6 items/page)
│   └── 🎲 Bouton "Challenge Aléatoire"
│
├── 📝 Détail d'un challenge avec:
│   ├── 📋 Description complète
│   ├── 🏷️ Tags associés
│   ├── 📊 Exemples d'entrée/sortie
│   └── ◀️ Bouton retour
│
└── 🎲 Challenge aléatoire
    └── Charge immédiatement un challenge random
```

---

## 🚀 Lancement rapide

### 1️⃣ Installation

```bash
cd Esprit-PI-4twin4-2026-AlgoArena-FrontEnd
npm install
```

### 2️⃣ Démarrer

```bash
# Option 1: Script automatique
bash start.sh        # Mac/Linux
start.bat           # Windows

# Option 2: Commande manuelle
npm run dev
```

### 3️⃣ Accéder

Ouvrez dans votre navigateur:
```
http://localhost:5173/playground/challenges
```

### ⚠️ N'oubliez pas !

Le backend NestJS doit tournée sur le port 3000:
```bash
# Terminal séparé, dans le dossier backend
npm start
```

---

## 📋 Structure du projet

```
Esprit-PI-4twin4-2026-AlgoArena-FrontEnd/
├── 📄 Documentation
│   ├── QUICK_START.md              ← Démarrage 30s ⭐ START HERE
│   ├── PLAYGROUND_SETUP.md         ← Guide installation complet
│   ├── PLAYGROUND_FAQ.md           ← FAQ & troubleshooting
│   ├── API_TEST_EXAMPLES.md        ← Test examples
│   └── ARCHITECTURE.md             ← Architecture détaillée
│
├── 🔧 Scripts
│   ├── start.sh                    ← Auto-starter (Mac/Linux)
│   └── start.bat                   ← Auto-starter (Windows)
│
├── 📁 Source Code
│   └── src/
│       ├── pages/Frontoffice/
│       │   └── PlaygroundChallengesPage.jsx    ⭐ Main page
│       ├── services/
│       │   └── playgroundChallengesService.js   ⭐ API service
│       ├── editor/hooks/
│       │   └── usePlaygroundChallenges.js       ⭐ Custom hook
│       └── utils/
│           └── apiTestUtils.js                  ⭐ Test utils
│
├── ⚙️ Config
│   ├── vite.config.js              ← Vite + Proxy
│   ├── package.json                ← Dependencies
│   └── tailwind.config.js           ← Styling
│
└── 📦 Dependencies
    ├── React 19.2
    ├── Chakra UI 2.8
    ├── Vite (Dev Server)
    └── [+ autres packages]
```

---

## 🔌 Endpoints consommés

L'app consomme 3 endpoints de votre backend NestJS:

| Endpoint | Méthode | Description | Implémentation |
|----------|---------|-------------|-----------------|
| `/playground/challenges` | GET | Liste de tous les challenges | ✅ Pages.ChallengeList |
| `/playground/challenges/:id` | GET | Détail d'un challenge | ✅ Pages.ChallengeDetail |
| `/playground/challenges/random` | GET | Challenge aléatoire | ✅ Button.Random |

### Flux de requête

```
Frontend (React)
    ↓
playgroundChallengesService.getChallenges()
    ↓
fetch('/api/playground/challenges')
    ↓
[Vite Proxy] http://127.0.0.1:3000/playground/challenges
    ↓
Backend NestJS
    ↓
MongoDB Database
```

---

## 📊 Format de données attendu

Votre API doit retourner un `Challenge` avec cette structure:

```typescript
interface Challenge {
  _id: string;                      // Pour MongoDB, peut aussi être 'id'
  title: string;                    // Ex: "Two Sum"
  description: string;              // Description complète
  difficulty: "Easy" | "Medium" | "Hard";
  tags?: string[];                  // Ex: ["array", "two-pointers"]
  examples?: Array<{
    input: string;                  // Ex: "[2,7,11,15], target=9"
    output: string;                 // Ex: "[0,1]"
    explanation?: string;           // Optionnel
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Exemple complet

```json
{
  "_id": "607f1f77bcf86cd799439011",
  "title": "Two Sum",
  "description": "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.",
  "difficulty": "Easy",
  "tags": ["array", "two-pointers", "hash-table"],
  "examples": [
    {
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0,1]",
      "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
    },
    {
      "input": "nums = [3,2,4], target = 6",
      "output": "[1,2]",
      "explanation": "nums[1] + nums[2] == 6; return [1, 2]"
    }
  ]
}
```

---

## 🎯 Features implémentées

### ✅ Affichage

- [x] Grille responsive (1 col mobile, 2 col tablet, 3 col desktop)
- [x] Cards avec hover effect
- [x] Dark mode support
- [x] Badges de difficulté (couleur-codés)
- [x] Tags affichage

### ✅ Interaction

- [x] Sélectionner un challenge pour voir le détail
- [x] Bouton "Back" pour revenir à la liste
- [x] Bouton "Random Challenge"
- [x] Pagination (6 items par page)
- [x] Pagination buttons (Prev/Next)

### ✅ Filtrage

- [x] Recherche par titre
- [x] Recherche par tags
- [x] Filtrer par difficulté

### ✅ Gestion d'état

- [x] Loading spinner pendant le fetch
- [x] Error handling & affichage d'erreur
- [x] Retry logic (futur: ✨)

### ✅ Styling

- [x] Chakra UI theme
- [x] Responsive design
- [x] Dark/Light mode
- [x] Smooth transitions

---

## 🛠️ Stack Technique

### Frontend
- **React 19.2** - UI library
- **Vite** - Build tool & dev server
- **Chakra UI 2.8** - Component library
- **Emotion** - CSS-in-JS
- **React Router** - Routing

### Backend (consommé)
- **NestJS** - REST API
- **MongoDB** - Database
- **Node.js** - Runtime

### Dev Tools
- **ESLint** - Code linting
- **Tailwind CSS** - Alternative styling
- **Mock data capabilities** - For testing

---

## 🧪 Testing

### Browser Console

Ouvrez la console (F12) et testez:

```javascript
// Import the test utility
import { testPlaygroundAPI } from './src/utils/apiTestUtils.js';

// Run all tests
testPlaygroundAPI();
```

Ou testez les endpoints individuellement:

```javascript
// Get all challenges
fetch('/api/playground/challenges').then(r => r.json()).then(console.log);

// Get specific challenge
fetch('/api/playground/challenges/607f1f77bcf86cd799439011')
  .then(r => r.json())
  .then(console.log);

// Get random
fetch('/api/playground/challenges/random')
  .then(r => r.json())
  .then(console.log);
```

### cURL / Postman

```bash
# List all
curl http://localhost:3000/playground/challenges

# Get one
curl http://localhost:3000/playground/challenges/607f1f77bcf86cd799439011

# Random
curl http://localhost:3000/playground/challenges/random
```

Voir [API_TEST_EXAMPLES.md](API_TEST_EXAMPLES.md) pour plus de détails.

---

## ❌ Troubleshooting

### Erreur: "API not accessible"

```bash
# 1. Vérifiez le backend
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Mac/Linux

# 2. Lancez le backend
cd [backend-folder]
npm start

# 3. Vérifiez le proxy dans vite.config.js
```

### Erreur CORS

- En développement: Le proxy Vite gère ça → Vérifiez `vite.config.js`
- En production: Activez CORS dans NestJS backend

### Port déjà utilisé

```bash
npm run dev -- --port 5174
```

Voir [PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md) pour plus d'erreurs courantes.

---

## 📖 Guides complets

### Pour commencer
1. **[QUICK_START.md](QUICK_START.md)** - 30 secondes pour lancer l'app ⭐ COMMENCEZ ICI
2. **[PLAYGROUND_SETUP.md](PLAYGROUND_SETUP.md)** - Installation détaillée + troubleshooting

### Pour développer
1. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Structure complète & composants
2. **[API_TEST_EXAMPLES.md](API_TEST_EXAMPLES.md)** - Tests & validation

### Pour déboguer
1. **[PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md)** - Questions fréquentes
2. Browser DevTools (F12) - Console & Network tabs

---

## 🚀 Déploiement

### Production Build

```bash
npm run build        # Génère dist/
npm run preview      # Test localement
```

### Hébergement

#### Vercel
```bash
vercel login
vercel
```

#### Netlify
```bash
npm run build
# Drag-drop dist/ sur Netlify Drop
# Ou connectez votre repo GitHub
```

#### Manual Host
```bash
# Upload dist/ à votre serveur
# Configurez le serveur pour diriger les requêtes vers index.html (SPA)
```

---

## 💡 Idées pour le futur

- [ ] Code editor intégré (Monaco)
- [ ] Exécution de code (JDoodles API)
- [ ] Favoris sauvegardés
- [ ] Stats utilisateur
- [ ] Historique
- [ ] Recommandations basées sur niveau
- [ ] Leaderboard
- [ ] Système de points

---

## 📞 Support

### Checklist de troubleshooting

- ✅ Node.js >= 18 installé?
- ✅ Backend sur port 3000?
- ✅ `npm install` exécuté?
- ✅ `npm run dev` lancé?
- ✅ Navigateur sur `http://localhost:5173`?

### En cas de problème

1. Vérifiez [PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md)
2. Ouvrez la console du navigateur (F12)
3. Testez l'API directement ([API_TEST_EXAMPLES.md](API_TEST_EXAMPLES.md))
4. Vérifiez les logs du backend

---

## 📝 Licence

Ce projet fait partie du curriculum **AlgoArena** (2026).

---

## 🎉 Ready?

```bash
bash start.sh              # Mac/Linux
# ou
start.bat                  # Windows
```

Naviguez vers **http://localhost:5173/playground/challenges** et commencez!

**Bonne pratique! 💪**

---

<div align="center">

Made with ❤️ for AlgoArena

[🚀 Quick Start](QUICK_START.md) • [📖 Setup](PLAYGROUND_SETUP.md) • [❓ FAQ](PLAYGROUND_FAQ.md) • [🧪 Tests](API_TEST_EXAMPLES.md) • [🏗️ Architecture](ARCHITECTURE.md)

</div>
