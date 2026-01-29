import api from "@/lib/api";






export const getYouTubeResultsByChannel = async (filters) => {
  try {
    const res = await api.post(
      `/query/searchByChannel`,
      {
        channelName: filters.channelName,
        query: filters.query, 
        sortBy: filters.sortBy,
        regionCode: filters.regionCode,
        maxResults: filters.maxResults,
      }
    );

    if (res.status === 202 && res.data.jobId) {
      return await pollSearchJob(res.data.jobId, filters);
    }

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching YouTube results:",
      error.response?.data || error.message
    );
    throw error;
  }
};


/**
 * Create a new token
 */
export const getSearchJobStatus = async (jobId) => {
  try {
    const res = await api.get(`/query/job/${jobId}`);
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching job status:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const pollSearchJob = async (jobId, filters) => {
  const POLLING_INTERVAL = 2000;
  const MAX_ATTEMPTS = 150;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const statusData = await getSearchJobStatus(jobId);
    const status = statusData.status || statusData.job?.status;

    if (status === "completed") {
      return await getQueryResults({ ...filters, limit: 10000 });
    }

    if (status === "failed") {
      throw new Error(statusData.error?.message || "Search job failed");
    }

    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
  }

  throw new Error("Search job timed out");
};

export const getYouTubeResults = async (filters) => {
  try {
    const res = await api.post(
      `/query/search`,
      {
        query: filters.query, // send as array
        minViews: filters.minViews,
        minSubscribers: filters.minSubscribers,
        regionCode: filters.regionCode,
        sortBy: filters.sortBy,
        maxResults: filters.maxResults,
        startDate: filters.startDate,
        endDate: filters.endDate,
      }
    );

    if (res.status === 202 && res.data.jobId) {
      return await pollSearchJob(res.data.jobId, filters);
    }

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching YouTube results:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const getQueryResults = async (filters) => {
  try {
    
    const res = await api.get(`/query/results`, {
      params: filters,
    });

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching query results:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getFiltersResults = async () => {
  try {
    
    const res = await api.get(`/query/regions`);

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching query results:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const getcsvResults = async (filters) => {
   try {
    
    const res = await api.get(`/query/download`, {
      params: filters,
    });

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching query results:",
      error.response?.data || error.message
    );
    throw error;
  }

}
