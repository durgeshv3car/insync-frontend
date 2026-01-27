import api from "@/lib/api";
import { getToken } from "@/lib/getToken";

export const getCreativeData = async (report_type) => {
  try {
    const res = await api.post(
      `/eskimi/get/creative`,
      {report_type}
    );
    return res.data;
  } catch (error) {
    console.error("Error creating token:", error.response?.data || error.message);
    throw error;
  }
};


