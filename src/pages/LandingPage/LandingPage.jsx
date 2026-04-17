import React, { Suspense, lazy, useEffect, useState } from 'react';
import Hero from '../../sections/Hero';

const Games = lazy(() => import('../../sections/Games'));
const Arena = lazy(() => import('../../sections/Arena'));
const Features = lazy(() => import('../../sections/Features'));
const Stats = lazy(() => import('../../sections/Stats'));
const TryChallenge = lazy(() => import('../../sections/TryChallenge'));
const CTA = lazy(() => import('../../sections/CTA'));

const LandingPage = () => {
    const [showBelowFold, setShowBelowFold] = useState(false);

    useEffect(() => {
        const reveal = () => setShowBelowFold(true);
        if ('requestIdleCallback' in window) {
            const id = window.requestIdleCallback(reveal, { timeout: 1200 });
            return () => window.cancelIdleCallback(id);
        }

        const id = window.setTimeout(reveal, 800);
        return () => window.clearTimeout(id);
    }, []);

    return (
        <>
            <Hero />
            {showBelowFold && (
                <Suspense fallback={null}>
                    <Games />
                    <Arena />
                    <Features />
                    <Stats />
                    <TryChallenge />
                    <CTA />
                </Suspense>
            )}
        </>
    );
};

export default LandingPage;

