import axiosClient from '../api/axiosClient';

const productService = {
  getAllProducts: async (params = {}) => {
    try {
      const response = await axiosClient.get('/products', { params });
      return response.data || response;
    } catch (error) {
      console.error("Lỗi API getAllProducts:", error);
      throw error;
    }
  },
  getProductById: async (id) => {
    try {
      const response = await axiosClient.get(`/products/${id}`);
      return response.data || response;
    } catch (error) {
      console.error(`Lỗi API getProductById với ID ${id}:`, error);
      throw error;
    }
  },
  getBestsellers: async () => {
    try {
      const response = await axiosClient.get('/products/bestsellers');
      return response.data || response;
    } catch (error) {
      console.error("Lỗi API getBestsellers:", error);
      throw error;
    }
  }
};

export default productService;
