import React, { Suspense, lazy } from 'react';
import Hero from '../../sections/Hero';

const Games = lazy(() => import('../../sections/Games'));
const Arena = lazy(() => import('../../sections/Arena'));
const Features = lazy(() => import('../../sections/Features'));
const Stats = lazy(() => import('../../sections/Stats'));
const TryChallenge = lazy(() => import('../../sections/TryChallenge'));
const CTA = lazy(() => import('../../sections/CTA'));

const LandingPage = () => {
    return (
        <>
            <Hero />
            <Suspense fallback={null}>
                <Games />
                <Arena />
                <Features />
                <Stats />
                <TryChallenge />
                <CTA />
            </Suspense>
        </>
    );
};

export default LandingPage;

