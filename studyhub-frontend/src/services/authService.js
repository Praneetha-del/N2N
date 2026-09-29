// studyhub-frontend/src/services/authService.js

import api from './api';

const authService = {
  // ✅ Updated login with role
  login: async (credentials) => {
    try {
      console.log('📤 Sending login request:', {
        username: credentials.username,
        role: credentials.role
      });
      
      const response = await api.post('/auth/login', {
        username: credentials.username,
        password: credentials.password,
        role: credentials.role || 'STUDENT'  // ✅ Include role
      });
      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('❌ Register error:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('❌ Get current user error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      console.error('❌ Refresh token error:', error);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      throw error;
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      console.error('❌ Reset password error:', error);
      throw error;
    }
  },

  verifyOTP: async (email, code) => {
    try {
      const response = await api.post('/auth/verify', { email, code });
      return response.data;
    } catch (error) {
      console.error('❌ Verify OTP error:', error);
      throw error;
    }
  },

  sendVerification: async (email) => {
    try {
      const response = await api.post('/auth/send-verification', { email });
      return response.data;
    } catch (error) {
      console.error('❌ Send verification error:', error);
      throw error;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await api.put('/auth/profile', data);
      return response.data;
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
  },

  getAdminDepartments: async () => {
    try {
      const response = await api.get('/auth/admin-departments');
      return response.data;
    } catch (error) {
      console.error('❌ Get admin departments error:', error);
      throw error;
    }
  },

  checkAdminDepartment: async (department) => {
    try {
      const response = await api.get(`/auth/check-admin?department=${encodeURIComponent(department)}`);
      return response.data;
    } catch (error) {
      console.error('❌ Check admin department error:', error);
      throw error;
    }
  },
};

export default authService;