import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5288/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;
