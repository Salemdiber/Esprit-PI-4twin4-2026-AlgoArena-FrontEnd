# 🚀 Quick Start - Test du Playground Arena

> **Démarrer et tester l'interface en 5 minutes**

---

## ⚡ 1. Démarrer (2 min)

### Terminal 1: Backend
```bash
cd [your-backend-directory]
npm start
# Backend prêt sur http://localhost:3000
```

### Terminal 2: Frontend
```bash
cd Esprit-PI-4twin4-2026-AlgoArena-FrontEnd
npm install  # First time only
npm run dev
# Frontend prêt sur http://localhost:5173
```

---

## 🎮 2. Accéder à l'Interface (1 min)

Ouvrez votre navigateur:

### Option A: Via la liste
```
http://localhost:5173/playground/challenges
↓ Cliquer sur n'importe quel challenge
↓ Click "💻 Solve Now"
```

### Option B: Direct
```
http://localhost:5173/playground/challenges/two-sum
```

---

## ✅ 3. Tester les Interfaces (2 min)

### Test 1: Éditeur de Code ✅

```javascript
// Dans l'éditeur, le code pré-rempli apparaît
// Essayez:

1. Change language (Python, Java, C++)
2. Modifiez le code
3. Le code s'update en direct
```

### Test 2: Exécuter les Tests ✅

```
1. Click "▶ Run Code"
2. Attendez ~1.5 secondes (simulation)
3. Vérifiez:
   ✅ Spinner affiche "Running tests..."
   ✅ TestResults component affiche les résultats
   ✅ Badge montre "X/Y tests passed"
   ✅ Tableau montre chaque test
```

**Expected Output:**
```
Test Results:
✅ PASS - Input: [2,7,11,15]  Output: [0,1]   Time: 8ms   Memory: 2.1MB
✅ PASS - Input: [3,2,4]       Output: [1,2]   Time: 9ms   Memory: 2.3MB
⚠️  FAIL - Input: [3,3]        Output: [0,1]   Time: 7ms   Memory: 2.0MB
...

8/10 Tests Passing - 80% ⚠️
```

### Test 3: Live Leaderboard ✅

```
RIGHT PANEL - Live Leaderboard

1. Vérifiez que le leaderboard affiche:
   🔴 Live Leaderboard
   ✅ Joueurs avec avatars
   ✅ Classement (rank 1, 2, 3...)
   ✅ Barre de progression
   ✅ Statut (solving/solved)
   ✅ Tests passed / Time

2. Auto-refresh:
   ✅ Leaderboard rafraîchit indépendament
   ✅ Toutes les 3 secondes
```

**Expected Data:**
```
🥇 #1 AlgoMaster       [████████████████] 100%  10/10 ✓ 1:45
🥈 #2 CodeNinja        [█████████░░░░░░░░] 70%   7/10  2:20
🥉 #3 BinaryBeast      [██████░░░░░░░░░░░] 60%   6/10  3:10
```

### Test 4: Soumettre du Code ✅

```
1. Si tous les tests passent, click "✓ Submit"
2. Vérifiez:
   ✅ Button affiche "Running" state
   ✅ Leaderboard se met à jour
   ✅ Vous apparaissez dans le classement

SI backend manquant:
   😊 Mock data s'affiche (c'est normal)
   ✅ Score et XP earned affichés
   ✅ Tout fonctionne quand même!
```

---

## 🧪 4. Vérifications Complètes

### Interface Complète
```
┌─────────────────────────────────────────────┐
│ Problem          │ Code Editor    │ Results │
│ Description      │ + Toolbar      │ +Lead   │
│ + Examples       │                │ erboard │
│ ~400px           │ ~600px         │ 350px   │
└─────────────────────────────────────────────┘
```

- ✅ Tous les 3 panneaux visibles
- ✅ Pas de scroll horizontal (responsive)
- ✅ Proportions correctes

### Réactivité
```
Desktop (>1200px):
  ✅ 3 colonnes côte à côte

Tablet (768px-1200px):
  ✅ 2 colonnes (Editor + Results stack)

Mobile (<768px):
  ✅ Stacked vertically
```

### Dark/Light Mode
```
Click bourton de thème en haut à droite:
  ✅ Interface change de couleur
  ✅ Texte reste lisible
  ✅ Couleurs cohérentes
```

---

## 📊 5. Vérifier les Données

### Console (F12)

```javascript
// Dans la console:

// Test 1: Services chargés
import { codeExecutionService } from '@/services/codeExecutionService'
console.log(codeExecutionService) // ✅ Doit afficher objet

// Test 2: Exécution simulée
const result = await codeExecutionService.runCode(
  'function test() { return 42; }',
  'javascript',
  'challenge_1',
  [{ input: 'test', output: '42' }]
)
console.log(result) // ✅ Doit avoir testResults, passedTests, etc.

// Test 3: Leaderboard mock
import { leaderboardService } from '@/services/leaderboardService'
const leaders = await leaderboardService.getLiveLeaderboard('challenge_1')
console.log(leaders.data) // ✅ Doit avoir tableau de joueurs
```

---

## 🐛 6. Troubleshooting

### "Code Editor n'apparaît pas"
```
✓ Vérifier que Monaco est installé
✓ Vérifier console (F12) pour les erreurs
✓ Recharge la page (Ctrl+F5)
```

### "Tests ne s'exécutent pas"
```
✓ Vérifier que backend tourne sur :3000
✓ Vérifier que testCases sont définis
✓ Voir console pour les erreurs d'API
✓ Mock data devrait s'afficher sinon
```

### "Leaderboard 'No players found'"
```
✓ C'est normal au départ!
✓ Mock data s'affiche si backend manquant
✓ Soumettez du code pour l'habiter
```

### "Performance lente"
```
✓ Vérifier que backend n'est pas surchargé
✓ Vérifier que polling n'est pas trop rapide
✓ Augmenter pollInterval dans LiveLeaderboard
```

---

## ✨ 7. Fonctionnalités Extra

### Keyboard Shortcuts (Monaco Editor)
- `Ctrl+S` - Format code
- `Ctrl+/` - Toggle comment
- `Tab` - Indent
- `Shift+Tab` - Unindent
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo

### Boutons/Actions
- 🌓 Dark mode toggle
- 📱 Responsive menu
- ↩️ Go back button
- ↺ Reset code
- ▶ Run tests
- ✓ Submit

---

## 📋 Résumé du Test

| Test | Attendu | Résultat |
|------|---------|----------|
| Code Editor charge | ✅ | ? |
| Peut taper du code | ✅ | ? |
| Langage switch | ✅ | ? |
| Run Code button | ✅ | ? |
| Tests exécutés | ✅ | ? |
| Résultats affichés | ✅ | ? |
| Leaderboard visible | ✅ | ? |
| Leaderboard update | ✅ | ? |
| Submit button | ✅ | ? |
| Tout responsive | ✅ | ? |
| **TOTAL** | **10/10** | **?** |

---

## 🎯 Résultat Attendu

Après test complet:

```
✅ Tous les interfaces fonctionnent
✅ Code exécuté avec résultats
✅ Tests affichent avec détails
✅ Leaderboard en temps réel
✅ UI fluide et responsive
✅ Dark/light mode
✅ Pas d'erreurs console
✅ Performance acceptable
✅ Mock data comme fallback
✅ Ready pour production!
```

---

## 🚀 Prochaine Étape

Si tout fonctionne:
1. ✅ Vérifiez `PLAYGROUND_IMPLEMENTATION_COMPLETE.md`
2. ✅ Lisez `PLAYGROUND_ARENA_SETUP.md` pour détails techniques
3. ✅ Intégrez avec votre backend
4. ✅ Déployez en production!

---

**Everything working?** 🎉
**Let's ship it!**
