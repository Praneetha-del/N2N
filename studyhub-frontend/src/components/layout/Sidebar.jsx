import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, BookOpen, MessageSquare, User, 
  Upload, FileText, LayoutDashboard, Users 
} from 'lucide-react';

const Sidebar = () => {
  const { isTeacher, isAdmin } = useAuth();

  const studentLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/materials', label: 'Materials', icon: BookOpen },
    { path: '/chatbot', label: 'AI Chat', icon: MessageSquare },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const teacherLinks = [
    ...studentLinks,
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/my-materials', label: 'My Materials', icon: FileText },
    { path: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/materials', label: 'Materials', icon: FileText },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  let links = studentLinks;
  if (isTeacher()) links = teacherLinks;
  if (isAdmin()) links = adminLinks;

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen border-r border-gray-200">
      <nav className="p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <link.icon size={20} />
            <span className="text-sm font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;