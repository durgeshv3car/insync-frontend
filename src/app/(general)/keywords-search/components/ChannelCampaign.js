"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  Globe,
  Calendar,
  AlertCircle,
  Filter,
  BookOpen,
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
        {/* Filter Card */}
        <div className="app-search-card">
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
              }}>
                <Filter size={16} />
              </div>
              <h6
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  margin: 0,
                }}
              >
                Channel Search Filters
              </h6>
            </div>

            <div className="app-toggle-pill">
              <button
                onClick={() => setSearchType("keyword")}
                className={`app-toggle-btn ${searchType === "keyword" ? "active" : ""}`}
              >
                Keyword
              </button>
              <button
                onClick={() => setSearchType("channel")}
                className={`app-toggle-btn ${searchType === "channel" ? "active" : ""}`}
              >
                Channel
              </button>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-4">
              <label className="app-search-label">
                Channel Name
              </label>
              <div className="app-input-group">
                <span className="app-input-addon">
                  <Globe size={16} />
                </span>
                <input
                  type="text"
                  name="channelName"
                  value={filters.channelName}
                  onChange={handleChange}
                  className="app-input"
                  placeholder="Enter channel name..."
                />
              </div>
            </div>

            {filters.channelName && (
              <>
                <div className="col-lg-4">
                  <label className="app-search-label">
                    Search Query
                  </label>
                  <div className="app-input-group">
                    <span className="app-input-addon">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      name="query"
                      value={filters.query}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Enter search terms..."
                    />
                  </div>
                </div>

                <div className="col-lg-2">
                  <label className="app-search-label">
                    Sort By
                  </label>
                  <div className="app-input-group">
                    <span className="app-input-addon">
                      <Filter size={16} />
                    </span>
                    <select
                      name="sortBy"
                      value={filters.sortBy}
                      onChange={handleChange}
                      className="app-select"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="popular">Popular</option>
                      <option value="recent">Recent</option>
                    </select>
                  </div>
                </div>

                <div className="col-lg-2">
                  <label className="app-search-label">
                    Date filter Data
                  </label>
                  <div className="app-input-group">
                    <span className="app-input-addon">
                      <Calendar size={16} />
                    </span>
                    <select
                      name="dateRange"
                      value={filters.dateRange}
                      onChange={handleChange}
                      className="app-select"
                    >
                      <option value="none">None</option>
                      <option value="24h">Last 24 Hours</option>
                      <option value="7d">7 Days</option>
                      <option value="15d">15 Days</option>
                      <option value="30d">30 Days</option>
                      <option value="3m">3 Months</option>
                      <option value="6m">6 Months</option>
                      <option value="12m">1 Year</option>
                      <option value="24m">2 Year</option>
                    </select>
                  </div>
                </div>

                <div className="col-lg-2">
                  <label className="app-search-label">
                    Max Results
                  </label>
                  <div className="app-input-group">
                    <span className="app-input-addon">
                      <BookOpen size={16} />
                    </span>
                    <input
                      type="text"
                      name="maxResults"
                      value={filters.maxResults}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="200"
                    />
                  </div>
                </div>

                <div className="col-lg-2 d-flex align-items-end">
                  <button
                    className="app-btn-search w-100"
                    type="button"
                    disabled={loading}
                    onClick={handleSubmit}
                  >
                    <Search size={16} />
                    {loading ? "Searching..." : "Search"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* No Videos Found State */}
        {hasSearched && videos.length === 0 && !loading && (
          <div
            style={{
              backgroundColor: "var(--card-bg, #1e293b)",
              borderRadius: "16px",
              padding: "24px 28px",
              marginTop: "20px",
              marginBottom: "24px",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <AlertCircle size={20} color="#ef4444" />
              <h5
                style={{
                  margin: 0,
                  fontSize: "1.05rem",
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
                fontSize: "0.9rem",
                margin: "8px 0 0 0",
              }}
            >
              Try adjusting your channel name, search terms, or date filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeTableChannelCampaign;
