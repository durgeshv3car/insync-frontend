import api from "@/lib/api";

export const getYouTubeResultsByChannel = async (filters) => {
  try {
    const res = await api.post(
      "/query/searchByChannel",
      {
        channelName: filters.channelName,
        query: Array.isArray(filters.query) ? filters.query : [filters.query],
        sortBy: filters.sortBy,
        dateRange: filters.dateRange,
        maxResults: filters.maxResults,
        userId: filters.userId,
      }
    );

    if (res.status === 202 && (res.data.jobId || res.data.progressId)) {
      const { regionCode, ...pollingFilters } = filters;
      return await pollSearchJob(
        { progressId: res.data.progressId, jobId: res.data.jobId },
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
    const res = await api.get(`/query/job/${jobId}`);
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching job status:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

const pollSearchJob = async (ids, filters, onProgress) => {
  const POLLING_INTERVAL = 1500; // Faster updates since it's a dedicated API
  const MAX_ATTEMPTS = 200;
  const progressId = typeof ids === "object" ? ids.progressId : ids;
  const jobId = typeof ids === "object" ? ids.jobId : null;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    try {
      let status = null;
      let processed = 0;
      let total = filters.maxResults || 20;

      if (progressId) {
        // Fetch from the Progress API
        const res = await api.get(`/progress/${progressId}`);
        const data = res.data;
        status = data.status;
        processed = data.processedItems || 0;
        total = data.totalItems || total;
      } else if (jobId) {
        const jobRes = await getSearchJobStatus(jobId);
        status = jobRes?.job?.status;
      }

      if (onProgress && typeof onProgress === "function") {
        onProgress({
          status,
          processed,
          total,
          percent: Math.min(
            Math.floor((processed / (total || 20)) * 100),
            99,
          ),
        });
      }

      if (status === "completed") {
        // Fetch job status if jobId is available to get resultSummary and similarQueries
        let jobData = null;
        if (jobId) {
          try {
            const jobRes = await getSearchJobStatus(jobId);
            jobData = jobRes?.job || null;
          } catch (e) {
            console.warn("Could not fetch job status:", e.message);
          }
        }

        const limitToRequest = filters.maxResults
          ? Math.max(Number(filters.maxResults), 1)
          : 50;

        // Final results from the results endpoint
        const queryRes = await getQueryResults({
          ...filters,
          limit: limitToRequest,
        });

        const videoResults =
          Array.isArray(jobData?.searchResults) &&
          jobData.searchResults.length > 0
            ? jobData.searchResults.slice(0, limitToRequest)
            : Array.isArray(queryRes?.results) && queryRes.results.length > 0
              ? queryRes.results.slice(0, limitToRequest)
              : [];

        const similarQueries =
          jobData?.resultSummary?.similarQueries ||
          queryRes?.similarQueries ||
          [];

        const unfilteredDbCount =
          jobData?.resultSummary?.unfilteredDbCount !== undefined
            ? jobData.resultSummary.unfilteredDbCount
            : queryRes?.unfilteredDbCount !== undefined
              ? queryRes.unfilteredDbCount
              : 0;

        return {
          ...queryRes,
          results: videoResults,
          job: jobData,
          resultSummary: jobData?.resultSummary || {
            count: videoResults.length,
            message:
              videoResults.length > 0
                ? "Search completed successfully"
                : "No videos found",
            similarQueries,
            unfilteredDbCount,
          },
          similarQueries,
          unfilteredDbCount,
        };
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
    const res = await api.post(
      "/query/search",
      {
        query: Array.isArray(filters.query) ? filters.query : [filters.query], // send as array
        originalQuery: filters.originalQuery || filters.saveAsQuery || undefined,
        saveAsQuery: filters.saveAsQuery || filters.originalQuery || undefined,
        minViews: filters.minViews,
        minSubscribers: filters.minSubscribers,
        regionCode: filters.regionCode,
        sortBy: filters.sortBy,
        dateRange: filters.dateRange,
        maxResults: filters.maxResults,
        startDate: filters.startDate,
        endDate: filters.endDate,
        userId: filters.userId,
      }
    );

    if (res.status === 202 && (res.data.jobId || res.data.progressId)) {
      return await pollSearchJob(
        { progressId: res.data.progressId, jobId: res.data.jobId },
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

    const res = await api.get("/query/results", { params });

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
    const res = await api.get("/query/regions");

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
    const res = await api.get("/query/download", { params: filters });

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
    const res = await api.get(`/recent-keywords/latest-query/${userId}`, {
      skipToast: true,
    });
    return res.data?.query || null;
  } catch (error) {
    console.warn(
      "Latest query not available:",
      error.response?.data || error.message,
    );
    return null;
  }
};

export const getRecentTenQueries = async (userId) => {
  try {
    const res = await api.get(`/recent-keywords/ten-list/${userId}`, {
      skipToast: true,
    });
    return res.data?.queries || [];
  } catch (error) {
    console.warn(
      "Recent queries not available:",
      error.response?.data || error.message,
    );
    return [];
  }
};
