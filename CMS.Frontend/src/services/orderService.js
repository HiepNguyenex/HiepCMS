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
  }
};

export default orderService;
