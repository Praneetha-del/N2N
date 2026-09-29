import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, BookOpen, UserCheck, UserX, 
  FileText, Video, Clock, TrendingUp,
  RefreshCw, AlertCircle, Building2,
  GraduationCap, Shield, ArrowUpRight, Plus,
  Layers
} from 'lucide-react';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    pendingTeachers: 0,
    totalMaterials: 0,
    activeMaterials: 0,
    blockedMaterials: 0,
  });
  const [recentMaterials, setRecentMaterials] = useState([]);

  const adminDepartment = user?.department || 'IT';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsResponse = await adminService.getStats();
      if (statsResponse && statsResponse.success) {
        setStats(statsResponse.data || {
          totalUsers: 0,
          totalStudents: 0,
          totalTeachers: 0,
          totalAdmins: 0,
          pendingTeachers: 0,
          totalMaterials: 0,
          activeMaterials: 0,
          blockedMaterials: 0,
        });
      }

      try {
        const materialsResponse = await adminService.getAllMaterials({
          page: 0,
          size: 5,
        });
        if (materialsResponse && materialsResponse.success) {
          const data = materialsResponse.data;
          setRecentMaterials(data.content || (Array.isArray(data) ? data : []));
        }
      } catch (err) {
        setRecentMaterials([]);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Enrolled Users',
      value: stats.totalUsers,
      subtext: `${stats.totalStudents} students • ${stats.totalTeachers} faculty`,
      icon: Users,
      badge: 'All Roles',
    },
    {
      title: 'Learning Materials',
      value: stats.totalMaterials,
      subtext: `${stats.activeMaterials || stats.totalMaterials} active resources`,
      icon: BookOpen,
      badge: 'Live Content',
    },
    {
      title: 'Faculty Members',
      value: stats.totalTeachers,
      subtext: `${stats.pendingTeachers || 0} pending verification`,
      icon: UserCheck,
      badge: 'Academic Staff',
    },
    {
      title: 'Department Students',
      value: stats.totalStudents,
      subtext: `Under ${adminDepartment} Department`,
      icon: GraduationCap,
      badge: 'Active Students',
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#163A70] text-xs font-semibold border border-blue-100 mb-3">
            <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>{adminDepartment} Department Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#163A70] tracking-tight">
            Administrator Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Welcome to the StudyHub Administration Suite. Moderate learning assets, manage user roles, and structure academic curriculums.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/curriculum"
            className="px-4 py-2.5 bg-[#EFF6FF] hover:bg-blue-100 text-[#2563EB] text-sm font-semibold rounded-lg transition-colors border border-blue-200 flex items-center gap-1.5"
          >
            <Plus size={16} /> New Curriculum
          </Link>
          <Link
            to="/admin/materials"
            className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <BookOpen size={16} /> All Materials
          </Link>
          <button
            onClick={fetchDashboardData}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-blue-100">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-[#163A70] tracking-tight">
                  {card.value}
                </span>
                <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                  {card.badge}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-2 font-medium">
                {card.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex items-start justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-3">
              <Users size={20} />
            </div>
            <h3 className="text-base font-bold text-[#163A70] group-hover:text-[#2563EB] transition-colors">
              User Approvals & Directory
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Verify faculty signups, manage roles, and review student rosters.
            </p>
          </div>
          <ArrowUpRight size={18} className="text-slate-400 group-hover:text-[#2563EB] transition-colors" />
        </Link>

        <Link
          to="/admin/curriculum"
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex items-start justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-3">
              <GraduationCap size={20} />
            </div>
            <h3 className="text-base font-bold text-[#163A70] group-hover:text-[#2563EB] transition-colors">
              Curriculum Mapping
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Map subjects, semesters, and academic years for {adminDepartment}.
            </p>
          </div>
          <ArrowUpRight size={18} className="text-slate-400 group-hover:text-[#2563EB] transition-colors" />
        </Link>

        <Link
          to="/admin/materials"
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex items-start justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-3">
              <BookOpen size={20} />
            </div>
            <h3 className="text-base font-bold text-[#163A70] group-hover:text-[#2563EB] transition-colors">
              Resource Moderation
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Review lecture notes, filter documents, and moderate live materials.
            </p>
          </div>
          <ArrowUpRight size={18} className="text-slate-400 group-hover:text-[#2563EB] transition-colors" />
        </Link>
      </div>

      {/* Recent Materials Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#163A70]">
              Recently Uploaded Materials
            </h2>
            <p className="text-xs text-slate-500">
              Latest lecture files and academic resources submitted for {adminDepartment}
            </p>
          </div>
          <Link
            to="/admin/materials"
            className="text-xs font-semibold text-[#2563EB] hover:text-[#163A70] transition-colors flex items-center gap-1"
          >
            View all ({stats.totalMaterials}) <ArrowUpRight size={14} />
          </Link>
        </div>

        {recentMaterials.length === 0 ? (
          <div className="text-center py-10 bg-[#F8FAFC] rounded-xl border border-slate-100">
            <FileText size={28} className="text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No materials uploaded yet</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Faculty uploads will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentMaterials.map((material, index) => (
              <div
                key={material.id || index}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50/70 px-3 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center flex-shrink-0">
                    {material.type === 'VIDEO' ? <Video size={16} /> : <FileText size={16} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#163A70] truncate">
                      {material.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {material.subject || material.subjectName || 'General'} • Year {material.year || material.academicYear} • Sem {material.semester}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    material.status === 'ACTIVE' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {material.status || 'ACTIVE'}
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    {material.createdAt ? new Date(material.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;