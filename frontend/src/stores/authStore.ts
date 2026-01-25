import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatarUrl?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
}

interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
}

export const useAuth = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (email: string, password: string) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/login', { email, password });
                    const { user, accessToken, refreshToken } = response.data.data;

                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);

                    set({
                        user,
                        accessToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    toast.success('Login successful!');
                } catch (error: any) {
                    set({ isLoading: false });
                    toast.error(error.response?.data?.error?.message || 'Login failed');
                    throw error;
                }
            },

            register: async (data: RegisterData) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/register', data);
                    const { user, accessToken, refreshToken } = response.data.data;

                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);

                    set({
                        user,
                        accessToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    toast.success('Registration successful!');
                } catch (error: any) {
                    set({ isLoading: false });
                    toast.error(error.response?.data?.error?.message || 'Registration failed');
                    throw error;
                }
            },

            logout: () => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                });
                toast.success('Logged out successfully');
            },

            fetchUser: async () => {
                try {
                    const response = await api.get('/auth/me');
                    set({ user: response.data.data.user, isAuthenticated: true });
                } catch (error) {
                    set({ user: null, isAuthenticated: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
