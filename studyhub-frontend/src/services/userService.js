import api from './api';

const userService = {
  // ==================== PROFILE ====================
  
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');  // ✅ Removed /api prefix
      return response.data;
    } catch (error) {
      console.error('❌ getProfile error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (data) => {
    try {
      const response = await api.put('/users/profile', data);  // ✅ Removed /api prefix
      return response.data;
    } catch (error) {
      console.error('❌ updateProfile error:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (data) => {
    try {
      const response = await api.put('/users/change-password', data);  // ✅ Removed /api prefix
      return response.data;
    } catch (error) {
      console.error('❌ changePassword error:', error);
      throw error;
    }
  },

  // ==================== ADMIN SPECIFIC ====================
  
  // Get all users (admin only)
  getAllUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      const response = await api.get(`/admin/users?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ getAllUsers error:', error);
      throw error;
    }
  },

  // Get user by ID (admin only)
  getUserById: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ getUserById error:', error);
      throw error;
    }
  },

  // Update user by ID (admin only)
  updateUserById: async (id, data) => {
    try {
      const response = await api.put(`/admin/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ updateUserById error:', error);
      throw error;
    }
  },

  // Delete user (admin only)
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ deleteUser error:', error);
      throw error;
    }
  },

  // Approve user (admin only)
  approveUser: async (id) => {
    try {
      const response = await api.put(`/admin/users/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('❌ approveUser error:', error);
      throw error;
    }
  },

  // Reject user (admin only)
  rejectUser: async (id, reason) => {
    try {
      const response = await api.put(`/admin/users/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('❌ rejectUser error:', error);
      throw error;
    }
  },

  // ==================== TEACHER SPECIFIC ====================
  
  // Get teacher's own materials
  getMyMaterials: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      const response = await api.get(`/materials/my-materials?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ getMyMaterials error:', error);
      throw error;
    }
  },

  // ==================== STUDENT SPECIFIC ====================
  
  // Get student's enrolled courses
  getMyCourses: async () => {
    try {
      const response = await api.get('/students/courses');
      return response.data;
    } catch (error) {
      console.error('❌ getMyCourses error:', error);
      throw error;
    }
  },

  // ==================== UPLOAD AVATAR ====================
  
  // Upload profile picture
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ uploadAvatar error:', error);
      throw error;
    }
  },

  // Delete profile picture
  deleteAvatar: async () => {
    try {
      const response = await api.delete('/users/avatar');
      return response.data;
    } catch (error) {
      console.error('❌ deleteAvatar error:', error);
      throw error;
    }
  },
};

export default userService;