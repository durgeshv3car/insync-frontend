import api from "@/lib/api";
import { getToken } from "@/lib/getToken";

export const createAudienceData = async (title) => {
  try {
    const res = await api.post(
      `/campaign`,
      { title }
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
    const res = await api.get(`/campaigns/data`);

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
    const res = await api.put(
      `/campaign/${id}`,
      { title }
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
    const res = await api.delete(
      `/campaign/${id}`
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


