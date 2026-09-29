// Auth Pages
export { default as Login } from './auth/Login';
export { default as Register } from './auth/Register';
export { default as ForgotPassword } from './auth/ForgotPassword';
export { default as ResetPassword } from './auth/ResetPassword';

// Student Pages
export { default as Home } from './student/Home';
export { default as Materials } from './student/Materials';
export { default as MaterialDetail } from './student/MaterialDetail';
export { default as Profile } from './student/Profile';

// Teacher Pages
export { default as UploadMaterial } from './teacher/UploadMaterial';
export { default as MyMaterials } from './teacher/MyMaterials';
export { default as TeacherDashboard } from './teacher/TeacherDashboard';

// Admin Pages
export { default as AdminDashboard } from './admin/AdminDashboard';
export { default as AdminUsers } from './admin/AdminUsers';
export { default as AdminMaterials } from './admin/AdminMaterials';
export { default as AdminStats } from './admin/AdminStats';

// Common Pages
export { default as Chatbot } from './common/Chatbot';
export { default as Unauthorized } from './common/Unauthorized';
export { default as NotFound } from './common/NotFound';