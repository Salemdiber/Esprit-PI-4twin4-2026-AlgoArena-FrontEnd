const headerStyle = {
  height: 72,
  borderBottom: '1px solid rgba(148, 163, 184, 0.14)',
  background: '#050914',
};

const shellStyle = {
  minHeight: '100vh',
  background: '#050914',
  color: 'transparent',
};

const contentStyle = {
  width: 'min(1180px, calc(100% - 32px))',
  margin: '0 auto',
  paddingTop: 32,
};

const blockStyle = {
  borderRadius: 8,
  background:
    'linear-gradient(90deg, rgba(148,163,184,0.10), rgba(148,163,184,0.18), rgba(148,163,184,0.10))',
};

export default function PageRouteSkeleton() {
  return (
    <div style={shellStyle} aria-hidden="true">
      <div style={headerStyle} />
      <main style={contentStyle}>
        <div style={{ ...blockStyle, height: 48, width: '42%', marginBottom: 24 }} />
        <div style={{ ...blockStyle, height: 180, width: '100%', marginBottom: 18 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          <div style={{ ...blockStyle, height: 132 }} />
          <div style={{ ...blockStyle, height: 132 }} />
          <div style={{ ...blockStyle, height: 132 }} />
        </div>
      </main>
    </div>
  );
}
