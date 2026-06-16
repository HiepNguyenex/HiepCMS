import axiosClient from '../api/axiosClient';

const customerService = {
  // Đăng ký tài khoản khách hàng mới
  register: async (customerData) => {
    try {
      const response = await axiosClient.post('/customers', customerData);
      return response.data || response;
    } catch (error) {
      console.error("Lỗi API đăng ký khách hàng:", error);
      throw error;
    }
  },

  // Đăng nhập khách hàng
  login: async (email, password) => {
    try {
      const response = await axiosClient.post('/customers/login', { email, password });
      return response.data || response;
    } catch (error) {
      console.error("Lỗi API đăng nhập khách hàng:", error);
      throw error;
    }
  }
};

export default customerService;
