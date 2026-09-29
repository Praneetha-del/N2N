import axios from 'axios';

// ✅ Make sure this points to your running backend
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('🚀 Request:', config.method.toUpperCase(), config.url);
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('✅ Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ Error:', error.response?.status, error.config?.url);
        console.error('❌ Error data:', error.response?.data);
        
        if (error.response?.status === 401) {
            const isLoginPage = window.location.pathname === '/login';
            const isRegisterPage = window.location.pathname === '/register';
            const isForgotPasswordPage = window.location.pathname === '/forgot-password';
            
            if (!isLoginPage && !isRegisterPage && !isForgotPasswordPage) {
                localStorage.removeItem('token');
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;