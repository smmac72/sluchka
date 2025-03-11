import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add auth token to requests if available
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    
    if (response) {
      // Unauthorized - token expired or invalid
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Only show message if user was previously logged in
        if (localStorage.getItem("token")) {
          toast.error("Сессия истекла. Пожалуйста, войдите снова.");
          // In a real app, you might want to redirect to login page here
        }
      }
      
      // Show error message from the API if available
      if (response.data && response.data.message) {
        toast.error(response.data.message);
      } else if (response.statusText) {
        toast.error(`Error: ${response.status} ${response.statusText}`);
      } else {
        toast.error("Произошла ошибка. Пожалуйста, попробуйте снова.");
      }
    } else {
      // Network error or other issues
      toast.error("Не удалось подключиться к серверу. Проверьте ваше соединение.");
    }
    
    return Promise.reject(error);
  }
);

export default api;
