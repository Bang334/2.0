/**
 * Authentication and authorization utility functions
 */

// Lưu token vào localStorage
export const saveToken = (token) => {
  localStorage.setItem('token', token);
};

// Lấy token từ localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Xóa token khỏi localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Lưu thông tin người dùng
export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Lấy thông tin người dùng
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

// Kiểm tra người dùng đã đăng nhập chưa
export const isAuthenticated = () => {
  const user = getUser();
  return !!user && !!user.token;
};

// Lấy vai trò của người dùng
export const getUserRoles = () => {
  const user = getUser();
  if (user && user.roles) {
    return user.roles;
  }
  // Trả về role mặc định nếu chưa đăng nhập
  return ['ROLE_SV'];
};

// Kiểm tra xem người dùng có phải là quản lý không
export const isAdmin = () => {
  const roles = getUserRoles();
  return roles.includes("ROLE_QL") || roles.includes("ROLE_ADMIN");
};

// Kiểm tra xem người dùng có phải là giảng viên không
export const isGiangVien = () => {
  const roles = getUserRoles();
  return roles.includes("ROLE_GV");
};

// Kiểm tra xem người dùng có phải là sinh viên không
export const isSinhVien = () => {
  // Nếu chưa đăng nhập hoặc không có role khác, mặc định là sinh viên
  if (!isAuthenticated()) return true;
  
  const roles = getUserRoles();
  return roles.includes("ROLE_SV");
};

// Xác định role chính của người dùng
export const getPrimaryRole = () => {
  if (isAdmin()) return 'ADMIN';
  if (isGiangVien()) return 'GIANGVIEN';
  return 'SINHVIEN';
};

// Lấy route mặc định theo vai trò
export const getDefaultRoute = () => {
  if (isAdmin()) {
    return '/admin';
  } else if (isGiangVien()) {
    return '/giangvien';
  } else if (isSinhVien()) {
    return '/sinhvien';
  }
  return '/';
};

// Lấy authorization header
export const getAuthHeader = () => {
  const token = getToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Xử lý đăng xuất
export const handleLogout = () => {
  removeToken();
  window.location.href = '/login';
};

// Lưu thông tin xác thực
export const setAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Xác định role cần thiết từ URL
export const getRoleFromPath = (path) => {
  // Trích xuất phần path chính (bỏ qua query params)
  const mainPath = path.split('?')[0];
  
  // Xác định role dựa vào đường dẫn
  if (mainPath.startsWith('/admin')) return 'ADMIN';
  if (mainPath.startsWith('/giangvien')) return 'GIANGVIEN';
  if (mainPath.startsWith('/sinhvien')) return 'SINHVIEN';
  
  return 'SINHVIEN'; // Mặc định là SINHVIEN
};

// Lấy trang phù hợp khi chưa đăng nhập, dựa vào đường dẫn yêu cầu
export const getAnonymousRoute = (requestedPath) => {
  const role = getRoleFromPath(requestedPath);
  
  switch(role) {
    case 'ADMIN':
      return '/login?role=admin';
    case 'GIANGVIEN':
      return '/login?role=giangvien';
    case 'SINHVIEN':
      return '/login?role=sinhvien';
    default:
      return '/login';
  }
}; 