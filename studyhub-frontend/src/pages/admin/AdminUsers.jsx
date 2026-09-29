import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import {
  Users, Search, Filter, UserCheck, UserX, UserPlus,
  Mail, Phone, Calendar, Shield, Building2, Hash,
  Loader2, CheckCircle, XCircle, Clock, MoreVertical,
  Edit, Trash2, Eye, RefreshCw, UserCog, CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const { user: currentUser, userDepartment, userDepartmentId } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const adminDepartment = userDepartment || currentUser?.department || 'IT';
  const adminDepartmentId = userDepartmentId || currentUser?.departmentId || '';

  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedRole, selectedStatus, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        role: selectedRole !== 'All' ? selectedRole : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        search: searchTerm || undefined,
        department: adminDepartment || adminDepartmentId
      };

      const response = await adminService.getAllUsers(params);

      if (response && response.success) {
        const data = response.data;
        if (Array.isArray(data)) {
          const filteredUsers = data.filter(user => 
            !user.department || user.department?.toLowerCase() === adminDepartment?.toLowerCase() ||
            user.departmentId === adminDepartmentId
          );
          setUsers(filteredUsers);
          setTotalUsers(filteredUsers.length);
          setTotalPages(1);
        } else if (data && data.content) {
          const filteredContent = data.content.filter(user => 
            !user.department || user.department?.toLowerCase() === adminDepartment?.toLowerCase() ||
            user.departmentId === adminDepartmentId
          );
          setUsers(filteredContent);
          setTotalUsers(data.totalElements || filteredContent.length);
          setTotalPages(data.totalPages || 1);
        } else {
          setUsers([]);
          setTotalUsers(0);
          setTotalPages(0);
        }
      } else {
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('Approve this faculty/student account for active platform access?')) return;
    try {
      const response = await adminService.approveUser(userId);
      if (response && response.success) {
        toast.success('Account approved successfully');
        fetchUsers();
      } else {
        toast.error(response?.message || 'Failed to approve user');
      }
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    const reason = prompt('Enter rejection note:');
    if (reason === null) return;
    try {
      const response = await adminService.rejectUser(userId, reason || 'Account rejected by admin');
      if (response && response.success) {
        toast.success('Account marked as rejected');
        fetchUsers();
      } else {
        toast.error(response?.message || 'Failed to reject user');
      }
    } catch (error) {
      toast.error('Failed to reject user');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user profile?')) return;
    try {
      const response = await adminService.deleteUser(userId);
      if (response && response.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error(response?.message || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'ACTIVE').toUpperCase();
    if (s === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
        </span>
      );
    }
    if (s === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={11} /> Pending Review
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle size={11} /> Rejected
        </span>
      );
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">{s}</span>;
  };

  const getRoleBadge = (role) => {
    const r = (role || '').replace('ROLE_', '').toUpperCase();
    if (r === 'ADMIN') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#163A70] border border-blue-200">Admin</span>;
    }
    if (r === 'TEACHER') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Faculty</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Student</span>;
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedRole('All');
    setSelectedStatus('All');
    setCurrentPage(0);
  };

  const filteredUsers = users.filter(user => {
    const userDept = user.department || '';
    const isSameDepartment = !userDept || userDept.toLowerCase() === adminDepartment?.toLowerCase() ||
                             user.departmentId === adminDepartmentId;
    if (!isSameDepartment) return false;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const match = fullName.includes(search) || 
                   user.email?.toLowerCase().includes(search) ||
                   user.rollNumber?.toLowerCase().includes(search) ||
                   user.employeeId?.toLowerCase().includes(search);
      if (!match) return false;
    }

    if (selectedRole !== 'All') {
      const uRole = (user.role || '').replace('ROLE_', '').toUpperCase();
      const sRole = selectedRole.replace('ROLE_', '').toUpperCase();
      if (uRole !== sRole) return false;
    }

    if (selectedStatus !== 'All' && user.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#163A70] text-xs font-semibold border border-blue-100 mb-2">
            <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>{adminDepartment} Department Roster</span>
          </div>
          <h1 className="text-2xl font-bold text-[#163A70]">User Directory & Access Control</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Approve registered faculty, inspect student accounts, and manage platform permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <span className="px-3.5 py-2 bg-[#EFF6FF] text-[#163A70] rounded-lg text-xs font-bold border border-blue-100">
            {totalUsers} Registered User{totalUsers !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, roll number..."
              className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none"
            >
              <option value="All">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="TEACHER">Faculty (Teachers)</option>
              <option value="ADMIN">Administrators</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="ACTIVE">Active Users</option>
              <option value="PENDING">Pending Approval</option>
              <option value="REJECTED">Rejected Accounts</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div>
            <button
              onClick={resetFilters}
              className="w-full py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mx-auto" />
            <p className="text-xs text-slate-500 mt-2 font-medium">Loading user profiles...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#163A70]">No Users Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No accounts match the current filter selection in the {adminDepartment} department.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Identifier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredUsers.map((u) => {
                  const isPending = (u.status || '').toUpperCase() === 'PENDING';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#163A70] flex items-center justify-center font-bold text-xs border border-blue-100 flex-shrink-0">
                            {u.firstName?.[0] || u.email?.[0] || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'No Name'}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {getRoleBadge(u.role)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {u.rollNumber || u.employeeId || '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(u.status)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(u.id)}
                                className="px-2.5 py-1 rounded-md text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                title="Approve user"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(u.id)}
                                className="px-2.5 py-1 rounded-md text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                                title="Reject user"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminUsers;