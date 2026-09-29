import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, BookOpen, Loader2, RefreshCw, Building2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import materialService from '../../services/materialService';
import MaterialCard from '../../components/materials/MaterialCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { getSemestersForYear, isSemesterValidForYear, normalizeAcademicYear, YEARS } from '../../utils/constants';

const normalizeYear = normalizeAcademicYear;

const Materials = () => {
  const { user, userDepartment, userDepartmentId, userJoiningYear, setUser } = useAuth();
  
  // State
  const [allMaterials, setAllMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('');
  const [selectedJoiningYear, setSelectedJoiningYear] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  // Curriculum and subjects
  const [allCurriculums, setAllCurriculums] = useState([]);
  const [departmentSubjectsList, setDepartmentSubjectsList] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [isMapping, setIsMapping] = useState(false);
  
  // Show filters tray
  const [showFilters, setShowFilters] = useState(false);

  // Set user department and joining year from profile
  useEffect(() => {
    const deptName = userDepartment || user?.department || '';
    const deptId = userDepartmentId || user?.departmentId || deptName;
    const jYear = userJoiningYear || user?.joiningYear || user?.batch || user?.admissionYear || '';
    
    setSelectedDepartmentId(deptId);
    setSelectedDepartmentName(deptName);
    if (jYear) {
      setSelectedJoiningYear(jYear.toString());
    }
  }, [user, userDepartment, userDepartmentId, userJoiningYear]);

  // Load Curriculums and Department Subjects
  const fetchCurriculumsAndSubjects = useCallback(async (deptName, deptId) => {
    if (!deptName) return;
    setLoadingFilters(true);
    try {
      // Fetch public curriculums strictly for this department
      let curRes = await adminService.getPublicCurriculums({ 
        department: deptName,
        departmentName: deptName,
        departmentId: deptId
      }).catch(() => null);
      
      let curriculumsList = (curRes && curRes.success && Array.isArray(curRes.data)) ? curRes.data : [];
      
      // Filter client-side strictly by department
      const deptLower = deptName.toLowerCase();
      curriculumsList = curriculumsList.filter(c => {
        const cDept = (c.department || c.departmentName || c.departmentId || '').toLowerCase();
        return cDept === deptLower || cDept.includes(deptLower) || deptLower.includes(cDept);
      });
      
      setAllCurriculums(curriculumsList);
      
      // Also try to get subjects from admin service if available
      try {
        const subRes = await adminService.getAllSubjects({ department: deptName });
        if (subRes && subRes.success && Array.isArray(subRes.data)) {
          const subs = subRes.data.filter(s => {
            const sDept = (s.department || '').toLowerCase();
            return !sDept || sDept === deptLower || sDept.includes(deptLower) || deptLower.includes(sDept);
          });
          setDepartmentSubjectsList(subs);
        }
      } catch (subErr) {
        // Optional endpoint
      }
    } catch (error) {
      console.error('Error fetching curriculum/subjects:', error);
      setAllCurriculums([]);
    } finally {
      setLoadingFilters(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDepartmentName) {
      fetchCurriculumsAndSubjects(selectedDepartmentName, selectedDepartmentId);
    }
  }, [selectedDepartmentName, selectedDepartmentId, fetchCurriculumsAndSubjects]);

  // Extract all distinct batches / joining years from configured curriculums
  const availableBatches = useMemo(() => {
    const batchSet = new Set();
    const deptLower = (selectedDepartmentName || userDepartment || user?.department || '').toLowerCase();

    allCurriculums.forEach(c => {
      const cDept = (c.department || c.departmentName || c.departmentId || '').toLowerCase();
      const matchDept = !deptLower || cDept === deptLower || cDept.includes(deptLower) || deptLower.includes(cDept);
      if (matchDept && c.joiningYear) {
        batchSet.add(c.joiningYear.toString());
      }
    });
    if (selectedJoiningYear) batchSet.add(selectedJoiningYear.toString());
    if (userJoiningYear) batchSet.add(userJoiningYear.toString());
    return Array.from(batchSet).sort((a, b) => b.localeCompare(a));
  }, [allCurriculums, selectedDepartmentName, userDepartment, user, selectedJoiningYear, userJoiningYear]);

  // Fetch all materials strictly for this department
  const fetchMaterials = useCallback(async () => {
    const dept = selectedDepartmentName || userDepartment || user?.department;
    if (!dept) return;

    setLoading(true);
    try {
      const response = await materialService.getAllMaterials({
        department: dept,
        size: 500
      });
      
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
      }
      
      // Strictly filter materials for this department
      const deptLower = dept.toLowerCase();
      const deptFilteredMaterials = materialData.filter(m => {
        const mDept = (m.department || m.departmentName || '').toLowerCase();
        return !mDept || mDept === deptLower || mDept.includes(deptLower) || deptLower.includes(mDept);
      });

      setAllMaterials(deptFilteredMaterials);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load materials');
      setAllMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDepartmentName, userDepartment, user]);

  useEffect(() => {
    if (selectedDepartmentName || userDepartment || user?.department) {
      fetchMaterials();
    }
  }, [fetchMaterials, selectedDepartmentName, userDepartment, user]);

  // Handle Joining Year / Batch change
  const handleJoiningYearChange = (year) => {
    setSelectedJoiningYear(year);
    setSelectedSubject('');
  };

  // Handle Academic Year change with validation
  const handleAcademicYearChange = (year) => {
    setSelectedAcademicYear(year);
    if (year && selectedSemester) {
      if (!isSemesterValidForYear(selectedSemester, year)) {
        setSelectedSemester('');
      }
    }
    setSelectedSubject('');
  };

  // Handle Semester change
  const handleSemesterChange = (sem) => {
    setSelectedSemester(sem);
    setSelectedSubject('');
  };

  // Dynamically compute available subjects strictly for the selected Batch, Year, and Semester of the user's department
  const availableSubjects = useMemo(() => {
    const subjectsMap = new Map();
    const targetDept = (selectedDepartmentName || userDepartment || user?.department || '').toLowerCase();
    const cleanJoiningYear = selectedJoiningYear ? selectedJoiningYear.toString() : '';
    const cleanYear = normalizeYear(selectedAcademicYear);
    const cleanSem = selectedSemester ? selectedSemester.toString() : '';

    if (!targetDept) return [];

    // 1. Strictly filter by Department
    let matchingCurriculums = allCurriculums.filter(c => {
      const cDept = (c.department || c.departmentName || c.departmentId || '').toLowerCase();
      return cDept === targetDept || cDept.includes(targetDept) || targetDept.includes(cDept);
    });

    // 2. Strictly filter by Joining Year / Batch
    if (cleanJoiningYear) {
      matchingCurriculums = matchingCurriculums.filter(c => 
        c.joiningYear && c.joiningYear.toString() === cleanJoiningYear
      );
    }

    // 3. Strictly filter by Academic Year
    if (cleanYear) {
      matchingCurriculums = matchingCurriculums.filter(c => 
        normalizeYear(c.academicYear) === cleanYear
      );
    }

    // 4. Strictly filter by Semester
    if (cleanSem) {
      matchingCurriculums = matchingCurriculums.filter(c => 
        c.semester?.toString() === cleanSem
      );
    }

    // Extract subjects from matching batch curriculums
    matchingCurriculums.forEach(curr => {
      if (Array.isArray(curr.subjectNames)) {
        curr.subjectNames.forEach((name, idx) => {
          if (name && name.trim()) {
            const key = name.trim().toLowerCase();
            const id = (curr.subjectIds && curr.subjectIds[idx]) || name.trim();
            subjectsMap.set(key, { id: id, name: name.trim() });
          }
        });
      }
    });

    // Also include subjects from materials matching the department, batch, year, and semester
    allMaterials.forEach(mat => {
      const matDept = (mat.department || mat.departmentName || '').toLowerCase();
      if (matDept && matDept !== targetDept && !matDept.includes(targetDept) && !targetDept.includes(matDept)) return;

      const matJoiningYear = mat.joiningYear ? mat.joiningYear.toString() : '';
      const matYear = normalizeYear(mat.academicYear || mat.year);
      const matSem = mat.semester ? mat.semester.toString() : '';

      if (cleanJoiningYear && matJoiningYear && matJoiningYear !== cleanJoiningYear) return;
      if (cleanYear && matYear && matYear !== cleanYear) return;
      if (cleanSem && matSem && matSem !== cleanSem) return;

      const name = mat.subjectName || mat.subject;
      if (name && name.trim()) {
        const key = name.trim().toLowerCase();
        if (!subjectsMap.has(key)) {
          subjectsMap.set(key, { id: mat.subjectId || name.trim(), name: name.trim() });
        }
      }
    });

    return Array.from(subjectsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allCurriculums, allMaterials, selectedDepartmentName, userDepartment, user, selectedJoiningYear, selectedAcademicYear, selectedSemester]);

  // If selected subject is no longer valid under new filters, reset it
  useEffect(() => {
    if (selectedSubject && availableSubjects.length > 0) {
      const exists = availableSubjects.some(
        s => s.id === selectedSubject || s.name.toLowerCase() === selectedSubject.toLowerCase()
      );
      if (!exists) {
        setSelectedSubject('');
      }
    }
  }, [availableSubjects, selectedSubject]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return allMaterials.filter(material => {
      // 1. Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesSearch = 
          material.title?.toLowerCase().includes(q) ||
          material.subject?.toLowerCase().includes(q) ||
          material.subjectName?.toLowerCase().includes(q) ||
          material.description?.toLowerCase().includes(q) ||
          material.uploadedByName?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // 2. Joining Year / Batch filter
      if (selectedJoiningYear && material.joiningYear) {
        if (material.joiningYear.toString() !== selectedJoiningYear.toString()) return false;
      }

      // 3. Academic Year filter
      if (selectedAcademicYear) {
        const matYear = normalizeYear(material.academicYear || material.year);
        const filterYear = normalizeYear(selectedAcademicYear);
        if (matYear && matYear !== filterYear) return false;
      }

      // 4. Semester filter
      if (selectedSemester) {
        const matSem = material.semester?.toString();
        if (matSem && matSem !== selectedSemester.toString()) return false;
      }

      // 5. Subject filter
      if (selectedSubject) {
        const selectedObj = availableSubjects.find(s => s.id === selectedSubject || s.name === selectedSubject);
        const targetName = (selectedObj ? selectedObj.name : selectedSubject).toLowerCase();
        const matSubName = (material.subjectName || material.subject || '').toLowerCase();
        const matSubId = material.subjectId || '';

        const matchesSubject = 
          matSubId === selectedSubject ||
          matSubName === targetName ||
          matSubName.includes(targetName);
        
        if (!matchesSubject) return false;
      }

      // 6. Format / Type filter
      if (selectedType) {
        const matType = (material.type || '').toUpperCase();
        if (matType !== selectedType.toUpperCase()) return false;
      }

      return true;
    });
  }, [allMaterials, searchTerm, selectedJoiningYear, selectedAcademicYear, selectedSemester, selectedSubject, selectedType, availableSubjects]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedAcademicYear('');
    setSelectedSemester('');
    setSelectedSubject('');
    setSelectedType('');
    // Reset to user's registered batch or empty
    const userBatch = userJoiningYear || user?.joiningYear || user?.batch || '';
    setSelectedJoiningYear(userBatch ? userBatch.toString() : '');
  };

  const hasActiveFilters = searchTerm || (selectedJoiningYear && selectedJoiningYear !== (userJoiningYear || user?.joiningYear || '').toString()) || selectedAcademicYear || selectedSemester || selectedSubject || selectedType;

  const academicYearOptions = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
  ];

  // Dynamic semester options constrained by selected Academic Year
  const semesterOptions = useMemo(() => {
    return getSemestersForYear(selectedAcademicYear);
  }, [selectedAcademicYear]);

  const typeOptions = ['PDF', 'PPT', 'DOC', 'VIDEO'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#163A70] text-xs font-semibold border border-blue-100 mb-2">
            <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>{selectedDepartmentName || userDepartment || 'Academic'} Department</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#163A70]">
            Study Materials & Lecture Notes
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Discover verified lecture notes, question banks, and learning materials curated by your faculty
          </p>
        </div>

        <button
          onClick={fetchMaterials}
          className="p-2.5 text-slate-500 hover:text-[#2563EB] hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors self-start sm:self-auto"
          title="Refresh List"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Search and Filters Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        
        {/* Quick Search Row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search materials by title, subject name, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] focus:bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${
              showFilters || hasActiveFilters
                ? 'bg-[#EFF6FF] text-[#2563EB] border-blue-200 font-semibold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter size={16} />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            )}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Filter Controls Tray (Always visible on desktop or when toggled) */}
        <div className="pt-3 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            
            {/* Batch / Joining Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Batch (Joining Year)
              </label>
              <select
                value={selectedJoiningYear}
                onChange={(e) => handleJoiningYearChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none font-medium"
              >
                <option value="">All Batches</option>
                {availableBatches.map(batch => (
                  <option key={batch} value={batch}>
                    {batch} Batch {batch === (userJoiningYear || user?.joiningYear || '').toString() ? '• My Batch' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Academic Year
              </label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => handleAcademicYearChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none"
              >
                <option value="">All Academic Years</option>
                {academicYearOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => handleSemesterChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none"
              >
                <option value="">All Semesters</option>
                {semesterOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              {loadingFilters ? (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563EB]" /> Loading subjects...
                </div>
              ) : (
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none"
                >
                  <option value="">All Subjects ({availableSubjects.length})</option>
                  {availableSubjects.map((sub, idx) => (
                    <option key={`${sub.id}-${idx}`} value={sub.name}>{sub.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Material Format */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Format
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none"
              >
                <option value="">All Formats</option>
                {typeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-[#163A70]">{filteredMaterials.length}</strong> of <strong className="text-slate-700">{allMaterials.length}</strong> material{allMaterials.length !== 1 ? 's' : ''}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-[#2563EB] hover:text-[#163A70] font-semibold underline underline-offset-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <LoadingSpinner />
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#EFF6FF] text-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <BookOpen size={32} />
          </div>
          <h3 className="text-lg font-bold text-[#163A70]">No Materials Found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Try adjusting or clearing your filters to see more results.'
              : 'No study materials have been uploaded for your department yet.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((material, index) => (
            <MaterialCard 
              key={material.id || index} 
              material={material} 
              onUpdate={fetchMaterials} 
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default Materials;