import api from "@/lib/api";
import { getToken } from "@/lib/getToken";

export const createAudience = async (campaignData) => {
  try {
    const res = await api.post(`/audience`, campaignData);

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
    const res = await api.get(`/audiences/data`, {
      params: { search },
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
    const res = await api.delete(`/audience/${audienceId}`);

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
    const res = await api.post(
      `/audiences`,
      {
        userId,
        role,
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
    const res = await api.put(
      `/audience/${audienceId}`,
      campaignData
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
    const res = await api.post(
      `/auth/user/add`,
      { email, audienceId }
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
