# ⚔️ ALGO ARENA: Next-Gen Code Combat

> **"Where Logic Meets Glory."**

**AlgoArena** is not just a coding platform—it is a **digital colosseum** designed for the modern developer. Built on the bleeding edge of **React 19** and **Chakra UI**, we have gamified the art of algorithmic problem-solving into a high-octane, cinematic experience.

Forget static text editors. Welcome to a living, breathing ecosystem where your code is your weapon, and efficiency is your shield.

---

## 🌌 The Experience

### 🎮 The Battle Arena (1v1 & PvE)
Enter the fray in real-time coding duels.
- **Duel Mode**: Lock horns with other developers in synchronized 1v1 battles. First to pass all test cases wins the glory.
- **Solo Campaigns**: Face off against our AI Sentinel in increasingly difficult algorithmic challenges.
- **Live Spectating**: Watch code execute in real-time with visualizers that bring sorting algorithms and pathfinding to life.

### 🧩 The Training Grounds (Challenges)
Sharpen your mind before entering the arena.
- **Curated Problem Sets**: From "Novice" scripts to "Grandmaster" dyamamic programming, filter challenges by difficulty, topic, and acceptance rate.
- **Monaco-Powered Editor**: A pro-grade coding environment with intelligent syntax highlighting (`VS Code` experience).
- **Instant Feedback**: Our simulated test runner provides millisecond-level feedback on time complexity and memory usage.

### 👁️ The "Oracle" (Advanced A11y)
We believe code is universal. Our distinct **Accessibility Suite** ensures the arena is open to every warrior:
- **Voice Command Interface**: Navigate the entire application using only your voice. *"Go to Arena"*, *"Start Battle"*.
- **Dyslexia Support**: Toggle specialized fonts (`OpenDyslexic`) instantly.
- **Sensory Control**: One-click "Reduced Motion" and "High Contrast" modes for a focused experience.
- **Text-to-Speech**: Let the system read complex problem descriptions to you.

### 🔐 Security & Access
We take security seriously, ensuring a safe environment for your code and account.
- **Role-Based Access Control (RBAC)**: Seamless redirection logic that routes Admins to the command center and Competitors to the arena.
- **Secure Authentication Flow**: Complete forgot password system with email simulation, token validation, and password strength enforcement.

### 🎨 Cinematic Immersion
We don't just load pages; we build atmosphere.
- **System Boot Sequence**: A mesmerizing, animated startup sequence that initializes your session.
- **Code Crosshair Cursor**: A custom-engineered precision cursor that snaps to interactive elements (CSS-driven for zero lag).
- **Neon-Glass Aesthetic**: A deep `Midnight Navy (#0f172a)` theme accented with `Cyber Cyan (#22d3ee)` builds a futuristic, focus-inducing environment.

---

## ⚡ Under the Hood (Tech Stack)

AlgoArena is forged from the strongest modern technologies:

| Domain | Technology |
| :--- | :--- |
| **Core Engine** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Styling** | [Chakra UI](https://chakra-ui.com/) + [Tailwind CSS v4](https://tailwindcss.com/) |
| **Motion Physics** | [Framer Motion](https://www.framer.com/motion/) |
| **State Management** | React Context API + Custom Hooks |
| **Visualizations** | [Chart.js](https://www.chartjs.org/) |
| **Routing** | [React Router v7](https://reactrouter.com/) |

---

## 🚀 Deployment Protocol

To deploy your own instance of the Arena locally:

### 1. Initialize
Clone the repository and install the dependencies.
```bash
git clone git@github.com:Salemdiber/AlgoArenaFrontEnd.git
cd Next-Gen
npm install
```

### 2. Ignite
Launch the development server.
```bash
npm run dev
```

### 3. Engage
Open your browser to `http://localhost:5173`. The system boot sequence will initiate.

---

## � System Architecture

Our codebase follows a strict **Clean Architecture** to ensure maintainability and scale:

```bash
src/
├── accessibility/   # The 'Oracle' (Voice, TTS, Dyslexia support)
├── components/      # UI Atoms (Buttons, Cards, Inputs)
├── layout/          # Structural Frames (Public vs Admin)
├── pages/
│   ├── Backoffice/  # The Command Center (Admin Analytics, User Mgmt)
│   ├── Frontoffice/ # The Player Experience (Battles, Leaderboards)
│   └── LandingPage/ # The Gateway
├── shared/          # Shared Resources
│   ├── context/     # Global State (Heat, Auth, Loading)
│   ├── cursor/      # Visual Pointer Logic
│   └── skeletons/   # Loading States
└── theme/           # The Design System (Tokens, Colors)
```

---

## 📄 License

**AlgoArena** is open-source software licensed under the **MIT License**.

---

*"Code long and prosper."* — **The AlgoArena Team**
