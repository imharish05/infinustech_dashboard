import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const HasPermission = ({ permission, children, mode = "any", redirect = false }) => {
    const { user, isInitialized } = useSelector((state) => state.auth);

    if (!isInitialized) return null;

    const userPermissions = user?.permissions || [];
    const userRole = user?.role?.toLowerCase();
    
    // Bypass for Admins
    const hasBypass = userRole === "super admin" || userRole === "admin";
    
    const requiredPermissions = Array.isArray(permission) ? permission : [permission];
    const hasAccess = hasBypass || (mode === "all" 
        ? requiredPermissions.every(p => userPermissions.includes(p)) 
        : requiredPermissions.some(p => userPermissions.includes(p)));

    if (hasAccess) {
        return <>{children}</>;
    }

    // IF NO ACCESS:
    if (redirect) {
        // This is for App.js - forces the page to change
        return <Navigate to="/access-denied" replace />;
    }

    // This is for Sidebar/Buttons - just makes the element invisible
    return null;
}

export default HasPermission;