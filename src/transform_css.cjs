const fs = require('fs');

const path = 'd:/4TWIN/Pi-JS/Next-Gen-V3/AlgoArenaFrontEnd/src/pages/Frontoffice/battles/battles.css';
let content = fs.readFileSync(path, 'utf8');

const replacements = [
    // Backgrounds & typography
    { match: /#0f172a/g, replace: 'var(--color-bg-primary)' },
    { match: /#1e293b/g, replace: 'var(--color-bg-card)' },
    { match: /#f1f5f9/g, replace: 'var(--color-text-primary)' },
    { match: /#94a3b8/g, replace: 'var(--color-text-muted)' },
    { match: /#cbd5e1/g, replace: 'var(--color-text-secondary)' },
    { match: /#e2e8f0/g, replace: 'var(--color-text-primary)' },
    { match: /white/g, replace: 'var(--color-text-inverted)' },

    // Borders
    { match: /#334155/g, replace: 'var(--color-border)' },
    { match: /#475569/g, replace: 'var(--color-border-hover)' },
    { match: /#64748b/g, replace: 'var(--color-border-hover)' },

    // Accents
    { match: /#22d3ee/g, replace: 'var(--color-cyan-400)' },
    { match: /#06b6d4/g, replace: 'var(--color-cyan-500)' },

    { match: /#8b5cf6/g, replace: 'var(--color-purple-500)' },
    { match: /#6366f1/g, replace: 'var(--color-purple-600)' },

    { match: /#22c55e/g, replace: 'var(--color-green-500)' },
    { match: /#16a34a/g, replace: 'var(--color-green-600)' },

    { match: /#facc15/g, replace: 'var(--color-yellow-500)' },
    { match: /#f59e0b/g, replace: 'var(--color-yellow-500)' }, // Map orange to yellow
    { match: /#d97706/g, replace: 'var(--color-yellow-600)' },

    { match: /#ef4444/g, replace: 'var(--color-red-500)' },
    { match: /#dc2626/g, replace: 'var(--color-red-600)' },

    // RGBA matches
    { match: /rgba\(30,\s*41,\s*59,\s*0\.6\)/g, replace: 'var(--color-glass-bg)' },
    { match: /rgba\(34,\s*211,\s*238,\s*0\.1\)/g, replace: 'var(--color-orb-cyan)' },
    { match: /rgba\(34,\s*211,\s*238,\s*0\.2\)/g, replace: 'var(--color-focus-ring)' },
    { match: /rgba\(34,\s*211,\s*238,\s*0\.25\)/g, replace: 'rgba(34, 211, 238, 0.25)' }, // leave some alpha alone for specific shadow
    { match: /rgba\(34,\s*211,\s*238,\s*0\.4\)/g, replace: 'rgba(34, 211, 238, 0.4)' },
];

for (const rep of replacements) {
    content = content.replace(rep.match, rep.replace);
}

// Special cases
content = content.replace(/background-color: var\(--color-text-inverted\)/g, 'background-color: var(--color-text-inverted)');
content = content.replace(/color: var\(--color-text-inverted\)/g, 'color: var(--color-bg-primary)'); // White text on colored background needs to be bg-primary in light mode

fs.writeFileSync(path, content, 'utf8');
console.log('Done transforming CSS.');
