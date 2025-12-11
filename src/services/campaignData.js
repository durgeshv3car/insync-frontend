import axios from "axios";
const Api_Url = process.env.NEXT_PUBLIC_API_BASE_URL;
import { getToken } from "@/lib/getToken";

export const getCampaignData = async (audienceId) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/data/campaigns`,
      { campaignId:audienceId },
      {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
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
      `${Api_Url}/data/campaign`,
      { campaignId:audienceId, youtubeQueryId: videos },
      {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
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
