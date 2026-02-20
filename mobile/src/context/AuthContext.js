import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAuth();
    }, []);

    const loadAuth = async () => {
        try {
            const savedToken = await SecureStore.getItemAsync('authToken');
            const savedUser = await SecureStore.getItemAsync('authUser');
            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            }
        } catch (e) {
            console.log('Error loading auth:', e);
        } finally {
            setLoading(false);
        }
    };

    const loginUser = async (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        await SecureStore.setItemAsync('authToken', authToken);
        await SecureStore.setItemAsync('authUser', JSON.stringify(userData));
    };

    const logout = async () => {
        setUser(null);
        setToken(null);
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('authUser');
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ user, token, loading, isAuthenticated, loginUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
