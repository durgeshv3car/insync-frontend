"use client";

import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { downloadDashboardPDF } from "@/utils/pdfExport";
import "./styles.css";

Chart.register(ChartDataLabels);
import {
  createReportsDataDevice,
  downloadAllDailyDeviceCSV,
  getDailyReportsByFilter,
  getDailyReportsByRange,
} from "@/services/device";
import { formatDate } from "@/utils/dateFormatter";
import { FiSmartphone, FiMonitor, FiTablet, FiTv, FiDownload } from "react-icons/fi";

const getDeviceIcon = (type) => {
  const t = type?.toLowerCase() || "";

  if (t.includes("desktop")) {
    return (
      <span className="device-icon-badge desktop">
        <FiMonitor size={14} />
      </span>
    );
  }

  if (t.includes("mobile") || t.includes("smart phone")) {
    return (
      <span className="device-icon-badge mobile">
        <FiSmartphone size={14} />
      </span>
    );
  }

  if (t.includes("tablet")) {
    return (
      <span className="device-icon-badge tablet">
        <FiTablet size={14} />
      </span>
    );
  }

  return (
    <span className="device-icon-badge tv">
      <FiTv size={14} />
    </span>
  );
};

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
  const [insertionOrderId, setInsertionOrderId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("insertionId") || "";
    }
    return "";
  });
  const [count, setCount] = useState(() => {
    if (typeof window !== "undefined") {
      const storedCount = localStorage.getItem("count");
      return storedCount ? Number(storedCount) : 0;
    }
    return 0;
  });
  const [audienceName, setAudienceName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("audienceName") || "";
    }
    return "";
  });


  const INSERTION_ORDER_ID = insertionOrderId;

  useEffect(() => {
    // Load initial values from localStorage
    const storedRange = localStorage.getItem("selectedRange");
    const storedStart = localStorage.getItem("startDate");
    const storedEnd = localStorage.getItem("endDate");
    const insertionOrderId = localStorage.getItem("insertionId");
    const storedAudienceId = localStorage.getItem("audienceId");

    if (storedRange) setDateRange(storedRange);
    if (storedStart) setStartDate(storedStart);
    if (storedEnd) setEndDate(storedEnd);
    if (storedAudienceId) setAudienceId(storedAudienceId);

    setIsInitialized(true);

    const handleStorageChange = (event) => {
      const key = event.key ?? event?.detail?.key;
      const newValue = event.newValue ?? event?.detail?.newValue;

      if (key === "selectedRange") setDateRange(newValue);
      if (key === "startDate") setStartDate(newValue || "");
      if (key === "endDate") setEndDate(newValue || "");
      if (key === "audienceId") setAudienceId(newValue || "");
      if (key === "audienceName") setAudienceName(newValue || "");
      if (key === "insertionId") setInsertionOrderId(newValue || "");
      if (key === "count") setCount(newValue ? Number(newValue) : 0);

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
  }, [
    dateRange,
    startDate,
    endDate,
    audienceId,
    isInitialized,
    count,
    insertionOrderId,
  ]);

  const params = {
    audienceId: audienceId,
    dataRange: dateRange,
    startDate: startDate,
    endDate: endDate,
  };

  // State for storing fetched data
  const [dailyReportsData, setDailyReportsData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);



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
    // Add artificial delay for smoother transition
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // 1. Helper function to perform the actual fetch
      const performFetch = async () => {
        if (dateRange === "CUSTOM") {
          const dailyData = await getDailyReportsByRange(
            INSERTION_ORDER_ID,
            startDate,
            endDate,
            audienceId
          );
          return { dailyData };
        } else {
          const dailyData = await getDailyReportsByFilter(
            INSERTION_ORDER_ID,
            dateRange,
            audienceId
          );
          return { dailyData };
        }
      };

      const result = await performFetch();
      const dailyData = result.dailyData;

      setDailyReportsData(dailyData);
      console.log("Report data updated successfully.");
    } catch (error) {
      console.error("Error in fetchReportsData workflow:", error);
      setDailyReportsData(null);
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
  }, [isInitialized, dateRange, startDate, endDate, insertionOrderId]); // Re-fetch when dates or audience change

  const groupDataByDevice = (data) => {
    if (!data || !Array.isArray(data)) return [];

    const grouped = data.reduce((acc, curr) => {
      const device = curr.deviceType || "Unknown";
      if (!acc[device]) {
        acc[device] = {
          deviceType: device,
          impressions: 0,
          clicks: 0,
          completeViews: 0,
          cost: 0,
        };
      }
      acc[device].impressions += parseInt(curr.impressions) || 0;
      acc[device].clicks += parseInt(curr.clicks) || 0;
      acc[device].completeViews += parseInt(curr.completeViewsVideo) || 0;
      acc[device].cost +=
        parseFloat(curr.cost || curr.mediaCostAdvertiserCurrency) || 0;
      return acc;
    }, {});

    return Object.values(grouped);
  };

  const aggregatedData = groupDataByDevice(dailyReportsData);

  const calculateDeviceTotals = () => {
    if (!aggregatedData || !Array.isArray(aggregatedData) || aggregatedData.length === 0) {
      return null;
    }

    const totals = aggregatedData.reduce(
      (acc, curr) => {
        acc.impressions += curr.impressions || 0;
        acc.clicks += curr.clicks || 0;
        acc.completeViews += curr.completeViews || 0;
        acc.cost += parseFloat(curr.cost) || 0;
        return acc;
      },
      { impressions: 0, clicks: 0, completeViews: 0, cost: 0 }
    );

    const ctr = totals.impressions > 0
      ? ((totals.clicks / totals.impressions) * 100).toFixed(2)
      : "0.00";
    
    const vcr = totals.impressions > 0
      ? ((totals.completeViews / totals.impressions) * 100).toFixed(2)
      : "0.00";

    return {
      ...totals,
      ctr,
      vcr,
    };
  };

  const [campaigns, setCampaigns] = useState([]);
  const [activities, setActivities] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [goals, setGoals] = useState([]);

  // Chart refs
  const performanceDailyChartRef = useRef(null);
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
    const dateText =
      dateRange === "CUSTOM"
        ? `${startDate} to ${endDate}`
        : `${dateRange || "All Time"}`;

    downloadDashboardPDF(mainContentRef, "Device_Report", dateText);
  };

  useEffect(() => {
    // Destroy existing charts if they exist
    if (chartsRef.current.performanceDaily) {
      chartsRef.current.performanceDaily.destroy();
      chartsRef.current.performanceDaily = null;
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
          return formatDate(item.date);
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
              borderColor: "#ec4899",
              backgroundColor: "transparent",
              borderWidth: 2.5,
              fill: false,
              tension: 0.45,
              pointRadius: 4,
              pointHoverRadius: 7,
              pointBackgroundColor: "#ec4899",
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
                color: "#cbd5e1",
              },
            },
            tooltip: {
              backgroundColor: "rgba(15,23,42,0.95)",
              padding: 16,
              titleColor: "#f1f5f9",
              bodyColor: "#94a3b8",
              titleFont: { size: 14, weight: "bold" },
              bodyFont: { size: 12 },
              borderColor: "rgba(255,255,255,0.12)",
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
          },
          scales: {
            x: {
              grid: { color: "rgba(255,255,255,0.06)", drawBorder: false },
              ticks: { font: { size: 12 }, color: "#94a3b8", padding: 8 },
            },
            y: {
              beginAtZero: true,
              grid: { color: "rgba(255,255,255,0.06)", drawBorder: false },
              ticks: {
                font: { size: 11 }, color: "#94a3b8",
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
                font: { size: 11 }, color: "#94a3b8",
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
              borderColor: "transparent",
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
                color: "#cbd5e1",
              },
            },
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
          plugins: { legend: { display: false } },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: "rgba(255,255,255,0.06)" },
              ticks: { color: "#94a3b8" },
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
            x: { stacked: true, ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.06)" } },
            y: { stacked: true, ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.06)" } },
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: { padding: 15, color: "#cbd5e1" },
            },
          },
        },
      });
    }

    // Hourly Heatmap (Now grouped by Device Type)
    if (heatmapChartRef.current && aggregatedData.length > 0) {
      if (chartsRef.current.heatmap) {
        chartsRef.current.heatmap.destroy();
      }
      const ctx = heatmapChartRef.current.getContext("2d");
      chartsRef.current.heatmap = new Chart(ctx, {
        type: "bar",
        data: {
          labels: aggregatedData.map((item) => item.deviceType),
          datasets: [
            {
              label: "Impressions by Device",
              data: aggregatedData.map((item) => item.impressions),
              backgroundColor: [
                "#6366f1",
                "#ec4899",
                "#06b6d4",
                "#10b981",
                "#f59e0b",
                "#8b5cf6",
              ],
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) =>
                  `Impressions: ${context.parsed.y.toLocaleString()}`,
              },
            },
            datalabels: {
              align: "top",
              anchor: "end",
              color: "#333",
              font: { weight: "bold" },
              formatter: formatNumber,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "rgba(0,0,0,0.05)" },
              ticks: {
                callback: (value) => formatNumber(value),
              },
            },
            x: {
              grid: { display: false },
            },
          },
        },
      });
    }

    return () => {
      // Cleanup charts on unmount
      Object.values(chartsRef.current).forEach((chart) => chart?.destroy());
      chartsRef.current = {};
    };
  }, [dailyReportsData, aggregatedData]); // Re-render charts when data changes

  const desktopItem = aggregatedData?.find((d) =>
    d.deviceType?.toLowerCase().includes("desktop")
  ) || { impressions: 0 };

  const mobileItem = aggregatedData?.find(
    (d) =>
      d.deviceType?.toLowerCase().includes("mobile") ||
      d.deviceType?.toLowerCase().includes("smart phone")
  ) || { impressions: 0 };

  const tabletItem = aggregatedData?.find((d) =>
    d.deviceType?.toLowerCase().includes("tablet")
  ) || { impressions: 0 };

  const totalDeviceImpressions =
    (desktopItem.impressions || 0) +
      (mobileItem.impressions || 0) +
      (tabletItem.impressions || 0) ||
    aggregatedData?.reduce((acc, curr) => acc + (curr.impressions || 0), 0) ||
    0;

  const desktopPct =
    totalDeviceImpressions > 0
      ? ((desktopItem.impressions / totalDeviceImpressions) * 100).toFixed(2)
      : "0.00";
  const mobilePct =
    totalDeviceImpressions > 0
      ? ((mobileItem.impressions / totalDeviceImpressions) * 100).toFixed(2)
      : "0.00";
  const tabletPct =
    totalDeviceImpressions > 0
      ? ((tabletItem.impressions / totalDeviceImpressions) * 100).toFixed(2)
      : "0.00";

  return (
    <>
      <div ref={mainContentRef}>
        {/* Device & Ad type Impression - 3 Gradient Cards */}
        <section className="device-section">
          <h2 className="device-section-title">Device & Ad type Impression</h2>
          <div className="device-gradient-grid">
            {/* Desktop */}
            <div className="device-gradient-card desktop-card">
              <div>
                <div className="device-card-header">
                  <div className="device-card-icon">
                    <FiMonitor size={20} color="#ffffff" />
                  </div>
                  <span className="device-card-label">Desktop</span>
                </div>
                <div className="device-card-value">
                  {formatNumber(desktopItem.impressions)}
                </div>
              </div>
              <div className="device-card-pct">{desktopPct}%</div>
            </div>

            {/* Smart Phone */}
            <div className="device-gradient-card mobile-card">
              <div>
                <div className="device-card-header">
                  <div className="device-card-icon">
                    <FiSmartphone size={20} color="#ffffff" />
                  </div>
                  <span className="device-card-label">Smart Phone</span>
                </div>
                <div className="device-card-value">
                  {formatNumber(mobileItem.impressions)}
                </div>
              </div>
              <div className="device-card-pct">{mobilePct}%</div>
            </div>

            {/* Tablet */}
            <div className="device-gradient-card tablet-card">
              <div>
                <div className="device-card-header">
                  <div className="device-card-icon">
                    <FiTablet size={20} color="#ffffff" />
                  </div>
                  <span className="device-card-label">Tablet</span>
                </div>
                <div className="device-card-value">
                  {formatNumber(tabletItem.impressions)}
                </div>
              </div>
              <div className="device-card-pct">{tabletPct}%</div>
            </div>
          </div>
        </section>

        {/* 2-Column Row: Device Table + Gender */}
        <div className="device-gender-grid">
          {/* Left: Device Performance Summary Table */}
          <div className="device-table-card" style={{ position: "relative" }}>
            {isLoadingData && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <div className="loading-text">Updating device data...</div>
              </div>
            )}
            <div className="table-header">
              <h3>Device Performance Summary</h3>

              <div className="table-actions">
                <button
                  className="table-export-btn"
                  onClick={() => downloadAllDailyDeviceCSV(insertionOrderId)}
                  title="Download CSV"
                >
                  <FiDownload size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="data-table device-summary-table">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th style={{ textAlign: "right" }}>Impressions</th>
                    <th style={{ textAlign: "right" }}>Clicks</th>
                    <th style={{ textAlign: "right" }}>CTR</th>
                    <th style={{ textAlign: "right" }}>VCR</th>
                    <th style={{ textAlign: "right" }}>Complete Views</th>
                    <th style={{ textAlign: "right" }}>Media Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregatedData && aggregatedData.length > 0 ? (
                    aggregatedData.map((item, index) => {
                      const ctr =
                        item.impressions > 0
                          ? ((item.clicks / item.impressions) * 100).toFixed(2)
                          : "0.00";
                      const vcr =
                        item.impressions > 0
                          ? (
                              (item.completeViews / item.impressions) *
                              100
                            ).toFixed(2)
                          : "0.00";

                      return (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              {getDeviceIcon(item.deviceType)}
                              <span style={{ fontWeight: 600 }}>{item.deviceType}</span>
                            </div>
                          </td>

                          <td style={{ textAlign: "right", fontWeight: 500 }}>{item.impressions.toLocaleString()}</td>
                          <td style={{ textAlign: "right", fontWeight: 500 }}>{item.clicks.toLocaleString()}</td>
                          <td style={{ textAlign: "right", fontWeight: 500 }}>{ctr}%</td>
                          <td style={{ textAlign: "right", fontWeight: 500 }}>{vcr}%</td>
                          <td style={{ textAlign: "right", fontWeight: 500 }}>{item.completeViews.toLocaleString()}</td>
                          <td style={{ textAlign: "right", fontWeight: 500 }}>
                            ₹{(Number(item?.cost) || 0).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          textAlign: "center",
                          padding: "2rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {isLoadingData
                          ? "Loading data..."
                          : "No data available. Please select a different date range to get data."}
                      </td>
                    </tr>
                  )}
                </tbody>
                {(() => {
                  const totals = calculateDeviceTotals();
                  if (!totals) return null;
                  return (
                    <tfoot>
                      <tr className="totals-row">
                        <td>Total</td>
                        <td style={{ textAlign: "right" }}>{totals.impressions.toLocaleString()}</td>
                        <td style={{ textAlign: "right" }}>{totals.clicks.toLocaleString()}</td>
                        <td style={{ textAlign: "right" }}>{totals.ctr}%</td>
                        <td style={{ textAlign: "right" }}>{totals.vcr}%</td>
                        <td style={{ textAlign: "right" }}>{totals.completeViews.toLocaleString()}</td>
                        <td style={{ textAlign: "right" }}>₹{totals.cost.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  );
                })()}
              </table>
            </div>
          </div>

          {/* Right: Gender Level Performance Card */}
          <GenderLevelPerformance dailyReportsData={dailyReportsData} />
        </div>

        {/* Bottom Sections */}
      </div>
    </>
  );
}

/* ===== Gender Level Performance Component ===== */

function GenderLevelPerformance({ dailyReportsData }) {
  const [activeMetric, setActiveMetric] = useState("Impressions");

  const dataArray = Array.isArray(dailyReportsData) ? dailyReportsData : [];

  const groupMap = {
    Male: { impressions: 0, clicks: 0, completes: 0 },
    Female: { impressions: 0, clicks: 0, completes: 0 },
    Other: { impressions: 0, clicks: 0, completes: 0 },
  };

  dataArray.forEach((item) => {
    let gender = item.gender || "Unknown";
    const gLower = gender.toLowerCase();
    if (gLower.includes("male") && !gLower.includes("female")) {
      gender = "Male";
    } else if (gLower.includes("female")) {
      gender = "Female";
    } else {
      gender = "Other";
    }

    const imps = Number(item.impressions) || 0;
    const ctrPct = Number(item.ctr?.replace("%", "")) || 0;
    const clks =
      item.clicks !== undefined
        ? Number(item.clicks)
        : Math.round((ctrPct / 100) * imps);
    const comps = Number(item.completeViewsVideo) || 0;

    groupMap[gender].impressions += imps;
    groupMap[gender].clicks += clks;
    groupMap[gender].completes += comps;
  });

  const totalImpressions =
    groupMap.Male.impressions +
    groupMap.Female.impressions +
    groupMap.Other.impressions;

  const getMetricData = (genderKey) => {
    const g = groupMap[genderKey];
    if (activeMetric === "Impressions") {
      const val = g.impressions;
      const pct =
        totalImpressions > 0
          ? ((val / totalImpressions) * 100).toFixed(1)
          : "0.0";
      return {
        valueText: formatNumber(val),
        pctText: pct + "%",
        pctNum: parseFloat(pct),
      };
    }
    if (activeMetric === "VCR") {
      const vcr =
        g.impressions > 0
          ? ((g.completes / g.impressions) * 100).toFixed(1)
          : "0.0";
      return {
        valueText: vcr + "%",
        pctText: vcr + "%",
        pctNum: Math.min(100, parseFloat(vcr)),
      };
    }
    // CTR
    const ctr =
      g.impressions > 0
        ? ((g.clicks / g.impressions) * 100).toFixed(2)
        : "0.00";
    return {
      valueText: ctr + "%",
      pctText: ctr + "%",
      pctNum: Math.min(100, parseFloat(ctr) * 10),
    };
  };

  const maleData = getMetricData("Male");
  const femaleData = getMetricData("Female");
  const otherData = getMetricData("Other");

  return (
    <div className="gender-card">
      <div className="table-header">
        <h3>Gender Level Performance</h3>
        <div className="toggle-pill-group">
          {["Impressions", "VCR", "CTR"].map((m) => (
            <button
              key={m}
              className={`toggle-pill-btn ${activeMetric === m ? "active" : ""}`}
              onClick={() => setActiveMetric(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="gender-card-body">
        <div className="gender-bars-list">
          {/* Male */}
          <div className="gender-bar-item">
            <span className="gender-bar-label">Male</span>
            <div className="gender-bar-track">
              <div
                className="gender-bar-fill male"
                style={{ width: `${Math.max(2, maleData.pctNum)}%` }}
              />
            </div>
            <div className="gender-bar-val-box">
              <div className="gender-bar-value">{maleData.valueText}</div>
              <div className="gender-bar-pct">{maleData.pctText}</div>
            </div>
          </div>

          {/* Female */}
          <div className="gender-bar-item">
            <span className="gender-bar-label">Female</span>
            <div className="gender-bar-track">
              <div
                className="gender-bar-fill female"
                style={{ width: `${Math.max(2, femaleData.pctNum)}%` }}
              />
            </div>
            <div className="gender-bar-val-box">
              <div className="gender-bar-value">{femaleData.valueText}</div>
              <div className="gender-bar-pct">{femaleData.pctText}</div>
            </div>
          </div>

          {/* Other */}
          <div className="gender-bar-item">
            <span className="gender-bar-label">Other</span>
            <div className="gender-bar-track">
              <div
                className="gender-bar-fill other"
                style={{ width: `${Math.max(2, otherData.pctNum)}%` }}
              />
            </div>
            <div className="gender-bar-val-box">
              <div className="gender-bar-value">{otherData.valueText}</div>
              <div className="gender-bar-pct">{otherData.pctText}</div>
            </div>
          </div>
        </div>

        <div className="gender-total-row">
          <span>Total</span>
          <span style={{ color: "#2563eb" }}>
            {activeMetric === "Impressions"
              ? formatNumber(totalImpressions)
              : "100%"}
          </span>
          <span>100%</span>
        </div>
      </div>
    </div>
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

function ChartCard({ title, children, subtitle, className = "" }) {
  return (
    <div className={`chart-card ${className}`}>
      <div className="chart-header">
        <div className="chart-title-group">
          <h3>{title}</h3>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
        <button className="btn btn-sm btn-ghost" title="More options">
          <i className="fas fa-ellipsis-h" />
        </button>
      </div>
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
