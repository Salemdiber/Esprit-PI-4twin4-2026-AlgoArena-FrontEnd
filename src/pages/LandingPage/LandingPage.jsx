import React from 'react';
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
            <Games />
            <Arena />
            <Features />
            <Stats />
            <TryChallenge />
            <CTA />
        </>
    );
};

export default LandingPage;

