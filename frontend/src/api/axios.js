import axios from 'axios';
import { baseUrl } from '@/config';

const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    
    return response;
  },
  (error) => {
   
    if (error.response && error.response.status === 401) {
    
      console.error('Unauthorized, redirecting to login...');
      
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;