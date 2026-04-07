import React from 'react';

const PlaceholderPage = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-fade-in-up">
            <div className="p-6 bg-cyan-500/10 rounded-full border border-cyan-500/20 shadow-glow-cyan">
                <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </div>
            <h1 style={{ color: 'var(--color-text-heading)' }} className="text-3xl font-heading font-bold ">{title}</h1>
            <p style={{ color: 'var(--color-text-muted)' }} className=" max-w-md text-lg">
                This module is currently under construction. <br />
                <span className="text-sm text-gray-500">Stay tuned for the next update.</span>
            </p>
        </div>
    );
};

export default PlaceholderPage;
