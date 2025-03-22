// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "@/api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userDetail, setUserDetail] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userGroups, setUserGroups] = useState(null); // Initialisé à null pour indiquer que les données ne sont pas encore chargées
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchUserData(token);
        }
    }, []);


    const fetchUserData = async (token) => {
        try {
            const userResponse = await axiosInstance.get("/auth/users/me/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const id = userResponse.data.id;
            const detailUser = await axiosInstance.get(`/auth/users/${id}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            setUser(userResponse.data);
            setIsAuthenticated(true);
            setUserGroups(detailUser.data.groups || []);
            setUserDetail(detailUser.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des informations de l'utilisateur:", error);
            logout();
        } finally {
            setIsLoading(false); // Fin du chargement
        }
    };
    


    const login = async (email, password) => {
        try {
            const response = await axiosInstance.post("/auth/jwt/create/", {
                email,
                password,
            });
            const { access } = response.data;
            localStorage.setItem("token", access);
            await fetchUserData(access);
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
        setUserGroups(null); // Réinitialiser à null lors de la déconnexion
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, userGroups, userDetail, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};




