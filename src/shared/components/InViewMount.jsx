import React, { useEffect, useRef, useState } from 'react';

/**
 * InViewMount – mounts its children only after the placeholder enters the
 * viewport (or comes within `rootMargin` of it). Used on the landing page
 * to defer below-the-fold sections so the initial bundle and main-thread
 * work shrink dramatically without changing the visual experience for the
 * user (placeholder is invisible / minimum height to preserve scroll).
 *
 * Once mounted, children stay mounted (no flicker on re-entry).
 */
const InViewMount = ({
    children,
    // Large margin so the chunk downloads and the section mounts well BEFORE
    // it scrolls into view. Without this, the placeholder is swapped for
    // real content while it's already on screen, which grows the page below
    // the user and causes a visible scroll jump (browsers' overflow-anchor
    // can't reliably anchor across a child re-render).
    rootMargin = '1500px 0px',
    minHeight = '1px',
    fallback = null,
}) => {
    const ref = useRef(null);
    const [shouldMount, setShouldMount] = useState(false);

    useEffect(() => {
        if (shouldMount) return undefined;
        const node = ref.current;
        if (!node) return undefined;

        // SSR / very old browser fallback – mount immediately.
        if (typeof IntersectionObserver === 'undefined') {
            setShouldMount(true);
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setShouldMount(true);
                    observer.disconnect();
                }
            },
            { rootMargin },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [shouldMount, rootMargin]);

    if (shouldMount) return children;
    return (
        <div ref={ref} style={{ minHeight }}>
            {fallback}
        </div>
    );
};

export default InViewMount;
