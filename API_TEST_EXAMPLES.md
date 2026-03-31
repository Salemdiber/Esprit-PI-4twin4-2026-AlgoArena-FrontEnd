# 🧪 Test Examples - Playground Challenges API

## 📋 Table des matières
- [cURL Examples](#curl-examples)
- [Postman Collection](#postman-collection)
- [Browser Console Tests](#browser-console-tests)
- [Validation Response Format](#validation-response-format)

---

## 🔌 cURL Examples

### 1. Get All Challenges

```bash
curl -X GET http://localhost:3000/playground/challenges \
  -H "Content-Type: application/json"
```

**Expected Response (200 OK):**
```json
[
  {
    "_id": "607f1f77bcf86cd799439011",
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target...",
    "difficulty": "Easy",
    "tags": ["array", "two-pointers"],
    "examples": [
      {
        "input": "[2,7,11,15], target=9",
        "output": "[0,1]",
        "explanation": "The indices 0 and 1..."
      }
    ]
  },
  // ... more challenges
]
```

### 2. Get Specific Challenge

```bash
curl -X GET http://localhost:3000/playground/challenges/607f1f77bcf86cd799439011 \
  -H "Content-Type: application/json"
```

**Expected Response (200 OK):**
```json
{
  "_id": "607f1f77bcf86cd799439011",
  "title": "Two Sum",
  "description": "...",
  "difficulty": "Easy",
  "tags": ["array", "two-pointers"],
  "examples": [...]
}
```

### 3. Get Random Challenge

```bash
curl -X GET http://localhost:3000/playground/challenges/random \
  -H "Content-Type: application/json"
```

**Expected Response (200 OK):**
```json
{
  "_id": "...",
  "title": "...",
  "description": "...",
  // ...
}
```

### 4. Test via Frontend Proxy

Les requêtes du frontend utilisent le proxy Vite :

```bash
# Via Vite proxy (port 5173):
curl -X GET http://localhost:5173/api/playground/challenges \
  -H "Content-Type: application/json"

# Équivalent à:
# http://localhost:3000/playground/challenges
```

---

## 📮 Postman Collection

### Setup Postman

1. **Créer une collection** : `AlgoArena Playground`
2. **Créer des requêtes** :

#### Request 1: Get All Challenges

```
Method: GET
URL: http://localhost:3000/playground/challenges
Headers:
  - Content-Type: application/json

Tests:
  pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
  });
  pm.test("Response is array", () => {
    pm.expect(pm.response.json()).to.be.an('array');
  });
```

#### Request 2: Get Challenge by ID

```
Method: GET
URL: http://localhost:3000/playground/challenges/{{challengeId}}
Headers:
  - Content-Type: application/json

Pre-request Script:
  // Gets first challenge ID from collection
  pm.sendRequest({
    url: 'http://localhost:3000/playground/challenges',
    method: 'GET',
  }, (err, res) => {
    if (!err) {
      pm.collectionVariables.set('challengeId', res.json()[0]._id);
    }
  });

Tests:
  pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
  });
  pm.test("Response has required fields", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property('title');
    pm.expect(json).to.have.property('difficulty');
  });
```

#### Request 3: Get Random Challenge

```
Method: GET
URL: http://localhost:3000/playground/challenges/random
Headers:
  - Content-Type: application/json

Tests:
  pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
  });
  pm.test("Response contains title", () => {
    pm.expect(pm.response.json().title).to.exist;
  });
```

### Import Postman Collection

Vous pouvez aussi importer directement en créant un fichier JSON:

**File: AlgoArena-Playground.postman_collection.json**

```json
{
  "info": {
    "name": "AlgoArena Playground",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All Challenges",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3000/playground/challenges",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["playground", "challenges"]
        }
      }
    }
  ]
}
```

---

## 🌐 Browser Console Tests

Ouvrez la console du navigateur (F12) et collez :

### Test All Endpoints

```javascript
// Function to test all endpoints
async function testAllEndpoints() {
  const baseURL = 'http://localhost:3000/playground/challenges';
  
  try {
    // Test 1: Get all
    console.log('🧪 Testing GET /playground/challenges');
    const allRes = await fetch(baseURL);
    const all = await allRes.json();
    console.log(`✅ Got ${all.length} challenges`, all.slice(0, 2));
    
    // Test 2: Get specific
    if (all.length > 0) {
      console.log('\n🧪 Testing GET /playground/challenges/:id');
      const id = all[0]._id;
      const oneRes = await fetch(`${baseURL}/${id}`);
      const one = await oneRes.json();
      console.log('✅ Challenge loaded:', one.title);
    }
    
    // Test 3: Get random
    console.log('\n🧪 Testing GET /playground/challenges/random');
    const randomRes = await fetch(`${baseURL}/random`);
    const random = await randomRes.json();
    console.log('✅ Random challenge:', random.title);
    
    console.log('\n✅ All tests passed!');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

// Run the tests
testAllEndpoints();
```

### Load Test Utility

```javascript
// Charger l'utilitaire de test depuis le projet
import { testPlaygroundAPI } from './src/utils/apiTestUtils.js';

// Lancer les tests
testPlaygroundAPI();
```

---

## ✅ Validation Response Format

Votre API doit retourner des challenges avec cette structure :

```typescript
interface Challenge {
  _id?: string;        // MongoDB ID (ou 'id')
  id?: string;         // Alternative: 'id' au lieu de '_id'
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags?: string[];
  examples?: Example[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface Example {
  input: string;
  output: string;
  explanation?: string;
}
```

### Validation Checklist

- ✅ Chaque challenge a un `_id` ou `id`
- ✅ `title` est une string non-vide
- ✅ `description` est une string non-vide
- ✅ `difficulty` est l'une de : "Easy", "Medium", "Hard"
- ✅ `tags` est un array (optionnel)
- ✅ `examples` est un array d'objets avec `input` et `output`

### Validation Script

```bash
# Tester avec jq (Linux/Mac)
curl http://localhost:3000/playground/challenges | jq '.[] | {_id, title, difficulty, tags}'

# Ou en Python
python3 << 'EOF'
import requests
import json

url = "http://localhost:3000/playground/challenges"
res = requests.get(url)
challenges = res.json()

print(f"✅ Got {len(challenges)} challenges")
for ch in challenges[:3]:
    print(f"  - {ch.get('title')} ({ch.get('difficulty')})")
    print(f"    Tags: {ch.get('tags', [])}")
    print(f"    Examples: {len(ch.get('examples', []))}")
EOF
```

---

## 🐛 Troubleshooting Tests

### Connection Refused
```bash
# Check if backend is running
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Mac/Linux
```

### 404 Not Found
```bash
# Check endpoint exists and is spelled correctly
curl -v http://localhost:3000/playground/challenges
```

### 500 Internal Server Error
```bash
# Check backend logs for errors
# Verify database connection
# Verify challenge model/schema
```

### CORS Error (Browser)
```javascript
// Use Vite proxy (frontend):
fetch('/api/playground/challenges')
  .then(r => r.json())
  .then(console.log);
```

---

## 📊 Performance Testing

### Load Test with Apache Bench

```bash
# Test 100 concurrent requests
ab -n 1000 -c 100 http://localhost:3000/playground/challenges

# With custom headers
ab -n 1000 -c 100 -H "Content-Type: application/json" \
  http://localhost:3000/playground/challenges
```

### Load Test with Vegeta

```bash
# Install: go install github.com/tsenart/vegeta@latest

echo "GET http://localhost:3000/playground/challenges" | \
  vegeta attack -duration=30s -rate=100 | \
  vegeta report
```

---

Bon test ! 🚀
