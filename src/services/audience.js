import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const createAudienceData = async (title) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/campaign`,
      { title },
      {
        headers: {
          Authorization: token,
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
    const res = await axios.get(`${API_URL}/campaigns/data`, {
      headers: {
        Authorization: token,
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

export const updateAudienceData = async (id, title) => {
  try {
    const token = await getToken();
    const res = await axios.put(
      `${API_URL}/campaign/${id}`,
      { title },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.log(
      "Error updating audience data:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteAudienceData = async (id) => {
  try {
    const token = await getToken();
    const res = await axios.delete(
      `${API_URL}/campaign/${id}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.log(
      "Error deleting audience data:",
      error.response?.data || error.message
    );
    throw error;
  }
};
