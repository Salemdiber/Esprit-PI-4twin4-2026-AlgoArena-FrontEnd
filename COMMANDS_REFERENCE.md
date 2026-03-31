# 🔧 Common Commands Reference

> Commandes utiles pour développer avec AlgoArena Playground Frontend

---

## 🚀 Lancement

### Démarrage Rapide

```bash
# Mac/Linux
bash start.sh

# Windows
start.bat

# Manuel
npm install
npm run dev
```

### Accéder à l'App

```
Frontend:  http://localhost:5173
Playground: http://localhost:5173/playground/challenges
Backend:   http://localhost:3000 (doit tourner séparément)
```

---

## 📦 Installation

### Installer les dépendances

```bash
npm install

# Si erreurs:
npm install --legacy-peer-deps
```

### Mettre à jour les dépendances

```bash
npm update

# Vérifier les dépendances
npm list --depth=0
```

### Nettoyer et réinstaller

```bash
# Supprimer node_modules et package-lock
rm -r node_modules package-lock.json

# Réinstaller
npm install
```

---

## 🛠️ Développement

### Mode développement

```bash
npm run dev

# Sur un port différent
npm run dev -- --port 5174
```

### Build production

```bash
npm run build

# Builder avec mode spécifique
npm run build -- --mode production
```

### Tester la build

```bash
npm run preview

# Puis naviguer à: http://localhost:4173
```

### Linting

```bash
npm run lint

# Fixer les erreurs
npm run lint -- --fix
```

---

## 🧪 Testing

### Tests Console (même terminal que dev server)

```javascript
// Ouvrir Console (F12) et coller:

// Test tous les endpoints
import { testPlaygroundAPI } from './src/utils/apiTestUtils.js';
testPlaygroundAPI();

// Ou tester individuellement
import { testGetChallenges, testGetChallenge, testRandomChallenge } from './src/utils/apiTestUtils.js';

testGetChallenges();
testGetChallenge('607f1f77bcf86cd799439011');  // Remplacez avec ID réel
testRandomChallenge();
```

### Tests avec cURL

```bash
# Lister tous les challenges
curl http://localhost:3000/playground/challenges

# Obtenir un challenge spécifique
curl http://localhost:3000/playground/challenges/607f1f77bcf86cd799439011

# Obtenir un challenge aléatoire
curl http://localhost:3000/playground/challenges/random

# Avec formatage
curl http://localhost:3000/playground/challenges | python3 -m json.tool
```

### Tests Frontend via Proxy

```bash
# Via le proxy Vite (frontend doit tourner)
curl http://localhost:5173/api/playground/challenges
```

---

## 🔍 Debugging

### Ouvrir DevTools

```
Raccourci: F12
Ou: Right-click → Inspect
```

### Voir les logs console

```javascript
// Dans DevTools → Console
// Lancer les tests:
import { testPlaygroundAPI } from './src/utils/apiTestUtils.js';
testPlaygroundAPI();
```

### Vérifier les requêtes réseau

```
DevTools → Network
Rafraîchir la page (Ctrl+R) ou F5
Voir les headers et réponses
```

### Profile la performance

```
DevTools → Performance
Cliquer Record
Effectuer une action
Clic Stop et analyser
```

---

## 🗄️ Backend

### Vérifier si le backend tourne

```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000
```

### Lancer le backend

```bash
# Terminal séparé, dossier backend
npm start
# ou
npm run start:dev
```

### Vérifier la DB

```bash
# Se connecter à MongoDB (si vous avez mongo CLI)
mongo

# Voir les databases
show dbs

# Voir les collections
db.challenges.find()

# Compter les challenges
db.challenges.count()
```

---

## 🖇️ Port Management

### Vérifier quel process utilise un port

```bash
# Windows
netstat -ano | findstr :5173
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :5173
lsof -i :3000
```

### Tuer un process

```bash
# Windows (remplacez PID)
taskkill /PID 12345 /F

# Mac/Linux (remplacez PID)
kill -9 12345

# Ou auto-tuer le port:
# Mac/Linux
lsof -ti :5173 | xargs kill -9
```

### Changer le port du frontend

```bash
npm run dev -- --port 5174
```

---

## 📁 Navigation

### Naviguer vers le projet

```bash
cd Esprit-PI-4twin4-2026-AlgoArena-FrontEnd
```

### Lister les fichiers

```bash
# Windows
dir

# Mac/Linux
ls -la

# Structure arborescence
tree -L 3
```

### Ouvrir dans l'éditeur

```bash
# VS Code
code .

# VS Code (toutes tabs)
code *.md

# Ouvrir fichier spécifique
code src/pages/Frontoffice/PlaygroundChallengesPage.jsx
```

---

## 📝 Git (si applicable)

### Cloner le repo

```bash
git clone [repository-url]
cd Esprit-PI-4twin4-2026-AlgoArena-FrontEnd
```

### Vérifier le status

```bash
git status
```

### Committer les changements

```bash
git add .
git commit -m "feat: Add feature"
git push
```

### Voir les changements

```bash
git diff

# Voir les changements stagés
git diff --staged
```

---

## 🚀 Déploiement

### Build production

```bash
npm run build

# Le dossier dist/ contient le build
```

### Déployer sur Vercel

```bash
npm install -g vercel
vercel login
vercel
```

### Déployer sur Netlify

```bash
npm run build

# Puis drag-drop le dossier dist/ sur Netlify Drop
# Ou connectez votre repo GitHub
```

### Servir localement la build

```bash
npm run preview

# Puis naviguer à: http://localhost:4173
```

---

## 📊 Environment Variables

### Créer le fichier .env.local

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_MODE=development
VITE_ENABLE_LOGGING=true
```

### Utiliser les variables

```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const mode = import.meta.env.VITE_APP_MODE;
```

---

## 🧹 Maintenance

### Nettoyer les fichiers temporaires

```bash
# Supprimer dist/
rm -r dist

# Supprimer node_modules
rm -r node_modules

# Nettoyer cache npm
npm cache clean --force
```

### Vérifier les vulnérabilités

```bash
npm audit

# Fixer les vulnérabilités automatiquement
npm audit fix
```

### Mettre à jour les packages

```bash
# Vérifier les mises à jour disponibles
npm outdated

# Mettre à jour
npm update
```

---

## 📚 Fichiers Importants

### Fichiers principaux

```bash
# Structure:
src/pages/Frontoffice/PlaygroundChallengesPage.jsx  # Main page
src/services/playgroundChallengesService.js          # API service
src/editor/hooks/usePlaygroundChallenges.js          # Custom hook
src/utils/apiTestUtils.js                           # Test utilities

# Config:
vite.config.js                                       # Vite config
package.json                                         # Dependencies
tailwind.config.js                                   # Tailwind
```

### Documentation

```bash
# Documentation:
00_START_HERE.md                                     # Point d'entrée
QUICK_START.md                                       # Lancement 30s
PLAYGROUND_SETUP.md                                  # Installation
PLAYGROUND_FAQ.md                                    # FAQ
API_TEST_EXAMPLES.md                                 # Tests
ARCHITECTURE.md                                      # Architecture
ADVANCED_CONFIG.md                                   # Config avancée
README_PLAYGROUND.md                                 # Vue d'ensemble
```

---

## 🎯 Workflows Complets

### Workflow: Développement Local

```bash
# 1. Installerles dépendances
npm install

# 2. Lancer le dev server
npm run dev

# 3. Ouvrir le navigateur
# http://localhost:5173/playground/challenges

# 4. Faire des changements dans le code
# src/pages/Frontoffice/PlaygroundChallengesPage.jsx

# 5. DevTools détecte les changements automatiquement (hot reload)

# 6. Tester avec F12 Console
import { testPlaygroundAPI } from './src/utils/apiTestUtils.js';
testPlaygroundAPI();
```

### Workflow: Tester une Feature

```bash
# 1. Lancer le dev server
npm run dev

# 2. Ouvrir DevTools (F12)
# Console tab

# 3. Tester l'API
fetch('/api/playground/challenges').then(r => r.json()).then(console.log)

# 4. Modifier le code selon le résultat

# 5. Recharger la page (Ctrl+R) ou laisser hot reload
```

### Workflow: Build et Deploy

```bash
# 1. Builder le projet
npm run build

# 2. Tester la build localement
npm run preview

# 3. Vérifier à: http://localhost:4173

# 4. Si OK, déployer
# Vercel: vercel
# Netlify: drag-drop dist/
# Manual: upload dist/ à votre serveur
```

### Workflow: Déboguer une Erreur

```bash
# 1. Ouvrir DevTools (F12)
# Console: voir l'erreur

# 2. Vérifier le Network tab
# Voir les requêtes et réponses

# 3. Vérifier que le backend tourne
netstat -ano | findstr :3000

# 4. Tester l'API directement
curl http://localhost:3000/playground/challenges

# 5. Consulter PLAYGROUND_FAQ.md
# Si l'erreur est courante, il y a une solution
```

---

## 💾 Quick Copy-Paste

### Setup complet (nouveau projet)

```bash
cd Esprit-PI-4twin4-2026-AlgoArena-FrontEnd
npm install
npm run dev
# Puis: http://localhost:5173/playground/challenges
```

### Vérifier tout fonctionne

```bash
# Terminal 1: Backend
cd [backend-folder]
npm start

# Terminal 2: Frontend
cd Esprit-PI-4twin4-2026-AlgoArena-FrontEnd
npm run dev

# Browser: http://localhost:5173/playground/challenges
# Console (F12): testPlaygroundAPI()
```

### Déployer

```bash
npm run build
# Vercel: vercel
# Netlify: drag-drop dist/
```

---

## 🆘 Commandes de Secours

```bash
# Tout reset
rm -r node_modules package-lock.json dist
npm install --legacy-peer-deps
npm run dev

# Tuer un port (Mac/Linux)
lsof -ti :5173 | xargs kill -9

# Vérifier environnement
node --version
npm --version
npm list --depth=0
```

---

*Gardez ce fichier comme référence! Copiez la commande que vous besoin et c'est parti! 🚀*
