import api from "@/lib/api";

export const DownloadCsvCampaignId = async (campaignId) => {
  try {
    const response = await api.get(
      `/data/campaign-data/csv/${campaignId}`,
      {
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
    const res = await api.post(
      "/data/campaigns",
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
    const res = await api.get("/campaigns/data");
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
      "/data/campaign",
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

export const deleteCampaignData = async (audienceId, videoId) => {
  const res = await api.delete(
    "/data/campaign",
    {
      data: {
        campaignId: audienceId,
        youtubeQueryId: videoId,
      },
    }
  );

  return res.data;
};

