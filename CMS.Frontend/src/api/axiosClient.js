import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5288/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;
