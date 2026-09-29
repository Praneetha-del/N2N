import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  BookOpen, 
  Upload, 
  User, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard,
  Users, 
  FileText, 
  Settings, 
  GraduationCap, 
  MessageSquare, 
  ChevronDown, 
  Shield, 
  Building2,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { 
    user, 
    isAuthenticated, 
    isAdmin, 
    isTeacher, 
    isStudent, 
    logout,
    userDepartment 
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isDropdownOpen && !e.target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const getNavLinks = () => {
    const links = [];

    if (isAuthenticated) {
      links.push({
        to: '/',
        label: 'Home',
        icon: Home,
        active: location.pathname === '/'
      });
    }

    if (isStudent) {
      links.push(
        {
          to: '/materials',
          label: 'Materials',
          icon: BookOpen,
          active: location.pathname === '/materials'
        },
        {
          to: '/chatbot',
          label: 'AI Tutor',
          icon: MessageSquare,
          active: location.pathname === '/chatbot'
        }
      );
    }

    if (isTeacher) {
      links.push(
        {
          to: '/teacher/dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          active: location.pathname === '/teacher/dashboard'
        },
        {
          to: '/upload',
          label: 'Upload Note',
          icon: Upload,
          active: location.pathname === '/upload'
        },
        {
          to: '/my-materials',
          label: 'My Uploads',
          icon: FileText,
          active: location.pathname === '/my-materials'
        },
        {
          to: '/chatbot',
          label: 'AI Tutor',
          icon: MessageSquare,
          active: location.pathname === '/chatbot'
        }
      );
    }

    if (isAdmin) {
      links.push(
        {
          to: '/admin/dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          active: location.pathname === '/admin/dashboard'
        },
        {
          to: '/admin/users',
          label: 'Users',
          icon: Users,
          active: location.pathname === '/admin/users'
        },
        {
          to: '/admin/materials',
          label: 'Materials',
          icon: FileText,
          active: location.pathname === '/admin/materials'
        },
        {
          to: '/admin/curriculum',
          label: 'Curriculum',
          icon: GraduationCap,
          active: location.pathname === '/admin/curriculum'
        },
        {
          to: '/admin/stats',
          label: 'Analytics',
          icon: Shield,
          active: location.pathname === '/admin/stats'
        },
        {
          to: '/chatbot',
          label: 'AI Tutor',
          icon: MessageSquare,
          active: location.pathname === '/chatbot'
        }
      );
    }

    return links;
  };

  const getRoleDisplay = () => {
    if (!user) return '';
    const role = user.role || '';
    if (role === 'ROLE_ADMIN') return 'Admin';
    if (role === 'ROLE_TEACHER') return 'Faculty';
    if (role === 'ROLE_STUDENT') return 'Student';
    return role.replace('ROLE_', '');
  };

  const navLinks = getNavLinks();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-white border-b ${
      scrolled ? 'border-slate-200/80 shadow-sm' : 'border-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#163A70] text-white flex items-center justify-center shadow-sm group-hover:bg-[#0F274D] transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-[#163A70] leading-none tracking-tight">
                  Study<span className="text-[#2563EB]">Hub</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
                  Academic Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5">
            {isAuthenticated ? (
              <>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        link.active
                          ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}

                {/* User Dropdown */}
                <div className="relative user-dropdown ml-3 pl-3 border-l border-slate-200">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#163A70] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-semibold text-[#163A70] leading-tight">
                        {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">{getRoleDisplay()}</p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-50 animate-fade-in">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-slate-100 bg-[#F8FAFC]/50">
                        <p className="text-sm font-bold text-[#163A70]">
                          {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EFF6FF] text-[#163A70] border border-blue-200">
                            {getRoleDisplay()}
                          </span>
                          {userDepartment && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              <Building2 className="w-3 h-3" />
                              {userDepartment}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Menu Links */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          My Profile
                        </Link>
                        
                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            Admin Console
                          </Link>
                        )}
                        
                        {isTeacher && (
                          <Link
                            to="/teacher/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            Faculty Dashboard
                          </Link>
                        )}
                      </div>

                      {/* Logout Action */}
                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-[#2563EB] hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg shadow-sm hover:shadow transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 py-3 px-4 shadow-md animate-fade-in">
          <div className="space-y-1">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2.5 bg-[#F8FAFC] rounded-xl mb-2 border border-slate-200/80">
                  <div className="w-9 h-9 rounded-full bg-[#163A70] text-white flex items-center justify-center font-bold text-xs">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-[#163A70] truncate">
                      {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>

                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        link.active
                          ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}

                <div className="pt-2 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 pt-1">
                <Link
                  to="/login"
                  className="block text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;