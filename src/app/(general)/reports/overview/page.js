"use client";

import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "./styles.css";

export default function OverviewPage() {
  const [dateRange, setDateRange] = useState("30");
  const [campaign, setCampaign] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Chart refs
  const performanceChartRef = useRef(null);
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
    // Performance Overview Chart
    if (performanceChartRef.current && !chartsRef.current.performance) {
      const ctx = performanceChartRef.current.getContext("2d");
      chartsRef.current.performance = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"],
          datasets: [
            {
              label: "Performance",
              data: [1200, 1900, 1500, 2200, 2800, 2400, 3000, 2800],
              borderColor: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "rgba(0,0,0,0.8)",
              padding: 12,
              titleFont: { size: 14 },
              bodyFont: { size: 13 },
              borderColor: "#e5e7eb",
              borderWidth: 1,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 3500,
              grid: { color: "rgba(0,0,0,0.05)" },
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

  return (
    <main className="main-content">

      {/* Filters Section */}
      <section className="filters-section">
        <div className="filter-bar">
          <div className="filter-group">
            <label htmlFor="dateRange">Date Range</label>
            <select 
              id="dateRange"
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="filter-select"
            >
              <option value="7">Last 7 Days</option>
              <option value="14">Last 14 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="campaign">Campaign</label>
            <select 
              id="campaign"
              value={campaign} 
              onChange={(e) => setCampaign(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Campaigns</option>
              <option value="brand">Brand Awareness</option>
              <option value="conversion">Conversions</option>
              <option value="retargeting">Retargeting</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="platform">Platform</label>
            <select 
              id="platform"
              value={platform} 
              onChange={(e) => setPlatform(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Platforms</option>
              <option value="google">Google Ads</option>
              <option value="meta">Meta Ads</option>
              <option value="tiktok">TikTok Ads</option>
            </select>
          </div>

          <button className="btn btn-secondary filter-reset">
            <i className="fas fa-redo-alt" /> Reset Filters
          </button>
        </div>
      </section>

      {/* Real-time Stats */}
      <section className="realtime-section">
        <div className="realtime-card">
          <div className="realtime-header">
            <div className="realtime-title">
              <h3>Real-Time Performance</h3>
              <span className="live-dot">● LIVE</span>
            </div>
            <button className="btn btn-refresh">
              <i className="fas fa-sync-alt" /> Refresh
            </button>
          </div>

          <div className="realtime-stats">
            <Stat value="2,844" label="Active Users" trend="+12.5%" />
            <Stat value="1,254" label="Clicks/Hour" trend="+8.3%" />
            <Stat value="91" label="Conversions" trend="+15.7%" />
            <Stat value="$4,641" label="Revenue" trend="+22.4%" />
            <Stat value="3.37%" label="CTR" trend="-1.2%" />
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
          <ChartCard title="Performance Overview">
            <canvas ref={performanceChartRef} id="performanceChart" />
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
            <button className="btn btn-sm btn-ghost">
              <i className="fas fa-filter" /> Filter
            </button>
            <button className="btn btn-sm btn-ghost">
              <i className="fas fa-download" /> Export
            </button>
            <button className="btn btn-primary">
              <i className="fas fa-plus" /> New Campaign
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
      <section className="bottom-sections">
        <div className="section-row">
          <div className="section-column">
            <div className="info-card">
              <div className="card-header">
                <h3>Recent Activity</h3>
                <a href="#" className="link-text">View All</a>
              </div>
              <div className="activity-list">
                <ActivityItem icon="fa-check-circle" title="Campaign launched successfully" time="2 hours ago" color="success" />
                <ActivityItem icon="fa-sync" title="100 conversions milestone reached" time="4 hours ago" color="info" />
                <ActivityItem icon="fa-chart-line" title="Brand Awareness budget updated to..." time="1 day ago" color="warning" />
                <ActivityItem icon="fa-pause-circle" title="Retargeting campaign paused due to..." time="3 hours ago" color="secondary" />
              </div>
            </div>
          </div>

          <div className="section-column">
            <div className="info-card">
              <div className="card-header">
                <h3>Top Performers</h3>
                <a href="#" className="link-text">See Rankings</a>
              </div>
              <div className="performers-list">
                <PerformerItem rank="1" title="App Install Campaign" value="5.1x" />
                <PerformerItem rank="2" title="Summer Sale 2024" value="4.2x" />
                <PerformerItem rank="3" title="Brand Awareness Q3" value="3.8x" />
                <PerformerItem rank="4" title="Retargeting - Cart" value="3.2x" />
              </div>
            </div>
          </div>

          <div className="section-column">
            <div className="info-card">
              <div className="card-header">
                <h3>Monthly Goals</h3>
                <a href="#" className="link-text">Manage</a>
              </div>
              <div className="goals-list">
                <GoalItem title="Revenue Target" current="78%" target="$150K" />
                <GoalItem title="Conversion Goal" current="89%" target="50K conversions" />
                <GoalItem title="New Customers" current="64%" target="1,000 / 1,560" />
              </div>
            </div>
          </div>
        </div>

        <div className="section-row">
          <div className="section-column">
            <ChartCard title="Geographic Performance" subtitle="Top performing regions">
              <canvas ref={geographicChartRef} id="geographicChart" />
            </ChartCard>
          </div>

          <div className="section-column">
            <ChartCard title="Audience Demographics" subtitle="Age and gender breakdown">
              <canvas ref={demographicsChartRef} id="demographicsChart" />
            </ChartCard>
          </div>
        </div>
      </section>
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
      {change && (
        <div className="stat-footer">
          <span className="change-badge" style={{ color: changeColor }}>
            <i className={`fas ${changeIcon}`} /> {change}
          </span>
          <span className="stat-comparison">vs last month</span>
        </div>
      )}
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
