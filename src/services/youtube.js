import axios from "axios";
const Api_Url = process.env.NEXT_PUBLIC_API_BASE_URL;
import { getToken } from "@/lib/getToken";






export const getYouTubeResultsByChannel = async (filters) => {
  try {
    const token = await getToken();
    

    const res = await axios.post(
      `${Api_Url}/query/searchByChannel`,
      {
        channelName: filters.channelName,
        query: filters.query, 
        sortBy: filters.sortBy,
        regionCode: filters.regionCode,
        maxResults: filters.maxResults,
      
      },
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
    const token = await getToken();

    // Split the comma-separated string into an array
    

    const res = await axios.post(
      `${Api_Url}/query/search`,
      {
        query: filters.query, // send as array
        minViews: filters.minViews,
        minSubscribers: filters.minSubscribers,
        regionCode: filters.regionCode,
        sortBy: filters.sortBy,
        maxResults: filters.maxResults,
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
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
      "Error fetching YouTube results:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const getQueryResults = async (filters) => {
  try {
    
    const token = await getToken();
    

    const res = await axios.get(`${Api_Url}/query/results`, {
      params: filters,
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
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
    
    const token = await getToken();
    

    const res = await axios.get(`${Api_Url}/query/regions`, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
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


export const getcsvResults = async (filters) => {
   try {
    
    const token = await getToken();
    const searchQueries = filters.query
      .split(",")
      .map((q) => q.trim())
      .filter(Boolean); 
     console.log(filters.csvResults)

    const res = await axios.get(`${Api_Url}/query/download`, {
      params: filters,
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
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
