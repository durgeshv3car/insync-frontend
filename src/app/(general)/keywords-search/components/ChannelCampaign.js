"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  Globe,
  Calendar,
  AlertCircle,
  Filter,
  BookOpen,
  Users,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { getYouTubeResultsByChannel } from "@/services/youtube";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const AILoader = ({ realProgress }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = [
    "Initializing AI engine",
    "Analyzing search patterns",
    "Fetching viral keywords",
    "Filtering high-potential videos",
    "Optimizing data presentation",
    "Finalizing results",
  ];

  useEffect(() => {
    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 3000);

    // Strictly follow real data
    if (realProgress) {
      const calculatedPercent =
        realProgress.total > 0
          ? Math.floor((realProgress.processed / realProgress.total) * 100)
          : 0;

      // Starting from 3% just to show active state, then follow data
      const finalPercent = realProgress.processed === 0 ? 3 : calculatedPercent;
      setProgress(finalPercent);
    }

    return () => {
      clearInterval(statusInterval);
    };
  }, [realProgress]);

  return (
    <div className="ai-loader-wrapper">
      <div className="ai-loader-card">
        {/* Animated AI Brain Icon */}
        <div className="ai-loader-icon-wrap">
          <div className="ai-loader-pulse">
            <Search color="#ffffff" size={32} />
          </div>
        </div>

        <h4 className="ai-loader-title">
          AI Channel Analysis in Progress
        </h4>
        <p className="ai-loader-status">
          {statuses[statusIndex]}
        </p>

        {realProgress && (
          <div className="ai-loader-counter-box">
            <span className="ai-loader-counter-badge">
              {realProgress.processed} / {realProgress.total}
            </span>
            <div className="ai-loader-counter-label">
              Videos Processed
            </div>
          </div>
        )}

        {/* Progress Bar Container */}
        <div className="ai-loader-track">
          {/* Progress Bar Fill */}
          <div
            className="ai-loader-fill"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer effect */}
            <div className="ai-loader-shimmer" />
          </div>
        </div>

        <div className="ai-loader-meta">
          <span>{Math.round(progress)}% Complete</span>
          <span>Please wait...</span>
        </div>
      </div>
    </div>
  );
};

const YouTubeTableChannelCampaign = ({ searchType, setSearchType }) => {
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    channelName: "",
    query: "",
    sortBy: "relevance",
    dateRange: "none",
    maxResults: 100,
    userId: "",
  });

  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      setFilters((prev) => ({ ...prev, userId: session.user.id }));
    }
  }, [session]);

  const activeFilterCount = [
    Boolean(filters.query?.trim()),
    filters.sortBy && filters.sortBy !== "relevance",
    filters.dateRange && filters.dateRange !== "none",
    filters.maxResults && String(filters.maxResults) !== "100",
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setFilters((prev) => ({
      ...prev,
      query: "",
      sortBy: "relevance",
      dateRange: "none",
      maxResults: 100,
    }));
  };

  const [jobProgress, setJobProgress] = useState(null);

  const fetchVideos = async () => {
    setHasSearched(true);
    setLoading(true);
    setJobProgress({
      processed: 0,
      total: filters.maxResults || 100,
      percent: 0,
    });
    try {
      const res = await getYouTubeResultsByChannel({
        ...filters,
        onProgress: (prog) => {
          setJobProgress(prog);
        },
      });

      // Smooth completion: Slide to 100% before closing
      setJobProgress((prev) => ({
        ...prev,
        percent: 100,
        processed: prev.total,
      }));
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (res) {
        // Capture videos from either .results (standard) or .data
        const videoData =
          res.results || (Array.isArray(res.data) ? res.data : []);
        setVideos(videoData);

        // Redirect to youtube-data page after getting all data
        if (videoData.length > 0) {
          const queryParams = new URLSearchParams();
          if (filters.channelName) queryParams.set("channelName", filters.channelName);
          if (filters.query) queryParams.set("query", filters.query);
          router.push(`/youtube-data?${queryParams.toString()}`);
        }
      }
    } catch (error) {
      console.error("Error fetching YouTube results:", error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "channelName" || name === "query") {
      setHasSearched(false);
    }

    // Constraint for maxResults
    if (name === "maxResults") {
      const numericValue = value.replace(/\D/g, ""); // Remove non-digits
      if (numericValue !== "" && Number(numericValue) > 1000) return;
      setFilters((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }

    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    fetchVideos();
  };

  if (loading) {
    return <AILoader realProgress={jobProgress} />;
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <div>
        {/* Discovery Filter Card */}
        <div className="discovery-card">
          {/* Top Bar: Title + Segmented Control */}
          <div className="discovery-top-bar">
            <div className="discovery-badge-wrap">
              <div className="discovery-icon-badge channel">
                <Users size={16} />
              </div>
              <span className="discovery-section-label">
                CHANNEL SEARCH FILTER
              </span>
            </div>

            <div className="discovery-toggle-pill">
              <button
                onClick={() => setSearchType("keyword")}
                className={`discovery-toggle-btn ${searchType === "keyword" ? "active" : ""}`}
                type="button"
              >
                <Search size={13} />
                <span>Keyword</span>
              </button>
              <button
                onClick={() => setSearchType("channel")}
                className={`discovery-toggle-btn ${searchType === "channel" ? "active" : ""}`}
                type="button"
              >
                <Users size={13} />
                <span>Channel</span>
              </button>
            </div>
          </div>

          {/* Primary Hero Search Bar: Channel Name */}
          <div
            className="discovery-hero-row"
            style={{ marginBottom: filters.channelName?.trim() ? "18px" : "0" }}
          >
            <div className="discovery-search-wrapper">
              <span className="discovery-search-icon">
                <Globe size={18} />
              </span>
              <input
                type="text"
                name="channelName"
                value={filters.channelName}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                className="discovery-search-input"
                placeholder="Enter YouTube channel name, creator name, or handle (e.g. MrBeast, Marques Brownlee)..."
                autoComplete="off"
              />
            </div>

            <button
              className="discovery-search-btn"
              type="button"
              disabled={loading || !filters.channelName?.trim()}
              onClick={handleSubmit}
            >
              <Search size={16} />
              <span>{loading ? "Searching..." : "Search"}</span>
            </button>
          </div>

          {/* Compact Filters Toolbar - Shown only when channelName is filled */}
          {Boolean(filters.channelName?.trim()) && (
            <div
              className="discovery-filters-panel"
              style={{
                animation: "fadeIn 0.25s ease-out forwards",
              }}
            >
              {/* Filter Section Header */}
              <div className="discovery-filters-header">
                <div className="discovery-filters-title-wrap">
                  <span className="discovery-filters-icon-badge">
                    <Filter size={13} />
                  </span>
                  <span className="discovery-filters-title">
                    Channel Search &amp; Audience Filters
                  </span>
                  {activeFilterCount > 0 ? (
                    <span className="discovery-filters-badge active">
                      {activeFilterCount} active
                    </span>
                  ) : (
                    <span className="discovery-filters-badge">Default</span>
                  )}
                </div>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="discovery-reset-btn"
                    title="Reset channel filters to default"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Compact Filters Grid */}
              <div className="discovery-filters-grid channel-filters-grid">
                {/* Search Query within Channel */}
                <div
                  className={`discovery-filter-item ${
                    filters.query?.trim() ? "is-active" : ""
                  }`}
                >
                  <div className="discovery-filter-item-head">
                    <span className="discovery-filter-micro-icon region">
                      <Search size={13} />
                    </span>
                    <label className="discovery-filter-label">
                      Filter Keywords
                    </label>
                    <span className="discovery-filter-pill">Optional</span>
                  </div>
                  <div className="discovery-input-wrap">
                    <input
                      type="text"
                      name="query"
                      value={filters.query}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSubmit();
                      }}
                      className="discovery-compact-input"
                      placeholder="Keywords within channel (e.g. tutorial, vlog)..."
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div
                  className={`discovery-filter-item ${
                    filters.sortBy !== "relevance" ? "is-active" : ""
                  }`}
                >
                  <div className="discovery-filter-item-head">
                    <span className="discovery-filter-micro-icon sort">
                      <TrendingUp size={13} />
                    </span>
                    <label className="discovery-filter-label">Sort By</label>
                    <span className="discovery-filter-pill">Order</span>
                  </div>
                  <div className="discovery-input-wrap">
                    <select
                      name="sortBy"
                      value={filters.sortBy}
                      onChange={handleChange}
                      className="discovery-compact-select"
                    >
                      <option value="relevance">⚡ Relevance</option>
                      <option value="popular">🔥 Most Popular</option>
                      <option value="recent">🕒 Recently Uploaded</option>
                    </select>
                  </div>
                </div>

                {/* Date Filter */}
                <div
                  className={`discovery-filter-item ${
                    filters.dateRange !== "none" ? "is-active" : ""
                  }`}
                >
                  <div className="discovery-filter-item-head">
                    <span className="discovery-filter-micro-icon date">
                      <Calendar size={13} />
                    </span>
                    <label className="discovery-filter-label">Uploaded</label>
                    <span className="discovery-filter-pill">Window</span>
                  </div>
                  <div className="discovery-input-wrap">
                    <select
                      name="dateRange"
                      value={filters.dateRange}
                      onChange={handleChange}
                      className="discovery-compact-select"
                    >
                      <option value="none">🗓️ Any Time</option>
                      <option value="24h">⏱️ Last 24 Hours</option>
                      <option value="7d">📅 Last 7 Days</option>
                      <option value="15d">📅 Last 15 Days</option>
                      <option value="30d">🗓️ Last 30 Days</option>
                      <option value="3m">🗓️ Last 3 Months</option>
                      <option value="6m">🗓️ Last 6 Months</option>
                      <option value="12m">📆 Last 1 Year</option>
                      <option value="24m">📆 Last 2 Years</option>
                    </select>
                  </div>
                </div>

                {/* Max Results */}
                <div
                  className={`discovery-filter-item ${
                    String(filters.maxResults) !== "100" ? "is-active" : ""
                  }`}
                >
                  <div className="discovery-filter-item-head">
                    <span className="discovery-filter-micro-icon max">
                      <BookOpen size={13} />
                    </span>
                    <label className="discovery-filter-label">Max Results</label>
                    <span className="discovery-filter-pill">Limit</span>
                  </div>
                  <div className="discovery-input-wrap">
                    <input
                      type="text"
                      name="maxResults"
                      value={filters.maxResults}
                      onChange={handleChange}
                      className="discovery-compact-input"
                      placeholder="100 (Max 1000)"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* No Videos Found State */}
        {hasSearched && videos.length === 0 && !loading && (
          <div className="discovery-suggestions-box">
            <div className="d-flex align-items-center gap-2 mb-2">
              <AlertCircle size={20} color="#ef4444" />
              <h5
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#ef4444",
                }}
              >
                No videos found for channel &quot;{filters.channelName}&quot;
              </h5>
            </div>
            <p
              style={{
                color: "var(--text-secondary, #94a3b8)",
                fontSize: "0.85rem",
                margin: "6px 0 12px 0",
              }}
            >
              Try adjusting your channel name or explore these popular channels:
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                alignItems: "center",
              }}
            >
              {[
                "MrBeast",
                "Marques Brownlee",
                "Veritasium",
                "Huberman Lab",
                "Lex Fridman",
                "Fireship",
              ].map((ch, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({
                      ...prev,
                      channelName: ch,
                      query: "",
                    }));
                    fetchVideos(ch);
                  }}
                  className="discovery-suggestion-chip"
                >
                  <Users size={13} color="#2563eb" />
                  <span>{ch}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeTableChannelCampaign;
