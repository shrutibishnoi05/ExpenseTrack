import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Types for auth tokens
interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Token management helpers
const getTokens = (): AuthTokens | null => {
    if (typeof window === 'undefined') return null;
    const tokens = localStorage.getItem('auth_tokens');
    return tokens ? JSON.parse(tokens) : null;
};

const setTokens = (tokens: AuthTokens): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
};

const clearTokens = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('user');
};

// Request interceptor - add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const tokens = getTokens();
        if (tokens?.accessToken) {
            config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Wait for the ongoing refresh to complete
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    if (token) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const tokens = getTokens();
            if (!tokens?.refreshToken) {
                clearTokens();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
                    { refreshToken: tokens.refreshToken }
                );

                const newTokens = response.data.data;
                setTokens(newTokens);
                processQueue(null, newTokens.accessToken);

                originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError as Error, null);
                clearTokens();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// Export helpers for use in auth context
export { getTokens, setTokens, clearTokens };
export default api;
