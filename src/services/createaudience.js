import axios from "axios";
const Api_Url = process.env.NEXT_PUBLIC_API_BASE_URL;
import { getToken } from "@/lib/getToken";

export const createAudience = async (campaignData) => {
  try {
    const token = await getToken();

    const res = await axios.post(`${Api_Url}/audience`, campaignData, {
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
    throw error;
  }
};

export const getAudience = async (search = "") => {
  try {
    const token = await getToken();

    const res = await axios.get(`${Api_Url}/audiences/data`, {
      params: { search },
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
    throw error;
  }
};

export const deleteAudience = async (audienceId) => {
  try {
    const token = await getToken();
    const res = await axios.delete(`${Api_Url}/audience/${audienceId}`, {
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
    throw error;
  }
};
export const getAudienceByUser = async (userId, role) => {
  try {
    const token = await getToken();

    const res = await axios.post(
      `${Api_Url}/audiences`,
      {
        userId,
        role,
      },
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

export const updateAudience = async (audienceId, campaignData) => {
  try {
    const token = await getToken();
    const res = await axios.put(
      `${Api_Url}/audience/${audienceId}`,
      campaignData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
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

export const addAudienceToUser = async (email, audienceId) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/auth/user/add`,
      { email, audienceId },
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
