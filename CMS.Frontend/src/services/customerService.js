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

  // Đăng nhập khách hàng (Sử dụng mật khẩu băm thông qua AuthController)
  login: async (email, password) => {
    try {
      const response = await axiosClient.post('/auth/customer-login', { email, password });
      const customerData = response.data?.customer || response.customer;
      const token = response.data?.token || response.token;
      if (customerData && token) {
        customerData.token = token; // Đính kèm token vào đối tượng customer
      }
      return customerData || response.data || response;
    } catch (error) {
      console.error("Lỗi API đăng nhập khách hàng:", error);
      throw error;
    }
  },

  // Quên mật khẩu khách hàng
  forgotPassword: async (email) => {
    try {
      const response = await axiosClient.post('/auth/forgot-password', { email });
      return response.data || response;
    } catch (error) {
      console.error("Lỗi API quên mật khẩu khách hàng:", error);
      throw error;
    }
  },

  // Lấy thông tin khách hàng bằng ID
  getCustomerById: async (id) => {
    try {
      const response = await axiosClient.get(`/customers/${id}`);
      return response.data || response;
    } catch (error) {
      console.error(`Lỗi API lấy thông tin khách hàng ID ${id}:`, error);
      throw error;
    }
  },

  // Cập nhật thông tin khách hàng
  updateCustomer: async (id, customerData) => {
    try {
      const response = await axiosClient.put(`/customers/${id}`, customerData);
      return response.data || response;
    } catch (error) {
      console.error(`Lỗi API cập nhật thông tin khách hàng ID ${id}:`, error);
      throw error;
    }
  }
};

export default customerService;
