import api from "@/lib/api";
import { getToken } from "@/lib/getToken";

export const getCampaignData = async (audienceId) => {
  try {
    const res = await api.post(
      `/data/campaigns`,
      { campaignId:audienceId }
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
    const res = await api.get(
      `/campaigns/data`
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
    const res = await api.post(
      `/data/campaign`,
      { campaignId:audienceId, youtubeQueryId: videos }
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
