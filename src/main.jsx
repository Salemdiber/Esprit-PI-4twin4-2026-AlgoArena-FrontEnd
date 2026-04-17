const bootApp = () => {
  import('./bootstrap.jsx').then(({ mountApp }) => mountApp());
};

const shellPaths = new Set(['/', '/signin', '/signup']);
const shouldDelayBoot = shellPaths.has(window.location.pathname) && !window.location.hash;

if (shouldDelayBoot) {
  window.addEventListener('pointerdown', bootApp, { once: true, passive: true });
  window.addEventListener('focusin', bootApp, { once: true, passive: true });
  window.addEventListener('keydown', bootApp, { once: true });
  window.addEventListener('algoarena:boot', bootApp, { once: true });
  window.setTimeout(bootApp, 9000);
} else {
  bootApp();
}
