import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getYouTubeResultsByChannel = async (filters) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/query/searchByChannel`,
      {
        channelName: filters.channelName,
        query: Array.isArray(filters.query) ? filters.query : [filters.query],
        sortBy: filters.sortBy,
        dateRange: filters.dateRange,
        maxResults: filters.maxResults,
        userId: filters.userId,
      },
      {
        headers: {
          Authorization: token,
        },
      },
    );

    if (res.status === 202 && (res.data.jobId || res.data.progressId)) {
      const { regionCode, ...pollingFilters } = filters;
      // Use progressId if available, fallback to jobId
      return await pollSearchJob(
        res.data.progressId || res.data.jobId,
        pollingFilters,
        filters.onProgress,
      );
    }

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching YouTube results:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Create a new token
 */
export const getSearchJobStatus = async (jobId) => {
  try {
    const token = await getToken();
    const res = await axios.get(`${API_URL}/query/job/${jobId}`, {
      headers: {
        Authorization: token,
      },
    });
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching job status:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

const pollSearchJob = async (progressId, filters, onProgress) => {
  const POLLING_INTERVAL = 1500; // Faster updates since it's a dedicated API
  const MAX_ATTEMPTS = 200;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    try {
      // Fetch from the new Progress API
      const token = await getToken();
      const res = await axios.get(`${API_URL}/progress/${progressId}`, {
        headers: { Authorization: token },
      });

      const data = res.data;
      const status = data.status;

      if (onProgress && typeof onProgress === "function") {
        onProgress({
          status,
          processed: data.processedItems || 0,
          total: data.totalItems || filters.maxResults || 20,
          percent: Math.min(
            Math.floor(
              ((data.processedItems || 0) / (data.totalItems || 20)) * 100,
            ),
            99,
          ),
        });
      }

      if (status === "completed") {
        // Final results from the results endpoint
        return await getQueryResults({ ...filters, limit: 10000 });
      }

      if (status === "failed") {
        return Promise.reject(new Error("Search job failed on server"));
      }
    } catch (err) {
      console.warn("Polling error:", err.message);
    }

    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
  }

  throw new Error("Search job timed out");
};

export const getYouTubeResults = async (filters) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/query/search`,
      {
        query: Array.isArray(filters.query) ? filters.query : [filters.query], // send as array
        minViews: filters.minViews,
        minSubscribers: filters.minSubscribers,
        regionCode: filters.regionCode,
        sortBy: filters.sortBy,
        dateRange: filters.dateRange,
        maxResults: filters.maxResults,
        startDate: filters.startDate,
        endDate: filters.endDate,
        userId: filters.userId,
      },
      {
        headers: {
          Authorization: token,
        },
      },
    );

    if (res.status === 202 && (res.data.jobId || res.data.progressId)) {
      // Use progressId if available, fallback to jobId
      return await pollSearchJob(
        res.data.progressId || res.data.jobId,
        filters,
        filters.onProgress,
      );
    }

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching YouTube results:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getQueryResults = async (filters) => {
  try {
    const token = await getToken();
    const params = {
      ...filters,
      // Ensure query and channelName are strings for backend .split(",") compatibility
      query: Array.isArray(filters.query)
        ? filters.query.join(",")
        : filters.query,
      channelName: Array.isArray(filters.channelName)
        ? filters.channelName.join(",")
        : filters.channelName,
      // Prioritize explicit limit over maxResults
      limit: filters.limit || filters.maxResults || 2000,
    };

    const res = await axios.get(`${API_URL}/query/results`, {
      params,
      headers: {
        Authorization: token,
      },
    });

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching query results:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getFiltersResults = async () => {
  try {
    const token = await getToken();

    const res = await axios.get(`${API_URL}/query/regions`, {
      headers: {
        Authorization: token,
      },
    });

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching query results:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getcsvResults = async (filters) => {
  try {
    const token = await getToken();

    const res = await axios.get(`${API_URL}/query/download`, {
      params: filters,
      headers: {
        Authorization: token,
      },
    });

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching query results:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getLatestQueryByUserId = async (userId) => {
  try {
    const token = await getToken();
    const res = await axios.get(
      `${API_URL}/recent-keywords/latest-query/${userId}`,
      {
        headers: { Authorization: token },
      },
    );
    return res.data.query;
  } catch (error) {
    console.error(
      "Error fetching latest query:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const getRecentTenQueries = async (userId) => {
  try {
    const token = await getToken();
    const res = await axios.get(
      `${API_URL}/recent-keywords/ten-list/${userId}`,
      {
        headers: { Authorization: token },
      },
    );
    return res.data.queries;
  } catch (error) {
    console.error(
      "Error fetching ten list:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
