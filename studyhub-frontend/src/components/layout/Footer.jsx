import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Bot, ShieldCheck, Mail, Globe } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg text-white shadow-sm">
                <GraduationCap size={18} />
              </div>
              <span className="text-base font-bold text-[#163A70] tracking-tight">
                Study<span className="text-blue-600">Hub</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Institutional knowledge platform and academic study resource repository powered by AI assistance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-[#163A70] uppercase tracking-wider mb-3">Academic Resources</h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/materials" className="hover:text-blue-600 transition-colors">
                  Study Materials
                </Link>
              </li>
              <li>
                <Link to="/chatbot" className="hover:text-blue-600 transition-colors">
                  AI Study Tutor
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-blue-600 transition-colors">
                  Academic Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Faculty / Administration */}
          <div>
            <h3 className="text-xs font-bold text-[#163A70] uppercase tracking-wider mb-3">Faculty & Management</h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/teacher/upload" className="hover:text-blue-600 transition-colors">
                  Publish Material
                </Link>
              </li>
              <li>
                <Link to="/teacher/my-materials" className="hover:text-blue-600 transition-colors">
                  Faculty Repository
                </Link>
              </li>
              <li>
                <Link to="/teacher/dashboard" className="hover:text-blue-600 transition-colors">
                  Faculty Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional Support */}
          <div>
            <h3 className="text-xs font-bold text-[#163A70] uppercase tracking-wider mb-3">Support & Compliance</h3>
            <p className="text-xs text-slate-500 mb-2">
              For support, account approvals or curriculum queries:
            </p>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold">
              <Mail size={13} />
              <span>support@studyhub.edu</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>&copy; {currentYear} StudyHub Academic Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-600 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;