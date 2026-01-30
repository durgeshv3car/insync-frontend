import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getCampaignData = async (audienceId) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/data/campaigns`,
      { campaignId:audienceId },
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error creating token:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getCampaignList = async (audienceId) => {
  try {
    const token = await getToken();
    const res = await axios.get(
      `${API_URL}/campaigns/data`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error creating token:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const createCampaignData = async (audienceId, videos) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/data/campaign`,
      { campaignId:audienceId, youtubeQueryId: videos },
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error creating token:",
      error.response?.data || error.message
    );
    throw error;
  }
};
