export const APP_NAME = 'StudyHub';
export const APP_VERSION = '1.0.0';

export const ROLES = {
  STUDENT: 'ROLE_STUDENT',
  TEACHER: 'ROLE_TEACHER',
  ADMIN: 'ROLE_ADMIN',
};

export const MATERIAL_TYPES = {
  PDF: 'PDF',
  PPT: 'PPT',
  DOC: 'DOC',
  VIDEO: 'VIDEO',
};

export const MATERIAL_STATUS = {
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED',
};

export const YEARS = [
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
];

export const YEAR_SEMESTER_MAP = {
  '1': [1, 2],
  '2': [3, 4],
  '3': [5, 6],
  '4': [7, 8],
  '1st Year': [1, 2],
  '2nd Year': [3, 4],
  '3rd Year': [5, 6],
  '4th Year': [7, 8],
};

export const normalizeAcademicYear = (val) => {
  if (!val) return '';
  const str = val.toString().trim().toLowerCase();
  if (str.includes('1')) return '1';
  if (str.includes('2')) return '2';
  if (str.includes('3')) return '3';
  if (str.includes('4')) return '4';
  return str;
};

export const getSemestersForYear = (year) => {
  if (!year) {
    return [
      { value: '1', label: 'Semester 1' },
      { value: '2', label: 'Semester 2' },
      { value: '3', label: 'Semester 3' },
      { value: '4', label: 'Semester 4' },
      { value: '5', label: 'Semester 5' },
      { value: '6', label: 'Semester 6' },
      { value: '7', label: 'Semester 7' },
      { value: '8', label: 'Semester 8' },
    ];
  }
  const cleanYear = normalizeAcademicYear(year);
  const sems = YEAR_SEMESTER_MAP[cleanYear] || [];
  return sems.map(s => ({ value: s.toString(), label: `Semester ${s}` }));
};

export const isSemesterValidForYear = (semester, year) => {
  if (!year || !semester) return true;
  const cleanYear = normalizeAcademicYear(year);
  const validSems = YEAR_SEMESTER_MAP[cleanYear] || [];
  return validSems.includes(parseInt(semester, 10));
};

export const SEMESTERS = [
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
  { value: '3', label: 'Semester 3' },
  { value: '4', label: 'Semester 4' },
  { value: '5', label: 'Semester 5' },
  { value: '6', label: 'Semester 6' },
  { value: '7', label: 'Semester 7' },
  { value: '8', label: 'Semester 8' },
];

export const SUBJECTS = [
  'Data Structures',
  'Algorithms',
  'Database Management Systems',
  'Operating Systems',
  'Computer Networks',
  'Software Engineering',
  'Web Development',
  'Machine Learning',
  'Artificial Intelligence',
  'Cloud Computing',
  'Cybersecurity',
  'Data Science',
];

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  MATERIALS: {
    BASE: '/materials',
    MY_MATERIALS: '/materials/my-materials',
    SEARCH: '/materials/search',
    DOWNLOAD: (id) => `/materials/${id}/download`,
  },
  ADMIN: {
    STATS: '/admin/stats',
    USERS: '/admin/users',
    MATERIALS: '/admin/materials',
    BLOCK: (id) => `/admin/materials/${id}/block`,
    UNBLOCK: (id) => `/admin/materials/${id}/unblock`,
  },
  AI: {
    SUMMARIZE: (id) => `/ai/summarize/${id}`,
    SUMMARY: (id) => `/ai/summary/${id}`,
    CHAT: '/ai/chat',
    CHAT_HISTORY: '/ai/chat/history',
  },
  USER: {
    PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    PROFILE_PICTURE: '/users/profile-picture',
    STATS: '/users/stats',
  },
};