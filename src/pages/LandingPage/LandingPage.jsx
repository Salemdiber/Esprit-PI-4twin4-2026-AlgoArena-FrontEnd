import React, { Suspense, lazy } from 'react';
import Hero from '../../sections/Hero';
import Games from '../../sections/Games';
import Arena from '../../sections/Arena';
import Features from '../../sections/Features';
import Stats from '../../sections/Stats';
import TryChallenge from '../../sections/TryChallenge';
import CTA from '../../sections/CTA';

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

