import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FileText, Search, Filter, X, BookOpen, Layers } from 'lucide-react';
import materialService from '../../services/materialService';
import MaterialCard from '../../components/materials/MaterialCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';

const MyMaterials = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, blocked

  useEffect(() => {
    fetchMaterials();
  }, [filter]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = {
        status: filter === 'all' ? undefined : filter,
        size: 50
      };
      
      const response = await materialService.getMyMaterials(params);
      
      let materialData = [];
      if (response && response.success) {
        const data = response.data;
        if (Array.isArray(data)) {
          materialData = data;
        } else if (data && data.content && Array.isArray(data.content)) {
          materialData = data.content;
        } else if (data && typeof data === 'object') {
          const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            materialData = possibleArrays[0];
          }
        }
      } else if (Array.isArray(response)) {
        materialData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        materialData = response.data;
      }
      
      setMaterials(Array.isArray(materialData) ? materialData : []);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialUpdate = () => {
    fetchMaterials();
  };

  const filteredMaterials = materials.filter(material => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      material.title?.toLowerCase().includes(search) ||
      material.subject?.toLowerCase().includes(search) ||
      material.description?.toLowerCase().includes(search) ||
      material.subjectName?.toLowerCase().includes(search)
    );
  });

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#163A70]">My Published Materials</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your uploaded documents and video lectures ({materials.length} total)
          </p>
        </div>
        <Link
          to="/teacher/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={16} />
          Upload New Material
        </Link>
      </div>

      {/* Search and Status Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Search by title, subject name, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Statuses
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                filter === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('BLOCKED')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                filter === 'BLOCKED'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Blocked
            </button>
          </div>
        </div>

        {searchTerm && (
          <p className="text-xs text-slate-500 pt-1">
            Found <span className="font-semibold text-slate-800">{filteredMaterials.length}</span> matching materials for "{searchTerm}"
          </p>
        )}
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {searchTerm ? "No matching materials found" : "No materials uploaded yet"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {searchTerm ? "Try searching with a different term or clear the filter." : "Start sharing lecture notes and resources with your department students."}
          </p>
          {!searchTerm && (
            <Link
              to="/teacher/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={15} /> Upload First Material
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((material, index) => (
            <motion.div
              key={material.id || index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <MaterialCard material={material} onUpdate={handleMaterialUpdate} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMaterials;