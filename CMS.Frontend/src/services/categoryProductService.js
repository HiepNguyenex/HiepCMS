import axiosClient from '../api/axiosClient';

const categoryProductService = {
  getAllCategoryProducts: async () => {
    try {
      const response = await axiosClient.get('/categoryproducts');
      return response.data || response;
    } catch (error) {
      console.error("Lỗi API getAllCategoryProducts:", error);
      throw error;
    }
  }
};

export default categoryProductService;
