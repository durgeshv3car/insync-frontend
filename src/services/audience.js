import axios from "axios";
const Api_Url = process.env.NEXT_PUBLIC_API_BASE_URL;
import { getToken } from "@/lib/getToken";

export const createAudienceData = async (title) => {
  try {
    const token = await getToken();

    const res = await axios.post(
      `${Api_Url}/campaign`,
      { title },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.log(
      "Error fetching audience data:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAudienceData = async () => {
  try {
    const token = await getToken();

    const res = await axios.get(`${Api_Url}/campaigns/data`, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });

    return res.data; 

  } catch (error) {
    console.log(
      "Error fetching audience data:",
      error.response?.data || error.message
    );
    throw error; // Let caller handle error
  }
};

