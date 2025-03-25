import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"

export const ProtectedRoute = ({ allowedGroups, redirectPath = "/login" }) => {
    const { isAuthenticated, userGroups = [], isLoading } = useAuth();

    if (isLoading) {
        return (""); 
    }
    
    const hasAccess = isAuthenticated && allowedGroups.some(group => userGroups.includes(group));
    
    if (!hasAccess) {
        return <Navigate to={redirectPath} replace />;
    }
    
    return <Outlet />;
};