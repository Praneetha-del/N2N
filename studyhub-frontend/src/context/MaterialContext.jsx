import React, { createContext, useContext, useState, useCallback } from 'react';
import materialService from '../services/materialService';
import toast from 'react-hot-toast';

const MaterialContext = createContext(null);

export const useMaterials = () => {
  const context = useContext(MaterialContext);
  if (!context) {
    throw new Error('useMaterials must be used within a MaterialProvider');
  }
  return context;
};

export const MaterialProvider = ({ children }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    totalPages: 0,
    totalElements: 0,
  });

  const fetchMaterials = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const response = await materialService.getAllMaterials(filters);
      setMaterials(response.data.content || []);
      setPagination({
        page: response.data.pageable?.pageNumber || 0,
        size: response.data.pageable?.pageSize || 12,
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
      });
    } catch (error) {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadMaterial = useCallback(async (formData) => {
    try {
      const response = await materialService.uploadMaterial(formData);
      toast.success('Material uploaded successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to upload material');
      throw error;
    }
  }, []);

  const deleteMaterial = useCallback(async (id) => {
    try {
      await materialService.deleteMaterial(id);
      toast.success('Material deleted successfully');
      setMaterials(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      toast.error('Failed to delete material');
      throw error;
    }
  }, []);

  const updateMaterial = useCallback(async (id, formData) => {
    try {
      const response = await materialService.updateMaterial(id, formData);
      toast.success('Material updated successfully');
      setMaterials(prev => prev.map(m => m.id === id ? response.data : m));
      return response.data;
    } catch (error) {
      toast.error('Failed to update material');
      throw error;
    }
  }, []);

  const value = {
    materials,
    loading,
    pagination,
    fetchMaterials,
    uploadMaterial,
    deleteMaterial,
    updateMaterial,
  };

  return (
    <MaterialContext.Provider value={value}>
      {children}
    </MaterialContext.Provider>
  );
};