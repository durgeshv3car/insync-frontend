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
import {
  FiDownload,
  FiChevronDown,
  FiChevronRight,
  FiSearch,
  FiList,
  FiBarChart2,
} from "react-icons/fi";
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

const formatGender = (gender) => {
  if (!gender) return "Unknown";
  const g = String(gender).trim().toLowerCase();
  if (g === "female") return "Female";
  if (g === "male") return "Male";
  if (g === "unknown") return "Unknown";
  return gender.charAt(0).toUpperCase() + gender.slice(1);
};

const getAgeRangeColor = (range) => {
  const r = (range || "").toUpperCase();
  if (r.includes("18-24") || r.includes("18 - 24")) return "#3b82f6";
  if (r.includes("25-34") || r.includes("25 - 34")) return "#ec4899";
  if (r.includes("35-44") || r.includes("35 - 44")) return "#06b6d4";
  if (r.includes("45-54") || r.includes("45 - 54")) return "#10b981";
  if (r.includes("55") || r.includes("65")) return "#f59e0b";
  return "#475569";
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
    const ctrValue = parseFloat(curr.ctr?.replace("%", "")) || 0;
    const clks = curr.clicks !== undefined ? parseInt(curr.clicks) || 0 : (ctrValue / 100) * imps;
    const views = parseInt(curr.completeViewsVideo) || 0;

    group.impressions += imps;
    group.clicks += clks;
    group.completeViews += views;

    return acc;
  }, {});

  return Object.values(cityGroups)
    .filter((city) => city.city && city.city.toLowerCase() !== "unknown")
    .map((city) => {
      const ctr =
        city.impressions > 0
          ? ((city.clicks / city.impressions) * 100).toFixed(2)
          : "0.00";
      const vcr =
        city.impressions > 0
          ? ((city.completeViews / city.impressions) * 100).toFixed(2)
          : "0.00";
      return {
        city: city.city,
        impressions: city.impressions,
        clicks: Math.round(city.clicks),
        completeViews: city.completeViews,
        ctr,
        vcr,
      };
    });
};

export default function OverviewPage() {
  const [expandedAgeRows, setExpandedAgeRows] = useState({});
  const [theme, setTheme] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.getAttribute("data-theme") || "light";
    }
    return "light";
  });

  useEffect(() => {
    const updateTheme = () => {
      const current =
        document.documentElement.getAttribute("data-theme") || "light";
      setTheme(current);
    };
    updateTheme();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          updateTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const toggleAgeRow = (range) => {
    setExpandedAgeRows((prev) => ({
      ...prev,
      [range]: !prev[range],
    }));
  };
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
  const topCitiesData = React.useMemo(() => {
    if (!cityData || cityData.length === 0) return [];
    return [...cityData]
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 50);
  }, [cityData]);

  const [campaigns, setCampaigns] = useState([]);
  const [activities, setActivities] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [goals, setGoals] = useState([]);
  const [hoveredAgeGroup, setHoveredAgeGroup] = useState(null);
  const [cityViewMode, setCityViewMode] = useState("chart");
  const [citySearchQuery, setCitySearchQuery] = useState("");

  const filteredCities = React.useMemo(() => {
    if (!topCitiesData) return [];
    if (!citySearchQuery.trim()) return topCitiesData;
    const q = citySearchQuery.toLowerCase();
    return topCitiesData.filter((c) => c.city.toLowerCase().includes(q));
  }, [topCitiesData, citySearchQuery]);

  const totalTopCitiesImpressions = React.useMemo(() => {
    return topCitiesData.reduce((acc, curr) => acc + (curr.impressions || 0), 0);
  }, [topCitiesData]);

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

    const isLight = theme === "light";

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
                backgroundColor: aggregatedData.map((d) =>
                  getAgeRangeColor(d.range),
                ),
                borderWidth: 3,
                borderColor: isLight ? "#ffffff" : "#1e293b",
                hoverOffset: 5,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: 6,
            },
            cutout: "75%",
            onHover: (event, elements) => {
              if (elements && elements.length > 0) {
                const index = elements[0].index;
                setHoveredAgeGroup(aggregatedData[index]);
              } else {
                setHoveredAgeGroup(null);
              }
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                enabled: false,
              },
              datalabels: {
                display: false,
              },
            },
          },
        });
      }
    }

    // Top 50 Cities Chart logic
    if (cityChartRef.current && topCitiesData && topCitiesData.length > 0) {
      const ctx = cityChartRef.current.getContext("2d");

      const labels = topCitiesData.map((d) => d.city);
      const dataValues = topCitiesData.map((d) => d.impressions);

      chartsRef.current.city = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Impressions",
              data: dataValues,
              backgroundColor: isLight ? "#4f46e5" : "#6366f1",
              borderRadius: 5,
              barThickness: 16,
              maxBarThickness: 20,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              right: 48,
              left: 5,
              top: 5,
              bottom: 5,
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  `Impressions: ${ctx.parsed.x.toLocaleString()}`,
              },
            },
            datalabels: {
              anchor: "end",
              align: "end",
              color: () => (isLight ? "#334155" : "#94a3b8"),
              font: { weight: "bold", size: 10 },
              formatter: (v) => formatNumber(v),
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              grace: "18%",
              ticks: {
                callback: (v) => formatNumber(v),
                color: () => (isLight ? "#64748b" : "#94a3b8"),
                font: { size: 10 },
              },
              grid: {
                color: () => (isLight ? "#f1f5f9" : "rgba(255,255,255,0.06)"),
              },
            },
            y: {
              grid: { display: false },
              ticks: {
                color: () => (isLight ? "#1e293b" : "#cbd5e1"),
                font: { size: 12, weight: "600" },
                autoSkip: false,
              },
            },
          },
        },
      });
    }

    return () => {
      Object.values(chartsRef.current).forEach((chart) => chart?.destroy());
      chartsRef.current = {};
    };
  }, [aggregatedData, topCitiesData, theme]);

  const downloadPDF = () => {
    const dateText =
      dateRange === "CUSTOM"
        ? `${startDate} to ${endDate}`
        : `${dateRange || "All Time"}`;

    downloadDashboardPDF(mainContentRef, "Demographics_Report", dateText);
  };

  return (
    <>
      <div ref={mainContentRef}>
        <section className="demographics-section">
          {/* Row 1: 2 Visual Charts Side-by-Side (Age Breakdown Donut + Top 50 Cities Bar Chart) */}
          <div className="demographics-charts-grid">
            {/* Left: Age Breakdown Donut Card */}
            <div className="demographics-card" style={{ position: "relative" }}>
              {isLoadingData && (
                <div className="loading-overlay">
                  <div className="loading-spinner"></div>
                  <div className="loading-text">Refreshing...</div>
                </div>
              )}
              <div className="table-header">
                <h3>
                  <span>Age Breakdown</span>
                  <span className="header-badge">By Age Group</span>
                </h3>
              </div>
              <div className="demographics-card-body">
                <div className="age-breakdown-layout">
                  {/* Left: Doughnut with Dynamic Centered HUD */}
                  <div className="age-donut-wrapper">
                    <canvas ref={ageBreakdownChartRef} id="ageBreakdownChart" />
                    <div className="age-donut-center-stat">
                      {hoveredAgeGroup ? (
                        <>
                          <span
                            className="center-stat-label"
                            style={{
                              color: getAgeRangeColor(hoveredAgeGroup.range),
                              fontWeight: 800,
                            }}
                          >
                            {hoveredAgeGroup.range}
                          </span>
                          <span className="center-stat-val">
                            {formatNumber(hoveredAgeGroup.impressions)}
                          </span>
                          <span
                            className="center-stat-badge"
                            style={{
                              backgroundColor: `${getAgeRangeColor(hoveredAgeGroup.range)}20`,
                              color: getAgeRangeColor(hoveredAgeGroup.range),
                              fontWeight: 700,
                            }}
                          >
                            {(() => {
                              const totalImps =
                                aggregatedData?.reduce(
                                  (acc, curr) => acc + (Number(curr.impressions) || 0),
                                  0,
                                ) || 0;
                              return totalImps > 0
                                ? ((hoveredAgeGroup.impressions / totalImps) * 100).toFixed(1) + "%"
                                : "0%";
                            })()}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="center-stat-label">Total Impr.</span>
                          <span className="center-stat-val">
                            {formatNumber(
                              aggregatedData?.reduce(
                                (acc, curr) => acc + (Number(curr.impressions) || 0),
                                0,
                              ) || 0,
                            )}
                          </span>
                          <span className="center-stat-badge">
                            {aggregatedData?.length || 0} Groups
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Interactive Legend List */}
                  <div className="age-legend-list">
                    {(() => {
                      const totalImps =
                        aggregatedData?.reduce(
                          (acc, curr) => acc + (Number(curr.impressions) || 0),
                          0,
                        ) || 0;
                      return aggregatedData && aggregatedData.length > 0 ? (
                        aggregatedData.map((item, idx) => {
                          const pct =
                            totalImps > 0
                              ? ((item.impressions / totalImps) * 100).toFixed(1)
                              : "0.0";
                          const color = getAgeRangeColor(item.range);
                          const isHovered = hoveredAgeGroup?.range === item.range;
                          return (
                            <div
                              key={idx}
                              className="age-legend-item"
                              onMouseEnter={() => setHoveredAgeGroup(item)}
                              onMouseLeave={() => setHoveredAgeGroup(null)}
                              style={
                                isHovered
                                  ? {
                                      borderColor: color,
                                      transform: "translateX(3px)",
                                      boxShadow: `0 3px 12px ${color}25`,
                                    }
                                  : undefined
                              }
                            >
                              <div className="age-legend-left">
                                <span
                                  className="age-legend-dot"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="age-legend-title">
                                  {item.range}
                                </span>
                              </div>
                              <div className="age-legend-right">
                                <span className="age-legend-count">
                                  {formatNumber(item.impressions)}
                                </span>
                                <span
                                  className="age-legend-pill"
                                  style={{
                                    backgroundColor: `${color}14`,
                                    color: color,
                                    borderColor: `${color}35`,
                                  }}
                                >
                                  {pct}%
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div
                          className="no-data-text"
                          style={{
                            textAlign: "center",
                            color: "var(--text-secondary)",
                            padding: "20px",
                          }}
                        >
                          No age data available
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Top 50 Cities Performance Card (Interactive Table & Chart View) */}
            <div className="demographics-card" style={{ position: "relative" }}>
              {isLoadingData && (
                <div className="loading-overlay">
                  <div className="loading-spinner"></div>
                  <div className="loading-text">Refreshing top cities...</div>
                </div>
              )}
              <div className="table-header">
                <div className="table-header-left">
                  <h3>
                    <span>Top 50 Cities Performance</span>
                    <span className="header-badge">Top 50</span>
                  </h3>
                </div>
                <div className="table-actions">
                  <div className="view-mode-pill-group">
                    <button
                      type="button"
                      className={`view-mode-btn ${cityViewMode === "chart" ? "active" : ""}`}
                      onClick={() => setCityViewMode("chart")}
                      title="Chart View"
                    >
                      <FiBarChart2 size={13} />
                      <span>Chart</span>
                    </button>
                    <button
                      type="button"
                      className={`view-mode-btn ${cityViewMode === "table" ? "active" : ""}`}
                      onClick={() => setCityViewMode("table")}
                      title="Table View"
                    >
                      <FiList size={13} />
                      <span>Table</span>
                    </button>
                  </div>

                  <button
                    className="table-export-btn"
                    onClick={() => downloadAllDailyCityCSV(insertionOrderId)}
                    title="Export City CSV"
                  >
                    <FiDownload size={14} />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              <div className="demographics-card-body" style={{ padding: "0" }}>
                {/* Table View */}
                <div
                  className="city-table-scroll-wrapper"
                  style={{
                    display: cityViewMode === "table" ? "block" : "none",
                  }}
                >
                  <table className="city-performance-table">
                    <thead>
                      <tr>
                        <th style={{ width: "55px", textAlign: "center" }}>Rank</th>
                        <th>City</th>
                        <th style={{ textAlign: "right" }}>Impressions</th>
                        <th style={{ textAlign: "right" }}>Complete Views</th>
                        <th style={{ textAlign: "right" }}>CTR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCities && filteredCities.length > 0 ? (
                        filteredCities.map((item, idx) => {
                          const originalRank =
                            topCitiesData.findIndex((c) => c.city === item.city) + 1;
                          return (
                            <tr key={idx} className="city-table-row">
                              <td style={{ textAlign: "center" }}>
                                <span
                                  className={`city-rank-pill rank-${originalRank <= 3 ? originalRank : "standard"}`}
                                >
                                  #{originalRank}
                                </span>
                              </td>
                              <td>
                                <span className="city-name-text">{item.city}</span>
                              </td>
                              <td style={{ textAlign: "right", fontWeight: 700 }}>
                                {item.impressions.toLocaleString()}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                {(item.completeViews || 0).toLocaleString()}
                              </td>
                              <td
                                style={{
                                  textAlign: "right",
                                  fontWeight: 600,
                                  color: "var(--accent-color, #2563eb)",
                                }}
                              >
                                {item.ctr}%
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            style={{
                              textAlign: "center",
                              padding: "30px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            No cities found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Chart View */}
                <div
                  className="demographics-chart-wrapper city-chart-wrapper"
                  style={{
                    display: cityViewMode === "chart" ? "block" : "none",
                    padding: "16px 20px",
                  }}
                >
                  <div
                    style={{
                      height: `${Math.max(340, (topCitiesData?.length || 0) * 26)}px`,
                      minHeight: "340px",
                      position: "relative",
                      width: "100%",
                    }}
                  >
                    <canvas ref={cityChartRef} id="cityChart" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Full Width Demographics Performance Summary Accordion Table Card */}
          <div className="demographics-card demographics-table-card" style={{ position: "relative" }}>
            {isLoadingData && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <div className="loading-text">Updating demographics...</div>
              </div>
            )}
            <div className="table-header">
              <h3>Demographics Performance Summary</h3>
            </div>

            <div className="table-responsive-wrapper">
              <table className="demographics-table">
                <thead>
                  <tr>
                    <th style={{ width: "35%" }}>Age Range</th>
                    <th style={{ textAlign: "right" }}>Impressions</th>
                    <th style={{ textAlign: "right" }}>CTR</th>
                    <th style={{ textAlign: "right" }}>VCR</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregatedData && aggregatedData.length > 0 ? (
                    aggregatedData.map((item, index) => {
                      const isExpanded = Boolean(expandedAgeRows[item.range]);
                      return (
                        <React.Fragment key={`group-${index}`}>
                          <tr
                            className={`demographics-parent-row ${isExpanded ? "is-expanded" : ""}`}
                            onClick={() => toggleAgeRow(item.range)}
                            title="Click to toggle age details"
                          >
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <button
                                  type="button"
                                  className="expand-toggle-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAgeRow(item.range);
                                  }}
                                  aria-label="Toggle details"
                                >
                                  {isExpanded ? (
                                    <FiChevronDown size={16} className="chevron-icon" />
                                  ) : (
                                    <FiChevronRight size={16} className="chevron-icon" />
                                  )}
                                </button>
                                <span
                                  className="age-dot"
                                  style={{
                                    backgroundColor: getAgeRangeColor(
                                      item.range,
                                    ),
                                  }}
                                />
                                <span className="age-range-text">{item.range}</span>
                              </div>
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 500 }}>
                              {item.impressions.toLocaleString()}
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 500 }}>
                              {item.ctr}%
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 500 }}>
                              {item.vcr}%
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="demographics-subtable-row">
                              <td colSpan="4" className="demographics-subtable-cell">
                                <div className="demographics-subtable-container">
                                  <table className="demographics-subtable">
                                    <thead>
                                      <tr>
                                        <th>Gender</th>
                                        <th style={{ textAlign: "right" }}>Impressions</th>
                                        <th style={{ textAlign: "right" }}>CTR</th>
                                        <th style={{ textAlign: "right" }}>VCR</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.gender && item.gender.length > 0 ? (
                                        item.gender.map((g, gIdx) => (
                                          <tr key={gIdx}>
                                            <td className="gender-name">
                                              {formatGender(g.type)}
                                            </td>
                                            <td style={{ textAlign: "right" }}>
                                              {g.impressions.toLocaleString()}
                                            </td>
                                            <td style={{ textAlign: "right" }}>
                                              {g.ctr}%
                                            </td>
                                            <td style={{ textAlign: "right" }}>
                                              {g.vcr}%
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan="4" className="no-sub-data">
                                            No gender breakdown available
                                          </td>
                                        </tr>
                                      )}
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
                        colSpan="4"
                        style={{
                          textAlign: "center",
                          padding: "2rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {isLoadingData
                          ? "Loading data..."
                          : "No demographics data available."}
                      </td>
                    </tr>
                  )}
                </tbody>
                {demographicsTotals && (
                  <tfoot>
                    <tr className="totals-row">
                      <td>
                        <div style={{ paddingLeft: "30px", fontWeight: 700 }}>
                          Total
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {demographicsTotals.impressions.toLocaleString()}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {demographicsTotals.ctr}%
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {demographicsTotals.vcr}%
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </section>
      </div>
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
