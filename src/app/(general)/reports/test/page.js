"use client";

import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "./styles.css";


function formatNumber(num) {
  const rounded = Math.round(num);
  
  if (rounded >= 1000000) {
    return Math.round(rounded / 1000000).toLocaleString() + 'M';
  } else if (rounded >= 1000) {
    return Math.round(rounded / 1000).toLocaleString() + 'K';
  }
  return rounded.toLocaleString();
}

export default function OverviewPage() {
  // State for data sections
  const [campaigns, setCampaigns] = useState([]);
  const [activities, setActivities] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [goals, setGoals] = useState([]);
  const [tableType, setTableType] = useState("daily"); // 'daily' or 'monthly'

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
    if (performanceDailyChartRef.current) {
      const ctx = performanceDailyChartRef.current.getContext("2d");
      
      // Daily chart data
      const dailyData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        impressions: [12000, 19000, 15000, 22000, 28000, 24000, 30000],
        vcr: [2.5, 3.2, 2.8, 3.5, 4.1, 3.8, 4.3],
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
              borderDash: [],
              segment: {
                borderColor: (ctx) => ctx.p0DataIndex === undefined ? "#6366f1" : "#6366f1",
              },
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
              borderDash: [],
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
              labels: { padding: 5, font: { size: 13, weight: "600" }, color: "#495057" },
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
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) label += ': ';
                  const value = context.parsed.y;
                  if (context.dataset.yAxisID === 'y1') {
                    label += Math.round(value) + '%';
                  } else {
                    label += Math.round(value).toLocaleString();
                  }
                  return label;
                },
                labelColor: function(context) {
                  return { borderColor: context.borderColor, backgroundColor: context.borderColor };
                }
              }
            },
          },
          scales: {
            x: {
              grid: { color: "rgba(0,0,0,0.02)", drawBorder: false },
              ticks: { font: { size: 12, color: "#6c757d" }, padding: 8 },
            },
            y: {
              beginAtZero: true,
              max: 35000,
              grid: { color: "rgba(0,0,0,0.06)", drawBorder: false },
              ticks: { font: { size: 11, color: "#6c757d" }, stepSize: 5000, padding: 10, callback: function(value) { return formatNumber(value); } },
              title: { display: false },
            },
            y1: {
              type: "linear",
              display: true,
              position: "right",
              beginAtZero: true,
              max: 5,
              grid: { drawOnChartArea: false, drawBorder: false },
              ticks: { font: { size: 11, color: "#6c757d" }, stepSize: 1, padding: 10, callback: function(value) { return Math.round(value) + '%'; } },
              title: { display: false },
            },
          },
        },
      });
    }

    // Performance Monthly Chart
    if (performanceMonthlyChartRef.current) {
      const ctx = performanceMonthlyChartRef.current.getContext("2d");
      
      // Monthly chart data
      const monthlyData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        impressions: [85000, 92000, 78000, 95000, 110000, 102000, 120000, 115000, 105000, 98000, 88000, 125000],
        vcr: [2.1, 2.4, 2.0, 2.8, 3.2, 3.0, 3.5, 3.3, 3.1, 2.9, 2.6, 3.8],
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
              borderDash: [],
              segment: {
                borderColor: (ctx) => ctx.p0DataIndex === undefined ? "#6366f1" : "#6366f1",
              },
            },
            {
              label: "VCR",
              data: monthlyData.vcr,
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
              borderDash: [],
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
              labels: { padding: 20, font: { size: 13, weight: "600" }, color: "#495057" },
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
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) label += ': ';
                  const value = context.parsed.y;
                  if (context.dataset.yAxisID === 'y1') {
                    label += Math.round(value) + '%';
                  } else {
                    label += Math.round(value).toLocaleString();
                  }
                  return label;
                },
                labelColor: function(context) {
                  return { borderColor: context.borderColor, backgroundColor: context.borderColor };
                }
              }
            },
          },
          scales: {
            x: {
              grid: { color: "rgba(0,0,0,0.02)", drawBorder: false },
              ticks: { font: { size: 12, color: "#6c757d" }, padding: 8 },
            },
            y: {
              beginAtZero: true,
              max: 135000,
              grid: { color: "rgba(0,0,0,0.06)", drawBorder: false },
              ticks: { font: { size: 11, color: "#6c757d" }, stepSize: 15000, padding: 10, callback: function(value) { return formatNumber(value); } },
              title: { display: false },
            },
            y1: {
              type: "linear",
              display: true,
              position: "right",
              beginAtZero: true,
              max: 5,
              grid: { drawOnChartArea: false, drawBorder: false },
              ticks: { font: { size: 11, color: "#6c757d" }, stepSize: 1, padding: 10, callback: function(value) { return Math.round(value) + '%'; } },
              title: { display: false },
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
          labels: ["Impressions", "Visits", "Clicks", "Add to Cart", "Purchase"],
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
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, max: 100, grid: { color: "rgba(0,0,0,0.05)" } },
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
              backgroundColor: [
                "#6366f1",
                "#ec4899",
                "#06b6d4",
                "#10b981",
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
              labels: { font: { size: 12 }, padding: 15 },
            },
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
          labels: ["USA", "UK", "Canada", "Australia", "Germany", "France", "India", "Japan"],
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
          },
        },
      });
    }

    return () => {
      // Cleanup charts on unmount
      Object.values(chartsRef.current).forEach((chart) => chart?.destroy());
      chartsRef.current = {};
    };
  }, []);

  // TODO: Add useEffect to fetch data from API
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       // const res = await fetch('/api/reports/data');
  //       // const data = await res.json();
  //       // setCampaigns(data.campaigns);
  //       // setActivities(data.activities);
  //       // setTopPerformers(data.topPerformers);
  //       // setGoals(data.goals);
  //     } catch (error) {
  //       console.error('Error fetching report data:', error);
  //     }
  //   };
  //   fetchData();
  // }, []);

  return (
    <main className="main-content">

      {/* Filters Section */}


      {/* Real-time Stats */}
      <section className="realtime-section">
        <div className="realtime-card">
          <div className="realtime-header">
            <div className="realtime-title">
              <h3>Real-Time Performance</h3>
            </div>
          
          </div>

          <div className="realtime-stats">
            <Stat value="2,844" label="Active Users"  />
            <Stat value="1,254" label="Clicks/Hour" />
            <Stat value="91" label="Conversions"  />
            <Stat value="$4,641" label="Revenue"  />
            <Stat value="3.37%" label="CTR"  />
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="metrics-section">
        <h2 className="section-title">Key Performance Metrics</h2>
        <div className="stats-grid">
          <StatCard title="Impressions" value="2.4M" icon="fa-eye" change="+12%" />
          <StatCard title="Clicks" value="847K" icon="fa-mouse-pointer" change="+8%" />
          <StatCard title="CTR" value="3.52%" icon="fa-percentage" change="+0.5%" />
          <StatCard title="Conversions" value="12.4K" icon="fa-shopping-cart" change="+23%" />
          <StatCard title="Revenue" value="$124.5K" icon="fa-dollar-sign" change="+15%" />
          <StatCard title="ROAS" value="4.2x" icon="fa-chart-line" change="+18%" />
        </div>
      </section>

      {/* Charts Section */}
      <section className="charts-section">
        <h2 className="section-title">Analytics & Insights</h2>
        <div className="charts-grid">
          <ChartCard title="Performance Daily">
            <canvas ref={performanceDailyChartRef} id="performanceDailyChart" />
          </ChartCard>
          <ChartCard title="Performance Monthly">
            <canvas ref={performanceMonthlyChartRef} id="performanceMonthlyChart" />
          </ChartCard>

          <ChartCard title="Platform Distribution">
            <canvas ref={platformChartRef} id="platformChart" />
          </ChartCard>

          <ChartCard title="Conversion Funnel">
            <canvas ref={funnelChartRef} id="funnelChart" />
          </ChartCard>

          <ChartCard title="Revenue by Channel">
            <canvas ref={revenueChartRef} id="revenueChart" />
          </ChartCard>

          <ChartCard title="Hourly Performance Heatmap">
            <canvas ref={heatmapChartRef} id="heatmapChart" />
          </ChartCard>

          <ChartCard title="Device Breakdown">
            <canvas ref={deviceChartRef} id="deviceChart" />
          </ChartCard>
        </div>
      </section>

      {/* Table */}
      <div className="data-table-card">
        <div className="table-header">
          <h3>Campaign Performance</h3>
          <div className="table-actions">
            <button 
              className={`btn btn-sm ${tableType === 'daily' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTableType('daily')}
            >
              Daily
            </button>
            <button 
              className={`btn btn-sm ${tableType === 'monthly' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTableType('monthly')}
              style={{ marginLeft: '8px' }}
            >
              Monthly
            </button>
            <button className="btn btn-sm btn-ghost" style={{ marginLeft: '12px' }}>
              <i className="fas fa-filter" /> Filter
            </button>
            <button className="btn btn-sm btn-ghost">
              <i className="fas fa-download" /> Export
            </button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Status</th>
              <th>Impressions</th>
              <th>Clicks</th>
              <th>CTR</th>
              <th>Conversions</th>
              <th>Spend</th>
              <th>ROAS</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><div className="campaign-icon active" />Summer Sale 2024</td>
              <td><span className="badge badge-active">Active</span></td>
              <td>1,245,678</td>
              <td>45,678</td>
              <td>3.67%</td>
              <td>1,234</td>
              <td>$12,456</td>
              <td>4.2x</td>
              <td><ProgressBar percent={75} /></td>
            </tr>
            <tr>
              <td><div className="campaign-icon secondary" />Brand Awareness Q3</td>
              <td><span className="badge badge-active">Active</span></td>
              <td>892,345</td>
              <td>32,456</td>
              <td>3.64%</td>
              <td>876</td>
              <td>$8,934</td>
              <td>3.8x</td>
              <td><ProgressBar percent={60} /></td>
            </tr>
            <tr>
              <td><div className="campaign-icon info" />Retargeting - Cart</td>
              <td><span className="badge badge-paused">Paused</span></td>
              <td>456,789</td>
              <td>16,234</td>
              <td>3.55%</td>
              <td>567</td>
              <td>$5,678</td>
              <td>3.2x</td>
              <td><ProgressBar percent={45} /></td>
            </tr>
            <tr>
              <td><div className="campaign-icon success" />App Install</td>
              <td><span className="badge badge-active">Active</span></td>
              <td>678,901</td>
              <td>24,567</td>
              <td>3.62%</td>
              <td>2,345</td>
              <td>$7,890</td>
              <td>5.1x</td>
              <td><ProgressBar percent={90} /></td>
            </tr>
            <tr>
              <td><div className="campaign-icon warning" />Video Engagement</td>
              <td><span className="badge badge-completed">Completed</span></td>
              <td>345,678</td>
              <td>12,345</td>
              <td>3.57%</td>
              <td>432</td>
              <td>$4,567</td>
              <td>1.8x</td>
              <td><ProgressBar percent={100} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bottom Sections */}

    </main>
  );
}

/* ===== Helpers (same file) ===== */

function Stat({ value, label, trend }) {
  const trendColor = trend?.startsWith('+') ? '#10b981' : '#ef4444';
  const trendIcon = trend?.startsWith('+') ? 'fa-arrow-up' : 'fa-arrow-down';

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
  const changeColor = change?.startsWith('+') ? '#10b981' : '#ef4444';
  const changeIcon = change?.startsWith('+') ? 'fa-arrow-up' : 'fa-arrow-down';

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
    <div className="chart-card">
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
    '1': '#ffd700',
    '2': '#c0c0c0',
    '3': '#cd7f32',
  };

  return (
    <div className="performer-item">
      <div className="performer-rank" style={{ color: rankColors[rank] || '#666' }}>
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