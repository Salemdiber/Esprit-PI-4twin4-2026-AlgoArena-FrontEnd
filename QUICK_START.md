# ⚡ Quick Start - 30 Secondes

## 1️⃣ Prérequis

- ✅ Node.js >= 18 ([Download](https://nodejs.org/))
- ✅ Backend NestJS sur port 3000

## 2️⃣ Lancer le Frontend

### Option A : Script automatique (recommandé)

**Windows:**
```bash
Double-click start.bat
```

**Mac/Linux:**
```bash
bash start.sh
```

### Option B : Commandes manuelles

```bash
cd Esprit-PI-4twin4-2026-AlgoArena-FrontEnd
npm install
npm run dev
```

## 3️⃣ Accéder à l'app

Ouvrez dans votre navigateur :
```
http://localhost:5173/playground/challenges
```

## ✨ Voilà !

Vous devriez voir la liste des challenges. Si ce n'est pas le cas :

### ❌ Erreur "API not accessible"?
```bash
# Terminal 2 - Lancez le backend
cd [your-nestjs-backend]
npm start
```

### ❌ Erreur CORS?
Vérifiez que le backend a CORS configuré

### ❌ Port déjà utilisé?
```bash
npm run dev -- --port 5174
```

---

## 📚 Docs Complètes

- **Installation détaillée**: [PLAYGROUND_SETUP.md](PLAYGROUND_SETUP.md)
- **FAQ**: [PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md)

---

## 🎯 Structure de l'App

```
🎮 Playground Challenges
├── 📋 Liste des challenges
│   ├── 🔍 Recherche
│   ├── 🎯 Filtrage par difficulté
│   └── 📄 Pagination
├── 📝 Détail d'un challenge
│   ├── 📋 Description
│   ├── 🏷️ Tags
│   └── 📊 Exemples
└── 🎲 Challenge aléatoire
```

## 🔌 Endpoints consommés

| Endpoint | Usage |
|----------|-------|
| `GET /playground/challenges` | Liste complète |
| `GET /playground/challenges/:id` | Détail |
| `GET /playground/challenges/random` | Random |

---

**Bonne pratique ! 💪**
