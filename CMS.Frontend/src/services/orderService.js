import axiosClient from '../api/axiosClient';

const orderService = {
  // Gửi đơn hàng lên Backend
  createOrder: async (orderData) => {
    try {
      const response = await axiosClient.post('/orders', orderData);
      return response.data || response;
    } catch (error) {
      console.error("Lỗi API createOrder:", error);
      throw error;
    }
  },

  // Lấy danh sách đơn hàng theo ID khách hàng
  getOrdersByCustomerId: async (customerId) => {
    try {
      const response = await axiosClient.get(`/orders?customerId=${customerId}`);
      return response.data || response;
    } catch (error) {
      console.error(`Lỗi API getOrdersByCustomerId với ID ${customerId}:`, error);
      throw error;
    }
  },

  // Lấy chi tiết đơn hàng
  getOrderById: async (id) => {
    try {
      const response = await axiosClient.get(`/orders/${id}`);
      return response.data || response;
    } catch (error) {
      console.error(`Lỗi API getOrderById với ID ${id}:`, error);
      throw error;
    }
  }
};

export default orderService;
