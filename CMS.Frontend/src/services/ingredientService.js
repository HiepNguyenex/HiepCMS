import axiosClient from '../api/axiosClient';

const ingredientService = {
  getAllIngredients: async () => {
    try {
      const response = await axiosClient.get('/ingredients');
      return response.data || response;
    } catch (error) {
      console.error("Lỗi API getAllIngredients:", error);
      throw error;
    }
  }
};

export default ingredientService;
