import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { completeNavigationProgress } from '../navigation/progress';

const NavigationProgress = () => {
    const location = useLocation();

    useEffect(() => {
        completeNavigationProgress();
    }, [location.pathname, location.search, location.hash]);

    return null;
};

export default NavigationProgress;
