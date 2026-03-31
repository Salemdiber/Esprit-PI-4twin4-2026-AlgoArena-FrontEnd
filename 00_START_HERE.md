# 🎯 START HERE - AlgoArena Playground Frontend

> **Bienvenue! 👋 Consultez ce fichier en premier.**

---

## ⚡ TL;DR - 30 Secondes

Vous voulez **juste démarrer**? Copiez-collez dans votre terminal:

```bash
# Mac/Linux:
bash start.sh

# Windows:
start.bat
```

Puis ouvrez: **http://localhost:5173/playground/challenges**

✅ **C'est tout!** Voilà le frontend Playground qui fonctionne.

---

## 📚 Guides par Besoin

### Je viens de cloner et je veux lancer l'app
**Temps: 5 min** → [QUICK_START.md](QUICK_START.md)

### J'ai une erreur / ça ne marche pas
**Temps: 10 min** → [PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md)

### Je veux comprendre comment ça fonctionne
**Temps: 30 min** → [ARCHITECTURE.md](ARCHITECTURE.md)

### Je dois apprendre l'installation complète
**Temps: 20 min** → [PLAYGROUND_SETUP.md](PLAYGROUND_SETUP.md)

### Je veux tester l'API backend
**Temps: 15 min** → [API_TEST_EXAMPLES.md](API_TEST_EXAMPLES.md)

### Je dois déployer en production
**Temps: 30 min** → [ADVANCED_CONFIG.md](ADVANCED_CONFIG.md)

### Je veux une vue d'ensemble du projet
**Temps: 20 min** → [README_PLAYGROUND.md](README_PLAYGROUND.md)

### Je cherche un guide spécifique
**Consultez:** [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

---

## 🚀 Lancement en Étapes

### 1️⃣ Prérequis (vérifier)

Avant de commencer, assurez-vous que vous avez :

```bash
# Vérifier Node.js
node --version          # Doit être >= 18.x
npm --version           # Doit être >= 9.x

# Si vous n'avez pas Node.js:
# Téléchargez depuis: https://nodejs.org/
```

### 2️⃣ Backend (en arrière-plan)

Assurez-vous que le backend NestJS tourne sur le port 3000 :

```bash
# Terminal séparé
cd [your-nestjs-backend-folder]
npm start
# ou
npm run start:dev
```

### 3️⃣ Frontend (ce projet)

```bash
# Option A: Script automatique (recommandé)
bash start.sh              # Mac/Linux
# ou
start.bat                  # Windows

# Option B: Commandes manuelles
cd Esprit-PI-4twin4-2026-AlgoArena-FrontEnd
npm install
npm run dev
```

### 4️⃣ Accéder à l'App

Une fois lancé (port 5173), ouvrez dans votre navigateur:

```
http://localhost:5173/playground/challenges
```

Vous devriez voir:
- 📋 Liste des challenges
- 🔍 Recherche et filtres
- 📄 Détail challenge
- 🎲 Bouton challenge aléatoire

✅ **Succès!** L'app fonctionne.

---

## ❌ Si ça ne marche pas...

### "API not accessible"
**Cause:** Backend n'est pas sur le port 3000

**Solution:**
```bash
# Terminal 2: Lancez le backend
cd [your-backend]
npm start

# Vérifiez le port 3000:
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Mac/Linux
```

👉 Consultant: [PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md)

### "Port 5173 already in use"
**Cause:** Un autre process utilise le port

**Solution:**
```bash
npm run dev -- --port 5174
```

👉 Consultant: [PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md)

### "Module not found errors"
**Cause:** node_modules non installé

**Solution:**
```bash
npm install
# ou avec support legacy:
npm install --legacy-peer-deps
```

👉 Consultant: [PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md)

### Autre erreur ?
👉 Consultant: [PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md) - Couvre 11 problèmes courants

---

## 📊 Ce que vous pouvez faire

### Utilisateur Final
- ✅ Voir la liste des challenges
- ✅ Chercher par titre/tags
- ✅ Filtrer par difficulté
- ✅ Voir le détail d'un challenge
- ✅ Obtenir un challenge aléatoire
- ✅ Naviguer avec pagination

### Développeur
- ✅ Modifier le code React
- ✅ Ajouter des features
- ✅ Tester l'API
- ✅ Déboguer localement
- ✅ Builder pour production

### DevOps
- ✅ Configurer env vars
- ✅ déployer (Vercel, Netlify, etc.)
- ✅ Monitorer performance
- ✅ Gérer CORS et proxy

---

## 🎯 Structure du Projet

```
Esprit-PI-4twin4-2026-AlgoArena-FrontEnd/
│
├── 📖 Documentation
│   ├── QUICK_START.md           ← 30 secondes
│   ├── PLAYGROUND_SETUP.md      ← Installation
│   ├── PLAYGROUND_FAQ.md        ← Questions fréquentes
│   ├── API_TEST_EXAMPLES.md     ← Tests
│   ├── ARCHITECTURE.md          ← Comprendre le code
│   ├── ADVANCED_CONFIG.md       ← Config avancée
│   ├── README_PLAYGROUND.md     ← Vue d'ensemble
│   ├── DOCUMENTATION_INDEX.md   ← Index guides
│   ├── IMPLEMENTATION_CHECKLIST.md ← Checklist
│   └── SUMMARY_AND_CHANGELOG.md ← Résumé
│
├── 🔧 Scripts
│   ├── start.sh                 ← Auto-starter
│   └── start.bat                ← Auto-starter
│
├── 💻 Code Source
│   └── src/
│       ├── pages/Frontoffice/PlaygroundChallengesPage.jsx
│       ├── services/playgroundChallengesService.js
│       ├── editor/hooks/usePlaygroundChallenges.js
│       └── utils/apiTestUtils.js
│
└── ⚙️ Configuration
    ├── vite.config.js
    ├── package.json
    └── index.html
```

---

## 🎓 Ressources

### Documentation dans ce projet
- [QUICK_START.md](QUICK_START.md) - 2 min pour lancer ⚡
- [PLAYGROUND_SETUP.md](PLAYGROUND_SETUP.md) - Installation complète
- [PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md) - FAQ & Troubleshooting
- [API_TEST_EXAMPLES.md](API_TEST_EXAMPLES.md) - Tests API
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture du code
- [ADVANCED_CONFIG.md](ADVANCED_CONFIG.md) - Configuration avancée
- [README_PLAYGROUND.md](README_PLAYGROUND.md) - Vue d'ensemble
- [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - Index des guides
- [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) - Checklist

### Ressources externes
- [React.dev](https://react.dev) - React docs
- [Vite.dev](https://vitejs.dev) - Vite docs
- [Chakra-ui.com](https://chakra-ui.com) - UI framework docs
- [NestJS Docs](https://docs.nestjs.com) - Backend framework

---

## ✅ Checklist Avant de Commencer

- [ ] Node.js >= 18 installé? (`node --version`)
- [ ] npm >= 9 installé? (`npm --version`)
- [ ] Backend NestJS sur port 3000?
- [ ] Vous êtes dans le bon dossier?
  - ✅ `Esprit-PI-4twin4-2026-AlgoArena-FrontEnd`

Si tout est ✅, vous êtes prêt!

---

## 🚀 Prochaines Étapes

### Option 1: Lancer Immédiatement ⚡

```bash
bash start.sh              # Mac/Linux
# ou
start.bat                  # Windows
```

Puis allez à: http://localhost:5173/playground/challenges

### Option 2: Lancer en 30 Secondes 📖

Lisez: [QUICK_START.md](QUICK_START.md)

### Option 3: Comprendre Complètement 🎓

Lisez: [PLAYGROUND_SETUP.md](PLAYGROUND_SETUP.md)

---

## 💡 Tips

### Ouvrir DevTools pour déboguer
```
Appuyez sur: F12
Onglet: Console & Network
```

### Tester l'API directement
```javascript
// Ouvrez la console (F12) et collez:
fetch('/api/playground/challenges')
  .then(r => r.json())
  .then(console.log)
```

### Voir les logs du backend
Consultez le terminal où vous avez lancé `npm start`

---

## 📞 Support

| Besoin | Ressource |
|--------|-----------|
| Lancer l'app | [QUICK_START.md](QUICK_START.md) |
| Erreur / Bug | [PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md) |
| Comprendre le code | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Tester l'API | [API_TEST_EXAMPLES.md](API_TEST_EXAMPLES.md) |
| Configuration avancée | [ADVANCED_CONFIG.md](ADVANCED_CONFIG.md) |
| Tous les guides | [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) |

---

## 🎉 Vous êtes Prêt!

```bash
bash start.sh        # Lancez
# ou
start.bat           # Lancez
```

**Bon codage! 💪**

---

<div align="center">

**Besoin d'aide?**

[🚀 START](QUICK_START.md) • [📖 SETUP](PLAYGROUND_SETUP.md) • [❓ FAQ](PLAYGROUND_FAQ.md) • [🧪 TESTS](API_TEST_EXAMPLES.md) • [🏗️ ARCH](ARCHITECTURE.md)

**[📚 Tous les Guides →](DOCUMENTATION_INDEX.md)**

</div>

---

v1.0 | Production Ready ✅
