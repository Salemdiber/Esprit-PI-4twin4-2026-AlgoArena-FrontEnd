# 🚀 AlgoArena Playground Frontend - Guide de Lancement

## 📋 Table des matières
- [Installation](#installation)
- [Prérequis](#prérequis)
- [Démarrage rapide](#démarrage-rapide)
- [Architecture](#architecture)
- [Endpoints API consommés](#endpoints-api-consommés)
- [Fonctionnalités](#fonctionnalités)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prérequis

Assurez-vous que vous avez installé :
- **Node.js** >= 18.x ([Télécharger](https://nodejs.org/))
- **npm** >= 9.x ou **yarn**  
- **Votre backend NestJS** sur le port **3000** (http://localhost:3000)

Vérifiez l'installation :
```bash
node --version      # v18.x.x
npm --version       # 9.x.x
```

---

## 📥 Installation

### 1. Cloner et naviguer vers le projet
```bash
cd c:\Users\zaabi\Desktop\Algofront\Esprit-PI-4twin4-2026-AlgoArena-FrontEnd
```

### 2. Installer les dépendances
```bash
npm install
```

Si vous avez des problèmes, essayez :
```bash
npm install --legacy-peer-deps
```

---

## ⚡ Démarrage rapide

### Mode développement
```bash
npm run dev
```

Le frontend démarre sur **http://localhost:5173** (port Vite par défaut)

### Accéder au Playground
Une fois l'appli lancée, allez à : **http://localhost:5173/playground/challenges**

### Builder pour production
```bash
npm run build
```

Les fichiers compilés seront dans le dossier `dist/`

---

## 🏗️ Architecture

### Structure des fichiers
```
src/
├── pages/
│   └── Frontoffice/
│       └── PlaygroundChallengesPage.jsx  ← Page principale
├── services/
│   └── playgroundChallengesService.js    ← Service API
├── components/
│   ├── ChallengeList.jsx                 ← Affichage liste
│   └── ChallengeDetail.jsx               ← Affichage détail
└── App.jsx                               ← Routing
```

### Service API (`playgroundChallengesService.js`)

Le service centralise tous les appels API :

```javascript
// Récupérer tous les challenges
const challenges = await playgroundChallengesService.getChallenges();

// Récupérer un challenge spécifique
const challenge = await playgroundChallengesService.getChallenge(id);

// Récupérer un challenge aléatoire
const randomChallenge = await playgroundChallengesService.getRandomChallenge();
```

---

## 🔌 Endpoints API consommés

L'application consomme les endpoints suivants de votre backend NestJS :

| Endpoint | Méthode | Description | État |
|----------|---------|-------------|------|
| `/playground/challenges` | GET | Liste de tous les challenges | ✅ Implémenté |
| `/playground/challenges/:id` | GET | Détail d'un challenge | ✅ Implémenté |
| `/playground/challenges/random` | GET | Challenge aléatoire | ✅ Implémenté |

### Configuration du proxy

Le Vite proxy (`vite.config.js`) redirige automatiquement :
- Requête : `http://localhost:5173/api/playground/challenges`
- Vers : `http://localhost:3000/playground/challenges`

---

## ✨ Fonctionnalités

### 1. **Liste des Challenges**
- 📊 Vue en grille (6 items par page sur desktop)
- 🔍 **Recherche** par titre ou tags
- 🎯 **Filtrage** par difficulté (Easy, Medium, Hard)
- 📄 **Pagination** automatique
- ⏳ Indicateur de chargement
- ⚠️ Gestion des erreurs affichée à l'utilisateur

### 2. **Détail d'un Challenge**
- 📝 Titre et description complète
- 🏷️ Tags associés  
- 🎲 Niveau de difficulté (avec couleur)
- 📋 Exemples d'entrée/sortie avec explications
- ◀️ Bouton retour à la liste

### 3. **Challenge Aléatoire**
- 🎲 Bouton "Practice Random Challenge"
- Charge un challenge aléatoire du backend
- Affiche directement le détail

---

## 🎨 Styling

L'application utilise :
- **Chakra UI** pour les composants
- **Dark Mode** supporté (Color Mode)
- **Responsive Design** (Mobile, Tablet, Desktop)

---

## 🐛 Troubleshooting

### ❌ Erreur : "Erreur lors du chargement des challenges (API locale non accessible ?)"

**Cause** : Le backend NestJS n'est pas accessible sur le port 3000

**Solutions** :
1. Vérifiez que le backend est lancé
   ```bash
   # Terminal séparé, dossier du backend NestJS:
   npm start  # ou npm run start:dev
   ```

2. Vérifiez le port du backend
   ```bash
   # Vérifier que le backend écoute bien sur 3000
   netstat -ano | findstr :3000  # Windows
   lsof -i :3000                  # Mac/Linux
   ```

3. Vérifiez la configuration proxy dans `vite.config.js`
   ```javascript
   // Vérifiez que 'target: 'http://127.0.0.1:3000'' est correct
   ```

### ❌ Erreur CORS
Si vous avez une erreur CORS même avec le proxy :
1. Assurez-vous que le proxy Vite est bien activé (dev mode)
2. En production, configurez CORS dans votre backend NestJS :
   ```javascript
   app.enableCors({
     origin: 'http://localhost:5173', // ou votre frontend URL
     credentials: true,
   });
   ```

### ❌ Erreur de compilation / "Module not found"
```bash
# Effacer node_modules et réinstaller
rm -r node_modules package-lock.json
npm install --legacy-peer-deps
npm run dev
```

### ✅ Port 5173 déjà utilisé
```bash
# Lancer Vite sur un autre port
npm run dev -- --port 5174
```

---

## 📦 Variables d'environ ement

Vous pouvez créer un fichier `.env.local` :

```env
# .env.local
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=AlgoArena Playground
```

Puis utiliser dans le code :
```javascript
const API_URL = import.meta.env.VITE_API_BASE_URL;
```

**Note** : Actuellement non utilisé (hardcodé dans `playgroundChallengesService.js`)

---

## 🚀 Déploiement

### Build production
```bash
npm run build     # Crée dist/
npm run preview   # Teste la build en local
```

### Héberger sur Vercel/Netlify
```bash
# Vercel
npm i -g vercel
vercel

# Netlify
npm run build
# Puis drag-drop le dossier dist/ sur Netlify
```

---

## 📊 Structure de données attendue

Votre API doit retourner un `Challenge` avec cette structure :

```javascript
{
  "_id": "607f1f77bcf86cd799439011",      // ou "id"
  "title": "Two Sum",
  "description": "Given an array of integers...",
  "difficulty": "Easy",                     // Easy | Medium | Hard
  "tags": ["array", "two-pointers"],
  "examples": [
    {
      "input": "[2,7,11,15], target=9",
      "output": "[0,1]",
      "explanation": "The indices 0 and 1..."
    }
  ]
}
```

---

## 💡 Prochaines étapes

Pour améliorer le frontend :

1. **Ajouter un code editor** pour tester les solutions
   ```javascript
   import CodeEditor from '@monaco-editor/react';
   ```

2. **Ajouter des statistiques utilisateur**
   - Nombre de challenges résolus
   - Temps moyen
   - Taux de réussite

3. **Persister les favoris**
   ```javascript
   localStorage.setItem('favorites', JSON.stringify(favoriteIds));
   ```

4. **Ajouter des suggestions de challenges**
   - Basé sur le niveau de difficulté
   - Basé sur les tags / sujets

5. **Intégrer un compilateur en temps réel**
   - Exécuter le code directement dans le navigateur
   - JDoodles ou similar

---

## 📞 Support

Si vous avez des questions :
1. Vérifiez les logs du backend
2. Ouvrez la console du navigateur (F12)
3. Vérifiez que l'API retourne le bon format

Bonne pratique ! 💪
