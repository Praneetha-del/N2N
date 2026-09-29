import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, BookOpen, MessageSquare, User, 
  ArrowRight, TrendingUp, Clock, Star,
  GraduationCap, FileText, Video, Users,
  Building2, Sparkles
} from 'lucide-react';
import api from '../../services/api';
import MaterialCard from '../../components/materials/MaterialCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const Home = () => {
  const { user, userDepartment, userJoiningYear } = useAuth();
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMaterials: 0,
    totalSubjects: 0,
    totalTeachers: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user, userDepartment, userJoiningYear]);

  const fetchDashboardData = async () => {
    try {
      const dept = userDepartment || user?.department || 'IT';
      const studentBatch = userJoiningYear || user?.joiningYear || user?.batch || user?.admissionYear || '';
      
      // 1. Fetch materials
      let materialList = [];
      let totalMatCount = 0;
      try {
        const materialsRes = await api.get(`/materials?department=${dept}&size=100&sortBy=createdAt&sortDirection=DESC`);
        const materialsData = materialsRes.data?.data || materialsRes.data;
        const allMaterialsList = materialsData?.content || (Array.isArray(materialsData) ? materialsData : []);
        
        // Filter strictly by student batch
        if (studentBatch) {
          materialList = allMaterialsList.filter(m => {
            const mBatch = m.joiningYear || m.batch;
            return mBatch && mBatch.toString() === studentBatch.toString();
          });
        } else {
          materialList = allMaterialsList;
        }

        totalMatCount = materialList.length;
        setRecentMaterials(materialList.slice(0, 6));
      } catch (err) {
        console.error('Error fetching materials for home:', err);
      }

      // 2. Fetch department subjects strictly for the student's department & batch curriculum
      const subjectsSet = new Set();
      try {
        const curRes = await api.get(`/curriculum/public?department=${encodeURIComponent(dept)}`);
        const curriculums = curRes.data?.data || (Array.isArray(curRes.data) ? curRes.data : []);
        const deptLower = (dept || '').toLowerCase();
        
        const matchingCurrs = curriculums.filter(c => {
          const cDept = (c.department || c.departmentName || c.departmentId || '').toLowerCase();
          const matchesDept = !cDept || cDept === deptLower || cDept.includes(deptLower) || deptLower.includes(cDept);
          const matchesBatch = studentBatch ? (c.joiningYear && c.joiningYear.toString() === studentBatch.toString()) : true;
          return matchesDept && matchesBatch;
        });

        matchingCurrs.forEach(c => {
          if (Array.isArray(c.subjectNames)) {
            c.subjectNames.forEach(name => {
              if (name && name.trim()) subjectsSet.add(name.trim().toLowerCase());
            });
          }
        });
      } catch (curErr) {
        console.error('Error fetching curriculums for home:', curErr);
      }

      materialList.forEach(m => {
        const sub = m.subjectName || m.subject;
        if (sub && sub.trim()) subjectsSet.add(sub.trim().toLowerCase());
      });

      // 3. Count unique active faculty for this department
      const teacherSet = new Set();
      materialList.forEach(m => {
        const teacher = m.uploadedByName || m.uploaderName;
        if (teacher && teacher.trim()) teacherSet.add(teacher.trim().toLowerCase());
      });

      try {
        const usersRes = await api.get(`/admin/users?role=TEACHER&department=${encodeURIComponent(dept)}`);
        const teachers = usersRes.data?.data?.content || usersRes.data?.data || (Array.isArray(usersRes.data) ? usersRes.data : []);
        const deptLower = (dept || '').toLowerCase();
        teachers.forEach(t => {
          const tDept = (t.department || t.departmentName || '').toLowerCase();
          if (!tDept || tDept === deptLower || tDept.includes(deptLower) || deptLower.includes(tDept)) {
            if (t.email) teacherSet.add(t.email.toLowerCase());
          }
        });
      } catch (userErr) {
        // user endpoint may require admin, fallback to teachers in materials + 1
      }

      setStats({
        totalMaterials: totalMatCount,
        totalSubjects: subjectsSet.size,
        totalTeachers: Math.max(teacherSet.size, 1),
      });

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Study Materials',
      description: 'Explore lecture notes, question banks & syllabus',
      icon: BookOpen,
      to: '/materials',
      tag: 'Browse',
    },
    {
      title: 'AI Study Assistant',
      description: 'Instant answers, concept explanations & practice Q&A',
      icon: MessageSquare,
      to: '/chatbot',
      tag: 'AI Tutor',
    },
    {
      title: 'Student Profile',
      description: 'View enrolled semester, department & settings',
      icon: User,
      to: '/profile',
      tag: 'Account',
    },
  ];

  const statCards = [
    {
      label: 'Materials Available',
      value: stats.totalMaterials || 0,
      icon: FileText,
      sub: 'Verified notes',
    },
    {
      label: 'Department Subjects',
      value: stats.totalSubjects || 0,
      icon: BookOpen,
      sub: 'Across semesters',
    },
    {
      label: 'Active Faculty',
      value: stats.totalTeachers || 0,
      icon: Users,
      sub: 'Contributing staff',
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#163A70] text-xs font-semibold border border-blue-100 mb-3">
            <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>{user?.department || 'Engineering & Technology'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#163A70] tracking-tight">
            Welcome back, {user?.firstName || 'Student'}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Access curriculum notes, syllabus documents, and instant AI tutoring designed for your coursework.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/materials"
            className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <BookOpen size={16} />
            <span>Browse Notes</span>
          </Link>
          <Link
            to="/chatbot"
            className="px-4 py-2.5 bg-[#EFF6FF] hover:bg-blue-100 text-[#163A70] text-sm font-semibold rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5"
          >
            <MessageSquare size={16} className="text-[#2563EB]" />
            <span>AI Tutor</span>
          </Link>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-blue-200 transition-all flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#163A70] mt-1">{stat.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{stat.sub}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-blue-100">
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.to}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-blue-100">
                    <Icon size={22} />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F8FAFC] text-slate-600 border border-slate-200">
                    {action.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#163A70] group-hover:text-[#2563EB] transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {action.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#2563EB]">
                <span>Explore</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Materials Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#163A70]">Recently Added Materials</h2>
            <p className="text-xs text-slate-500">Latest resources uploaded by faculty</p>
          </div>
          <Link
            to="/materials"
            className="text-xs font-semibold text-[#2563EB] hover:text-[#163A70] flex items-center gap-1 transition-colors"
          >
            <span>View All Materials</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentMaterials.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <BookOpen size={36} className="text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-[#163A70]">No materials available yet</h3>
            <p className="text-xs text-slate-500 mt-1">Check back soon for new lecture notes and study guides.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentMaterials.map((material, index) => (
              <MaterialCard 
                key={material.id || index} 
                material={material} 
                onUpdate={fetchDashboardData} 
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;