"use client";

import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "./styles.css";
import {
  createReportsDataAge,
  getDailyReportsByFilter,
  getDailyReportsByRange,
} from "@/services/demographics";

function formatNumber(num) {
  const rounded = Math.round(num);

  if (rounded >= 1000000) {
    return Math.round(rounded / 1000000).toLocaleString() + "M";
  } else if (rounded >= 1000) {
    return Math.round(rounded / 1000).toLocaleString() + "K";
  }
  return rounded.toLocaleString();
}

const groupDemographicsData = (data) => {
  if (!data || !Array.isArray(data)) return [];

  // Group by Age and Gender
  const ageGroups = data.reduce((acc, curr) => {
    const age = curr.ageType || "Unknown";
    const gender = curr.gender || "Unknown";

    if (!acc[age]) {
      acc[age] = {
        range: age,
        impressions: 0,
        clicks: 0,
        completeViews: 0,
        genderMap: {}
      };
    }

    const aGroup = acc[age];
    const imps = parseInt(curr.impressions) || 0;
    const clks = parseInt(curr.clicks) || 0;
    const views = parseInt(curr.completeViewsVideo) || 0;

    aGroup.impressions += imps;
    aGroup.clicks += clks;
    aGroup.completeViews += views;

    if (!aGroup.genderMap[gender]) {
      aGroup.genderMap[gender] = {
        type: gender,
        impressions: 0,
        clicks: 0,
        completeViews: 0
      };
    }

    const gGroup = aGroup.genderMap[gender];
    gGroup.impressions += imps;
    gGroup.clicks += clks;
    gGroup.completeViews += views;

    return acc;
  }, {});

  // Convert map to array and calculate rates
  return Object.values(ageGroups).map(age => {
    const ctr = age.impressions > 0 ? (age.clicks / age.impressions) * 100 : 0;
    const vcr = age.impressions > 0 ? (age.completeViews / age.impressions) * 100 : 0;

    return {
      range: age.range,
      impressions: age.impressions,
      clicks: age.clicks,
      ctr: parseFloat(ctr.toFixed(3)),
      vcr: parseFloat(vcr.toFixed(2)),
      gender: Object.values(age.genderMap).map(g => {
        const gCtr = g.impressions > 0 ? (g.clicks / g.impressions) * 100 : 0;
        const gVcr = g.impressions > 0 ? (g.completeViews / g.impressions) * 100 : 0;
        return {
          type: g.type,
          impressions: g.impressions,
          clicks: g.clicks,
          ctr: parseFloat(gCtr.toFixed(3)),
          vcr: parseFloat(gVcr.toFixed(2))
        };
      })
    };
  });
};

export default function OverviewPage() {
  const [activeMetric, setActiveMetric] = useState("Impressions");
  const [expandedAgeRow, setExpandedAgeRow] = useState(null);
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
      const res = await createReportsDataAge(params);
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
        console.log("Data not found in DB or error occurred, triggering sync...");
        setDailyReportsData(null);
        const isSent = await sentReportsData();

        if (isSent) {
          console.log("Sync complete, fetching refreshed data...");
          const refreshed = await performFetch();
          dailyData = refreshed.dailyData;
        }
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

  const aggregatedData = groupDemographicsData(dailyReportsData);

  const [campaigns, setCampaigns] = useState([]);
  const [activities, setActivities] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [goals, setGoals] = useState([]);

  // Chart refs
  const genderChartRef = useRef(null);
  const ageLevelChartRef = useRef(null);
  const ageBreakdownChartRef = useRef(null);

  // Store chart instances
  const chartsRef = useRef({});

  useEffect(() => {
    if (!aggregatedData || aggregatedData.length === 0) return;

    // Destroy existing charts
    Object.values(chartsRef.current).forEach(chart => chart?.destroy());
    chartsRef.current = {};

    // Gender Level Performance (Bar)
    if (genderChartRef.current) {
      const ctx = genderChartRef.current.getContext("2d");
      const metricKey = activeMetric.toLowerCase();
      
      // We need to sum metrics across ALL data to get true distribution
      const genderTotals = {};
      aggregatedData.forEach(age => {
        age.gender.forEach(g => {
          if (!genderTotals[g.type]) {
            genderTotals[g.type] = {
              impressions: 0,
              clicks: 0,
              completeViews: 0
            };
          }
          genderTotals[g.type].impressions += g.impressions;
          genderTotals[g.type].clicks += g.clicks;
          genderTotals[g.type].completeViews += g.completeViews || (g.impressions * g.vcr / 100);
        });
      });

      const labels = ["Male", "Female", "Unknown"].filter(l => genderTotals[l]);
      const dataValues = labels.map(l => {
        const g = genderTotals[l];
        if (activeMetric === "Impressions") return g.impressions;
        if (activeMetric === "CTR") return g.impressions > 0 ? (g.clicks / g.impressions) * 100 : 0;
        if (activeMetric === "VCR") return g.impressions > 0 ? (g.completeViews / g.impressions) * 100 : 0;
        return 0;
      });

      chartsRef.current.gender = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: activeMetric,
            data: dataValues,
            backgroundColor: labels.map(l => l === "Male" ? "#6366f1" : l === "Female" ? "#ec4899" : "#94a3b8"),
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `${activeMetric}: ${activeMetric === 'Impressions' ? ctx.parsed.y.toLocaleString() : ctx.parsed.y.toFixed(2) + '%'}`
              }
            }
          },
          scales: { 
            y: { 
              beginAtZero: true, 
              ticks: { 
                callback: v => activeMetric === 'Impressions' ? formatNumber(v) : v + '%' 
              } 
            } 
          }
        }
      });
    }

    // Age Level Performance (Bar)
    if (ageLevelChartRef.current) {
      const ctx = ageLevelChartRef.current.getContext("2d");
      const metricKey = activeMetric.toLowerCase();
      
      chartsRef.current.ageLevel = new Chart(ctx, {
        type: "bar",
        data: {
          labels: aggregatedData.map(d => d.range),
          datasets: [
            {
              label: activeMetric,
              data: aggregatedData.map(d => d[metricKey]),
              backgroundColor: "rgba(99, 102, 241, 0.6)",
              hoverBackgroundColor: "#6366f1",
              borderRadius: 6,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `${activeMetric}: ${activeMetric === 'Impressions' ? ctx.parsed.y.toLocaleString() : ctx.parsed.y + '%'}`
              }
            }
          },
          scales: {
            y: { 
              beginAtZero: true, 
              ticks: { 
                callback: v => activeMetric === 'Impressions' ? formatNumber(v) : v + '%' 
              } 
            }
          }
        }
      });
    }

    // Age Breakdown (Doughnut)
    if (ageBreakdownChartRef.current) {
      const ctx = ageBreakdownChartRef.current.getContext("2d");
      chartsRef.current.ageBreakdown = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: aggregatedData.map(d => d.range),
          datasets: [{
            data: aggregatedData.map(d => d.impressions),
            backgroundColor: ["#6366f1", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#8b5cf6"]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } }
        }
      });
    }

    return () => {
      Object.values(chartsRef.current).forEach((chart) => chart?.destroy());
      chartsRef.current = {};
    };
  }, [aggregatedData, activeMetric]); 
// Re-render charts when data changes

  return (
    <main className="main-content">
      

      {/* Charts Section */}
      <section className="charts-section">
        <div className="metric-toggle-bar" style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {["Impressions", "VCR", "CTR"].map((m) => (
            <button
              key={m}
              className={`btn btn-sm ${activeMetric === m ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveMetric(m)}
              style={{ 
                borderRadius: "2rem", 
                padding: "0.5rem 1.25rem",
                background: activeMetric === m ? "var(--primary)" : "white",
                color: activeMetric === m ? "white" : "var(--text)",
                border: "1px solid var(--border)",
                fontWeight: "600",
                fontSize: "0.85rem",
                transition: "all 0.2s"
              }}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="charts-grid">
          <ChartCard title="Gender Level Performance">
            <canvas ref={genderChartRef} id="genderChart" />
          </ChartCard>
          <ChartCard title="Age Level Performance">
            <canvas ref={ageLevelChartRef} id="ageLevelChart" />
          </ChartCard>
          <ChartCard title="Age Breakdown">
            <canvas ref={ageBreakdownChartRef} id="ageBreakdownChart" />
          </ChartCard>
        </div>
      </section>

      {/* Table */}
      <div className="data-table-card">
        <div className="table-header">
          <h3>Demographics Summary</h3>
          <div className="table-actions">
            <button className="btn btn-sm btn-ghost">
              <i className="fas fa-download" /> Export
            </button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "50px" }}></th>
              <th>Age Range</th>
              <th>Impressions</th>
              <th>CTR</th>
              <th>VCR</th>
            </tr>
          </thead>
          <tbody>
            {(aggregatedData && aggregatedData.length > 0) ? (
              aggregatedData.map((item, index) => {
                const metricKey = activeMetric.toLowerCase();
                const isExpanded = expandedAgeRow === index;

                return (
                  <React.Fragment key={index}>
                    <tr 
                      onClick={() => setExpandedAgeRow(isExpanded ? null : index)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`} style={{ color: "var(--text-light)" }} />
                      </td>
                      <td>
                        <div className="campaign-icon active" style={{ borderRadius: "50%", width: "1.5rem", height: "1.5rem" }} />
                        {item.range}
                      </td>
                      <td>{item.impressions.toLocaleString()}</td>
                      <td>{item.ctr}%</td>
                      <td>{item.vcr}%</td>
                    </tr>
                    {isExpanded && (
                      <tr className="expanded-row" style={{ background: "#f8fafc" }}>
                        <td colSpan="5" style={{ padding: "0 1rem 1rem 3rem" }}>
                          <div className="gender-breakdown-container" style={{ paddingTop: "1rem" }}>
                            <table className="data-table" style={{ background: "white", borderRadius: "0.5rem", border: "1px solid var(--border)" }}>
                              <thead style={{ background: "#f1f5f9" }}>
                                <tr>
                                  <th>Gender</th>
                                  <th>Impressions</th>
                                  <th>CTR</th>
                                  <th>VCR</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.gender.map((g, gIdx) => (
                                  <tr key={gIdx}>
                                    <td>{g.type}</td>
                                    <td>{g.impressions.toLocaleString()}</td>
                                    <td>{g.ctr}%</td>
                                    <td>{g.vcr}%</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                  {isLoadingData
                    ? "Loading data..."
                    : "No demographics data available. Please select a different date range to get data."}
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
