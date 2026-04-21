/**
 * LoadingContext – Global loading state management
 * 
 * Provides:
 * - setGlobalLoading(boolean) – trigger AppLoader
 * - setRouteLoading(boolean) – trigger RouteLoader
 * - startLoading(message) / stopLoading() – with optional messages
 */
import React, { createContext, useState, useCallback } from 'react';

const LoadingContext = createContext({
    isGlobalLoading: false,
    isRouteLoading: false,
    loadingMessage: '',
    setGlobalLoading: () => { },
    setRouteLoading: () => { },
    startLoading: () => { },
    stopLoading: () => { },
});

export const LoadingProvider = ({ children }) => {
    const [isGlobalLoading, setIsGlobalLoading] = useState(false);
    const [isRouteLoading, setIsRouteLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const setGlobalLoading = useCallback((loading, message = '') => {
        setIsGlobalLoading(loading);
        setLoadingMessage(message);
    }, []);

    const setRouteLoading = useCallback((loading) => {
        setIsRouteLoading(loading);
    }, []);

    const startLoading = useCallback((message = '') => {
        setIsGlobalLoading(true);
        setLoadingMessage(message);
    }, []);

    const stopLoading = useCallback(() => {
        setIsGlobalLoading(false);
        setLoadingMessage('');
    }, []);

    return (
        <LoadingContext.Provider
            value={{
                isGlobalLoading,
                isRouteLoading,
                loadingMessage,
                setGlobalLoading,
                setRouteLoading,
                startLoading,
                stopLoading,
            }}
        >
            {children}
        </LoadingContext.Provider>
    );
};

export default LoadingContext;
