import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (role && user.role !== role) {
        // Handle role specific redirection with path formatting
        const rolePath = user.role === 'Swachhta Mitra' ? 'swachhta-mitra' : user.role;
        return <Navigate to={`/${rolePath}/dashboard`} />;
    }

    return children;
};

export default ProtectedRoute;
