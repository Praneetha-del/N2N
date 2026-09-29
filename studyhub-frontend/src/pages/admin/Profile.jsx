import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Building2, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Edit,
  Save,
  X,
  Loader2,
  UserCircle,
  Key,
  Shield,
  Clock,
  IdCard,
  Smartphone,
  Globe,
  MapPin
} from 'lucide-react';
import Button from '../../components/common/Button';

const AdminProfile = () => {
  const { user, setUser, token } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    departmentId: '',
    role: '',
    status: '',
    branch: '',
    year: '',
    semester: '',
    phone: '',
    address: ''
  });

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        department: user.department || '',
        departmentId: user.departmentId || '',
        role: user.role || '',
        status: user.status || '',
        branch: user.branch || '',
        year: user.year || '',
        semester: user.semester || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const response = await userService.updateProfile(formData);
      if (response.success) {
        // Update user context with new data
        setUser(prev => ({ ...prev, ...formData }));
        toast.success('Profile updated successfully!');
        setEditing(false);
      } else {
        toast.error(response.message || 'Update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword) {
      toast.error('Please enter current password');
      return;
    }
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (response.success) {
        toast.success('Password changed successfully!');
        setChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(response.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get role badge color
  const getRoleColor = (role) => {
    if (role === 'ROLE_ADMIN') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (role === 'ROLE_TEACHER') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (role === 'ROLE_STUDENT') return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Get role display name
  const getRoleDisplay = (role) => {
    if (!role) return 'Unknown';
    return role.replace('ROLE_', '');
  };

  // Get status color
  const getStatusColor = (status) => {
    if (status === 'ACTIVE') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'PENDING') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (status === 'REJECTED') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    if (status === 'ACTIVE') return <CheckCircle className="w-4 h-4" />;
    if (status === 'PENDING') return <Clock className="w-4 h-4" />;
    if (status === 'REJECTED') return <AlertCircle className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-6 py-8 relative">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                <UserCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1">
                <div className={`w-4 h-4 rounded-full border-2 border-white ${
                  user?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">
                {user?.firstName} {user?.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user?.role)}`}>
                  <Shield className="w-3 h-3" />
                  {getRoleDisplay(user?.role)}
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user?.status)}`}>
                  {getStatusIcon(user?.status)}
                  {user?.status || 'Unknown'}
                </span>
                <span className="text-white/60 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Member since {formatDate(user?.createdAt)}
                </span>
              </div>
            </div>

            {/* Edit Button */}
            {!editing && (
              <Button 
                onClick={() => setEditing(true)} 
                icon={Edit}
                className="bg-white/20 hover:bg-white/30 text-white border-white/20"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Editing Controls */}
          {editing && (
            <div className="flex justify-end gap-2 mb-6 pb-4 border-b border-gray-200">
              <Button 
                onClick={() => {
                  setEditing(false);
                  // Reset form data to original user data
                  if (user) {
                    setFormData({
                      firstName: user.firstName || '',
                      lastName: user.lastName || '',
                      email: user.email || '',
                      department: user.department || '',
                      departmentId: user.departmentId || '',
                      role: user.role || '',
                      status: user.status || '',
                      branch: user.branch || '',
                      year: user.year || '',
                      semester: user.semester || '',
                      phone: user.phone || '',
                      address: user.address || ''
                    });
                  }
                }} 
                icon={X}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveProfile} 
                icon={Save}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          )}

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                <User className="inline w-4 h-4 mr-1" />
                First Name
              </label>
              {editing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{user?.firstName || 'Not set'}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                <User className="inline w-4 h-4 mr-1" />
                Last Name
              </label>
              {editing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{user?.lastName || 'Not set'}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                <Mail className="inline w-4 h-4 mr-1" />
                Email Address
              </label>
              <p className="text-gray-900 font-medium flex items-center gap-2">
                {user?.email || 'Not set'}
                {user?.email && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                )}
              </p>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                <Shield className="inline w-4 h-4 mr-1" />
                Role
              </label>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user?.role)}`}>
                {getRoleDisplay(user?.role)}
              </span>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                <Building2 className="inline w-4 h-4 mr-1" />
                Department
              </label>
              {editing ? (
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={user?.role === 'ROLE_ADMIN'}
                />
              ) : (
                <p className="text-gray-900 font-medium">{user?.department || 'Not set'}</p>
              )}
              {user?.role === 'ROLE_ADMIN' && (
                <p className="text-xs text-gray-400 mt-1">Department is auto-detected from admin profile</p>
              )}
            </div>

            {/* Department ID */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                <IdCard className="inline w-4 h-4 mr-1" />
                Department ID
              </label>
              <p className={`font-medium ${user?.departmentId ? 'text-gray-900' : 'text-amber-600'}`}>
                {user?.departmentId || (
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Not set
                  </span>
                )}
              </p>
              {!user?.departmentId && user?.role === 'ROLE_ADMIN' && (
                <p className="text-xs text-amber-600 mt-1">
                  Please contact system administrator to set your department ID
                </p>
              )}
            </div>

            {/* Branch */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                <MapPin className="inline w-4 h-4 mr-1" />
                Branch
              </label>
              {editing ? (
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{user?.branch || 'Not set'}</p>
              )}
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                <Calendar className="inline w-4 h-4 mr-1" />
                Year
              </label>
              {editing ? (
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{user?.year || 'Not set'}</p>
              )}
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                <Smartphone className="inline w-4 h-4 mr-1" />
                Semester
              </label>
              {editing ? (
                <input
                  type="number"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{user?.semester || 'Not set'}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                <Smartphone className="inline w-4 h-4 mr-1" />
                Phone
              </label>
              {editing ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-gray-900 font-medium">{user?.phone || 'Not set'}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                <Globe className="inline w-4 h-4 mr-1" />
                Address
              </label>
              {editing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter address"
                />
              ) : (
                <p className="text-gray-900 font-medium">{user?.address || 'Not set'}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                <CheckCircle className="inline w-4 h-4 mr-1" />
                Account Status
              </label>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(user?.status)}`}>
                {getStatusIcon(user?.status)}
                {user?.status || 'Unknown'}
              </span>
            </div>
          </div>

          {/* Warning if Department ID is missing */}
          {!user?.departmentId && user?.role === 'ROLE_ADMIN' && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-700 font-medium">Department ID Missing</p>
                <p className="text-xs text-amber-600">
                  Your department ID is not set in the database. This may prevent you from managing curriculum. 
                  Please contact system administrator to update your profile.
                </p>
              </div>
            </div>
          )}

          {/* Change Password Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-600" />
                  Change Password
                </h3>
                <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
              </div>
              <Button 
                onClick={() => setChangingPassword(!changingPassword)}
                variant={changingPassword ? 'secondary' : 'primary'}
              >
                {changingPassword ? 'Cancel' : 'Change Password'}
              </Button>
            </div>

            {changingPassword && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter new password (min 6 chars)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={handleChangePassword}
                    disabled={loading}
                    icon={Key}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Changing...
                      </span>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Account Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <label className="text-gray-500">Member Since</label>
                <p className="font-medium text-gray-900">{formatDate(user?.createdAt)}</p>
              </div>
              <div>
                <label className="text-gray-500">Last Updated</label>
                <p className="font-medium text-gray-900">{formatDateTime(user?.updatedAt)}</p>
              </div>
              <div>
                <label className="text-gray-500">User ID</label>
                <p className="font-medium text-gray-900 text-xs truncate" title={user?.id}>
                  {user?.id || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-gray-500">Account Type</label>
                <p className="font-medium text-gray-900">{user?.role || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;