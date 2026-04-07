import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getToken } from '../../../../services/cookieUtils';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { reload } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = getToken();

      if (token) {
        await reload();
        setTimeout(() => {
          navigate('/');
        }, 1500); // Slight delay to let user enjoy the beautiful loader
      } else {
        navigate('/signin');
      }
    };

    handleOAuthCallback();
  }, [navigate, reload]);

  return (
    <div className="min-h-screen bg-(--color-bg-primary) flex flex-col items-center justify-center relative overflow-hidden font-body">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-(--color-orb-cyan) rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-(--color-orb-purple) rounded-full blur-[100px] animate-blob"></div>
      </div>

      <div className="relative z-10 glass-panel p-12 rounded-3xl border border-(--color-border) flex flex-col items-center max-w-sm w-full shadow-[var(--shadow-dropdown)] backdrop-blur-xl transition-all duration-300">
        {/* Animated Rings Loader */}
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-400 animate-spin" style={{ animationDuration: '1s' }}></div>
          <div className="absolute inset-1 rounded-full border-b-2 border-l-2 border-purple-500 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
          <div className="absolute inset-3 rounded-full border-t-2 border-l-2 border-blue-400 animate-spin" style={{ animationDuration: '2s' }}></div>

          {/* Center Lock Icon / Logo */}
          <div className="absolute inset-0 flex items-center justify-center drop-shadow-[0_0_8px_var(--color-cyan-400)]">
            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2 mt-4">
          Authenticating
        </h2>

        <p className="text-(--color-text-muted) text-sm font-medium text-center animate-pulse">
          Establishing secure connection to cognitive cores...
        </p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
