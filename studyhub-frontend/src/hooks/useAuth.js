import { useAuth as useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const auth = useAuthContext();
  return auth;
};

// ✅ Helper hooks for specific data
export const useUser = () => {
  const { user } = useAuthContext();
  return user;
};

export const useUserRole = () => {
  const { userRole } = useAuthContext();
  return userRole;
};

export const useUserDepartment = () => {
  const { userDepartment, userDepartmentId } = useAuthContext();
  return { department: userDepartment, departmentId: userDepartmentId };
};

export const useUserYearSemester = () => {
  const { userYear, userSemester } = useAuthContext();
  return { year: userYear, semester: userSemester };
};

export default useAuth;