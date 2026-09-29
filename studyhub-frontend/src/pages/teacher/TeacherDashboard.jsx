import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Upload, TrendingUp, BookOpen, 
  Users, Eye, Download, Clock, Plus,
  ArrowUpRight, Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import materialService from '../../services/materialService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMaterials: 0,
    activeMaterials: 0,
    totalViews: 0,
    totalDownloads: 0,
  });
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await materialService.getMyMaterials({ size: 5, sortBy: 'createdAt' });
      const materials = response?.data?.content || (Array.isArray(response?.data) ? response?.data : []);
      setRecentMaterials(materials);
      setStats({
        totalMaterials: response?.data?.totalElements || materials.length,
        activeMaterials: materials.filter(m => m.status === 'ACTIVE').length,
        totalViews: materials.reduce((sum, m) => sum + (m.views || 0), 0),
        totalDownloads: materials.reduce((sum, m) => sum + (m.downloads || 0), 0),
      });
    } catch (error) {
      console.error('Failed to fetch teacher dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Uploaded Materials',
      value: stats.totalMaterials,
      icon: FileText,
      subtext: 'Your total published notes',
    },
    {
      title: 'Active (Live)',
      value: stats.activeMaterials,
      icon: BookOpen,
      subtext: 'Available to students',
    },
    {
      title: 'Total Downloads',
      value: stats.totalDownloads,
      icon: Download,
      subtext: 'Student study downloads',
    },
    {
      title: 'Material Views',
      value: stats.totalViews,
      icon: Eye,
      subtext: 'Classroom reader views',
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#163A70] text-xs font-semibold border border-blue-100 mb-2">
            <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>{user?.department || 'Faculty'} Department</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#163A70] tracking-tight">
            Faculty Instructor Workspace
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back, Prof. {user?.firstName} {user?.lastName}. Upload coursework, curate lectures, and manage student learning notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/upload"
            className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Upload New Material</span>
          </Link>
          <Link
            to="/my-materials"
            className="px-4 py-2.5 bg-[#EFF6FF] hover:bg-blue-100 text-[#163A70] text-sm font-semibold rounded-lg border border-blue-200 transition-colors"
          >
            My Uploads
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-blue-200 transition-all flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#163A70] mt-1">{card.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{card.subtext}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-blue-100">
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/upload"
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex items-start justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-3">
              <Upload size={20} />
            </div>
            <h3 className="text-base font-bold text-[#163A70] group-hover:text-[#2563EB] transition-colors">
              Publish Study Material
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload PDF lecture notes, presentation slides, question banks, or YouTube lecture links.
            </p>
          </div>
          <ArrowUpRight size={18} className="text-slate-400 group-hover:text-[#2563EB] transition-colors" />
        </Link>

        <Link
          to="/my-materials"
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex items-start justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-3">
              <FileText size={20} />
            </div>
            <h3 className="text-base font-bold text-[#163A70] group-hover:text-[#2563EB] transition-colors">
              Manage Published Resources
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Edit subject tags, update attachments, or view feedback on your published files.
            </p>
          </div>
          <ArrowUpRight size={18} className="text-slate-400 group-hover:text-[#2563EB] transition-colors" />
        </Link>
      </div>

      {/* Recent Uploads Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#163A70]">Your Recent Uploads</h2>
          <Link
            to="/my-materials"
            className="text-xs font-semibold text-[#2563EB] hover:text-[#163A70] flex items-center gap-1 transition-colors"
          >
            <span>View All Uploads</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {recentMaterials.length === 0 ? (
          <div className="text-center py-10 bg-[#F8FAFC] rounded-xl border border-slate-100">
            <FileText size={28} className="text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No materials uploaded yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Click "Upload New Material" to share your first lecture note.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentMaterials.map((material, index) => (
              <div
                key={material.id || index}
                className="py-3 flex items-center justify-between hover:bg-slate-50/70 px-3 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center flex-shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#163A70] truncate">{material.title}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {material.subject || material.subjectName} • Year {material.academicYear || material.year} • Sem {material.semester}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    material.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {material.status || 'Active'}
                  </span>
                  <Link
                    to={`/materials/${material.id}`}
                    className="text-xs font-semibold text-[#2563EB] hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default TeacherDashboard;