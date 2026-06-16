import axiosClient from '../api/axiosClient';

const postService = {
  getAllPosts: async () => {
    try {
      const response = await axiosClient.get('/posts');
      return response.data || response;
    } catch (error) {
      console.error("Lỗi API getAllPosts:", error);
      throw error;
    }
  },
  getPostById: async (id) => {
    try {
      const response = await axiosClient.get(`/posts/${id}`);
      return response.data || response;
    } catch (error) {
      console.error(`Lỗi API getPostById với ID ${id}:`, error);
      throw error;
    }
  },
  getAllCategories: async () => {
    try {
      const response = await axiosClient.get('/categories');
      return response.data || response;
    } catch (error) {
      console.error("Lỗi API getAllCategories của Post:", error);
      throw error;
    }
  }
};

export default postService;
