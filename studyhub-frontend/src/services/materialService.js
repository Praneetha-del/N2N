import api from './api';

const materialService = {
  // Upload file material
  uploadMaterial: async (formData) => {
    try {
      const response = await api.post('/materials/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ uploadMaterial error:', error);
      throw error;
    }
  },

  // Upload YouTube video
  uploadYouTubeVideo: async (data) => {
    try {
      const response = await api.post('/materials/youtube', data);
      return response.data;
    } catch (error) {
      console.error('❌ uploadYouTubeVideo error:', error);
      throw error;
    }
  },

  // Get all materials
  getAllMaterials: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      const response = await api.get(`/materials?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ getAllMaterials error:', error);
      throw error;
    }
  },

  // Get material by ID
  getMaterialById: async (id) => {
    try {
      const response = await api.get(`/materials/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ getMaterialById error:', error);
      throw error;
    }
  },

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

  // Update material
  updateMaterial: async (id, data) => {
    try {
      const response = await api.put(`/materials/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ updateMaterial error:', error);
      throw error;
    }
  },

  // Delete material
  deleteMaterial: async (id) => {
    try {
      const response = await api.delete(`/materials/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ deleteMaterial error:', error);
      throw error;
    }
  },

 // Download material
downloadMaterial: async (id) => {
  try {
    const response = await api.get(`/materials/${id}/download`, {
      responseType: 'blob', // ✅ Important: Must be blob
    });
    return response.data;
  } catch (error) {
    console.error('❌ downloadMaterial error:', error);
    throw error;
  }
},

  // Search materials
  searchMaterials: async (query) => {
    try {
      const response = await api.get(`/materials/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('❌ searchMaterials error:', error);
      throw error;
    }
  },
};

export default materialService;