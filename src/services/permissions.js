import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getPermissionList = async () => {
  try {
    const token = await getToken();
    const res = await axios.get(
      `${API_URL}/user/permissions`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error creating token:", error.response?.data || error.message);
    throw error;
  }
};

export const createPermission = async (permission_data) => {
  try {
    const token = await getToken();
    const res = await axios.post(`${API_URL}/user/permission`, permission_data, {
      headers: {
        Authorization: token,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error creating token:", error.response?.data || error.message);
    throw error;
  }
}
