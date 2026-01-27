"use client";

import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "./styles.css";
import {
  createReportsDataDevice,
  getDailyReportsByFilter,
  getDailyReportsByRange,
} from "@/services/device";
import VisitorsChart from "@/components/widgetsCharts/VisitorsChart";
import TopCountryBarChart from "@/components/widgetsCharts/TopCountriyBarChart";

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

  // Global insertionOrderId - TODO: Make this dynamic later
  const INSERTION_ORDER_ID = "1024667156";

  useEffect(() => {
    // Load initial values from localStorage
    const storedRange = localStorage.getItem("selectedRange");
    const storedStart = localStorage.getItem("startDate");
    const storedEnd = localStorage.getItem("endDate");
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
  }, [dateRange, startDate, endDate, audienceId, isInitialized]);

  const params = {
    audienceId: audienceId,
    dataRange: dateRange,
    startDate: startDate,
    endDate: endDate,
  };

  // State for storing fetched data
  const [dailyReportsData, setDailyReportsData] = useState(null);
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
        "Date range is not selected. Please select a date range to fetch data."
      );
      return;
    }

    // Validation: If dateRange is CUSTOM, both startDate and endDate must be selected
    if (dateRange === "CUSTOM" && (!startDate || !endDate)) {
      console.log(
        "Custom date range selected. Please select both start and end dates."
      );
      return;
    }

    setIsLoadingData(true);

    try {
      // 1. Helper function to perform the actual fetch
      const performFetch = async () => {
        if (dateRange === "CUSTOM") {
          const dailyData = await getDailyReportsByRange(
            INSERTION_ORDER_ID,
            startDate,
            endDate
          );
          return { dailyData };
        } else {
          const dailyData = await getDailyReportsByFilter(
            INSERTION_ORDER_ID,
            dateRange
          );
          return { dailyData };
        }
      };

      let dailyData = null;
      let monthlyData = null;
      let fetchErrorOccurred = false;

      // 2. Try fetching existing data first
      try {
        const initialResult = await performFetch();
        dailyData = initialResult.dailyData;
      } catch (error) {
        console.log("Initial fetch failed or data not found:", error.message);
        fetchErrorOccurred = true;
      }

      // 3. Check if we have data. If not (or if fetch failed), trigger sync and fetch again.
      const hasData =
        dailyData && Array.isArray(dailyData) && dailyData.length > 0;

      if (!hasData || fetchErrorOccurred) {
        console.log(
          "Data not found in DB or error occurred, triggering sync..."
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
        }
      } else {
        console.log("Existing data found in DB, skipping sync.");
      }

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
      { impressions: 0, clicks: 0, completeViews: 0 }
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
          spend: 0,
        };
      }
      acc[device].impressions += parseInt(curr.impressions) || 0;
      acc[device].clicks += parseInt(curr.clicks) || 0;
      acc[device].completeViews += parseInt(curr.completeViewsVideo) || 0;
      acc[device].spend +=
        parseFloat(curr.mediaCostAdvertiserCurrency) || 0;
      return acc;
    }, {});

    return Object.values(grouped);
  };

  const aggregatedData = groupDataByDevice(dailyReportsData);

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
          // Format date from "2025/12/13" to "Dec 13"
          const date = new Date(item.date);
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        }),
        impressions: dailyReportsData.map(
          (item) => parseInt(item.impressions) || 0
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

  return (
    <main className="main-content">
      

      {/* Charts Section */}
      <section className="charts-section">
        <div className="grid">
          <TopCountryBarChart />




          <ChartCard
            title="Device Type (Impressions Distributions)"
            className="full-width"
          >
            <canvas ref={heatmapChartRef} id="heatmapChart" />
          </ChartCard>


        </div>
      </section>

      {/* Table */}
      <div className="data-table-card">
        <div className="table-header">
          <h3>Device Performance Summary</h3>
          <div className="table-actions">
            <button className="btn btn-sm btn-ghost">
              <i className="fas fa-download" /> Export
            </button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Device Type</th>
              <th>Impressions</th>
              <th>CTR</th>
              <th>VCR</th>
              <th>Complete Views</th>
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
                    ? ((item.completeViews / item.impressions) * 100).toFixed(2)
                    : "0.00";

                return (
                  <tr key={index}>
                    <td>
                      <div className={`campaign-icon active`} />
                      {item.deviceType}
                    </td>
                    <td>{item.impressions.toLocaleString()}</td>
                    <td>{ctr}%</td>
                    <td>{vcr}%</td>
                    <td>{item.completeViews.toLocaleString()}</td>
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

      {/* Bottom Sections */}
    </main>
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
