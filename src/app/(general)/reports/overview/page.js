"use client";

import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { downloadDashboardPDF } from "@/utils/pdfExport";
import "./styles.css";

Chart.register(ChartDataLabels);
import {
  getDailyReportsByFilter,
  getDailyReportsByRange,
  getMonthlyReportsByFilter,
  getMonthlyReportsByRange,
} from "@/services/reports";
import { createReportsDataDevice } from "@/services/device";
import VisitorsChart from "@/components/widgetsCharts/VisitorsChart";
import VisitorsChartVcr from "@/components/widgetsCharts/VistiorsChartVcr";
import SiteOverviewChart from "@/components/widgetsCharts/SiteOverviewChart";
import PageHeader from "@/components/shared/pageHeader/PageHeader";

function formatNumber(num) {
  const rounded = Math.round(num);

  if (rounded >= 1000000) {
    return Math.round(rounded / 1000000).toLocaleString() + "M";
  } else if (rounded >= 1000) {
    return Math.round(rounded / 1000).toLocaleString() + "K";
  }
  return rounded.toLocaleString();
}

export default function OverviewPage() {
  const [dateRange, setDateRange] = useState("");
  const [campaign, setCampaign] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [audienceId, setAudienceId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [count, setCount] = useState(0);
  const [insertionOrderId, setInsertionOrderId] = useState("");

  // Global insertionOrderId - TODO: Make this dynamic later
  const INSERTION_ORDER_ID = insertionOrderId;

  useEffect(() => {
    // Load initial values from localStorage
    const storedRange = localStorage.getItem("selectedRange");
    const storedStart = localStorage.getItem("startDate");
    const storedEnd = localStorage.getItem("endDate");
    const storedAudienceId = localStorage.getItem("audienceId");
    const storedCount = localStorage.getItem("count");
    const storedInsertionId = localStorage.getItem("insertionId");

    if (storedRange) setDateRange(storedRange);
    if (storedStart) setStartDate(storedStart);
    if (storedEnd) setEndDate(storedEnd);
    if (storedAudienceId) setAudienceId(storedAudienceId);
    if (storedCount) setCount(parseInt(storedCount));
    if (storedInsertionId) setInsertionOrderId(storedInsertionId);

    setIsInitialized(true);

    const handleStorageChange = (event) => {
      const key = event.key ?? event?.detail?.key;
      const newValue = event.newValue ?? event?.detail?.newValue;

      if (key === "selectedRange") setDateRange(newValue);
      if (key === "startDate") setStartDate(newValue || "");
      if (key === "endDate") setEndDate(newValue || "");
      if (key === "audienceId") setAudienceId(newValue || "");
      if (key === "insertionId") setInsertionOrderId(newValue || "");
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    localStorage.setItem("selectedRange", dateRange);
    localStorage.setItem("startDate", startDate);
    localStorage.setItem("endDate", endDate);
    localStorage.setItem("audienceId", audienceId);
    localStorage.setItem("count", count);
    localStorage.setItem("insertionId", insertionOrderId);
  }, [dateRange, startDate, endDate, audienceId, isInitialized]);

  const params = {
    audienceId: audienceId,
    dataRange: dateRange,
    startDate: startDate,
    endDate: endDate,
  };

  // State for storing fetched data
  const [dailyReportsData, setDailyReportsData] = useState(null);
  const [monthlyReportsData, setMonthlyReportsData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const sentReportsData = async () => {
    try {
      const res = await createReportsDataDevice(params);
      console.log("Reports data sent successfully:", res);
      return true;
    } catch (error) {
      console.error("Error sending reports data:", error);
      return false;
    }
  };

  const fetchReportsData = async () => {
    // Validation: Check if dateRange is selected
    if (!dateRange) {
      console.log(
        "Date range is not selected. Please select a date range to fetch data.",
      );
      return;
    }

    // Validation: If dateRange is CUSTOM, both startDate and endDate must be selected
    if (dateRange === "CUSTOM" && (!startDate || !endDate)) {
      console.log(
        "Custom date range selected. Please select both start and end dates.",
      );
      return;
    }

    setIsLoadingData(true);

    try {
      // 1. Helper function to perform the actual fetch
      const performFetch = async () => {
        if (dateRange === "CUSTOM") {
          const [dailyData, monthlyData] = await Promise.all([
            getDailyReportsByRange(INSERTION_ORDER_ID, startDate, endDate),
            getMonthlyReportsByRange(INSERTION_ORDER_ID, startDate, endDate),
          ]);
          return { dailyData, monthlyData };
        } else {
          const [dailyData, monthlyData] = await Promise.all([
            getDailyReportsByFilter(INSERTION_ORDER_ID, dateRange),
            getMonthlyReportsByFilter(INSERTION_ORDER_ID, dateRange),
          ]);
          return { dailyData, monthlyData };
        }
      };

      let dailyData = null;
      let monthlyData = null;
      let fetchErrorOccurred = false;

      // 2. Try fetching existing data first
      try {
        const initialResult = await performFetch();
        dailyData = initialResult.dailyData;
        monthlyData = initialResult.monthlyData;
      } catch (error) {
        console.log("Initial fetch failed or data not found:", error.message);
        fetchErrorOccurred = true;
      }

      // 3. Check if we have data. If not (or if fetch failed), trigger sync and fetch again.
      const hasData =
        dailyData && Array.isArray(dailyData) && dailyData.length > 0;

      if (!hasData || fetchErrorOccurred) {
        console.log(
          "Data not found in DB or error occurred, triggering sync...",
        );

        // Clear old data to prevent showing stale results during sync
        setDailyReportsData(null);
        setMonthlyReportsData(null);

        const isSent = await sentReportsData();

        if (isSent) {
          console.log("Sync complete, fetching refreshed data...");
          // Fetch again after sync
          const refreshed = await performFetch();
          dailyData = refreshed.dailyData;
          monthlyData = refreshed.monthlyData;
        }
      } else {
        console.log("Existing data found in DB, skipping sync.");
      }

      setDailyReportsData(dailyData);
      setMonthlyReportsData(monthlyData);
      console.log("Report data updated successfully.");
    } catch (error) {
      console.error("Error in fetchReportsData workflow:", error);
      setDailyReportsData(null);
      setMonthlyReportsData(null);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Helper functions for validation
  const getValidationMessage = () => {
    if (!dateRange) {
      return "⚠️ Please select a date range to view data.";
    }
    if (dateRange === "CUSTOM" && (!startDate || !endDate)) {
      return "⚠️ Please select both start and end dates for custom date range.";
    }
    return null;
  };

  const calculateSummaryMetrics = () => {
    if (
      !dailyReportsData ||
      !Array.isArray(dailyReportsData) ||
      dailyReportsData.length === 0
    ) {
      return {
        impressions: 0,
        clicks: 0,
        completeViews: 0,
        ctr: "0.00",
        vcr: "0.00",
      };
    }

    const totals = dailyReportsData.reduce(
      (acc, curr) => {
        acc.impressions += parseInt(curr.impressions) || 0;
        acc.clicks += parseInt(curr.clicks) || 0;
        acc.completeViews += parseInt(curr.completeViewsVideo) || 0;
        return acc;
      },
      { impressions: 0, clicks: 0, completeViews: 0 },
    );

    const ctr =
      totals.impressions > 0
        ? ((totals.clicks / totals.impressions) * 100).toFixed(2)
        : "0.00";
    const vcr =
      totals.impressions > 0
        ? ((totals.completeViews / totals.impressions) * 100).toFixed(2)
        : "0.00";

    return {
      impressions: totals.impressions,
      clicks: totals.clicks,
      completeViews: totals.completeViews,
      ctr,
      vcr,
    };
  };

  const shouldShowData = () => {
    return dateRange && (dateRange !== "CUSTOM" || (startDate && endDate));
  };

  const summaryMetrics = calculateSummaryMetrics();

  // Fetch data after initialization and whenever date values change
  useEffect(() => {
    if (!isInitialized) return; // Wait until localStorage is loaded

    fetchReportsData();
  }, [isInitialized, dateRange, startDate, endDate]); // Re-fetch when dates change

  const [campaigns, setCampaigns] = useState([]);
  const [activities, setActivities] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [goals, setGoals] = useState([]);
  const [tableType, setTableType] = useState("daily"); // 'daily' or 'monthly'
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset page when data or table type changes
  useEffect(() => {
    setCurrentPage(1);
  }, [dailyReportsData, monthlyReportsData, tableType]);

  // Chart refs
  const performanceDailyChartRef = useRef(null);
  const performanceMonthlyChartRef = useRef(null);
  const platformChartRef = useRef(null);
  const funnelChartRef = useRef(null);
  const revenueChartRef = useRef(null);
  const heatmapChartRef = useRef(null);
  const deviceChartRef = useRef(null);
  const geographicChartRef = useRef(null);
  const demographicsChartRef = useRef(null);

  // Store chart instances
  const chartsRef = useRef({});
  const mainContentRef = useRef(null);

  const downloadPDF = () => {
    const dateText = dateRange === "CUSTOM" 
      ? `${startDate} to ${endDate}`
      : `${dateRange || 'All Time'}`;
      
    downloadDashboardPDF(mainContentRef, "Overview_Report", dateText);
  };

  useEffect(() => {
    // Destroy existing charts if they exist
    if (chartsRef.current.performanceDaily) {
      chartsRef.current.performanceDaily.destroy();
      chartsRef.current.performanceDaily = null;
    }
    if (chartsRef.current.performanceMonthly) {
      chartsRef.current.performanceMonthly.destroy();
      chartsRef.current.performanceMonthly = null;
    }

    // Performance Daily Chart
    if (
      performanceDailyChartRef.current &&
      dailyReportsData &&
      Array.isArray(dailyReportsData)
    ) {
      const ctx = performanceDailyChartRef.current.getContext("2d");

      // Process daily data from API
      const dailyData = {
        labels: dailyReportsData.map((item) => {
          // Format date from "2025/12/13" to "Dec 13"
          const date = new Date(item.date);
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        }),
        impressions: dailyReportsData.map(
          (item) => parseInt(item.impressions) || 0,
        ),
        vcr: dailyReportsData.map((item) => {
          const impressions = parseInt(item.impressions) || 0;
          const completeViews = parseInt(item.completeViewsVideo) || 0;
          return impressions > 0
            ? ((completeViews / impressions) * 100).toFixed(2)
            : 0;
        }),
      };

      chartsRef.current.performanceDaily = new Chart(ctx, {
        type: "line",
        data: {
          labels: dailyData.labels,
          datasets: [
            {
              label: "Impressions",
              data: dailyData.impressions,
              borderColor: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.08)",
              borderWidth: 3.5,
              fill: true,
              tension: 0.45,
              pointRadius: 5,
              pointHoverRadius: 8,
              pointBackgroundColor: "#6366f1",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
            },
            {
              label: "VCR",
              data: dailyData.vcr,
              borderColor: "#009DFE",
              backgroundColor: "transparent",
              borderWidth: 2.5,
              fill: false,
              tension: 0.45,
              pointRadius: 4,
              pointHoverRadius: 7,
              pointBackgroundColor: "#000",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              yAxisID: "y1",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          layout: { padding: { left: 0, right: 0, top: 10, bottom: 10 } },
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: {
                padding: 5,
                font: { size: 13, weight: "600" },
                color: "#495057",
              },
            },
            tooltip: {
              backgroundColor: "rgba(255,255,255,0.95)",
              padding: 16,
              titleColor: "#1a1a1a",
              bodyColor: "#495057",
              titleFont: { size: 14, weight: "bold" },
              bodyFont: { size: 12 },
              borderColor: "#dee2e6",
              borderWidth: 1,
              cornerRadius: 6,
              displayColors: true,
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || "";
                  if (label) label += ": ";
                  const value = context.parsed.y;
                  if (context.dataset.yAxisID === "y1") {
                    label += value + "%";
                  } else {
                    label += Math.round(value).toLocaleString();
                  }
                  return label;
                },
              },
            },
            datalabels: {
              display: 'auto',
              align: 'top',
              anchor: 'end',
              formatter: (value, context) => {
                if (context.dataset.yAxisID === "y1") {
                  return value + "%";
                }
                return formatNumber(value);
              },
              font: { size: 10, weight: 'bold' },
              color: (context) => context.dataset.borderColor,
            },
          },
          scales: {
            x: {
              grid: { color: "rgba(0,0,0,0.02)", drawBorder: false },
              ticks: { font: { size: 12, color: "#6c757d" }, padding: 8 },
            },
            y: {
              beginAtZero: true,
              grid: { color: "rgba(0,0,0,0.06)", drawBorder: false },
              ticks: {
                font: { size: 11, color: "#6c757d" },
                padding: 10,
                callback: function (value) {
                  return formatNumber(value);
                },
              },
            },
            y1: {
              type: "linear",
              display: true,
              position: "right",
              beginAtZero: true,
              grid: { drawOnChartArea: false, drawBorder: false },
              ticks: {
                font: { size: 11, color: "#6c757d" },
                padding: 10,
                callback: function (value) {
                  return value + "%";
                },
              },
            },
          },
        },
      });
    }

    // Performance Monthly Chart
    if (
      performanceMonthlyChartRef.current &&
      monthlyReportsData &&
      Array.isArray(monthlyReportsData)
    ) {
      const ctx = performanceMonthlyChartRef.current.getContext("2d");

      // Process monthly data from API
      const monthlyData = {
        labels: monthlyReportsData.map((item) => {
          // Format month from "2025/12" to "Dec 2025"
          const [year, month] = item.month.split("/");
          const date = new Date(year, month - 1);
          return date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
        }),
        impressions: monthlyReportsData.map(
          (item) => parseInt(item.impressions) || 0,
        ),
        vcr: monthlyReportsData.map((item) => {
          const impressions = parseInt(item.impressions) || 0;
          const completeViews = parseInt(item.completeViewsVideo) || 0;
          return impressions > 0
            ? ((completeViews / impressions) * 100).toFixed(2)
            : 0;
        }),
      };

      chartsRef.current.performanceMonthly = new Chart(ctx, {
        type: "line",
        data: {
          labels: monthlyData.labels,
          datasets: [
            {
              label: "Impressions",
              data: monthlyData.impressions,
              borderColor: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.08)",
              borderWidth: 3.5,
              fill: true,
              tension: 0.45,
              pointRadius: 5,
              pointHoverRadius: 8,
              pointBackgroundColor: "#6366f1",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
            },
            {
              label: "VCR",
              data: monthlyData.vcr,
              borderColor: "#009DFE",
              backgroundColor: "transparent",
              borderWidth: 2.5,
              fill: false,
              tension: 0.45,
              pointRadius: 4,
              pointHoverRadius: 7,
              pointBackgroundColor: "#009DFE",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              yAxisID: "y1",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          layout: { padding: { left: 0, right: 0, top: 10, bottom: 10 } },
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: {
                padding: 20,
                font: { size: 13, weight: "600" },
                color: "#495057",
              },
            },
            tooltip: {
              backgroundColor: "rgba(255,255,255,0.95)",
              padding: 16,
              titleColor: "#1a1a1a",
              bodyColor: "#495057",
              titleFont: { size: 14, weight: "bold" },
              bodyFont: { size: 12 },
              borderColor: "#dee2e6",
              borderWidth: 1,
              cornerRadius: 6,
              displayColors: true,
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || "";
                  if (label) label += ": ";
                  const value = context.parsed.y;
                  if (context.dataset.yAxisID === "y1") {
                    label += value + "%";
                  } else {
                    label += Math.round(value).toLocaleString();
                  }
                  return label;
                },
              },
            },
            datalabels: {
              display: 'auto',
              align: 'top',
              anchor: 'end',
              formatter: (value, context) => {
                if (context.dataset.yAxisID === "y1") {
                  return value + "%";
                }
                return formatNumber(value);
              },
              font: { size: 10, weight: 'bold' },
              color: (context) => context.dataset.borderColor,
            },
          },
          scales: {
            x: {
              grid: { color: "rgba(0,0,0,0.02)", drawBorder: false },
              ticks: { font: { size: 12, color: "#6c757d" }, padding: 8 },
            },
            y: {
              beginAtZero: true,
              grid: { color: "rgba(0,0,0,0.06)", drawBorder: false },
              ticks: {
                font: { size: 11, color: "#6c757d" },
                padding: 10,
                callback: function (value) {
                  return formatNumber(value);
                },
              },
            },
            y1: {
              type: "linear",
              display: true,
              position: "right",
              beginAtZero: true,
              grid: { drawOnChartArea: false, drawBorder: false },
              ticks: {
                font: { size: 11, color: "#6c757d" },
                padding: 10,
                callback: function (value) {
                  return value + "%";
                },
              },
            },
          },
        },
      });
    }

    // Platform Distribution Chart (Donut)
    if (platformChartRef.current && !chartsRef.current.platform) {
      const ctx = platformChartRef.current.getContext("2d");
      chartsRef.current.platform = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Google Ads", "Meta Ads", "LinkedIn", "TikTok", "Other"],
          datasets: [
            {
              data: [35, 28, 18, 12, 7],
              backgroundColor: [
                "#6366f1",
                "#ec4899",
                "#06b6d4",
                "#10b981",
                "#f59e0b",
              ],
              borderColor: "#fff",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                font: { size: 12 },
                padding: 15,
              },
            },
            datalabels: {
              color: '#fff',
              formatter: (value) => value + '%',
              font: { weight: 'bold' }
            }
          },
        },
      });
    }

    // Conversion Funnel Chart (Horizontal Bar)
    if (funnelChartRef.current && !chartsRef.current.funnel) {
      const ctx = funnelChartRef.current.getContext("2d");
      chartsRef.current.funnel = new Chart(ctx, {
        type: "bar",
        data: {
          labels: [
            "Impressions",
            "Visits",
            "Clicks",
            "Add to Cart",
            "Purchase",
          ],
          datasets: [
            {
              label: "Count",
              data: [2400, 1800, 900, 450, 200],
              backgroundColor: "#6366f1",
              borderRadius: 4,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            datalabels: {
              align: 'end',
              anchor: 'end',
              color: '#6366f1',
              font: { weight: 'bold' }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: "rgba(0,0,0,0.05)" },
            },
          },
        },
      });
    }

    // Revenue by Channel Chart (Stacked Bar)
    if (revenueChartRef.current && !chartsRef.current.revenue) {
      const ctx = revenueChartRef.current.getContext("2d");
      chartsRef.current.revenue = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Google",
              data: [500, 600, 700, 800, 900, 800, 700],
              backgroundColor: "#6366f1",
            },
            {
              label: "Meta",
              data: [400, 500, 600, 700, 800, 700, 600],
              backgroundColor: "#ec4899",
            },
            {
              label: "TikTok",
              data: [300, 400, 500, 600, 700, 600, 500],
              backgroundColor: "#06b6d4",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { stacked: true },
            y: { stacked: true, grid: { color: "rgba(0,0,0,0.05)" } },
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: { padding: 15 },
            },
            datalabels: {
              color: '#fff',
              font: { weight: 'bold' },
              formatter: (val) => val > 0 ? val : ''
            }
          },
        },
      });
    }

    // Hourly Performance Heatmap Chart
    if (heatmapChartRef.current && !chartsRef.current.heatmap) {
      const ctx = heatmapChartRef.current.getContext("2d");
      chartsRef.current.heatmap = new Chart(ctx, {
        type: "bar",
        data: {
          labels: [
            "12am",
            "1am",
            "2am",
            "3am",
            "4am",
            "5am",
            "6am",
            "7am",
            "8am",
            "9am",
            "10am",
            "11am",
          ],
          datasets: [
            {
              label: "Performance",
              data: [20, 15, 10, 25, 40, 60, 80, 90, 85, 75, 65, 55],
              backgroundColor: [
                "#ef4444",
                "#f97316",
                "#f59e0b",
                "#eab308",
                "#84cc16",
                "#22c55e",
                "#10b981",
                "#14b8a6",
                "#06b6d4",
                "#0ea5e9",
                "#6366f1",
                "#8b5cf6",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            datalabels: {
              color: '#fff',
              font: { weight: 'bold' },
              align: 'top',
              anchor: 'center'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              grid: { color: "rgba(0,0,0,0.05)" },
            },
          },
        },
      });
    }

    // Device Breakdown Chart (Pie)
    if (deviceChartRef.current && !chartsRef.current.device) {
      const ctx = deviceChartRef.current.getContext("2d");
      chartsRef.current.device = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Mobile", "Desktop", "Tablet", "Smart TV"],
          datasets: [
            {
              data: [45, 30, 15, 10],
              backgroundColor: ["#6366f1", "#ec4899", "#06b6d4", "#10b981"],
              borderColor: "#fff",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: { font: { size: 12 }, padding: 15 },
            },
            datalabels: {
              color: '#fff',
              font: { weight: 'bold' },
              formatter: (val) => val + '%'
            }
          },
        },
      });
    }

    // Geographic Performance Chart
    if (geographicChartRef.current && !chartsRef.current.geographic) {
      const ctx = geographicChartRef.current.getContext("2d");
      chartsRef.current.geographic = new Chart(ctx, {
        type: "bar",
        data: {
          labels: [
            "USA",
            "UK",
            "Canada",
            "Australia",
            "Germany",
            "France",
            "India",
            "Japan",
          ],
          datasets: [
            {
              label: "Revenue",
              data: [4500, 3800, 3200, 2900, 2600, 2400, 2100, 1900],
              backgroundColor: "#6366f1",
              borderRadius: 4,
            },
            {
              label: "Conversions",
              data: [3200, 2900, 2400, 2100, 1900, 1700, 1500, 1300],
              backgroundColor: "#06b6d4",
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { grid: { color: "rgba(0,0,0,0.05)" } },
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: { padding: 15 },
            },
            datalabels: {
              align: 'end',
              anchor: 'end',
              color: (context) => context.dataset.backgroundColor,
              font: { weight: 'bold', size: 10 },
              formatter: formatNumber
            }
          },
        },
      });
    }

    // Audience Demographics Chart
    if (demographicsChartRef.current && !chartsRef.current.demographics) {
      const ctx = demographicsChartRef.current.getContext("2d");
      chartsRef.current.demographics = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["13-24", "25-34", "35-44", "45-54", "55-64", "65+"],
          datasets: [
            {
              label: "Male",
              data: [850, 1200, 950, 800, 650, 400],
              backgroundColor: "#6366f1",
              borderRadius: 4,
            },
            {
              label: "Female",
              data: [920, 1350, 1050, 900, 720, 450],
              backgroundColor: "#ec4899",
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { grid: { color: "rgba(0,0,0,0.05)" } },
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: { padding: 15 },
            },
            datalabels: {
              color: '#fff',
              font: { weight: 'bold', size: 10 },
              formatter: formatNumber
            }
          },
        },
      });
    }

    return () => {
      // Cleanup charts on unmount
      Object.values(chartsRef.current).forEach((chart) => chart?.destroy());
      chartsRef.current = {};
    };
  }, [dailyReportsData, monthlyReportsData]); // Re-render charts when data changes

  return (
    <> <PageHeader></PageHeader>
    <main className="main-content" ref={mainContentRef}>
      {/* Filters Section */}
     

      {/* Real-time Stats */}
      <section className="realtime-section">
        <div className="realtime-card">
          <div className="realtime-header">
            <div className="realtime-title">
              <h3>Performance Summary</h3>
            </div>
          </div>

          <div className="realtime-stats">
            <Stat
              value={formatNumber(summaryMetrics.impressions)}
              label="Impressions"
            />
            <Stat
              value={formatNumber(summaryMetrics.completeViews)}
              label="Complete Views"
            />
            <Stat value={`${summaryMetrics.vcr}%`} label="VCR" />
            <Stat value={formatNumber(summaryMetrics.clicks)} label="Clicks" />
            <Stat value={`${summaryMetrics.ctr}%`} label="CTR" />
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="charts-section">
        <h2 className="section-title">Analytics & Insights</h2>
        <div className="charts-grid">
          <VisitorsChart dailyReportsData={dailyReportsData} />
          <VisitorsChartVcr dailyReportsData={dailyReportsData} />
        </div>
      </section>

      {/* Table */}
      <div className="data-table-card">
        <div className="table-header">
          <h3>Campaign Performance Summary</h3>
          <div className="table-actions">
            <div className="btn-group">
              <button 
                className={`btn btn-sm ${tableType === 'daily' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTableType('daily')}
              >
                Daily
              </button>
              <button 
                className={`btn btn-sm ${tableType === 'monthly' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTableType('monthly')}
              >
                Monthly
              </button>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={downloadPDF} title="Download Data as PDF" style={{ marginLeft: "10px" }}>
              <i className="fas fa-download" style={{ marginRight: "8px" }} /> Export PDF
            </button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>{tableType === "daily" ? "Date" : "Month"}</th>
              <th>Impressions</th>
              <th>Clicks</th>
              <th>CTR</th>
              <th>VCR</th>
              <th>1st Quartile Views</th>
              <th>Midpoint Views</th>
              <th>3rd Quartile Views</th>
              <th>Complete Views</th>
              <th>Media Cost</th>
              <th>Unique Reach</th>
            </tr>
          </thead>
          <tbody>
            {tableType === "daily" &&
            dailyReportsData &&
            Array.isArray(dailyReportsData) ? (
              (() => {
                const sortedData = [...dailyReportsData].sort((a, b) => b.date.localeCompare(a.date));
                const indexOfLastRow = currentPage * rowsPerPage;
                const indexOfFirstRow = indexOfLastRow - rowsPerPage;
                const currentRows = sortedData.slice(indexOfFirstRow, indexOfLastRow);

                return currentRows.map((item, index) => {
                  const impressions = parseInt(item.impressions) || 0;
                  const completeViews = parseInt(item.completeViewsVideo) || 0;
                  const vcr =
                    impressions > 0
                      ? ((completeViews / impressions) * 100).toFixed(2)
                      : "0.00";

                  return (
                    <tr key={index}>
                      <td>{item.date}</td>
                      <td>{parseInt(item.impressions).toLocaleString()}</td>
                      <td>{parseInt(item.clicks).toLocaleString()}</td>
                      <td>{item.ctr}</td>
                      <td>{vcr}%</td>
                      <td>
                        {parseInt(
                          item.firstQuartileViewsVideo,
                        ).toLocaleString()}
                      </td>
                      <td>
                        {parseInt(item.midpointViewsVideo).toLocaleString()}
                      </td>
                      <td>
                        {parseInt(
                          item.thirdQuartileViewsVideo,
                        ).toLocaleString()}
                      </td>

                      <td>
                        {parseInt(item.completeViewsVideo).toLocaleString()}
                      </td>
                      <td>
                        ₹
                        {(
                          parseFloat(item.mediaCostAdvertiserCurrency) * count
                        ).toFixed(2)}
                      </td>

                      <td>
                        {item.uniqueReachImpressionReach !== "-"
                          ? parseInt(
                              item.uniqueReachImpressionReach,
                            ).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  );
                });
              })()
            ) : tableType === "monthly" &&
              monthlyReportsData &&
              Array.isArray(monthlyReportsData) ? (
              (() => {
                const sortedData = [...monthlyReportsData].sort((a, b) => b.month.localeCompare(a.month));
                const indexOfLastRow = currentPage * rowsPerPage;
                const indexOfFirstRow = indexOfLastRow - rowsPerPage;
                const currentRows = sortedData.slice(indexOfFirstRow, indexOfLastRow);

                return currentRows.map((item, index) => {
                  const impressions = parseInt(item.impressions) || 0;
                  const completeViews = parseInt(item.completeViewsVideo) || 0;
                  const vcr =
                    impressions > 0
                      ? ((completeViews / impressions) * 100).toFixed(2)
                      : "0.00";

                  return (
                    <tr key={index}>
                      <td>{item.month}</td>
                      <td>{parseInt(item.impressions).toLocaleString()}</td>
                      <td>{parseInt(item.clicks).toLocaleString()}</td>
                      <td>{item.ctr}</td>
                      <td>{vcr}%</td>
                      <td>
                        {parseInt(
                          item.firstQuartileViewsVideo,
                        ).toLocaleString()}
                      </td>
                      <td>
                        {parseInt(item.midpointViewsVideo).toLocaleString()}
                      </td>
                      <td>
                        {parseInt(
                          item.thirdQuartileViewsVideo,
                        ).toLocaleString()}
                      </td>

                      <td>
                        {parseInt(item.completeViewsVideo).toLocaleString()}
                      </td>
                      <td>
                        ₹
                        {parseFloat(item.mediaCostAdvertiserCurrency).toFixed(
                          2,
                        )}
                      </td>
                      <td>
                        {item.uniqueReachImpressionReach !== "-"
                          ? parseInt(
                              item.uniqueReachImpressionReach,
                            ).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  );
                });
              })()
            ) : (
              <tr>
                <td
                  colSpan="11"
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#6b7280",
                  }}
                >
                  {isLoadingData
                    ? "Loading data..."
                    : "No data available. Please select a different date range to get data."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination UI */}
      {(tableType === "daily" ? dailyReportsData : monthlyReportsData)?.length > 0 && (
        <div className="pagination-wrapper">
          <div className="rows-per-page">
            <span>Rows per page:</span>
            <select 
              value={rowsPerPage} 
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="rows-select"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="pagination-controls">
            <span className="pagination-info">
              Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, (tableType === "daily" ? dailyReportsData : monthlyReportsData).length)} of {(tableType === "daily" ? dailyReportsData : monthlyReportsData).length}
            </span>
            <div className="pagination-buttons">
              <button 
                className="btn btn-sm btn-ghost" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left" />
              </button>
              
              {/* Simple page numbers */}
              {(() => {
                const totalPages = Math.ceil((tableType === "daily" ? dailyReportsData : monthlyReportsData).length / rowsPerPage);
                const pages = [];
                let startPage = Math.max(1, currentPage - 2);
                let endPage = Math.min(totalPages, startPage + 4);
                
                if (endPage - startPage < 4) {
                  startPage = Math.max(1, endPage - 4);
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      className={`btn btn-sm ${currentPage === i ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setCurrentPage(i)}
                    >
                      {i}
                    </button>
                  );
                }
                return pages;
              })()}

              <button 
                className="btn btn-sm btn-ghost" 
                onClick={() => {
                  const totalPages = Math.ceil((tableType === "daily" ? dailyReportsData : monthlyReportsData).length / rowsPerPage);
                  setCurrentPage(p => Math.min(totalPages, p + 1));
                }}
                disabled={currentPage === Math.ceil((tableType === "daily" ? dailyReportsData : monthlyReportsData).length / rowsPerPage)}
              >
                <i className="fas fa-chevron-right" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sections */}
    </main>
    </>
  );
}

/* ===== Helpers (same file) ===== */

function Stat({ value, label, trend }) {
  const trendColor = trend?.startsWith("+") ? "#10b981" : "#ef4444";
  const trendIcon = trend?.startsWith("+") ? "fa-arrow-up" : "fa-arrow-down";

  return (
    <div className="realtime-stat">
      <div className="realtime-value">{value}</div>
      <div className="realtime-label">{label}</div>
      {trend && (
        <div className="stat-trend" style={{ color: trendColor }}>
          <i className={`fas ${trendIcon}`} /> {trend}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, change }) {
  const changeColor = change?.startsWith("+") ? "#10b981" : "#ef4444";
  const changeIcon = change?.startsWith("+") ? "fa-arrow-up" : "fa-arrow-down";

  return (
    <div className="stat-card">
      <div className="stat-header">
        <i className={`fas ${icon}`} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{title}</div>
    </div>
  );
}

function ChartCard({ title, children, subtitle }) {
  return (
    <div className="chart-card" style={{ padding: 0 }}>
      <div className="chart-container">{children}</div>
    </div>
  );
}

function ProgressBar({ percent }) {
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${percent}%` }}></div>
    </div>
  );
}

function ActivityItem({ icon, title, time, color }) {
  return (
    <div className="activity-item">
      <div className={`activity-icon activity-${color}`}>
        <i className={`fas ${icon}`} />
      </div>
      <div className="activity-content">
        <p className="activity-title">{title}</p>
        <p className="activity-time">{time}</p>
      </div>
    </div>
  );
}

function PerformerItem({ rank, title, value }) {
  const rankColors = {
    1: "#ffd700",
    2: "#c0c0c0",
    3: "#cd7f32",
  };

  return (
    <div className="performer-item">
      <div
        className="performer-rank"
        style={{ color: rankColors[rank] || "#666" }}
      >
        #{rank}
      </div>
      <div className="performer-content">
        <p className="performer-title">{title}</p>
      </div>
      <div className="performer-value">
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function GoalItem({ title, current, target }) {
  const percent = parseInt(current);

  return (
    <div className="goal-item">
      <div className="goal-header">
        <p className="goal-title">{title}</p>
        <span className="goal-percent">{current}</span>
      </div>
      <div className="goal-progress">
        <div className="goal-fill" style={{ width: current }}></div>
      </div>
      <p className="goal-target">{target}</p>
    </div>
  );
}
