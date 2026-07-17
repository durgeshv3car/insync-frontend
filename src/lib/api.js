import axios from "axios";
import { toast } from "react-toastify";
import { getToken } from "./getToken";

const Api_Url = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: Api_Url,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for toasts
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.response?.data?.error || error.message || "An error occurred";
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
