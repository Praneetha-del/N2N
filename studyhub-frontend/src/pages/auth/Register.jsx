import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, AlertCircle, Hash, Calendar, Briefcase, Building, Shield, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        rollNumber: '',
        employeeId: '',
        password: '',
        confirmPassword: '',
        role: 'STUDENT',
        department: 'IT',
        joiningYear: '2023',
        year: '',
        semester: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [adminDepartments, setAdminDepartments] = useState([]);

    const departments = ['IT', 'CSE', 'ECE', 'EEE', 'ME', 'CE'];

    const isSameDept = (d1, d2) => {
        if (!d1 || !d2) return false;
        const s1 = d1.trim().toLowerCase();
        const s2 = d2.trim().toLowerCase();
        if (s1 === s2) return true;
        if ((s1 === 'it' || s1.includes('information technology')) && (s2 === 'it' || s2.includes('information technology'))) return true;
        if ((s1 === 'cse' || s1.includes('computer science')) && (s2 === 'cse' || s2.includes('computer science'))) return true;
        if ((s1 === 'ece' || s1.includes('electronics')) && (s2 === 'ece' || s2.includes('electronics'))) return true;
        if ((s1 === 'eee' || s1.includes('electrical')) && (s2 === 'eee' || s2.includes('electrical'))) return true;
        if ((s1 === 'me' || s1.includes('mechanical')) && (s2 === 'me' || s2.includes('mechanical'))) return true;
        if ((s1 === 'ce' || s1.includes('civil')) && (s2 === 'ce' || s2.includes('civil'))) return true;
        return false;
    };

    const isDepartmentAdminOccupied = (dept) => {
        if (!dept) return false;
        return adminDepartments.some(d => isSameDept(d, dept));
    };

    const fetchAdminDepartments = async () => {
        try {
            const res = await api.get('/auth/admin-departments');
            if (res.data?.success && Array.isArray(res.data.data)) {
                setAdminDepartments(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch admin departments:', err);
        }
    };

    useEffect(() => {
        fetchAdminDepartments();
    }, []);

    const handleRoleChange = (newRole) => {
        setFormData(prev => {
            let nextDept = prev.department;
            if (newRole === 'ADMIN' && isDepartmentAdminOccupied(nextDept)) {
                const available = departments.find(d => !isDepartmentAdminOccupied(d));
                if (available) {
                    nextDept = available;
                }
            }
            return { ...prev, role: newRole, department: nextDept };
        });
        if (errors.department) {
            setErrors(prev => ({ ...prev, department: '' }));
        }
    };

    const yearOptions = () => {
        const currentYear = new Date().getFullYear();
        const options = [];
        for (let year = 2020; year <= currentYear + 5; year++) {
            options.push(year.toString());
        }
        return options;
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!formData.department) {
            newErrors.department = 'Department is required';
        } else if (formData.role === 'ADMIN' && isDepartmentAdminOccupied(formData.department)) {
            newErrors.department = 'An Admin already exists for this department. Admin registration is not allowed.';
            toast.error('An Admin already exists for this department. Admin registration is not allowed.');
        }
        
        if (formData.role === 'STUDENT') {
            if (!formData.rollNumber) {
                newErrors.rollNumber = 'Roll number is required';
            } else if (formData.rollNumber.length < 5) {
                newErrors.rollNumber = 'Roll number must be at least 5 characters';
            }
            if (!formData.joiningYear) newErrors.joiningYear = 'Please select your joining year';
            if (!formData.year) newErrors.year = 'Please select your year';
            if (!formData.semester) newErrors.semester = 'Please select your semester';
        }
        
        if (formData.role === 'TEACHER') {
            if (!formData.employeeId) {
                newErrors.employeeId = 'Employee ID is required';
            } else if (formData.employeeId.length < 4) {
                newErrors.employeeId = 'Employee ID must be at least 4 characters';
            }
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const registrationData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                rollNumber: formData.role === 'STUDENT' ? formData.rollNumber : null,
                employeeId: formData.role === 'TEACHER' ? formData.employeeId : null,
                password: formData.password,
                role: formData.role,
                department: formData.department,
                branch: null,
                joiningYear: formData.role === 'STUDENT' ? parseInt(formData.joiningYear) : null,
                year: formData.role === 'STUDENT' ? parseInt(formData.year) : null,
                semester: formData.role === 'STUDENT' ? parseInt(formData.semester) : null,
            };

            const response = await api.post('/auth/register', registrationData);
            
            sessionStorage.setItem('registrationEmail', formData.email);
            
            const role = formData.role;
            
            if (role === 'STUDENT' || role === 'TEACHER') {
                toast.success('Verification code sent to your email');
                toast('After OTP verification, your account will be reviewed by admin.', { duration: 5000 });
                navigate('/verify-otp');
                return;
            }
            
            if (role === 'ADMIN') {
                toast.success('Verification code sent to your email');
                navigate('/verify-otp');
                return;
            }
            
            toast.success('Registration successful!');
            navigate('/login');
            
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed.';
            if (message.toLowerCase().includes('roll number')) {
                setErrors({ rollNumber: message });
                toast.error(message);
            } else if (message.toLowerCase().includes('employee id')) {
                setErrors({ employeeId: message });
                toast.error(message);
            } else if (message.toLowerCase().includes('email')) {
                setErrors({ email: message });
                toast.error(message);
            } else if (message.toLowerCase().includes('admin already exists') || message.toLowerCase().includes('admin registration is not allowed') || message.toLowerCase().includes('department') || message.toLowerCase().includes('administrator') || message.toLowerCase().includes('admin')) {
                setErrors({ department: message });
                toast.error(message);
                fetchAdminDepartments();
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 bg-slate-50">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-xl"
            >
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl shadow-sm text-white mb-4">
                            <GraduationCap size={28} />
                        </div>
                        <h1 className="text-2xl font-bold text-[#163A70] tracking-tight">Create an Account</h1>
                        <p className="text-sm text-slate-500 mt-1">Join StudyHub academic knowledge platform</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">First Name *</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all ${errors.firstName ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-200'}`}
                                        placeholder="John"
                                    />
                                </div>
                                {errors.firstName && <p className="mt-1 text-xs text-rose-600">{errors.firstName}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Last Name *</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all ${errors.lastName ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-200'}`}
                                    placeholder="Doe"
                                />
                                {errors.lastName && <p className="mt-1 text-xs text-rose-600">{errors.lastName}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Email Address *</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all ${errors.email ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-200'}`}
                                    placeholder="student@university.edu"
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Role Type *</label>
                            <div className="grid grid-cols-3 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => handleRoleChange('STUDENT')}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${formData.role === 'STUDENT' ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-semibold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                >
                                    <GraduationCap size={16} className={formData.role === 'STUDENT' ? 'text-blue-600' : 'text-slate-400'} />
                                    Student
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRoleChange('TEACHER')}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${formData.role === 'TEACHER' ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-semibold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                >
                                    <Briefcase size={16} className={formData.role === 'TEACHER' ? 'text-blue-600' : 'text-slate-400'} />
                                    Faculty
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRoleChange('ADMIN')}
                                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${formData.role === 'ADMIN' ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-semibold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                >
                                    <Shield size={16} className={formData.role === 'ADMIN' ? 'text-blue-600' : 'text-slate-400'} />
                                    Admin
                                </button>
                            </div>
                        </div>

                        {/* Department */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Department *</label>
                                {formData.role === 'ADMIN' && (
                                    <span className="text-[11px] font-medium text-amber-600">
                                        Exactly 1 Admin per Department
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all ${errors.department || (formData.role === 'ADMIN' && isDepartmentAdminOccupied(formData.department)) ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'}`}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => {
                                        const isOccupied = formData.role === 'ADMIN' && isDepartmentAdminOccupied(dept);
                                        return (
                                            <option key={dept} value={dept} disabled={isOccupied} className={isOccupied ? 'text-slate-400 bg-slate-50' : ''}>
                                                {dept} - Department of {dept} {isOccupied ? '(Admin already registered - Unavailable)' : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            {errors.department && <p className="mt-1 text-xs text-rose-600">{errors.department}</p>}
                            {formData.role === 'ADMIN' && isDepartmentAdminOccupied(formData.department) && (
                                <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
                                    <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-rose-800">Admin already exists for {formData.department}</p>
                                        <p className="text-rose-700 mt-0.5">An Admin already exists for this department. Admin registration is not allowed.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Student Specific Fields */}
                        {formData.role === 'STUDENT' && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Roll Number *</label>
                                        <div className="relative">
                                            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                name="rollNumber"
                                                value={formData.rollNumber}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all ${errors.rollNumber ? 'border-rose-300' : 'border-slate-200'}`}
                                                placeholder="e.g. 2024CS001"
                                            />
                                        </div>
                                        {errors.rollNumber && <p className="mt-1 text-xs text-rose-600">{errors.rollNumber}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Joining Year *</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <select
                                                name="joiningYear"
                                                value={formData.joiningYear}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all ${errors.joiningYear ? 'border-rose-300' : 'border-slate-200'}`}
                                            >
                                                <option value="">Select Year</option>
                                                {yearOptions().map(yr => (
                                                    <option key={yr} value={yr}>{yr}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.joiningYear && <p className="mt-1 text-xs text-rose-600">{errors.joiningYear}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Current Year *</label>
                                        <select
                                            name="year"
                                            value={formData.year}
                                            onChange={handleChange}
                                            className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all ${errors.year ? 'border-rose-300' : 'border-slate-200'}`}
                                        >
                                            <option value="">Select Year</option>
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                            <option value="3">3rd Year</option>
                                            <option value="4">4th Year</option>
                                        </select>
                                        {errors.year && <p className="mt-1 text-xs text-rose-600">{errors.year}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Semester *</label>
                                        <select
                                            name="semester"
                                            value={formData.semester}
                                            onChange={handleChange}
                                            className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all ${errors.semester ? 'border-rose-300' : 'border-slate-200'}`}
                                        >
                                            <option value="">Select Semester</option>
                                            <option value="1">Semester 1</option>
                                            <option value="2">Semester 2</option>
                                            <option value="3">Semester 3</option>
                                            <option value="4">Semester 4</option>
                                            <option value="5">Semester 5</option>
                                            <option value="6">Semester 6</option>
                                            <option value="7">Semester 7</option>
                                            <option value="8">Semester 8</option>
                                        </select>
                                        {errors.semester && <p className="mt-1 text-xs text-rose-600">{errors.semester}</p>}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Teacher Specific Fields */}
                        {formData.role === 'TEACHER' && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Employee ID *</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        name="employeeId"
                                        value={formData.employeeId}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all ${errors.employeeId ? 'border-rose-300' : 'border-slate-200'}`}
                                        placeholder="e.g., TCH2024001"
                                    />
                                </div>
                                {errors.employeeId && <p className="mt-1 text-xs text-rose-600">{errors.employeeId}</p>}
                            </div>
                        )}

                        {/* Password Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Password *</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-10 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all ${errors.password ? 'border-rose-300' : 'border-slate-200'}`}
                                        placeholder="Min. 6 chars"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Confirm Password *</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all ${errors.confirmPassword ? 'border-rose-300' : 'border-slate-200'}`}
                                        placeholder="Repeat password"
                                    />
                                </div>
                                {errors.confirmPassword && <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword}</p>}
                            </div>
                        </div>

                        {/* Security notice */}
                        <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0" />
                            <span>A 6-digit OTP code will be sent to your email to verify account ownership.</span>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all disabled:opacity-60 shadow-sm"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-600">
                            Already registered?{' '}
                            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;