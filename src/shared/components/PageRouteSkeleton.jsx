const shellStyle = {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at 50% 20%, var(--color-info-bg) 0%, transparent 36%), var(--color-bg-primary)',
  color: 'var(--color-text-secondary)',
  display: 'grid',
  placeItems: 'center',
  padding: 24,
};

const panelStyle = {
  width: 'min(360px, 100%)',
  display: 'grid',
  justifyItems: 'center',
  gap: 18,
};

const markStyle = {
  width: 52,
  height: 52,
  borderRadius: 14,
  border: '1px solid var(--color-glass-border-strong)',
  background:
    'linear-gradient(135deg, var(--color-bg-elevated), var(--color-bg-secondary))',
  boxShadow: 'var(--shadow-card)',
  position: 'relative',
  overflow: 'hidden',
};

const progressTrackStyle = {
  width: '100%',
  height: 4,
  borderRadius: 999,
  background: 'var(--color-border-subtle)',
  overflow: 'hidden',
};

export default function PageRouteSkeleton() {
  return (
    <div style={shellStyle} role="status" aria-live="polite" aria-busy="true">
      <style>
        {`
          @keyframes route-progress {
            0% { transform: translateX(-65%); }
            100% { transform: translateX(165%); }
          }

          @keyframes route-sheen {
            0% { transform: translateX(-120%) skewX(-16deg); }
            100% { transform: translateX(220%) skewX(-16deg); }
          }

          @keyframes route-dot {
            0%, 80%, 100% { opacity: 0.32; transform: translateY(0); }
            40% { opacity: 1; transform: translateY(-3px); }
          }

          @media (prefers-reduced-motion: reduce) {
            .route-progress-bar,
            .route-mark-sheen,
            .route-dot {
              animation: none !important;
            }
          }
        `}
      </style>

      <div style={panelStyle}>
        <div style={markStyle} aria-hidden="true">
          <div
            className="route-mark-sheen"
            style={{
              position: 'absolute',
              inset: 0,
              width: '42%',
              background:
                'linear-gradient(90deg, transparent, rgba(34,211,238,0.28), transparent)',
              animation: 'route-sheen 1.25s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 13,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--color-cyan-400), var(--color-purple-500))',
              boxShadow: '0 0 22px var(--color-focus-glow)',
            }}
          />
        </div>

        <div style={progressTrackStyle} aria-hidden="true">
          <div
            className="route-progress-bar"
            style={{
              width: '45%',
              height: '100%',
              borderRadius: 999,
              background:
                'linear-gradient(90deg, var(--color-cyan-400), var(--color-purple-500), var(--color-cyan-400))',
              animation: 'route-progress 1.05s ease-in-out infinite',
            }}
          />
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <span>Loading page</span>
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="route-dot"
              style={{
                width: 5,
                height: 5,
                borderRadius: 999,
                background: 'var(--color-cyan-400)',
                animation: 'route-dot 1.1s ease-in-out infinite',
                animationDelay: `${index * 0.14}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
