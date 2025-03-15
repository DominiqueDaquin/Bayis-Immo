// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "@/api/axios";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); 
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            
            fetchUserData(token);
        }
    }, []);

    
    const fetchUserData = async (token) => {
        try {
            const response = await axiosInstance.get("/auth/users/me/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(response.data); 
            setIsAuthenticated(true); 
        } catch (error) {
            console.error("Erreur lors de la récupération des informations de l'utilisateur:", error);
            logout(); 
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
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};