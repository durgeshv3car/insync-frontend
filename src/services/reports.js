import api from "@/lib/api";

export const createReportsData = async (params) => {
  try {
    const res = await api.post(
      "/dv360/listQueries",
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
      "/overview/filter",
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
      "/overview/range",
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

// Monthly reports with filter (LAST_7_DAYS, LAST_30_DAYS, etc.)
export const getMonthlyReportsByFilter = async (insertionOrderId, filter, audienceId) => {
  try {
    const res = await api.post(
      "/overview/monthly/filter",
      {
        insertionOrderId,
        filter,
        audienceId,
      }
    );

    return res.data.data;
  } catch (error) {
    console.log(
      "Error fetching monthly reports by filter:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Monthly reports with custom date range
export const getMonthlyReportsByRange = async (insertionOrderId, startDate, endDate, audienceId) => {
  try {
    const res = await api.post(
      "/overview/monthly/range",
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
      "Error fetching monthly reports by range:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Download ALL daily overview data as CSV
export const downloadAllDailyOverviewCSV = async (insertionOrderId) => {
  try {
    const res = await api.post(
      "/overview/download/daily-all",
      { insertionOrderId },
      {
        responseType: "blob", // VERY IMPORTANT for CSV
      }
    );

    // Create download link in browser
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `overview_daily_${insertionOrderId}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log(
      "Error downloading daily overview CSV:",
      error.response?.data || error.message
    );
    if (error.response && error.response.status === 404) {
      alert("No daily overview data found to export.");
      return;
    }
    alert("Failed to download daily overview CSV.");
  }
};

