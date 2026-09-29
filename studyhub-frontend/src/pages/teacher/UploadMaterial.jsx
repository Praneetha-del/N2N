import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import materialService from '../../services/materialService';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { Upload, File, Loader2, AlertCircle, CheckCircle, Users, Video, Check, FileText } from 'lucide-react';
import { getSemestersForYear, isSemesterValidForYear } from '../../utils/constants';

const UploadMaterial = () => {
  const { user, userDepartment, userDepartmentId, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [uploadType, setUploadType] = useState('file');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [allCurriculums, setAllCurriculums] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingCurriculums, setLoadingCurriculums] = useState(false);
  const [isMapping, setIsMapping] = useState(false);
  const [mappingCompleted, setMappingCompleted] = useState(false);
  
  // Local state for department
  const [localDepartmentId, setLocalDepartmentId] = useState('');
  const [localDepartmentName, setLocalDepartmentName] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: '',
    departmentName: '',
    joiningYear: '',
    academicYear: '',
    semester: '',
    subjectId: '',
    subjectName: '',
    type: 'PDF',
    youTubeUrl: '',
    fileName: ''
  });

  useEffect(() => {
    const autoMapDepartment = async () => {
      const deptName = userDepartment || user?.department || '';
      const deptId = userDepartmentId || user?.departmentId || '';
      
      if (deptId) {
        setLocalDepartmentId(deptId);
        setLocalDepartmentName(deptName || '');
        setMappingCompleted(true);
        setFormData(prev => ({
          ...prev,
          departmentId: deptId,
          departmentName: deptName || ''
        }));
        return;
      }
      
      if (!deptName) return;
      
      setIsMapping(true);
      try {
        const response = await adminService.getPublicDepartments();
        if (response && response.success) {
          const departments = response.data || [];
          const found = departments.find(d => 
            d.name?.toLowerCase() === deptName?.toLowerCase() ||
            d.code?.toLowerCase() === deptName?.toLowerCase()
          );
          
          if (found) {
            setLocalDepartmentId(found.id);
            setLocalDepartmentName(found.name);
            setMappingCompleted(true);
            setFormData(prev => ({
              ...prev,
              departmentId: found.id,
              departmentName: found.name
            }));
            
            if (setUser) {
              setUser(prev => ({ 
                ...prev, 
                departmentId: found.id,
                department: found.name 
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error auto-mapping department:', error);
      } finally {
        setIsMapping(false);
      }
    };
    
    autoMapDepartment();
  }, [userDepartment, userDepartmentId, user, setUser]);

  useEffect(() => {
    const deptId = localDepartmentId || userDepartmentId || '';
    const deptName = localDepartmentName || userDepartment || '';
    if (deptId) {
      setFormData(prev => ({
        ...prev,
        departmentId: deptId,
        departmentName: deptName
      }));
    }
  }, [localDepartmentId, localDepartmentName, userDepartmentId, userDepartment]);

  useEffect(() => {
    const deptId = localDepartmentId || userDepartmentId || '';
    if (deptId) {
      fetchCurriculumsForDepartment();
    }
  }, [localDepartmentId, userDepartmentId]);

  useEffect(() => {
    if (formData.joiningYear && formData.academicYear && formData.semester) {
      fetchSubjectsFromBackend();
    } else {
      setSubjects([]);
    }
  }, [formData.joiningYear, formData.academicYear, formData.semester]);

  const fetchCurriculumsForDepartment = async () => {
    setLoadingCurriculums(true);
    try {
      const deptId = localDepartmentId || userDepartmentId || formData.departmentId;
      const deptName = localDepartmentName || userDepartment || formData.departmentName;
      
      const response = await adminService.getPublicCurriculums({ 
        departmentName: deptName,
        departmentId: deptId
      });
      
      if (response && response.success) {
        const data = response.data || [];
        setAllCurriculums(data);
        if (data.length === 1) {
          const curr = data[0];
          setFormData(prev => ({
            ...prev,
            joiningYear: curr.joiningYear?.toString() || '',
            academicYear: curr.academicYear?.toString() || '',
            semester: curr.semester?.toString() || ''
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching curriculum:', error);
    } finally {
      setLoadingCurriculums(false);
    }
  };

  const fetchSubjectsFromBackend = async () => {
    const { joiningYear, academicYear, semester } = formData;
    const joiningYearNum = parseInt(joiningYear);
    const academicYearNum = parseInt(academicYear);
    const semesterNum = parseInt(semester);
    
    if (isNaN(joiningYearNum) || isNaN(academicYearNum) || isNaN(semesterNum)) {
      setSubjects([]);
      return;
    }
    
    const deptId = localDepartmentId || userDepartmentId || formData.departmentId;
    const deptName = localDepartmentName || userDepartment || formData.departmentName;
    
    setLoadingSubjects(true);
    try {
      const params = {
        department: deptName,
        departmentId: deptId,
        departmentName: deptName,
        joiningYear: joiningYearNum,
        academicYear: academicYearNum,
        semester: semesterNum
      };
      
      const response = await adminService.getSubjectsByCurriculum(params);
      
      if (response && response.success && response.data) {
        const subjectData = response.data;
        let subjectList = [];
        if (subjectData.subjects && Array.isArray(subjectData.subjects)) {
          subjectList = subjectData.subjects;
        } else if (Array.isArray(subjectData)) {
          subjectList = subjectData;
        } else if (subjectData.subjectNames && Array.isArray(subjectData.subjectNames)) {
          subjectList = subjectData.subjectNames.map((name, index) => ({
            id: `sub-${index}`,
            name: name,
            subjectName: name
          }));
        }
        
        const normalized = subjectList.map((s, idx) => {
          if (typeof s === 'string') {
            return { id: `sub-${idx}-${s}`, name: s, subjectName: s };
          }
          const id = s.id || s._id || `sub-${idx}`;
          const name = s.subjectName || s.name || s.title || '';
          return { ...s, id, name, subjectName: name };
        });

        setSubjects(normalized);
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'academicYear') {
        if (value && prev.semester && !isSemesterValidForYear(prev.semester, value)) {
          newData.semester = '';
        }
      }
      if (name === 'joiningYear' || name === 'academicYear' || name === 'semester') {
        newData.subjectId = '';
        newData.subjectName = '';
        setSubjects([]);
      }
      return newData;
    });
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    const selectedSubject = subjects.find(s => s.id === subjectId || s._id === subjectId);
    setFormData(prev => ({
      ...prev,
      subjectId: subjectId,
      subjectName: selectedSubject ? (selectedSubject.subjectName || selectedSubject.name || '') : ''
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        file: file,
        fileName: file.name,
        type: file.type.includes('pdf') ? 'PDF' : 
              file.type.includes('ppt') ? 'PPT' : 
              file.type.includes('doc') ? 'DOC' : 'Other'
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }
    
    const deptId = localDepartmentId || userDepartmentId || formData.departmentId;
    const deptName = localDepartmentName || userDepartment || formData.departmentName;
    
    if (!deptName) {
      toast.error('Department not found');
      return;
    }
    if (!deptId) {
      toast.error('Department ID not mapped. Please refresh.');
      return;
    }
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
    if (!formData.subjectId && !formData.subjectName) {
      toast.error('Please select or enter a subject');
      return;
    }
    
    if (uploadType === 'file' && !selectedFile) {
      toast.error('Please select a file');
      return;
    }
    
    if (uploadType === 'youtube' && !formData.youTubeUrl) {
      toast.error('Please enter YouTube URL');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      let cleanDeptId = (deptId.includes(',') ? deptId.split(',')[0] : deptId).trim();
      let cleanDeptName = (deptName.includes(',') ? deptName.split(',')[0] : deptName).trim();
      
      const fieldsToSend = {
        title: formData.title,
        description: formData.description || '',
        department: cleanDeptName,
        departmentName: cleanDeptName,
        departmentId: cleanDeptId,
        joiningYear: formData.joiningYear,
        academicYear: formData.academicYear,
        year: formData.academicYear,
        semester: formData.semester,
        subjectId: formData.subjectId || '',
        subjectName: formData.subjectName || '',
        subject: formData.subjectName || '',
        type: formData.type || 'PDF',
        youTubeUrl: formData.youTubeUrl || ''
      };
      
      Object.keys(fieldsToSend).forEach(key => {
        if (fieldsToSend[key] !== null && fieldsToSend[key] !== undefined && fieldsToSend[key] !== '') {
          formDataToSend.append(key, fieldsToSend[key]);
        }
      });

      if (uploadType === 'file' && selectedFile) {
        formDataToSend.append('file', selectedFile);
      }

      const response = await materialService.uploadMaterial(formDataToSend);

      if (response.success) {
        toast.success('Material published successfully!');
        setFormData({
          title: '',
          description: '',
          departmentId: cleanDeptId,
          departmentName: cleanDeptName,
          joiningYear: '',
          academicYear: '',
          semester: '',
          subjectId: '',
          subjectName: '',
          type: 'PDF',
          youTubeUrl: '',
          fileName: ''
        });
        setSelectedFile(null);
        setSubjects([]);
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast.error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload material');
    } finally {
      setLoading(false);
    }
  };

  const yearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    for (let year = 2020; year <= currentYear + 1; year++) {
      options.push({ value: year.toString(), label: year.toString() });
    }
    return options;
  };

  const semesterOptions = getSemestersForYear(formData.academicYear);

  const academicYearOptions = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
  ];

  if (loading || isMapping) return <LoadingSpinner />;

  const deptId = localDepartmentId || userDepartmentId || formData.departmentId;
  const deptName = localDepartmentName || userDepartment || formData.departmentName;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#163A70]">Upload Study Material</h1>
          <p className="text-sm text-slate-500 mt-1">Publish lecture notes, question banks, lab manuals, and video lectures</p>
        </div>
        
        {/* Department Info Banner */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Users size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Designated Department</p>
              <p className="text-sm font-bold text-[#163A70]">{deptName || 'Not set'}</p>
            </div>
          </div>
          <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-1 rounded-full">
            Faculty Authorized
          </span>
        </div>

        {/* Upload Type Selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setUploadType('file')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
              uploadType === 'file'
                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText size={18} className={uploadType === 'file' ? 'text-blue-600' : 'text-slate-400'} />
            Document / File
          </button>
          <button
            type="button"
            onClick={() => setUploadType('youtube')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
              uploadType === 'youtube'
                ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-sm'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Video size={18} className={uploadType === 'youtube' ? 'text-rose-600' : 'text-slate-400'} />
            YouTube Lecture
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Material Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              placeholder="e.g., Unit 3 - Relational Database Normalization Notes"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              rows="3"
              placeholder="Brief summary of contents, key topics covered, syllabus unit..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Joining Year *</label>
              <select
                name="joiningYear"
                value={formData.joiningYear}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                required
              >
                <option value="">Select Year</option>
                {yearOptions().map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Academic Year *</label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                required
              >
                <option value="">Select Year</option>
                {academicYearOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Semester *</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                required
              >
                <option value="">Select Sem</option>
                {semesterOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Subject *</label>
              {loadingCurriculums || loadingSubjects ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  Loading subjects...
                </div>
              ) : formData.joiningYear && formData.academicYear && formData.semester ? (
                subjects.length > 0 ? (
                  <select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleSubjectChange}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.subjectName || sub.name}</option>
                    ))}
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      name="subjectName"
                      value={formData.subjectName}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          subjectName: e.target.value,
                          subjectId: `manual-${Date.now()}`
                        }));
                      }}
                      placeholder="Enter subject name manually"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>
                )
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-400">
                  Select Year and Semester first
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Format *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="PDF">PDF Document</option>
                <option value="PPT">Presentation (PPT)</option>
                <option value="DOC">Word Document (DOC)</option>
                <option value="VIDEO">Video Lecture</option>
              </select>
            </div>
          </div>

          {uploadType === 'file' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Upload File *</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50/20 transition-all cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.ppt,.pptx,.doc,.docx"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-800">{selectedFile.name}</p>
                        <p className="text-xs text-slate-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                      <p className="text-sm font-semibold text-slate-700">Click to upload file</p>
                      <p className="text-xs text-slate-400 mt-0.5">Supports PDF, PPTX, DOCX (Max 50MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {uploadType === 'youtube' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">YouTube Video URL *</label>
              <input
                type="url"
                name="youTubeUrl"
                value={formData.youTubeUrl}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !deptId}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Publish Material
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadMaterial;