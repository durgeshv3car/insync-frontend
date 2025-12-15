import axios from "axios";
const Api_Url = process.env.NEXT_PUBLIC_API_BASE_URL;
import { getToken } from "@/lib/getToken";

export const getPermissionList = async () => {
  try {
    const token = await getToken();
    const res = await axios.get(
      `${Api_Url}/user/permissions`,
      {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
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
    const res = await axios.post(`${Api_Url}/user/permission`, permission_data, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error creating token:", error.response?.data || error.message);
    throw error;
  }
}
