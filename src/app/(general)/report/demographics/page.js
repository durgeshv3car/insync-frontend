"use client";

import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { downloadDashboardPDF } from "@/utils/pdfExport";
import "./styles.css";

Chart.register(ChartDataLabels);
import {
  createReportsDataAge,
  getDailyReportsByFilter,
  getDailyReportsByRange,
} from "@/services/demographics";
import TopCountryBarChart from "@/components/widgetsCharts/TopCountriyBarChartGender";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import {
  getDailyReportsByFilterCity,
  getDailyReportsByRangeCity,
  createReportsDataCity,
  downloadAllDailyCityCSV,
} from "@/services/city";

function formatNumber(num) {
  const rounded = Math.round(num);

  if (rounded >= 1000000) {
    return Math.round(rounded / 1000000).toLocaleString() + "M";
  } else if (rounded >= 1000) {
    return Math.round(rounded / 1000).toLocaleString() + "K";
  }
  return rounded.toLocaleString();
}

const getAgeRangeColor = (range) => {
  const colors = {
    "18-24": "#6366f1",
    "25-34": "#ec4899",
    "35-44": "#06b6d4",
    "45-54": "#10b981",
    "55-64": "#f59e0b",
    "65+": "#8b5cf6",
    "65 AND OVER": "#8b5cf6",
    "UNKNOWN": "#6366f1", // Match image for Unknown
  };
  return colors[range] || colors[range.toUpperCase()] || "#6366f1";
};

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
        cost: 0,
        genderMap: {},
      };
    }

    const aGroup = acc[age];
    const imps = parseInt(curr.impressions) || 0;
    const clks = parseInt(curr.clicks) || 0;
    const views = parseInt(curr.completeViewsVideo) || 0;
    const cost = parseFloat(curr.cost || curr.mediaCostAdvertiserCurrency) || 0;

    aGroup.impressions += imps;
    aGroup.clicks += clks;
    aGroup.completeViews += views;
    aGroup.cost += cost;

    if (!aGroup.genderMap[gender]) {
      aGroup.genderMap[gender] = {
        type: gender,
        impressions: 0,
        clicks: 0,
        completeViews: 0,
        cost: 0,
      };
    }

    const gGroup = aGroup.genderMap[gender];
    gGroup.impressions += imps;
    gGroup.clicks += clks;
    gGroup.completeViews += views;
    gGroup.cost += cost;

    return acc;
  }, {});

  // Convert map to array and calculate rates
  return Object.values(ageGroups).map((age) => {
    const ctr = age.impressions > 0 ? (age.clicks / age.impressions) * 100 : 0;
    const vcr =
      age.impressions > 0 ? (age.completeViews / age.impressions) * 100 : 0;

    return {
      range: age.range,
      impressions: age.impressions,
      clicks: age.clicks,
      completeViews: age.completeViews,
      cost: age.cost,
      ctr: parseFloat(ctr.toFixed(3)),
      vcr: parseFloat(vcr.toFixed(2)),
      gender: Object.values(age.genderMap).map((g) => {
        const gCtr = g.impressions > 0 ? (g.clicks / g.impressions) * 100 : 0;
        const gVcr =
          g.impressions > 0 ? (g.completeViews / g.impressions) * 100 : 0;
        return {
          type: g.type,
          impressions: g.impressions,
          clicks: g.clicks,
          completeViews: g.completeViews,
          cost: g.cost,
          ctr: parseFloat(gCtr.toFixed(3)),
          vcr: parseFloat(gVcr.toFixed(2)),
        };
      }),
    };
  });
};

const groupCityData = (data) => {
  if (!data || !Array.isArray(data)) return [];

  const cityGroups = data.reduce((acc, curr) => {
    const city = curr.city || "Unknown";

    if (!acc[city]) {
      acc[city] = {
        city,
        impressions: 0,
        clicks: 0,
        completeViews: 0,
      };
    }

    const group = acc[city];
    const imps = parseInt(curr.impressions) || 0;
    // CTR = (clicks / impressions) * 100 => clicks = (CTR / 100) * impressions
    const ctrValue = parseFloat(curr.ctr?.replace("%", "")) || 0;
    const clks = (ctrValue / 100) * imps;
    const views = parseInt(curr.completeViewsVideo) || 0;

    group.impressions += imps;
    group.clicks += clks;
    group.completeViews += views;

    return acc;
  }, {});

  return Object.values(cityGroups)
    .filter((city) => city.city && city.city.toLowerCase() !== "unknown")
    .map((city) => ({
      city: city.city,
      impressions: city.impressions,
    }));
};

export default function OverviewPage() {
  const [expandedAgeRow, setExpandedAgeRow] = useState(null);
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

  // Global insertionOrderId - TODO: Make this dynamic later
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
  const [dailyReportsDataCity, setDailyReportsDataCity] = useState(null);
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
            audienceId,
          );
          const dailyDataCity = await getDailyReportsByRangeCity(
            INSERTION_ORDER_ID,
            startDate,
            endDate,
            audienceId,
          );
          return { dailyData, dailyDataCity };
        } else {
          const dailyData = await getDailyReportsByFilter(
            INSERTION_ORDER_ID,
            dateRange,
            audienceId,
          );
          const dailyDataCity = await getDailyReportsByFilterCity(
            INSERTION_ORDER_ID,
            dateRange,
            audienceId,
          );
          return { dailyData, dailyDataCity };
        }
      };

      const result = await performFetch();
      const dailyData = result.dailyData;
      const dailyDataCity = result.dailyDataCity;

      setDailyReportsData(dailyData);
      setDailyReportsDataCity(dailyDataCity);
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

  const aggregatedData = React.useMemo(
    () => groupDemographicsData(dailyReportsData),
    [dailyReportsData],
  );

  const demographicsTotals = React.useMemo(() => {
    if (!aggregatedData || aggregatedData.length === 0) return null;

    const totals = aggregatedData.reduce(
      (acc, curr) => {
        acc.impressions += curr.impressions || 0;
        acc.clicks += curr.clicks || 0;
        acc.completeViews += curr.completeViews || 0;
        return acc;
      },
      { impressions: 0, clicks: 0, completeViews: 0 }
    );

    const ctr = totals.impressions > 0
      ? ((totals.clicks / totals.impressions) * 100).toFixed(3)
      : "0.000";
    
    const vcr = totals.impressions > 0
      ? ((totals.completeViews / totals.impressions) * 100).toFixed(2)
      : "0.00";

    return {
      ...totals,
      ctr,
      vcr,
    };
  }, [aggregatedData]);

  const cityData = React.useMemo(
    () => groupCityData(dailyReportsDataCity),
    [dailyReportsDataCity],
  );

  const [campaigns, setCampaigns] = useState([]);
  const [activities, setActivities] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [goals, setGoals] = useState([]);

  // Chart refs
  const ageBreakdownChartRef = useRef(null);
  const cityChartRef = useRef(null);

  // Store chart instances
  const chartsRef = useRef({});
  const mainContentRef = useRef(null);

  useEffect(() => {
    // Destroy existing charts
    Object.values(chartsRef.current).forEach((chart) => chart?.destroy());
    chartsRef.current = {};

    if (aggregatedData && aggregatedData.length > 0) {
      // Age Breakdown (Doughnut)
      if (ageBreakdownChartRef.current) {
        const ctx = ageBreakdownChartRef.current.getContext("2d");
        chartsRef.current.ageBreakdown = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: aggregatedData.map((d) => d.range),
            datasets: [
              {
                data: aggregatedData.map((d) => d.impressions),
                backgroundColor: [
                  "#6366f1",
                  "#ec4899",
                  "#06b6d4",
                  "#10b981",
                  "#f59e0b",
                  "#8b5cf6",
                ],
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: 5,
            },
            cutout: "60%",
            plugins: {
              legend: {
                position: "right",
                labels: {
                  boxWidth: 12,
                  padding: 15,
                  usePointStyle: true,
                  font: { size: 11 },
                },
              },
              datalabels: {
                color: "#fff",
                font: { weight: "bold", size: 10 },
                formatter: (value, ctx) => {
                  const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage =
                    total > 0 ? ((value / total) * 100).toFixed(1) + "%" : "";
                  return percentage;
                },
              },
            },
          },
        });
      }
    }

    // City Chart logic
    if (cityChartRef.current && cityData && cityData.length > 0) {
      const ctx = cityChartRef.current.getContext("2d");

      // Always sort by Impressions and take TOP 25
      const processedCityData = [...cityData]
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 50);

      const labels = processedCityData.map((d) => d.city);
      const dataValues = processedCityData.map((d) => d.impressions);

      chartsRef.current.city = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Impressions",
              data: dataValues,
              backgroundColor: "#8b5cf6", // Indigo/Purple shade
              borderRadius: 4,
              barPercentage: 0.7,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `Impressions: ${ctx.parsed.x.toLocaleString()}`,
              },
            },
            datalabels: {
              anchor: "end",
              align: "end",
              color: "#64748b", // Slate-500
              font: { weight: "bold", size: 10 },
              formatter: (v) => formatNumber(v),
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                callback: (v) => formatNumber(v),
              },
              grid: { display: false },
            },
            y: {
              grid: { display: false },
              // ticks: {
              //   autoSkip: false,
              //   font: { size: 10 },
              // },
            },
          },
        },
      });
    }

    return () => {
      Object.values(chartsRef.current).forEach((chart) => chart?.destroy());
      chartsRef.current = {};
    };
  }, [aggregatedData, cityData]);

  const downloadPDF = () => {
    const dateText =
      dateRange === "CUSTOM"
        ? `${startDate} to ${endDate}`
        : `${dateRange || "All Time"}`;

    downloadDashboardPDF(mainContentRef, "Demographics_Report", dateText);
  };

  return (
    <>
      <main className="main-content" ref={mainContentRef}>
        {/* Charts Section */}
        <section className="charts-section" style={{ position: "relative" }}>
          {isLoadingData && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <div className="loading-text">Refreshing analytics...</div>
            </div>
          )}
          <div className="charts-grid top-charts">
            {/* Gender - top left, row 1 */}
            <div
              className="chart-item equal-height"
              style={{ gridColumn: 1, gridRow: 1 }}
            >
              <TopCountryBarChart
                dailyReportsData={dailyReportsData}
                audienceName={audienceName}
              />
            </div>

            {/* City - right column, spans both rows */}
            <ChartCard
              title={`Top 50 Cities Performance`}
              className="equal-height"
              style={{ gridColumn: 2, gridRow: "1 / 3", height: "auto" }}
            >
              <canvas ref={cityChartRef} id="cityChart" />
            </ChartCard>

            {/* Age Breakdown - bottom left, row 2 */}
            <ChartCard
              title={`Age Breakdown`}
              className="equal-height"
              style={{ gridColumn: 1, gridRow: 2 }}
            >
              <canvas ref={ageBreakdownChartRef} id="ageBreakdownChart" />
            </ChartCard>
          </div>
        </section>

        {/* Table */}
        <div className="data-table-card" style={{ position: "relative" }}>
          {isLoadingData && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <div className="loading-text">Updating demographics...</div>
            </div>
          )}
          <div className="table-header">
            <h3>Demographics Performance Summary</h3>

            <div className="table-actions">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => downloadAllDailyCityCSV(insertionOrderId)}
                title="Download Data as PDF"
                style={{ textTransform: "none" }}
              >
                <i className="fas fa-download" style={{ marginRight: "8px" }} />{" "}
                Export City Csv
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
                {/* <th>Media Cost</th> */}
              </tr>
            </thead>
            <tbody>
              {aggregatedData && aggregatedData.length > 0 ? (
                aggregatedData.map((item, index) => {
                  const isExpanded = expandedAgeRow === index;

                  return (
                    <React.Fragment key={index}>
                      <tr
                        onClick={() =>
                          setExpandedAgeRow(isExpanded ? null : index)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <i
                            className={`fas fa-chevron-${isExpanded ? "down" : "right"}`}
                            style={{ color: "var(--text-light)" }}
                          />
                        </td>
                        <td>
                          <div
                            className="campaign-icon active"
                            style={{
                              borderRadius: "50%",
                              width: "1.5rem",
                              height: "1.5rem",
                              backgroundColor: getAgeRangeColor(item.range),
                              border: "none",
                            }}
                          />
                          {item.range}
                        </td>
                        <td>{item.impressions.toLocaleString()}</td>
                        <td>{item.ctr}%</td>
                        <td>{item.vcr}%</td>
                        {/* <td>₹{(Number(item?.cost) || 0).toFixed(2)}</td> */}
                      </tr>
                      {isExpanded && (
                        <tr
                          className="expanded-row"
                          style={{ background: "#f8fafc" }}
                        >
                          <td
                            colSpan="6"
                            style={{ padding: "0 1rem 1rem 3rem" }}
                          >
                            <div
                              className="gender-breakdown-container"
                              style={{ paddingTop: "1rem" }}
                            >
                              <table
                                className="data-table"
                                style={{
                                  background: "white",
                                  borderRadius: "0.5rem",
                                  border: "1px solid var(--border)",
                                }}
                              >
                                <thead style={{ background: "#f1f5f9" }}>
                                  <tr>
                                    <th>Gender</th>
                                    <th>Impressions</th>
                                    <th>CTR</th>
                                    <th>VCR</th>
                                    {/* <th>Media Cost</th> */}
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.gender.map((g, gIdx) => (
                                    <tr key={gIdx}>
                                      <td>{g.type}</td>
                                      <td>{g.impressions.toLocaleString()}</td>
                                      <td>{g.ctr}%</td>
                                      <td>{g.vcr}%</td>
                                      {/* <td>
                                        ₹{(Number(g?.cost) || 0).toFixed(2)}
                                      </td> */}
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
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#6b7280",
                    }}
                  >
                    {isLoadingData
                      ? "Loading data..."
                      : "No demographics data available. Please select a different date range to get data."}
                  </td>
                </tr>
              )}
            </tbody>
            {demographicsTotals && (
              <tfoot>
                <tr className="totals-row">
                  <td />
                  <td>Total</td>
                  <td>{demographicsTotals.impressions.toLocaleString()}</td>
                  <td>{demographicsTotals.ctr}%</td>
                  <td>{demographicsTotals.vcr}%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

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

function ChartCard({ title, children, subtitle, className = "", style = {} }) {
  const hasStyle = Object.keys(style).length > 0;
  return (
    <div className={`chart-card ${className}`} style={hasStyle ? style : undefined}>
      <div className="chart-header">
        <div className="chart-title-group">
          <h3>{title}</h3>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
        <button className="btn btn-sm btn-ghost" title="More options">
          <i className="fas fa-ellipsis-h" />
        </button>
      </div>
      <div className="chart-container">
        {children}
      </div>
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
