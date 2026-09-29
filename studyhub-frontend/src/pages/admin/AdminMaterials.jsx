import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Eye, EyeOff, Trash2, Download, RefreshCw, 
  FileText, Video, File, AlertCircle, X, CheckCircle, BookOpen,
  Calendar, Layers, Sparkles, ExternalLink, ShieldAlert
} from 'lucide-react';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/common/Button';
import { 
  getSemestersForYear, 
  isSemesterValidForYear, 
  normalizeAcademicYear, 
  YEARS 
} from '../../utils/constants';

const AdminMaterials = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Comprehensive filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    joiningYear: '',
    subject: '',
    academicYear: '',
    semester: '',
    type: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [actionType, setActionType] = useState('');

  const adminDepartment = user?.department || 'IT';

  // Load department subjects and curriculums for filter dropdowns
  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        let curRes = await adminService.getAllCurriculums({ department: adminDepartment }).catch(() => null);
        let currs = (curRes && curRes.success && Array.isArray(curRes.data)) ? curRes.data : (Array.isArray(curRes) ? curRes : []);
        
        if (currs.length === 0) {
          const publicRes = await adminService.getPublicCurriculums({ department: adminDepartment }).catch(() => null);
          if (publicRes && publicRes.success && Array.isArray(publicRes.data)) {
            const deptLower = (adminDepartment || '').toLowerCase();
            currs = publicRes.data.filter(c => {
              const cDept = (c.department || c.departmentName || c.departmentId || '').toLowerCase();
              return !cDept || cDept === deptLower || cDept.includes(deptLower) || deptLower.includes(cDept);
            });
          }
        }

        const subRes = await adminService.getAllSubjects({ department: adminDepartment }).catch(() => ({ data: [] }));
        const subs = Array.isArray(subRes) ? subRes : (subRes?.data || []);
        
        setCurriculums(currs);
        setSubjects(subs);
      } catch (err) {
        console.error('Failed to fetch subjects/curriculums for filter:', err);
      }
    };
    if (adminDepartment) {
      loadFiltersData();
    }
  }, [adminDepartment]);

  // Extract unique batch / joining years from curriculums
  const availableBatches = useMemo(() => {
    const batches = new Set();
    curriculums.forEach(c => {
      if (c.joiningYear) batches.add(c.joiningYear.toString());
    });
    return Array.from(batches).sort((a, b) => Number(b) - Number(a));
  }, [curriculums]);

  // Dynamic semester options constrained by selected Academic Year
  const semesterOptions = useMemo(() => {
    return getSemestersForYear(filters.academicYear);
  }, [filters.academicYear]);

  // Dynamically compute available subjects strictly for the selected Joining Year, Academic Year & Semester
  const availableSubjects = useMemo(() => {
    const subjectsMap = new Map();
    const cleanYear = normalizeAcademicYear(filters.academicYear);
    const cleanSem = filters.semester ? filters.semester.toString() : '';
    const cleanBatch = filters.joiningYear ? filters.joiningYear.toString() : '';

    // 1. From matching curriculums
    let matchingCurriculums = curriculums;
    if (cleanBatch) {
      matchingCurriculums = matchingCurriculums.filter(c => 
        c.joiningYear?.toString() === cleanBatch
      );
    }
    if (cleanYear) {
      matchingCurriculums = matchingCurriculums.filter(c => 
        normalizeAcademicYear(c.academicYear) === cleanYear
      );
    }
    if (cleanSem) {
      matchingCurriculums = matchingCurriculums.filter(c => 
        c.semester?.toString() === cleanSem
      );
    }

    matchingCurriculums.forEach(curr => {
      if (Array.isArray(curr.subjectNames)) {
        curr.subjectNames.forEach((name, idx) => {
          if (name && name.trim()) {
            const key = name.trim().toLowerCase();
            subjectsMap.set(key, { 
              id: (curr.subjectIds && curr.subjectIds[idx]) || name.trim(), 
              name: name.trim() 
            });
          }
        });
      }
    });

    // 2. From materials matching batch, year and semester
    materials.forEach(mat => {
      const matBatch = mat.joiningYear || mat.batch;
      const matYear = normalizeAcademicYear(mat.academicYear || mat.year);
      const matSem = mat.semester ? mat.semester.toString() : '';

      if (cleanBatch && matBatch && matBatch.toString() !== cleanBatch) return;
      if (cleanYear && matYear && matYear !== cleanYear) return;
      if (cleanSem && matSem && matSem !== cleanSem) return;

      const name = mat.subject || mat.subjectName;
      if (name && name.trim()) {
        const key = name.trim().toLowerCase();
        if (!subjectsMap.has(key)) {
          subjectsMap.set(key, { id: mat.subjectId || name.trim(), name: name.trim() });
        }
      }
    });

    // 3. ONLY if NO batch, NO year and NO semester are filtered, show department subjects
    if (!cleanBatch && !cleanYear && !cleanSem && subjects.length > 0) {
      subjects.forEach(sub => {
        const name = sub.subjectName || sub.name;
        if (name && name.trim()) {
          const key = name.trim().toLowerCase();
          if (!subjectsMap.has(key)) {
            subjectsMap.set(key, { id: sub.id || name.trim(), name: name.trim() });
          }
        }
      });
    }

    return Array.from(subjectsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [curriculums, subjects, materials, filters.joiningYear, filters.academicYear, filters.semester]);

  // Reset subject filter if it no longer exists in available subjects
  useEffect(() => {
    if (filters.subject && availableSubjects.length > 0) {
      const exists = availableSubjects.some(
        s => s.name.toLowerCase() === filters.subject.toLowerCase() || s.id === filters.subject
      );
      if (!exists) {
        setFilters(prev => ({ ...prev, subject: '' }));
      }
    }
  }, [availableSubjects, filters.subject]);

  useEffect(() => {
    fetchMaterials();
  }, [currentPage, filters.status, filters.joiningYear, filters.subject, filters.academicYear, filters.semester, filters.type]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllMaterials({
        page: currentPage,
        size: 12,
        status: filters.status || undefined,
        search: filters.search || undefined,
        subject: filters.subject || undefined,
        joiningYear: filters.joiningYear ? parseInt(filters.joiningYear) : undefined,
        year: filters.academicYear ? parseInt(filters.academicYear) : undefined,
        semester: filters.semester ? parseInt(filters.semester) : undefined,
        type: filters.type || undefined,
        department: adminDepartment
      });
      
      if (response && response.success) {
        const data = response.data;
        let list = data.content || (Array.isArray(data) ? data : []);
        
        // Client-side subject/batch/year/type filtering fallback if backend doesn't filter nested params
        if (filters.joiningYear) {
          list = list.filter(m => String(m.joiningYear || m.batch || '') === String(filters.joiningYear));
        }
        if (filters.subject) {
          const subLower = filters.subject.toLowerCase();
          list = list.filter(m => (m.subject || m.subjectName || '').toLowerCase().includes(subLower));
        }
        if (filters.academicYear) {
          list = list.filter(m => String(m.academicYear || m.year || '').includes(filters.academicYear));
        }
        if (filters.semester) {
          list = list.filter(m => String(m.semester) === String(filters.semester));
        }
        if (filters.type) {
          list = list.filter(m => (m.type || '').toUpperCase() === filters.type.toUpperCase());
        }

        setMaterials(list);
        setTotalElements(data.totalElements || list.length);
        setTotalPages(data.totalPages || 1);
      } else {
        setMaterials([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('fetchMaterials error:', error);
      setMaterials([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockMaterial = async (id, reason) => {
    try {
      await adminService.blockMaterial(id, reason);
      toast.success('Material blocked successfully');
      fetchMaterials();
    } catch (error) {
      toast.error('Failed to block material');
    }
    setShowDeleteDialog(false);
    setSelectedMaterial(null);
  };

  const handleUnblockMaterial = async (id) => {
    try {
      await adminService.unblockMaterial(id);
      toast.success('Material unblocked successfully');
      fetchMaterials();
    } catch (error) {
      toast.error('Failed to unblock material');
    }
    setShowDeleteDialog(false);
    setSelectedMaterial(null);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchMaterials();
  };

  const handleFilterChange = (key, value) => {
    if (key === 'academicYear') {
      const valid = isSemesterValidForYear(filters.semester, value);
      setFilters(prev => ({
        ...prev,
        academicYear: value,
        semester: valid ? prev.semester : '',
        subject: ''
      }));
      setCurrentPage(0);
      return;
    }

    if (key === 'joiningYear') {
      setFilters(prev => ({
        ...prev,
        joiningYear: value,
        subject: ''
      }));
      setCurrentPage(0);
      return;
    }

    if (key === 'semester') {
      setFilters(prev => ({
        ...prev,
        semester: value,
        subject: ''
      }));
      setCurrentPage(0);
      return;
    }

    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0);
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      status: '',
      joiningYear: '',
      subject: '',
      academicYear: '',
      semester: '',
      type: ''
    });
    setCurrentPage(0);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const getTypeBadge = (type) => {
    const t = (type || 'PDF').toUpperCase();
    if (t === 'VIDEO') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <Video size={12} /> Video
        </span>
      );
    }
    if (t === 'PDF') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <FileText size={12} /> PDF
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <File size={12} /> {t}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
        </span>
      );
    } else if (status === 'BLOCKED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Blocked
        </span>
      );
    }
    return <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs">{status || 'Active'}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-[#EFF6FF] text-[#163A70] text-xs font-bold uppercase tracking-wider border border-blue-100">
              {adminDepartment} Department
            </span>
            <span className="text-xs text-slate-400 font-medium">• Content Moderation</span>
          </div>
          <h1 className="text-2xl font-bold text-[#163A70]">Study Material Management</h1>
          <p className="text-sm text-slate-500">
            Monitor, inspect, and moderate all learning resources uploaded for your department
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchMaterials}
            className="p-2.5 text-slate-600 hover:text-[#2563EB] hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Main Search & Filters Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        
        {/* Quick Search Row */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search materials by title, keyword, or faculty name..."
              className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] focus:bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none transition-all"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => handleFilterChange('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-[#EFF6FF] text-[#2563EB] border-blue-200 font-semibold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter size={16} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-xs flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </form>

        {/* Expanded Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 border-t border-slate-100"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3.5">
                
                {/* Batch / Joining Year */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Batch / Year
                  </label>
                  <select
                    value={filters.joiningYear}
                    onChange={(e) => handleFilterChange('joiningYear', e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none"
                  >
                    <option value="">All Batches</option>
                    {availableBatches.map(b => (
                      <option key={b} value={b}>{b} Batch</option>
                    ))}
                  </select>
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Academic Year
                  </label>
                  <select
                    value={filters.academicYear}
                    onChange={(e) => handleFilterChange('academicYear', e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none"
                  >
                    <option value="">All Years</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Semester
                  </label>
                  <select
                    value={filters.semester}
                    onChange={(e) => handleFilterChange('semester', e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none"
                  >
                    <option value="">All Semesters</option>
                    {semesterOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Filter */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <select
                    value={filters.subject}
                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none"
                  >
                    <option value="">All Subjects ({availableSubjects.length})</option>
                    {availableSubjects.map((s, idx) => (
                      <option key={`${s.id}-${idx}`} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Material Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Format
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none"
                  >
                    <option value="">All Formats</option>
                    <option value="PDF">PDF Documents</option>
                    <option value="PPT">Presentations (PPT)</option>
                    <option value="DOC">Word Docs (DOC)</option>
                    <option value="VIDEO">Video Lectures</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Moderation Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active (Live)</option>
                    <option value="BLOCKED">Blocked (Hidden)</option>
                  </select>
                </div>

              </div>

              {activeFiltersCount > 0 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">
                    Filtering {materials.length} results
                  </span>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-[#2563EB] hover:text-[#163A70] font-semibold underline underline-offset-2 transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Materials List or Empty State */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <LoadingSpinner />
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <FileText size={32} className="text-[#2563EB]" />
          </div>
          <h3 className="text-lg font-bold text-[#163A70]">No Materials Available</h3>
          <p className="text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
            {activeFiltersCount > 0
              ? 'No study materials match the selected search criteria. Try modifying or clearing your filters.'
              : `There are currently no study materials uploaded for the ${adminDepartment} department.`}
          </p>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 bg-[#EFF6FF] hover:bg-blue-100 text-[#2563EB] rounded-lg text-sm font-semibold transition-colors"
            >
              Clear Active Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material, idx) => (
            <div
              key={material.id || idx}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Format Badge & Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  {getTypeBadge(material.type)}
                  {getStatusBadge(material.status)}
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-base text-[#163A70] line-clamp-1 mb-1">
                  {material.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {material.description || 'No description provided.'}
                </p>

                {/* Metadata tags */}
                <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Subject:</span>
                    <span className="font-semibold text-slate-800 line-clamp-1">{material.subject || material.subjectName || 'General'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Level:</span>
                    <span className="font-medium text-slate-700">Year {material.year || material.academicYear} • Sem {material.semester}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Faculty:</span>
                    <span className="font-medium text-slate-700">{material.uploadedByName || material.uploaderName || 'Faculty Member'}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-2 flex items-center justify-between gap-2">
                {material.fileUrl ? (
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#163A70] transition-colors"
                  >
                    <Download size={14} /> Download File
                  </a>
                ) : material.youTubeUrl ? (
                  <a
                    href={material.youTubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                  >
                    <ExternalLink size={14} /> Watch Lecture
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400">No external link</span>
                )}

                <div className="flex items-center gap-1">
                  {material.status === 'ACTIVE' ? (
                    <button
                      onClick={() => {
                        setSelectedMaterial(material);
                        setActionType('block');
                        setShowDeleteDialog(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1"
                      title="Block from students"
                    >
                      <EyeOff size={13} /> Block
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedMaterial(material);
                        setActionType('unblock');
                        setShowDeleteDialog(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1"
                      title="Restore visibility"
                    >
                      <Eye size={13} /> Unblock
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Previous
          </button>
          <span className="text-xs text-slate-600 font-medium px-2">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Next
          </button>
        </div>
      )}

      {/* Action Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title={actionType === 'block' ? 'Block Study Material' : 'Restore Study Material'}
        message={
          actionType === 'block'
            ? `Are you sure you want to block "${selectedMaterial?.title}"? It will no longer be visible to students.`
            : `Are you sure you want to unblock "${selectedMaterial?.title}"? It will be made visible to students.`
        }
        confirmLabel={actionType === 'block' ? 'Block Material' : 'Unblock Material'}
        confirmVariant={actionType === 'block' ? 'danger' : 'success'}
        onConfirm={() => {
          if (actionType === 'block') {
            handleBlockMaterial(selectedMaterial?.id, 'Blocked by administrator');
          } else {
            handleUnblockMaterial(selectedMaterial?.id);
          }
        }}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedMaterial(null);
          setActionType('');
        }}
      />

    </div>
  );
};

export default AdminMaterials;