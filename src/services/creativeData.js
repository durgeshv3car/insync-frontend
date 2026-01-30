import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getCreativeData = async (report_type) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/eskimi/get/creative`,
      {report_type},
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
