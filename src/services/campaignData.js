import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const DownloadCsvCampaignId = async (campaignId) => {
  try {
    const token = await getToken();

    const response = await axios.get(
      `${API_URL}/data/campaign-data/csv/${campaignId}`,
      {
        headers: {
          Authorization: token,
        },
        responseType: "blob", 
      }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "campaign-videos.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error(
      "Error downloading CSV:",
      error.response?.data || error.message
    );
  }
};


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
