import React, { Children } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({children}) => {

    const {isAuthenticated,loading} = useSelector((state) => state.auth)

    const location = useLocation();

    if(loading){
        return <div>Loading...</div>;
    }

    if(!isAuthenticated){
        return <Navigate to ="/sign-in"/>
    }
  return children
}

export default ProtectedRoute;