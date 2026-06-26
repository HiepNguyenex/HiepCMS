import axiosClient from '../api/axiosClient';

const paymentService = {
  createCheckoutSession: async (orderId) => {
    try {
      const response = await axiosClient.post('/payment/create-checkout-session', { orderId });
      return response.data || response;
    } catch (error) {
      console.error("Lỗi API createCheckoutSession:", error);
      throw error;
    }
  },

  confirmPayment: async (sessionId, orderId) => {
    try {
      const response = await axiosClient.post('/payment/confirm-payment', { sessionId, orderId });
      return response.data || response;
    } catch (error) {
      console.error("Lỗi API confirmPayment:", error);
      throw error;
    }
  }
};

export default paymentService;
