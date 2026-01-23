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
