import AuthService from './auth.service';

const authService = new AuthService();

class ValidationService {
  // Kiểm tra định dạng email
  validateEmailFormat(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Kiểm tra định dạng số điện thoại Việt Nam
  validatePhoneFormat(phone) {
    // Accept formats: 0xxxxxxxxx, +84xxxxxxxxx, 84xxxxxxxxx
    // Where x is a digit and the total length is 10 digits (excluding country code)
    const phoneRegex = /^(0|(\+?84))[3|5|7|8|9][0-9]{8}$/;
    return phoneRegex.test(phone);
  }

  // Kiểm tra email đã tồn tại chưa (server-side)
  async checkEmailExists(email, excludeId = null) {
    try {
      const response = await authService.checkEmailExists(email, excludeId);
      return response.data.exists;
    } catch (error) {
      console.error("Lỗi khi kiểm tra email:", error);
      return false; // Mặc định không báo trùng nếu có lỗi
    }
  }

  // Kiểm tra số điện thoại đã tồn tại chưa (server-side)
  async checkPhoneExists(phone, excludeId = null) {
    if (!phone) return false; // Không kiểm tra nếu không có số điện thoại
    
    try {
      const response = await authService.checkPhoneExists(phone, excludeId);
      return response.data.exists;
    } catch (error) {
      console.error("Lỗi khi kiểm tra số điện thoại:", error);
      return false; // Mặc định không báo trùng nếu có lỗi
    }
  }

  // Kiểm tra tên đăng nhập đã tồn tại chưa (server-side)
  async checkUsernameExists(username) {
    if (!username) return false; // Không kiểm tra nếu không có tên đăng nhập
    
    try {
      const response = await authService.checkUsernameExists(username);
      return response.data.exists;
    } catch (error) {
      console.error("Lỗi khi kiểm tra tên đăng nhập:", error);
      return false; // Mặc định không báo trùng nếu có lỗi
    }
  }
}

export default new ValidationService(); 