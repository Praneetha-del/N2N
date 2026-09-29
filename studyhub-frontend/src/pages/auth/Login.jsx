import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, Mail, Lock, Eye, EyeOff, Hash, AlertCircle, 
  Users, Shield, BookOpen, Briefcase, Loader2, ArrowRight,
  Sparkles, KeyRound, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const getDashboardPath = (role) => {
    if (!role) return '/';
    const normalizedRole = role.replace('ROLE_', '').toUpperCase();
    if (normalizedRole === 'ADMIN') return '/admin/dashboard';
    if (normalizedRole === 'TEACHER') return '/teacher/dashboard';
    return '/';
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const dashboardPath = getDashboardPath(user.role);
      navigate(dashboardPath, { replace: true });
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = selectedRole === 'STUDENT' ? 'Roll number is required' : (selectedRole === 'TEACHER' ? 'Employee ID is required' : 'Email is required');
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUserRole = (userData) => {
    const userRole = userData?.role || '';
    const selected = selectedRole.toUpperCase();
    
    const roleMatch = userRole.includes(selected) || 
                     userRole.includes('ROLE_' + selected) ||
                     userRole.replace('ROLE_', '') === selected;
    
    if (!roleMatch) {
      const roleNames = {
        'STUDENT': 'Student',
        'TEACHER': 'Teacher',
        'ADMIN': 'Admin'
      };
      const selectedName = roleNames[selected] || selected;
      toast.error(`You are not registered as a ${selectedName}. Please switch role.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    
    try {
      const result = await login({
        username: formData.username.trim(),
        password: formData.password,
        role: selectedRole
      });
      
      if (result.success && result.user) {
        const isValidRole = validateUserRole(result.user);
        if (!isValidRole) {
          localStorage.removeItem('token');
          setLoading(false);
          return;
        }
        
        const roleName = result.user?.role?.replace('ROLE_', '') || 'User';
        toast.success(`Welcome back, ${result.user.firstName || roleName}!`);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
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

  const fillDemoAdmin = () => {
    setSelectedRole('ADMIN');
    setFormData({
      username: 'admin@studyhub.com',
      password: 'Admin@123'
    });
    setErrors({});
    toast.success('Admin demo credentials populated');
  };

  const getPlaceholder = () => {
    if (selectedRole === 'STUDENT') return 'e.g. 2024CS001';
    if (selectedRole === 'TEACHER') return 'e.g. TCH2024001';
    return 'admin@studyhub.com';
  };

  const getFieldLabel = () => {
    if (selectedRole === 'STUDENT') return 'Roll Number';
    if (selectedRole === 'TEACHER') return 'Employee ID';
    return 'Email Address';
  };

  const getFieldIcon = () => {
    if (selectedRole === 'STUDENT') return <Hash className="w-5 h-5 text-slate-400" />;
    if (selectedRole === 'TEACHER') return <Briefcase className="w-5 h-5 text-slate-400" />;
    return <Mail className="w-5 h-5 text-slate-400" />;
  };

  const roles = [
    { id: 'STUDENT', label: 'Student', icon: Users },
    { id: 'TEACHER', label: 'Teacher', icon: BookOpen },
    { id: 'ADMIN', label: 'Admin', icon: Shield },
  ];

  if (authLoading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center p-8">
          <Loader2 className="animate-spin h-8 w-8 text-[#2563EB] mx-auto" />
          <p className="mt-3 text-sm text-slate-500 font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[88vh] flex items-center justify-center py-10 px-4 sm:px-6 bg-[#F8FAFC]">
      <div className="w-full max-w-md">
        
        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-7 sm:p-9">
          
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] mb-4 border border-blue-100">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-[#163A70] tracking-tight">
              Sign In to StudyHub
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Select your role and enter your account credentials
            </p>
          </div>

          {/* Role Switcher */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Select Role
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-[#F8FAFC] rounded-xl border border-slate-200">
              {roles.map((role) => {
                const isSelected = selectedRole === role.id;
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.id);
                      setFormData(prev => ({ ...prev, username: '' }));
                      setErrors({});
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      isSelected
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username / Identifier */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                {getFieldLabel()} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  {getFieldIcon()}
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={getPlaceholder()}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 text-sm rounded-lg border outline-none transition-all ${
                    errors.username 
                      ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-50' 
                      : 'border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50'
                  }`}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} />
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#2563EB] hover:text-[#163A70] font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-11 py-2.5 bg-white text-slate-900 text-sm rounded-lg border outline-none transition-all ${
                    errors.password 
                      ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-50' 
                      : 'border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-sm rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {selectedRole}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                Demo Credentials
              </span>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="text-[#2563EB] hover:text-[#163A70] font-medium text-xs transition-colors flex items-center gap-1 underline underline-offset-2"
              >
                <KeyRound className="w-3 h-3" />
                Fill Admin
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-[#EFF6FF] border border-blue-100 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span className="font-mono text-slate-800 font-medium">admin@studyhub.com</span>
                <span className="mx-2 text-slate-400">/</span>
                <span className="font-mono text-slate-800">Admin@123</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white text-[#163A70] text-[10px] font-semibold border border-blue-200">
                Admin
              </span>
            </div>
          </div>

          {/* Register Prompt */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-[#2563EB] hover:text-[#163A70] font-semibold transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;