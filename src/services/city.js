import api from "@/lib/api";

export const createReportsDataCity = async (params) => {
  try {
    const res = await api.post(
      "/dv360/listQueries/city",
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
export const getDailyReportsByFilterCity = async (insertionOrderId, filter, audienceId) => {
  try {
    const res = await api.post(
      "/city/filter",
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
export const getDailyReportsByRangeCity = async (insertionOrderId, startDate, endDate, audienceId) => {
  try {
    const res = await api.post(
      "/city/range",
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


// Download ALL daily city data as CSV
export const downloadAllDailyCityCSV = async (insertionOrderId) => {
  try {
    const res = await api.post(
      "/city/download/daily-all",
      { insertionOrderId },
      {
        responseType: "blob", // IMPORTANT for CSV
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `city_daily_${insertionOrderId}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log(
      "Error downloading daily city CSV:",
      error.response?.data || error.message
    );
    if (error.response && error.response.status === 404) {
      alert("No daily city data found to export.");
      return;
    }
    alert("Failed to download daily city CSV.");
  }
};
