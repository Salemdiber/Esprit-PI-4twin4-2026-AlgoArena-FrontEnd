import React from 'react';
import Hero from '../../sections/Hero';
import Games from '../../sections/Games';
import Arena from '../../sections/Arena';
import Features from '../../sections/Features';
import Stats from '../../sections/Stats';
import TryChallenge from '../../sections/TryChallenge';
import CTA from '../../sections/CTA';

// All landing sections are imported eagerly into a single chunk (~50 KB
// gzipped). Earlier we lazy-loaded them, but every chunk that arrived
// *after* the user started scrolling grew the page below the viewport and
// caused the browser scroll anchor to jump the user back upward (visible
// especially at desktop resolution where each section is shorter and
// chunks finish at noticeably different times). Eager mounting means the
// page reaches its final height in ONE synchronous pass before the user
// can scroll, so layout is stable for the rest of the session.
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
