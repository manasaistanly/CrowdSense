import axios from 'axios';

const BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/v1`;
console.log('🌐 API URL:', API_URL);

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // For cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        let token = localStorage.getItem('accessToken');

        // Fallback: Check auth-storage (Zustand persist) if raw token is missing
        if (!token) {
            try {
                const authStorage = localStorage.getItem('auth-storage');
                if (authStorage) {
                    const parsed = JSON.parse(authStorage);
                    if (parsed.state && parsed.state.accessToken) {
                        token = parsed.state.accessToken as string;
                        // Heal the raw key
                        localStorage.setItem('accessToken', token);
                    }
                }
            } catch (e) {
                // Ignore parse errors
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`📡 Requesting: ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken } = response.data.data;
                    localStorage.setItem('accessToken', accessToken);

                    // Retry original request
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
