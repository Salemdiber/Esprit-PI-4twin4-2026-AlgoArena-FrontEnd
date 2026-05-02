import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import Hero from '../../sections/Hero';
const Games = lazy(() => import('../../sections/Games'));
const Arena = lazy(() => import('../../sections/Arena'));
const Features = lazy(() => import('../../sections/Features'));
const Stats = lazy(() => import('../../sections/Stats'));
const TryChallenge = lazy(() => import('../../sections/TryChallenge'));
const CTA = lazy(() => import('../../sections/CTA'));

const SectionReserve = ({ minHeight }) => (
    <div style={{ minHeight }} aria-hidden="true" />
);

const DeferredSection = ({ children, minHeight }) => {
    const [isReady, setIsReady] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (isReady) return undefined;
        const node = ref.current;
        if (!node || typeof IntersectionObserver === 'undefined') {
            const timeoutId = window.setTimeout(() => setIsReady(true), 1200);
            return () => window.clearTimeout(timeoutId);
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) return;
                setIsReady(true);
                observer.disconnect();
            },
            { rootMargin: '900px 0px' },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [isReady]);

    return (
        <div ref={ref} style={{ minHeight }}>
            {isReady ? (
                <Suspense fallback={<SectionReserve minHeight={minHeight} />}>
                    {children}
                </Suspense>
            ) : null}
        </div>
    );
};

const LandingPage = () => {
    return (
        <>
            <Hero />
            <DeferredSection minHeight={780}>
                <Games />
            </DeferredSection>
            <DeferredSection minHeight={780}>
                <Arena />
            </DeferredSection>
            <DeferredSection minHeight={720}>
                <Features />
            </DeferredSection>
            <DeferredSection minHeight={360}>
                <Stats />
            </DeferredSection>
            <DeferredSection minHeight={920}>
                <TryChallenge />
            </DeferredSection>
            <DeferredSection minHeight={340}>
                <CTA />
            </DeferredSection>
        </>
    );
};

export default LandingPage;
