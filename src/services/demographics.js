import api from "@/lib/api";

export const createReportsDataAge = async (params) => {
  try {
    const res = await api.post(
      "/dv360/listQueries/age",
      {
        audienceId: params.audienceId,
        dataRange: params.dataRange,
        startDate: params.startDate,
        endDate: params.endDate,
      }
    );

    return res.data;
  } catch (error) {
    console.log(
      "Error fetching audience data:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Daily reports with filter (LAST_7_DAYS, LAST_30_DAYS, etc.)
export const getDailyReportsByFilter = async (insertionOrderId, filter, audienceId) => {
  try {
    const res = await api.post(
      "/demographics/filter",
      {
        insertionOrderId,
        filter,
        audienceId,
      }
    );

    return res.data.data; // Extract data array from response
  } catch (error) {
    console.log(
      "Error fetching daily reports by filter:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Daily reports with custom date range
export const getDailyReportsByRange = async (insertionOrderId, startDate, endDate, audienceId) => {
  try {
    const res = await api.post(
      "/demographics/range",
      {
        insertionOrderId,
        startDate,
        endDate,
        audienceId,
      }
    );

    return res.data.data;
  } catch (error) {
    console.log(
      "Error fetching daily reports by range:",
      error.response?.data || error.message
    );
    throw error;
  }
};
