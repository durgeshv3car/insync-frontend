import api from "@/lib/api";
import { getToken } from "@/lib/getToken";

export const getPermissionList = async () => {
  try {
    const res = await api.get(
      `/user/permissions`
    );
    return res.data;
  } catch (error) {
    console.error("Error creating token:", error.response?.data || error.message);
    throw error;
  }
};

export const createPermission = async (permission_data) => {
  try {
    const res = await api.post(`/user/permission`, permission_data);
    return res.data;
  } catch (error) {
    console.error("Error creating token:", error.response?.data || error.message);
    throw error;
  }
}
