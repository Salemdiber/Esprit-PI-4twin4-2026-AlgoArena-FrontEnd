import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({
    showSpinner: false,
    trickleSpeed: 80,
    minimum: 0.08,
});

export const startNavigationProgress = () => {
    if (typeof window === 'undefined') return;
    NProgress.start();
};

export const completeNavigationProgress = () => {
    if (typeof window === 'undefined') return;
    window.requestAnimationFrame(() => NProgress.done());
};
