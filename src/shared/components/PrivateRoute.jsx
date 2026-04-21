import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../pages/Frontoffice/auth/context/AuthContext';
import { getToken } from '../../services/cookieUtils';
import AppLoader from './AppLoader';

/**
 * PrivateRoute
 * - wraps children and redirects to /signin when not authenticated
 * - supports optional `allowedRoles` prop (array of role strings)
 * - shows a loader when an access token exists but `currentUser` hasn't been rehydrated yet
 */
const PrivateRoute = ({ children, allowedRoles = null, redirectTo = '/signin' }) => {
    const { currentUser, isLoggedIn } = useAuth();
    const location = useLocation();

    // If there's an access token but currentUser is not set yet, show loader while rehydration happens
    const token = getToken();
    if (token && !isLoggedIn) {
        return <AppLoader />;
    }

    if (!isLoggedIn) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
        const role = (currentUser?.role || '').toString();
        const allowed = allowedRoles.map((r) => r.toString()).includes(role);
        if (!allowed) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default PrivateRoute;
