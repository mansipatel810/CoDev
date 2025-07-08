import axios from 'axios';

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;