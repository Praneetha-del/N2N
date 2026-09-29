import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Eye } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';
import MaterialCard from './MaterialCard';
import FilterPanel from './FilterPanel';
import SearchBar from './SearchBar';

const MaterialGrid = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: '',
    year: '',
    semester: '',
    type: '',
    search: ''
  });

  // ✅ Get user's department from auth context
  const userDepartment = user?.department || '';

  useEffect(() => {
    if (userDepartment) {
      fetchMaterials();
    }
  }, [filters, userDepartment]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      // ✅ Backend will automatically filter by department
      const params = new URLSearchParams();
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.year) params.append('year', filters.year);
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/api/materials?${params.toString()}`);
      
      // ✅ Backend already filters by department, so no need to filter again
      setMaterials(response.data.data || []);
      
      if (response.data.data?.length === 0) {
        toast.success(`No materials found for ${userDepartment} department`);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load materials');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setFilters(prev => ({ ...prev, search: query }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Department Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800">
          📚 Materials for {userDepartment} Department
        </h3>
        <p className="text-sm text-blue-600">
          Showing {materials.length} materials available for your department
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchBar onSearch={handleSearch} />
        </div>
        <div>
          <FilterPanel onFilterChange={handleFilterChange} />
        </div>
      </div>

      {/* Materials Grid */}
      {materials.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-700">No Materials Found</h3>
          <p className="text-gray-500 mt-2">
            No materials have been uploaded for {userDepartment} department yet.
          </p>
          {user?.role === 'ROLE_TEACHER' && (
            <button 
              onClick={() => window.location.href = '/upload'}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upload Your First Material
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialGrid;