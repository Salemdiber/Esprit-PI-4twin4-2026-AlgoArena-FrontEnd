# ❓ FAQ - AlgoArena Playground Frontend

## Installation & Démarrage

### Q: Quel est le port par défaut du frontend?
**R:** Port **5173** (Vite). Vous pouvez le changer avec `npm run dev -- --port XXXX`

### Q: Le backend doit être sur quel port?
**R:** Port **3000** (configuré par défaut dans `vite.config.js`)

### Q: J'ai une erreur "node_modules"?
**R:** 
```bash
npm install
# ou
npm install --legacy-peer-deps
```

---

## Erreurs Courantes

### ❌ "Erreur lors du chargement des challenges (API locale non accessible ?)"

**Cause:** Le backend ne répond pas

**Solutions:**
1. Lancez le backend NestJS en mode dev (terminal séparé):
   ```bash
   cd [backend-folder]
   npm start
   # ou
   npm run start:dev
   ```

2. Vérifiez que port 3000 est libre:
   ```bash
   # Windows:
   netstat -ano | findstr :3000
   
   # Mac/Linux:
   lsof -i :3000
   ```

3. Testez l'API manuellement:
   ```bash
   curl http://localhost:3000/playground/challenges
   ```

4. Vérifiez le proxy dans `vite.config.js`:
   ```javascript
   '/api': {
     target: 'http://127.0.0.1:3000',  // Vérifiez l'adresse
   }
   ```

### ❌ CORS Error

Si vous avez : `Access to XMLHttpRequest at 'http://localhost:3000/...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solutions:**
- En **développement**: Le proxy Vite devrait gérer ça automatiquement. Redémarrez `npm run dev`
- En **production**: Configurez CORS dans le backend NestJS:
  ```javascript
  // main.ts (NestJS)
  app.enableCors({
    origin: 'http://your-frontend-url.com',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });
  ```

### ❌ Port 5173 déjà utilisé

```bash
npm run dev -- --port 5174
# ou tuez le processus qui utilise le port:
# Windows:
netstat -ano | findstr :5173
taskkill /PID [PID] /F

# Mac/Linux:
lsof -ti :5173 | xargs kill -9
```

### ❌ Challenges ne s'affichent pas (liste vide)

**Vérifiez:**
1. Votre base de données contient des challenges
2. L'API retourne bien le format attendu:
   ```javascript
   [
     {
       "_id": "...",
       "title": "Two Sum",
       "description": "...",
       "difficulty": "Easy",
       "tags": ["array"],
       "examples": [...]
     }
   ]
   ```

3. Ouvrez la console du navigateur (F12) et testez:
   ```javascript
   fetch('/api/playground/challenges').then(r => r.json()).then(console.log)
   ```

---

## Features

### Q: Comment ajouter/modifier un challenge?
**R:** Via l'API backend. Le frontend récupère les données avec `getChallenges()`.

### Q: Comment activer le dark mode?
**R:** Cliquez sur l'icône (généralement en haut à droite). Chakra UI gère le color mode automatiquement.

### Q: Peut-on filtrer par plusieurs difficultés à la fois?
**R:** Actuellement non, mais c'est facile à ajouter dans `PlaygroundChallengesPage.jsx` en changeant `Select` en `CheckboxGroup`.

### Q: Comment exclure un challenge?
**R:** Vous pouvez ajouter un champ `hidden: true` dans votre modèle backend et filtrer côté frontend.

---

## Développement & Customisation

### Q: Comment modifier les icônes?
**R:** Le projet utilise `lucide-react`:
```javascript
import { ChevronRight, MoreVertical, Zap } from 'lucide-react';
```

### Q: Comment changer les couleurs?
**R:** Éditer `theme/index.js` ou utiliser les couleurs par défaut de Chakra UI.

### Q: Comment ajouter une colonne 'Status' ou 'Completed'?
**R:** 
1. Ajouter à votre modèle backend
2. Afficher dans `ChallengeList` ou `ChallengeDetail`
3. Ajouter des couleurs avec Badge

### Q: Peut-on ajouter une intégration avec un compilateur?
**R:** Oui! Utilisez JDoodles ou Judge0 API:
```javascript
// Exemple simplifié
const response = await fetch('https://api.jdoodle.com/execute', {
  method: 'POST',
  body: JSON.stringify({
    clientId: YOUR_ID,
    clientSecret: YOUR_SECRET,
    script: userCode,
    language: 'python3',
  })
});
```

---

## Performance

### Q: L'app est lente?
**R:**
1. Vérifiez la performance réseau (F12 → Network)
2. Réduisez `itemsPerPage` dans `PlaygroundChallengesPage.jsx`
3. Implémentez un cache:
   ```javascript
   const cache = new Map();
   if (cache.has(id)) return cache.get(id);
   ```

### Q: Beaucoup de challenges ralentissent l'app?
**R:** Implémentez la virtualisation avec `react-window`:
```bash
npm install react-window
```

---

## Déploiement

### Q: Comment déployer sur Vercel?
```bash
npm run build
npm install -g vercel
vercel
```

### Q: Comment déployer sur Netlify?
```bash
npm run build  # Crée dist/
# Drag-drop dist/ sur Netlify Drop
# ou connectez votre repo GitHub avec Netlify
```

### Q: Backend en production, frontend sur Vercel?
**R:** Changez l'API URL dans `playgroundChallengesService.js`:
```javascript
const API_BASE = process.env.REACT_APP_API_URL + '/playground/challenges';
```

Puis configurez dans Vercel les variables d'environnement.

---

## Bug Reporting

Trouvé un bug ? 🐛
1. Décrivez le problème
2. Steps pour reproduire
3. Screenshot/Console logs
4. Vérifiez que le backend répond correctement
5. Ouvrez une issue sur GitHub

---

## Ressources

- 📚 [React Docs](https://react.dev)
- 🎨 [Chakra UI Docs](https://chakra-ui.com)
- ⚡ [Vite Docs](https://vitejs.dev)
- 🏗️ [NestJS Docs](https://docs.nestjs.com)

---

**Besoin d'aide? Consultez le `PLAYGROUND_SETUP.md` pour plus de détails!**
