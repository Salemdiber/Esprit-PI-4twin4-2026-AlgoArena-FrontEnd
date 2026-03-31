# 🎮 Playground Arena - Guide Complet

> **Éditeur de code complet + Tests en direct + Leaderboard en temps réel**

---

## 📋 Vue d'ensemble

Le **Playground Arena** est une interface complète et intégrée permettant aux utilisateurs de:

✅ **Écrire du code** dans un éditeur Monaco avec support multi-langues
✅ **Exécuter des tests** en temps réel contre les cas de test
✅ **Voir les résultats** avec détails de performance
✅ **Soumettre du code** pour la compétition
✅ **Suivre les leaders** en direct avec le leaderboard en temps réel

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│         ChallengeArenaPlayground Component           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │  Problem     │  │  Code Editor │  │ Results  │ │
│  │  Description │  │              │  │ & Leader │ │
│  │  (Left)      │  │  (Center)    │  │ (Right)  │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
         │                │                 │
         ├─ playgroundChallengesService
         ├─ codeExecutionService
         ├─ leaderboardService
         └─ useCodeExecution Hook
```

### Services

#### 1. **codeExecutionService.js**
Gère l'exécution du code et les résultats des tests.

```javascript
// Exécuter le code (test rapide)
await codeExecutionService.runCode(code, language, challengeId, testCases);

// Soumettre le code (full evaluation)
await codeExecutionService.submitCode(code, language, challengeId, testCases);
```

**Fonctionnalités:**
- Exécution contre les cas de test
- Fallback avec résultats simulés
- Validation de syntaxe
- Statistiques de performance

#### 2. **leaderboardService.js**
Gère les données du leaderboard et les classements en direct.

```javascript
// Leaderboard global
await leaderboardService.getGlobalLeaderboard({ limit: 50, timeframe: 'all' });

// Leaderboard en direct pour un challenge
await leaderboardService.getLiveLeaderboard(challengeId, { limit: 10 });

// Top performeurs
await leaderboardService.getTopPerformers(challengeId, 5);

// Enregistrer une soumission
await leaderboardService.recordSubmission(submissionData);
```

**Fonctionnalités:**
- Classements en temps réel
- Filtrage par timeframe
- Suivi des performances
- Mock data pour les tests

### Hooks

#### **useCodeExecution()** Hook
Gère l'état d'exécution du code.

```javascript
const execution = useCodeExecution(challengeId, testCases);

// État
execution.isRunning;           // bool - Exécution en cours
execution.isSubmitting;        // bool - Soumission en cours
execution.testResults;         // array - Résultats des tests
execution.passedTests;         // number - Tests réussis
execution.totalTests;          // number - Total tests
execution.error;               // string - Message d'erreur
execution.success;             // bool - Tous les tests passés

// Méthodes
await execution.runCode(code, language);
await execution.submitCode(code, language, userId);
execution.resetResults();
execution.clearError();

// Computed
execution.allTestsPassed;      // bool - Tous réussis?
execution.passPercentage;      // number - 0-100%
```

### Composants

#### 1. **ChallengeArenaPlayground**
Composant principal intégrant tous les éléments.

```jsx
<ChallengeArenaPlayground 
  challengeId="challenge_id"
/>
```

**Affiche:**
- Description du problème (gauche)
- Éditeur de code (centre)
- Résultats des tests + Leaderboard (droite)

#### 2. **LiveLeaderboard**
Affiche le leaderboard en temps réel.

```jsx
<LiveLeaderboard 
  challengeId="challenge_id"
  autoPoll={true}              // Auto-refresh
  pollInterval={3000}          // 3 secondes
/>
```

**Fonctionnalités:**
- Classement en direct
- Barre de progression
- Statut du joueur (solving/solved)
- Mise à jour automatique

#### 3. **TestResults**
Affiche les résultats détaillés des tests.

```jsx
<TestResults 
  results={testResults}
  isRunning={isRunning}
  passedTests={passedTests}
  totalTests={totalTests}
/>
```

**Affiche:**
- Résumé (passé/échoué)
- Barre de progression
- Tableau détaillé des résultats
- Temps d'exécution et mémoire

---

## 🚀 Utilisation

### Route

```
/playground/challenges/:id
```

### Exemple d'intégration

```jsx
import { ChallengeArenaPlayground } from '@/playground';
import { useParams } from 'react-router-dom';

export default function GamePage() {
  const { id } = useParams();
  
  return <ChallengeArenaPlayground challengeId={id} />;
}
```

### Flux typique

1. **Utilisateur arrive** → Page charge le challenge
2. **Écrit du code** → État mis à jour en temps réel
3. **Clique "Run Code"** → `runCode()` exécuté
4. **Résultats affichés** → Tests et leaderboard mis à jour
5. **Clique "Submit"** → Enregistre la soumission
6. **Leaderboard notifié** → Classements mis à jour

### Exécution de code

```javascript
// État initial
const execution = useCodeExecution(challengeId, testCases);

// Utilisateur clique "Run"
await execution.runCode(code, 'javascript');

// État mis à jour automatiquement
console.log(execution.testResults);  // Résultats
console.log(execution.passPercentage); // 85%
```

### Soumission

```javascript
// Utilisateur clique "Submit"
await execution.submitCode(code, 'javascript', userId);

// Si succès
if (execution.success) {
  // Tous les tests passés!
  // Leaderboard notifié
}
```

---

## 🎯 Cas d'utilisation

### Pour les développeurs
- Pratiquer des algorithmes
- Tester le code avant la soumission
- Voir les performances (temps/mémoire)
- Vérifier contre les cas de test

### Pour les compétiteurs
- Voir le classement en direct
- Comprendre la performance relative
- Suivre les autres joueurs
- Participer aux défis chronométrés

### Pour les administrateurs
- Monitorer les soumissions
- Analyser les performances
- Gérer les challenges
- Vérifier la triche

---

## 📊 Structure des données

### Challenge
```javascript
{
  _id: "123",
  title: "Two Sum",
  description: "...",
  difficulty: "EASY",       // EASY, MEDIUM, HARD
  tags: ["array", "hash"],
  examples: [
    { input: "[2,7,11,15], 9", output: "[0,1]", explanation: "..." }
  ],
  testCases: [
    { id: "1", input: "...", output: "..." }
  ],
  starterCode: {
    javascript: "function solution(nums, target) {\n  // ...\n}",
    python: "def solution(nums, target):\n  pass"
  },
  xp: 100,
  timeLimit: 15
}
```

### Test Result
```javascript
{
  id: "test_1",
  input: "[2,7,11,15]",
  expected: "[0,1]",
  actual: "[0,1]",
  status: "PASSED",          // PASSED, FAILED
  runtime: 8,                // ms
  memory: 2.1,               // MB
  time: "8ms"
}
```

### Leaderboard Entry
```javascript
{
  rank: 1,
  username: "AlgoMaster",
  xp: 12500,
  wins: 45,
  accuracy: 98.5,
  status: "solving",         // solving, solved
  progress: 85,              // %
  testsPassed: 8,
  totalTests: 10,
  time: "2:45"
}
```

---

## 🔧 Configuration

### Langages supportés
- **JavaScript** (par défaut)
- **Python**
- **Java**
- **C++**

### Timeframe du leaderboard
- `all` - Tout temps
- `month` - Ce mois
- `week` - Cette semaine
- `day` - Aujourd'hui

---

## 🐛 Troubleshooting

### "API not accessible"
→ Vérifier que le backend est lancé sur port 3000
→ Vérifier que `/api` est bien routée par Vite

### "No test results"
→ Vérifier que les testCases sont définis
→ Vérifier que le code d'exécution est valide
→ Vérifier la console (F12) pour les erreurs

### "Leaderboard 'No players found'"
→ C'est normal pour un nouveau challenge
→ Utilisateur doit soumettre du code pour apparaître
→ Mock data s'affiche sinon

### "Test case échoue"
→ Vérifier l'input/output format
→ Vérifier que le code traite bien les cas limites
→ Voir les détails du test dans TestResults

---

## 📚 Fichiers clés

```
src/
├── services/
│   ├── codeExecutionService.js      (Exécution de code)
│   └── leaderboardService.js        (Leaderboard)
├── hooks/
│   └── useCodeExecution.js          (State management)
├── components/
│   ├── ChallengeArenaPlayground.jsx  (Main component)
│   ├── LiveLeaderboard.jsx          (Leaderboard UI)
│   └── TestResults.jsx              (Results UI)
├── pages/
│   └── Frontoffice/
│       ├── PlaygroundChallengesPage.jsx  (List page)
│       └── ChallengePlaygroundPage.jsx   (Play page)
└── playground/
    └── index.js                     (Exports)
```

---

## 🔐 Sécurité

- Code exécuté dans un sandbox côté backend
- API validée et sécurisée
- Pas d'accès direct aux systèmes de fichiers
- Timeouts pour éviter les boucles infinies

---

## 🎓 Exemples

### 1. Afficher le playground pour un challenge

```jsx
import { useParams } from 'react-router-dom';
import { ChallengeArenaPlayground } from '@/playground';

export function GamePage() {
  const { id } = useParams();
  return <ChallengeArenaPlayground challengeId={id} />;
}
```

### 2. Utiliser le hook seul

```jsx
import { useCodeExecution } from '@/playground';

export function MyEditor() {
  const execution = useCodeExecution('challenge_1', [
    { input: '2,3', output: '5' }
  ]);

  return (
    <div>
      <textarea 
        value={code}
        onChange={e => setCode(e.target.value)}
      />
      <button onClick={() => execution.runCode(code, 'js')}>
        Run
      </button>
      {execution.testResults.map(r => (
        <div key={r.id}>
          {r.status === 'PASSED' ? '✓' : '✗'} {r.input}
        </div>
      ))}
    </div>
  );
}
```

### 3. Récupérer le leaderboard

```jsx
import { leaderboardService } from '@/playground';

export async function getLeaders() {
  const result = await leaderboardService.getLiveLeaderboard('challenge_1');
  console.log(result.data); // [{ rank, username, ... }]
}
```

---

## 📝 Notes

- Mock data utilisé si API non disponible
- Auto-save du code (localStorage)
- Supports dark mode (Chakra UI)
- Responsive (mobile/tablet/desktop)
- Performance optimisée (memoization, lazy loading)

---

**Status:** ✅ Production Ready

