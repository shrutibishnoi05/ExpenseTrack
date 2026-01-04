'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api, { setTokens, clearTokens, getTokens } from '@/lib/api';
import { User, LoginCredentials, SignupData, AuthTokens } from '@/types';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    signup: (data: SignupData) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        isLoading: true,
        isAuthenticated: false,
    });
    const router = useRouter();

    // Load user from localStorage on mount
    useEffect(() => {
        const loadUser = async () => {
            const tokens = getTokens();
            const savedUser = localStorage.getItem('user');

            if (tokens && savedUser) {
                try {
                    // Verify token is still valid
                    const response = await api.get('/auth/me');
                    const user = response.data.data.user;
                    localStorage.setItem('user', JSON.stringify(user));
                    setState({
                        user,
                        isLoading: false,
                        isAuthenticated: true,
                    });
                } catch {
                    // Token expired or invalid
                    clearTokens();
                    localStorage.removeItem('user');
                    setState({
                        user: null,
                        isLoading: false,
                        isAuthenticated: false,
                    });
                }
            } else {
                setState({
                    user: null,
                    isLoading: false,
                    isAuthenticated: false,
                });
            }
        };

        loadUser();
    }, []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        const response = await api.post('/auth/login', credentials);
        const { user, accessToken, refreshToken } = response.data.data;

        setTokens({ accessToken, refreshToken });
        localStorage.setItem('user', JSON.stringify(user));

        setState({
            user,
            isLoading: false,
            isAuthenticated: true,
        });

        router.push('/dashboard');
    }, [router]);

    const signup = useCallback(async (data: SignupData) => {
        const response = await api.post('/auth/signup', data);
        const { user, accessToken, refreshToken } = response.data.data;

        setTokens({ accessToken, refreshToken });
        localStorage.setItem('user', JSON.stringify(user));

        setState({
            user,
            isLoading: false,
            isAuthenticated: true,
        });

        router.push('/dashboard');
    }, [router]);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // Ignore logout errors
        } finally {
            clearTokens();
            localStorage.removeItem('user');
            setState({
                user: null,
                isLoading: false,
                isAuthenticated: false,
            });
            router.push('/login');
        }
    }, [router]);

    const updateUser = useCallback((data: Partial<User>) => {
        setState((prev) => {
            if (!prev.user) return prev;
            const updatedUser = { ...prev.user, ...data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return { ...prev, user: updatedUser };
        });
    }, []);

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                signup,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
