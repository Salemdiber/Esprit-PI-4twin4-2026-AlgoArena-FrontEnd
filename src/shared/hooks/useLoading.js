/**
 * useLoading – Hook to consume LoadingContext
 */
import { useContext } from 'react';
import LoadingContext from '../context/LoadingContext';

const useLoading = () => {
    const ctx = useContext(LoadingContext);
    if (!ctx) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return ctx;
};

export default useLoading;
