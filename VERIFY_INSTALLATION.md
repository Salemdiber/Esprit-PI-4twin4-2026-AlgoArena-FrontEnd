# ✅ Installation Verification Guide

> **How to verify everything is working correctly**

---

## 🎯 Verification Steps

Follow these steps to verify your installation is complete and working.

---

## Step 1: Verify Node.js Installation

### Command
```bash
node --version
npm --version
```

### Expected Output
```
v18.x.x or higher
9.x.x or higher
```

### ✅ If OK:
Proceed to Step 2

### ❌ If NOT OK:
- Download Node.js from [nodejs.org](https://nodejs.org/)
- Install and try again
- Restart your terminal

---

## Step 2: Verify Project Folder

### Command
```bash
cd Esprit-PI-4twin4-2026-AlgoArena-FrontEnd
ls -la              # Mac/Linux
# or
dir                 # Windows
```

### Expected Files
```
✓ package.json
✓ vite.config.js
✓ src/
✓ public/
✓ README_PLAYGROUND.md (and other docs)
✓ start.sh or start.bat
```

### ✅ If found:
Proceed to Step 3

### ❌ If NOT found:
- Make sure you're in the right folder
- Verify folder name: `Esprit-PI-4twin4-2026-AlgoArena-FrontEnd`
- Check path: `c:\Users\zaabi\Desktop\Algofront\...`

---

## Step 3: Verify npm Install

### Command
```bash
npm install
```

### Expected Output
```
added XXX packages
found 0 vulnerabilities
```

### ✅ If successful:
- Check that `node_modules/` folder was created
- Proceed to Step 4

### ❌ If error:
```bash
# Try with legacy peer deps
npm install --legacy-peer-deps

# Or clean and reinstall
rm -r node_modules package-lock.json
npm install
```

---

## Step 4: Verify Backend Connection

### Prerequisites
- Backend NestJS must be running on port 3000
- In a **separate terminal**, run:
  ```bash
  cd [your-backend-folder]
  npm start
  ```

### Verify Backend is Running

#### Option A: Check Port
```bash
# Windows:
netstat -ano | findstr :3000

# Mac/Linux:
lsof -i :3000
```

**Expected:** Process listening on port 3000

#### Option B: Test API
```bash
curl http://localhost:3000/playground/challenges
```

**Expected:** JSON array of challenges (or error if no data, not connection error)

### ✅ If working:
Proceed to Step 5

### ❌ If NOT working:
- Make sure backend is actually running (`npm start`)
- Check backend logs for errors
- Verify backend is set to port 3000
- Try a different port if 3000 is taken

---

## Step 5: Start Frontend Development Server

### Command
```bash
# Option A: Auto-script
bash start.sh                # Mac/Linux
# or
start.bat                    # Windows

# Option B: Manual
npm run dev
```

### Expected Output
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### ✅ If successful:
Proceed to Step 6

### ❌ If error:
```bash
# Check port
netstat -ano | findstr :5173  # Windows
lsof -i :5173                 # Mac/Linux

# If port used, try different port
npm run dev -- --port 5174
```

---

## Step 6: Verify Frontend in Browser

### Command
Open your browser and navigate to:
```
http://localhost:5173/playground/challenges
```

### Expected View
```
✅ Title: "Playground Challenges" or similar
✅ Search input field
✅ Difficulty filter dropdown
✅ Grid of challenge cards
✅ Pagination controls (if multiple pages)
✅ "Practice Random Challenge" button
```

### ✅ If you see all of these:
Proceed to Step 7

### ❌ If you see error message:
- "API not accessible" → Backend not running, fix Step 4
- "No challenges" → Database is empty
- CSS not loading → Vite dev server issue, restart `npm run dev`
- Blank page → JavaScript error, check console (F12)

---

## Step 7: Verify API Connection

### Open Browser Console
```
Press F12
Click "Console" tab
```

### Test 1: Get All Challenges
Paste this:
```javascript
fetch('/api/playground/challenges')
  .then(r => r.json())
  .then(console.log)
```

**Expected:** Array of challenge objects displayed

### Test 2: Test Specific Challenge
Paste this (get ID from previous output):
```javascript
fetch('/api/playground/challenges/REPLACE_WITH_ID')
  .then(r => r.json())
  .then(console.log)
```

**Expected:** Single challenge object displayed

### Test 3: Test Random
Paste this:
```javascript
fetch('/api/playground/challenges/random')
  .then(r => r.json())
  .then(console.log)
```

**Expected:** Random challenge object displayed

### Test All Endpoints
Paste this:
```javascript
import { testPlaygroundAPI } from './src/utils/apiTestUtils.js';
testPlaygroundAPI()
```

**Expected:** Summary of all tests passing

### ✅ If all tests pass:
Everything is working! ✨

### ❌ If tests fail:
- Backend might not be running
- API path might be wrong
- Challenge format might be different

---

## Step 8: Verify Search & Filter

### In the App:
1. **Search Test**
   - Type in search box
   - Should filter challenges by title/tags in real-time
   - ✅ Working if results update instantly

2. **Filter Test**
   - Select difficulty from dropdown
   - Should filter to only that difficulty
   - ✅ Working if list updates

3. **Pagination Test**
   - Click "Next" button
   - Should show next page of challenges
   - ✅ Working if new challenges appear

4. **Detail View Test**
   - Click on a challenge card
   - Should show full details
   - ✅ Working if detail page appears

5. **Random Challenge Test**
   - Click "Practice Random Challenge"
   - Should load and show detail view
   - ✅ Working if random challenge appears

---

## Step 9: Verify Dark Mode (Optional)

### In the App:
- Look for theme toggle button (usually top-right)
- Click to switch dark/light mode
- ✅ Working if colors change

---

## 📊 Final Verification Checklist

- [ ] Node.js >= 18 installed
- [ ] npm >= 9 installed
- [ ] Project folder correct
- [ ] `npm install` completed
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Browser shows Playground page
- [ ] API tests pass in console
- [ ] Search works
- [ ] Filter works
- [ ] Pagination works
- [ ] Detail view works
- [ ] Random challenge works
- [ ] Dark mode works (optional)

### ✅ If All Checked:
**Installation is COMPLETE and WORKING!** 🎉

### ❌ If Any Unchecked:
1. Identify the failing step above
2. Follow the troubleshooting for that step
3. Consult [PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md)
4. Check [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

---

## 🆘 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Backend won't start | [PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md) - Backend section |
| Port already in use | [PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md) - Port section |
| npm install fails | [PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md) - Dependencies section |
| API not accessible | [PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md) - API section |
| Challenges not showing | [PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md) - Data section |
| CSS not loading | Check terminal for errors, restart `npm run dev` |
| Can't find challenges | Verify database has challenges: `db.challenges.find()` |

---

## 🎯 Next Steps Once Verified

### If Everything Works:
1. ✅ Explore the [ARCHITECTURE.md](ARCHITECTURE.md) to understand code
2. ✅ Review [KEY_TAKEAWAYS.md](KEY_TAKEAWAYS.md) for important points
3. ✅ Check [COMMAND_REFERENCE.md](COMMANDS_REFERENCE.md) for useful commands
4. ✅ Read about deployment in [ADVANCED_CONFIG.md](ADVANCED_CONFIG.md)

### If You Want to Deploy:
1. Follow [ADVANCED_CONFIG.md](ADVANCED_CONFIG.md) - Deployment section
2. Build with `npm run build`
3. Test build with `npm run preview`
4. Deploy `dist/` folder

### If You Want to Develop:
1. Make code changes in `src/` files
2. Vite will auto-reload (hot reload)
3. Check browser DevTools (F12) for errors
4. Refer to [ARCHITECTURE.md](ARCHITECTURE.md) for structure

---

## ✨ Verification Complete!

Once you've checked everything on the list above and everything passes, you have:

```
✅ Complete Frontend Installation
✅ Working API Connection
✅ All Features Functional
✅ Ready to Use/Deploy
```

**Congratulations!** Your AlgoArena Playground Frontend is fully set up and working! 🎉

---

**Need Further Help?**
- Beginner? → [00_START_HERE.md](00_START_HERE.md)
- Found issue? → [PLAYGROUND_FAQ.md](PLAYGROUND_FAQ.md)
- Need guide? → [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
- Check these docs: [INDEX_ALL_DOCS.txt](INDEX_ALL_DOCS.txt)
