const bootApp = () => {
  import('./bootstrap.jsx').then(({ mountApp }) => mountApp());
};

const isStaticHome = window.location.pathname === '/' && !window.location.hash;

if (isStaticHome) {
  window.addEventListener('pointerdown', bootApp, { once: true, passive: true });
  window.addEventListener('keydown', bootApp, { once: true });
  window.setTimeout(bootApp, 9000);
} else {
  bootApp();
}
