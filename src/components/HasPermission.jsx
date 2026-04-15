import React from 'react'
import { useSelector } from 'react-redux';

const HasPermission = ({permission,children,mode = "any"}) => {

    const {user} = useSelector((state) => state.auth)

    const userPermissions = user?.permissions || [];

    const isSuperAdmin = user?.role === "Super Admin"

    if(isSuperAdmin) return children;

    const requiredPermissions = Array.isArray(permission) ? permission : [permission]

    const hasAccess = mode === "all" ? requiredPermissions.every(p => userPermissions.includes(p)) : requiredPermissions.some(p => userPermissions.includes(p))

    if(hasAccess){
        return <>{children}</>
    }

    return null;
}

export default HasPermission