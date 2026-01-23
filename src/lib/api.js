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
        config.headers.Authorization = token;
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
    // You can customize this to check for specific success codes or messages if your API returns them
    // For now, we'll try to use a message from the response, or a generic one if it's a mutation
    // GET requests usually don't need a success toast unless specific action
    
    // Strategy: Show toast if response has a 'message' field which usually implies an action result
    if (response.data && response.data.message) {
        toast.success(response.data.message);
    }
    
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.response?.data?.error || error.message || "An error occurred";
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
