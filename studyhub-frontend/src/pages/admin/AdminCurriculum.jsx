import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Building2,
  BookOpen,
  Calendar,
  Layers,
  User,
  RefreshCw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import Button from '../../components/common/Button';
import { getSemestersForYear, isSemesterValidForYear } from '../../utils/constants';

const AdminCurriculum = () => {
  const { user, userDepartment } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Data states
  const [departments, setDepartments] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  
  // Department mapping
  const currentDepartment = userDepartment || user?.department || 'IT';
  
  // Form state
  const [formData, setFormData] = useState({
    department: currentDepartment,
    joiningYear: '',
    academicYear: '',
    semester: '',
    subjectIds: [],
    subjectNames: []
  });
  
  // New subject input
  const [newSubjectName, setNewSubjectName] = useState('');
  const [editingCurriculum, setEditingCurriculum] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [currentDepartment]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [deptRes, currRes] = await Promise.all([
        adminService.getAllDepartments().catch((err) => {
          console.error('Failed to load departments:', err);
          return { data: [] };
        }),
        adminService.getAllCurriculums({ department: currentDepartment }).catch((err) => {
          console.error('Failed to load curriculums:', err);
          return { data: [] };
        })
      ]);

      const depts = Array.isArray(deptRes) ? deptRes : (deptRes?.data || []);
      setDepartments(depts);
      
      const currs = Array.isArray(currRes) ? currRes : (currRes?.data || []);
      setCurriculums(currs);
    } catch (error) {
      console.error('Error loading curriculum data:', error);
      toast.error('Failed to load curriculum data');
    } finally {
      setLoading(false);
    }
  };

  const refreshCurriculums = async () => {
    try {
      setLoading(true);
      const currRes = await adminService.getAllCurriculums({ department: currentDepartment });
      const currs = Array.isArray(currRes) ? currRes : (currRes?.data || []);
      setCurriculums(currs);
      toast.success('Curriculum list refreshed');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'academicYear') {
        if (value && prev.semester && !isSemesterValidForYear(prev.semester, value)) {
          next.semester = '';
        }
      }
      return next;
    });
  };

  // Add subject to the current curriculum being configured
  const handleAddNewSubject = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    const trimmed = newSubjectName.trim();
    if (!trimmed) {
      toast.error('Please enter a subject name');
      return;
    }

    // Check for duplicate within the current curriculum
    const exists = formData.subjectNames?.some(
      name => name.toLowerCase().trim() === trimmed.toLowerCase()
    );
    if (exists) {
      toast.error(`Subject "${trimmed}" is already added to this curriculum`);
      return;
    }

    const newId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setFormData(prev => ({
      ...prev,
      subjectIds: [...(prev.subjectIds || []), newId],
      subjectNames: [...(prev.subjectNames || []), trimmed]
    }));
    
    setNewSubjectName('');
    toast.success(`Added "${trimmed}" to curriculum`);
  };

  // Remove subject from the current curriculum
  const handleRemoveSubject = (indexToRemove) => {
    setFormData(prev => {
      const updatedNames = prev.subjectNames.filter((_, idx) => idx !== indexToRemove);
      const updatedIds = prev.subjectIds ? prev.subjectIds.filter((_, idx) => idx !== indexToRemove) : [];
      return {
        ...prev,
        subjectNames: updatedNames,
        subjectIds: updatedIds
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.joiningYear) {
      toast.error('Please select joining year');
      return;
    }
    if (!formData.academicYear) {
      toast.error('Please select academic year');
      return;
    }
    if (!formData.semester) {
      toast.error('Please select semester');
      return;
    }
    if (!formData.subjectNames || formData.subjectNames.length === 0) {
      toast.error('Please add at least one subject for this curriculum');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        department: currentDepartment,
        departmentName: currentDepartment,
        joiningYear: parseInt(formData.joiningYear),
        academicYear: formData.academicYear,
        semester: parseInt(formData.semester),
        subjectIds: formData.subjectIds || [],
        subjectNames: formData.subjectNames || [],
        active: true
      };

      let response;
      if (editingCurriculum) {
        response = await adminService.updateCurriculum(editingCurriculum.id, payload);
      } else {
        response = await adminService.createCurriculum(payload);
      }

      if (response && response.success) {
        toast.success(editingCurriculum ? 'Curriculum updated successfully!' : 'Curriculum created successfully!');
        resetForm();
        refreshCurriculums();
      } else {
        toast.error(response?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving curriculum:', error);
      toast.error(error.response?.data?.message || 'Failed to save curriculum');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (curriculum) => {
    setEditingCurriculum(curriculum);
    setFormData({
      department: curriculum.department || currentDepartment,
      joiningYear: curriculum.joiningYear?.toString() || '',
      academicYear: curriculum.academicYear || '',
      semester: curriculum.semester?.toString() || '',
      subjectIds: curriculum.subjectIds ? [...curriculum.subjectIds] : [],
      subjectNames: curriculum.subjectNames ? [...curriculum.subjectNames] : []
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this curriculum?')) return;
    
    try {
      setCurriculums(prev => prev.filter(c => c.id !== id && c._id !== id));
      const response = await adminService.deleteCurriculum(id);
      if (response && response.success) {
        toast.success('Curriculum deleted successfully');
        refreshCurriculums();
      } else {
        toast.error(response?.message || 'Failed to delete curriculum');
        refreshCurriculums();
      }
    } catch (error) {
      console.error('Error deleting curriculum:', error);
      toast.error('Failed to delete curriculum');
      refreshCurriculums();
    }
  };

  const resetForm = () => {
    setFormData({
      department: currentDepartment,
      joiningYear: '',
      academicYear: '',
      semester: '',
      subjectIds: [],
      subjectNames: []
    });
    setEditingCurriculum(null);
    setShowForm(false);
    setNewSubjectName('');
  };

  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };

  const yearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    for (let year = 2020; year <= currentYear + 5; year++) {
      options.push({ value: year.toString(), label: year.toString() });
    }
    return options;
  };

  const academicYearOptions = [
    { value: '1st Year', label: '1st Year' },
    { value: '2nd Year', label: '2nd Year' },
    { value: '3rd Year', label: '3rd Year' },
    { value: '4th Year', label: '4th Year' },
  ];

  const semesterOptions = getSemestersForYear(formData.academicYear);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#163A70] text-xs font-semibold border border-blue-100 mb-2">
            <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>{currentDepartment} Department</span>
          </div>
          <h1 className="text-2xl font-bold text-[#163A70]">Curriculum Architecture</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure joining years, academic sessions, semesters, and subject assignments for {currentDepartment}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshCurriculums}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button 
            onClick={() => {
              if (showForm) resetForm();
              else openNewForm();
            }}
            className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            <span>{showForm ? 'Close Form' : 'Add Curriculum'}</span>
          </button>
        </div>
      </div>

      {/* Curriculum Form (Expandable) */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-[#163A70]">
                {editingCurriculum ? 'Edit Curriculum Mapping' : 'Create New Curriculum Mapping'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {editingCurriculum ? 'Update batch details and subject syllabus' : 'Define new batch syllabus and assign subjects'}
              </p>
            </div>
            <button 
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50"
            >
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Department */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Assigned Department
                </label>
                <div className="w-full px-3.5 py-2.5 border border-blue-200 rounded-lg flex items-center gap-2 bg-[#EFF6FF] text-[#163A70]">
                  <Building2 className="w-4 h-4 text-[#2563EB]" />
                  <span className="font-semibold text-sm">{currentDepartment}</span>
                  <span className="text-xs text-[#2563EB] font-bold ml-auto">Locked to Admin</span>
                </div>
              </div>

              {/* Joining Year */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Joining Year (Batch) <span className="text-rose-500">*</span>
                </label>
                <select
                  name="joiningYear"
                  value={formData.joiningYear}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none"
                  required
                >
                  <option value="">Select Joining Year</option>
                  {yearOptions().map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} Batch
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Academic Year */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Academic Year <span className="text-rose-500">*</span>
                </label>
                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none"
                  required
                >
                  <option value="">Select Academic Year</option>
                  {academicYearOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Semester <span className="text-rose-500">*</span>
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none"
                  required
                >
                  <option value="">Select Semester</option>
                  {semesterOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add Subject to this Curriculum */}
            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Add Subject to this Curriculum
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewSubject(e);
                    }
                  }}
                  placeholder="Enter subject name (e.g. Data Structures, Cloud Computing)"
                  className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={handleAddNewSubject}
                  disabled={submitting || !newSubjectName.trim()}
                  className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={16} /> Add Subject
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Type a subject title and press Enter or click "Add Subject" to include it in this curriculum.
              </p>
            </div>

            {/* Curriculum's Configured Subjects List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Subjects in this Curriculum <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-[#2563EB] font-bold">
                  {(formData.subjectNames?.length || 0)} subject(s) added
                </span>
              </div>
              
              {(!formData.subjectNames || formData.subjectNames.length === 0) ? (
                <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center bg-[#F8FAFC]">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="font-semibold text-slate-700 text-sm">No subjects added for this curriculum yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Use the "Add Subject" field above to specify the subjects taught in this semester.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl p-4 bg-[#F8FAFC]/50 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {formData.subjectNames.map((subjectName, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-3 bg-white rounded-xl border border-blue-100 shadow-sm text-slate-800"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold truncate text-[#163A70]">
                            {subjectName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                          title="Remove subject"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button 
                type="submit" 
                disabled={submitting}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editingCurriculum ? 'Update Curriculum' : 'Save Curriculum'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Configured Curriculums Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#163A70]">
            Configured Curriculums for {currentDepartment} ({curriculums.length})
          </h2>
          <span className="text-xs text-slate-500">
            Department-wise Syllabus Mapping
          </span>
        </div>

        {curriculums.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#163A70] mb-1">No Curriculums Configured for {currentDepartment}</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
              Click the "Add Curriculum" button to create syllabus mappings for {currentDepartment} department.
            </p>
            <button
              onClick={openNewForm}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-semibold hover:bg-[#1D4ED8] shadow-sm transition-all"
            >
              <Plus size={16} /> Add Curriculum
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {curriculums.map((curriculum) => (
              <div 
                key={curriculum.id || curriculum._id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#163A70] border border-blue-100 mb-1.5">
                        {curriculum.department || currentDepartment}
                      </span>
                      <h3 className="text-base font-bold text-[#163A70]">
                        {curriculum.joiningYear ? `${curriculum.joiningYear} Batch • ` : ''}{curriculum.academicYear} • Sem {curriculum.semester}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(curriculum)}
                        className="p-1.5 text-slate-500 hover:text-[#2563EB] hover:bg-slate-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(curriculum.id || curriculum._id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Subjects ({curriculum.subjectNames?.length || curriculum.subjectIds?.length || 0}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(curriculum.subjectNames && curriculum.subjectNames.length > 0) ? (
                        curriculum.subjectNames.map((name, idx) => (
                          <span 
                            key={idx}
                            className="px-2.5 py-1 bg-[#F8FAFC] text-slate-700 rounded-md text-xs font-medium border border-slate-200"
                          >
                            {name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No subjects assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminCurriculum;