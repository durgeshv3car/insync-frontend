"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  Eye,
  ThumbsUp,
  MessageCircle,
  Globe,
  Calendar,
  Users,
  AlertCircle,
  Filter,
  BookOpen,
} from "lucide-react";
import { getYouTubeResultsByChannel } from "@/services/youtube";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import PageHeaderDate from "@/components/shared/pageHeader/PageHeaderDate";
import Image from "next/image";
import { useSession } from "next-auth/react";

const AILoader = ({ realProgress }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = [
    "Initializing AI engine...",
    "Analyzing search patterns...",
    "Fetching viral keywords...",
    "Filtering high-potential videos...",
    "Optimizing data presentation...",
    "Finalizing results...",
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
    <div
      className="d-flex flex-column justify-content-center align-items-center vh-100"
      style={{ background: "#f8f9fa" }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          padding: "40px",
          textAlign: "center",
        }}
      >
        {/* Animated AI Brain Icon */}
        <div style={{ marginBottom: "30px", position: "relative" }}>
          <div
            className="ai-loader-pulse"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #031035 0%, #081947 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              boxShadow: "0 10px 25px rgba(3, 16, 53, 0.2)",
            }}
          >
            <Search color="white" size={32} />
          </div>
        </div>

        <h4
          style={{ fontWeight: "700", color: "#031035", marginBottom: "10px" }}
        >
          AI Channel Analysis in Progress
        </h4>
        <p
          style={{
            color: "#64748b",
            fontSize: "0.95rem",
            marginBottom: "10px",
            height: "1.5rem",
          }}
        >
          {statuses[statusIndex]}
        </p>

        {realProgress && (
          <div style={{ marginBottom: "20px" }}>
            <span
              style={{
                fontSize: "1.2rem",
                fontWeight: "800",
                color: "#1e293b",
                background: "#f1f5f9",
                padding: "4px 12px",
                borderRadius: "20px",
                border: "1px solid #e2e8f0",
              }}
            >
              {realProgress.processed} / {realProgress.total}
            </span>
            <div
              style={{
                fontSize: "0.75rem",
                color: "#64748b",
                marginTop: "8px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Videos Processed
            </div>
          </div>
        )}

        {/* Progress Bar Container */}
        <div
          style={{
            width: "100%",
            height: "10px",
            backgroundColor: "#e9ecef",
            borderRadius: "10px",
            overflow: "hidden",
            marginBottom: "15px",
            position: "relative",
          }}
        >
          {/* Progress Bar Fill */}
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #031035, #081947)",
              borderRadius: "10px",
              transition: "width 0.3s ease-out",
              position: "relative",
            }}
          >
            {/* Shimmer effect */}
            <div
              className="ai-loader-shimmer"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              }}
            />
          </div>
        </div>

        <div
          className="d-flex justify-content-between"
          style={{ fontSize: "0.85rem", fontWeight: "600", color: "#6c757d" }}
        >
          <span>{Math.round(progress)}% Complete</span>
          <span>Please wait...</span>
        </div>
      </div>
    </div>
  );
};

const YouTubeTableChannelCampaign = ({ searchType, setSearchType }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    channelName: "",
    query: "",
    sortBy: "relevance",
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
      console.log("YouTube Results:", res);

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
      }
    } catch (error) {
      console.error("Error fetching YouTube results:", error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    fetchVideos();
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    return Number(num).toLocaleString();
  };

  if (loading) {
    return <AILoader realProgress={jobProgress} />;
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="container mt-3">
        {/* Filter Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "12px",
            marginBottom: "30px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid #e9ecef",
          }}
        >
          <div
            style={{
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h6
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#1a1a1a",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                margin: 0,
              }}
            >
              Channel Search Filters
            </h6>

            <div
              style={{
                display: "inline-flex",
                backgroundColor: "#f1f5f9",
                padding: "3px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                height: "36px",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => setSearchType("keyword")}
                className="btn-sm"
                style={{
                  padding: "4px 16px",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "0.75rem",
                  fontWeight: "750",
                  backgroundColor:
                    searchType === "keyword" ? "#ffffff" : "transparent",
                  color: searchType === "keyword" ? "#0d6efd" : "#64748b",
                  boxShadow:
                    searchType === "keyword"
                      ? "0 2px 6px rgba(0,0,0,0.1)"
                      : "none",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform:
                    searchType === "keyword" ? "scale(1.02)" : "scale(1)",
                }}
              >
                Keyword
              </button>
              <button
                onClick={() => setSearchType("channel")}
                className="btn-sm"
                style={{
                  padding: "4px 16px",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "0.75rem",
                  fontWeight: "750",
                  backgroundColor:
                    searchType === "channel" ? "#ffffff" : "transparent",
                  color: searchType === "channel" ? "#0d6efd" : "#64748b",
                  boxShadow:
                    searchType === "channel"
                      ? "0 2px 6px rgba(0,0,0,0.1)"
                      : "none",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform:
                    searchType === "channel" ? "scale(1.02)" : "scale(1)",
                }}
              >
                Channel
              </button>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-4">
              <label
                style={{
                  padding: "14px 0 8px 0",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  color: "#495057",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                }}
              >
                Channel Name
              </label>
              <div
                className="input-group"
                style={{
                  borderRadius: "8px",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                }}
              >
                <span
                  className="input-group-text"
                  style={{
                    border: "1px solid #dee2e6",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <Globe size={16} style={{ color: "#6c757d" }} />
                </span>
                <input
                  type="text"
                  name="channelName"
                  value={filters.channelName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter channel name..."
                  style={{
                    border: "1px solid #dee2e6",
                    fontSize: "0.85rem",
                    padding: "8px 12px",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0d6efd")}
                  onBlur={(e) => (e.target.style.borderColor = "#dee2e6")}
                />
              </div>
            </div>

            {filters.channelName && (
              <>
                <div className="col-lg-4">
                  <label
                    style={{
                      padding: "14px 0 8px 0",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                    }}
                  >
                    Search Query
                  </label>
                  <div
                    className="input-group"
                    style={{
                      borderRadius: "8px",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <span
                      className="input-group-text"
                      style={{
                        border: "1px solid #dee2e6",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <Search size={16} style={{ color: "#6c757d" }} />
                    </span>
                    <input
                      type="text"
                      name="query"
                      value={filters.query}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter search terms..."
                      style={{
                        border: "1px solid #dee2e6",
                        fontSize: "0.85rem",
                        padding: "8px 12px",
                        transition: "all 0.2s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#0d6efd")}
                      onBlur={(e) => (e.target.style.borderColor = "#dee2e6")}
                    />
                  </div>
                </div>
                <div className="col-lg-3">
                  <label
                    style={{
                      padding: "14px 0 8px 0",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                    }}
                  >
                    Sort By
                  </label>
                  <div
                    className="input-group"
                    style={{ borderRadius: "6px", overflow: "hidden" }}
                  >
                    <span
                      className="input-group-text"
                      style={{
                        border: "1px solid #dee2e6",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <Filter size={16} style={{ color: "#6c757d" }} />
                    </span>
                    <select
                      name="sortBy"
                      value={filters.sortBy}
                      onChange={handleChange}
                      className="form-select"
                      style={{
                        border: "1px solid #dee2e6",
                        fontSize: "0.85rem",
                        padding: "8px 12px",
                      }}
                    >
                      <option value="relevance">Relevance</option>
                      <option value="popular">Popular</option>
                      <option value="recent">Recent</option>
                    </select>
                  </div>
                </div>

                <div className="col-lg-2">
                  <label
                    style={{
                      padding: "14px 0 8px 0",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                    }}
                  >
                    Max Results
                  </label>
                  <div
                    className="input-group"
                    style={{ borderRadius: "6px", overflow: "hidden" }}
                  >
                    <span
                      className="input-group-text"
                      style={{
                        border: "1px solid #dee2e6",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <BookOpen size={16} style={{ color: "#6c757d" }} />
                    </span>
                    <input
                      type="number"
                      name="maxResults"
                      value={filters.maxResults}
                      onChange={handleChange}
                      className="form-control"
                      min="1"
                      max="200"
                      placeholder="100"
                      style={{
                        border: "1px solid #dee2e6",
                        fontSize: "0.85rem",
                        padding: "8px 12px",
                      }}
                    />
                  </div>
                </div>

                <div className="col-lg-2 d-flex align-items-end">
                  <button
                    className="btn w-100"
                    type="button"
                    disabled={loading || !filters.channelName || !filters.query}
                    onClick={handleSubmit}
                    style={{
                      backgroundColor:
                        loading || !filters.channelName || !filters.query
                          ? "#e2e8f0"
                          : "#0d6efd",
                      color:
                        loading || !filters.channelName || !filters.query
                          ? "#94a3b8"
                          : "#ffffff",
                      border: "none",
                      fontWeight: "750",
                      padding: "10px 16px",
                      borderRadius: "10px",
                      cursor:
                        loading || !filters.channelName || !filters.query
                          ? "not-allowed"
                          : "pointer",
                      fontSize: "0.95rem",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow:
                        loading || !filters.channelName || !filters.query
                          ? "none"
                          : "0 4px 12px rgba(13, 110, 253, 0.25)",
                      transform:
                        loading || !filters.channelName || !filters.query
                          ? "scale(1)"
                          : "scale(1)",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading && filters.channelName && filters.query)
                        e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      if (!loading && filters.channelName && filters.query)
                        e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {loading ? "Searching..." : "Search"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#6c757d",
                marginBottom: "0",
              }}
            >
              {videos.length > 0
                ? `Showing ${videos.length} video${videos.length !== 1 ? "s" : ""}`
                : "No videos to display"}
            </p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="container">
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid #e9ecef",
          }}
        >
          <div
            className="table-responsive"
            style={{ overflowX: "auto", width: "100%", maxWidth: "100%" }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "fixed",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  <th
                    style={{
                      padding: "10px",
                      textAlign: "left",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "21%",
                    }}
                  >
                    Video
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      textAlign: "left",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "13%",
                    }}
                  >
                    Channel
                  </th>
                  <th
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "13%",
                    }}
                  >
                    Views
                  </th>
                  <th
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "12%",
                    }}
                  >
                    Likes
                  </th>
                  <th
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "12%",
                    }}
                  >
                    Comments
                  </th>
                  <th
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "13%",
                    }}
                  >
                    Subscribers
                  </th>
                  <th
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "10%",
                    }}
                  >
                    Published
                  </th>
                </tr>
              </thead>
              <tbody>
                {videos.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      <div>
                        <AlertCircle
                          size={48}
                          style={{ color: "#dee2e6", marginBottom: "16px" }}
                        />
                        <h5
                          style={{
                            color: "#6c757d",
                            fontWeight: "500",
                            marginBottom: "8px",
                            fontSize: "1.1rem",
                          }}
                        >
                          No videos found
                        </h5>
                        <p
                          style={{
                            color: "#adb5bd",
                            marginBottom: "0",
                            fontSize: "0.95rem",
                          }}
                        >
                          {filters.query
                            ? "Try adjusting your search terms or filters"
                            : "Enter a search query to find videos"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {videos.map((v, idx) => (
                  <tr
                    key={v.videoId}
                    style={{
                      borderBottom: "1px solid #e9ecef",
                      transition: "background-color 0.2s ease",
                      backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8f9fa",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f0f4ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        idx % 2 === 0 ? "#ffffff" : "#f8f9fa")
                    }
                  >
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          minWidth: 0,
                        }}
                      >
                        <img
                          src={v.thumbnail}
                          alt={v.title}
                          width={48}
                          height={36}
                          style={{
                            borderRadius: "4px",
                            objectFit: "cover",
                            flexShrink: 0,
                            border: "1px solid #e9ecef",
                          }}
                        />
                        <div
                          style={{ minWidth: 0, flex: 1, overflow: "hidden" }}
                        >
                          <div
                            style={{
                              fontWeight: "500",
                              color: "#1a1a1a",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              marginBottom: "4px",
                              fontSize: "0.85rem",
                            }}
                            title={v.title}
                          >
                            {v.title}
                          </div>
                          <a
                            href={v.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "0.75rem",
                              color: "#0d6efd",
                              textDecoration: "none",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                            }}
                          >
                            Watch Video →
                          </a>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#e9ecef",
                            fontWeight: "600",
                            fontSize: "0.8rem",
                            color: "#495057",
                            flexShrink: 0,
                          }}
                        >
                          {v.channelName.charAt(0).toUpperCase()}
                        </div>
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: "0.85rem",
                            color: "#1a1a1a",
                            minWidth: 0,
                          }}
                          title={v.channelName}
                        >
                          {v.channelName}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Eye
                          size={12}
                          style={{ color: "#6c757d", flexShrink: 0 }}
                        />
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "#1a1a1a",
                            fontWeight: "500",
                          }}
                        >
                          {formatNumber(v.views)}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <ThumbsUp
                          size={12}
                          style={{ color: "#6c757d", flexShrink: 0 }}
                        />
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "#1a1a1a",
                            fontWeight: "500",
                          }}
                        >
                          {formatNumber(v.likes)}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <MessageCircle
                          size={12}
                          style={{ color: "#6c757d", flexShrink: 0 }}
                        />
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "#1a1a1a",
                            fontWeight: "500",
                          }}
                        >
                          {formatNumber(v.comments)}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Users
                          size={12}
                          style={{ color: "#6c757d", flexShrink: 0 }}
                        />
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "#1a1a1a",
                            fontWeight: "500",
                          }}
                        >
                          {formatNumber(v.subscribers)}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#6c757d",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                        }}
                      >
                        {new Date(v.publishedDate).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {videos.length > 0 && (
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f8f9fa",
                borderTop: "1px solid #dee2e6",
                fontSize: "0.9rem",
                color: "#6c757d",
              }}
            >
              Showing <strong>{videos.length}</strong> video
              {videos.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YouTubeTableChannelCampaign;
