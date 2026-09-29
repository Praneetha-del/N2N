import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // ✅ Extract user properties for easy access
  const userDepartment = user?.department || '';
  const userDepartmentId = user?.departmentId || '';
  const userJoiningYear = user?.joiningYear || user?.batch || user?.admissionYear || '';
  const userYear = user?.year || '';
  const userSemester = user?.semester || '';
  const userRole = user?.role || '';

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const mapDepartmentId = async (userData) => {
    try {
      if (userData.departmentId) {
        console.log('✅ Department ID already exists:', userData.departmentId);
        return userData;
      }
      
      if (userData.department) {
        console.log('🔍 Mapping department:', userData.department);
        
        const response = await adminService.getPublicDepartments();
        console.log('📚 Departments response:', response);
        
        if (response && response.success) {
          const departments = response.data || [];
          
          const found = departments.find(d => 
            d.name?.toLowerCase() === userData.department?.toLowerCase() ||
            d.code?.toLowerCase() === userData.department?.toLowerCase()
          );
          
          if (found) {
            console.log('✅ Found department ID:', found.id, 'for:', found.name);
            userData.departmentId = found.id;
            userData.departmentName = found.name;
            console.log('✅ Department mapped locally (no update needed)');
          } else {
            console.warn('⚠️ No department found for:', userData.department);
          }
        }
      }
      return userData;
    } catch (error) {
      console.error('❌ Error mapping department:', error);
      return userData;
    }
  };

  const fetchUserProfile = async () => {
    try {
      console.log('👤 Fetching user profile...');
      const response = await authService.getCurrentUser();
      console.log('👤 Profile response:', response);
      
      if (response && response.success && response.data) {
        let rawData = response.data;
        let userData = (rawData && rawData.user) ? rawData.user : rawData;
        console.log('📊 User data from API:', userData);
        
        // Auto-map department ID
        userData = await mapDepartmentId(userData);
        
        const userRole = userData.role || userData.userRole || 'ROLE_STUDENT';
        console.log('✅ User role from API:', userRole);
        
        setUser({
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userRole,
          department: userData.department || userData.departmentName || '',
          departmentId: userData.departmentId || '',
          rollNumber: userData.rollNumber || '',
          employeeId: userData.employeeId || '',
          branch: userData.branch || '',
          joiningYear: userData.joiningYear || userData.batch || userData.admissionYear || '',
          year: userData.year || '',           // ✅ Student's year
          semester: userData.semester || '',   // ✅ Student's semester
          profilePicture: userData.profilePicture || '',
          status: userData.status || '',
          active: userData.active,
          fullName: userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
        });
        
        console.log('✅ User set with role:', userRole);
        console.log('✅ Department:', userData.department);
        console.log('✅ Department ID:', userData.departmentId);
        console.log('✅ Joining Year / Batch:', userData.joiningYear);
        console.log('✅ Year:', userData.year);
        console.log('✅ Semester:', userData.semester);
      } else {
        console.warn('⚠️ Invalid profile response');
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔑 Login attempt:', credentials.username, 'Role:', credentials.role);
      
      const response = await authService.login({
        username: credentials.username,
        password: credentials.password,
        role: credentials.role || 'STUDENT'
      });
      
      console.log('📥 Login response:', response);
      
      if (response.success && response.data) {
        const { token: authToken, user: userData } = response.data;
        console.log('📦 User data from login:', userData);
        
        const mappedUserData = await mapDepartmentId(userData);
        
        localStorage.setItem('token', authToken);
        setToken(authToken);
        
        const userRole = mappedUserData.role || mappedUserData.userRole || 'ROLE_STUDENT';
        console.log('✅ Login user role:', userRole);
        
        const mappedUser = {
          id: mappedUserData.id,
          firstName: mappedUserData.firstName,
          lastName: mappedUserData.lastName,
          email: mappedUserData.email,
          role: userRole,
          department: mappedUserData.department || mappedUserData.departmentName || '',
          departmentId: mappedUserData.departmentId || '',
          rollNumber: mappedUserData.rollNumber || '',
          employeeId: mappedUserData.employeeId || '',
          branch: mappedUserData.branch || '',
          joiningYear: mappedUserData.joiningYear || mappedUserData.batch || mappedUserData.admissionYear || '',
          year: mappedUserData.year || '',
          semester: mappedUserData.semester || '',
          profilePicture: mappedUserData.profilePicture || '',
          status: mappedUserData.status || '',
          active: mappedUserData.active,
          fullName: mappedUserData.fullName || `${mappedUserData.firstName || ''} ${mappedUserData.lastName || ''}`.trim()
        };
        
        setUser(mappedUser);
        console.log('✅ User logged in with role:', userRole);
        
        toast.success('Login successful!');
        return { success: true, user: mappedUser };
      } else {
        const message = response.message || 'Login failed';
        toast.error(message);
        return { success: false, message };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        toast.success('Registration successful! Please verify your email.');
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = async (data) => {
    try {
      const response = await authService.updateProfile(data);
      if (response.success) {
        setUser(prev => ({ ...prev, ...response.data }));
        toast.success('Profile updated!');
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      return { success: false };
    }
  };

  const value = {
    user,
    setUser,
    loading,
    token,
    login,
    register,
    logout,
    updateUser,
    fetchUserProfile,
    mapDepartmentId,
    // ✅ User properties for easy access
    userDepartment,
    userDepartmentId,
    userJoiningYear,
    userYear,
    userSemester,
    userRole,
    // ✅ Auth checks
    isAuthenticated: !!token && !!user,
    isAdmin: (user?.role || '').replace('ROLE_', '').toUpperCase() === 'ADMIN',
    isTeacher: (user?.role || '').replace('ROLE_', '').toUpperCase() === 'TEACHER',
    isStudent: (user?.role || '').replace('ROLE_', '').toUpperCase() === 'STUDENT',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;