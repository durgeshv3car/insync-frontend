"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Globe,
  Calendar,
  Users,
  AlertCircle,
  Filter,
  BookOpen,
  ExternalLink,
  Database,
  Sparkles,
} from "lucide-react";
import { getYouTubeResults } from "@/services/youtube";
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
          AI Search in Progress
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

const YouTubeTableKeywordCampaign = ({ searchType, setSearchType }) => {
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [similarQueries, setSimilarQueries] = useState([]);
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [originalQuery, setOriginalQuery] = useState("");
  const [triedQueries, setTriedQueries] = useState(new Set());
  const [unfilteredDbCount, setUnfilteredDbCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    query: "",
    regionCode: "IN",
    minViews: "",
    minSubscribers: "1000",
    maxResults: "100",
    sortBy: "relevance",
    dateRange: "none",
    userId: "",
  });

  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      setFilters((prev) => ({ ...prev, userId: session.user.id }));
    }
  }, [session]);

  const [jobProgress, setJobProgress] = useState(null);

  const fetchVideos = async (overrideQuery, isFromSuggestion = false) => {
    const currentQuery =
      typeof overrideQuery === "string" ? overrideQuery : filters.query;

    const effectiveOriginalQuery = isFromSuggestion
      ? originalQuery || filters.query
      : currentQuery;

    const activeFilters = {
      ...filters,
      query: currentQuery,
      originalQuery: effectiveOriginalQuery,
      saveAsQuery: effectiveOriginalQuery,
    };
    if (typeof overrideQuery === "string") {
      setFilters((prev) => ({ ...prev, query: overrideQuery }));
    }

    if (!isFromSuggestion) {
      setOriginalQuery(currentQuery);
      setTriedQueries(new Set());
      setAllSuggestions([]);
    } else {
      setTriedQueries((prev) => {
        const next = new Set(prev);
        if (currentQuery) next.add(currentQuery.trim().toLowerCase());
        return next;
      });
    }

    setLoading(true);
    setHasSearched(true);
    setJobProgress({
      processed: 0,
      total: activeFilters.maxResults || 100,
      percent: 0,
    });
    try {
      const res = await getYouTubeResults({
        ...activeFilters,
        onProgress: (prog) => {
          setJobProgress(prog);
        },
      });
      console.log("Response", res);

      // Smooth completion: Slide to 100% before closing
      setJobProgress((prev) => ({
        ...prev,
        percent: 100,
        processed: prev.total,
      }));
      await new Promise((resolve) => setTimeout(resolve, 800));

      const videoList =
        res?.results || (Array.isArray(res?.data) ? res.data : []);
      const suggestions =
        res?.similarQueries ||
        res?.resultSummary?.similarQueries ||
        [];
      const countInDb =
        res?.unfilteredDbCount !== undefined
          ? res.unfilteredDbCount
          : res?.resultSummary?.unfilteredDbCount !== undefined
            ? res.resultSummary.unfilteredDbCount
            : 0;

      if (videoList.length > 0) {
        setVideos(videoList);
        setSimilarQueries([]);
        setAllSuggestions([]);
        setUnfilteredDbCount(0);

        // Directly redirect to YouTube Data page with priority IDs on top
        const processedIds = videoList
          .map((v) => v._id || v.videoId)
          .filter(Boolean)
          .join(",");

        const targetQueryForRedirect = effectiveOriginalQuery || currentQuery;

        const queryParams = new URLSearchParams();
        if (targetQueryForRedirect)
          queryParams.set("query", targetQueryForRedirect);
        if (
          activeFilters.regionCode &&
          activeFilters.regionCode !== "none" &&
          activeFilters.regionCode !== "all"
        )
          queryParams.set("regionCode", activeFilters.regionCode);
        if (activeFilters.sortBy)
          queryParams.set("sortBy", activeFilters.sortBy);
        if (activeFilters.dateRange && activeFilters.dateRange !== "none")
          queryParams.set("dateRange", activeFilters.dateRange);
        if (activeFilters.minViews && Number(activeFilters.minViews) > 0)
          queryParams.set("minViews", activeFilters.minViews);
        if (
          activeFilters.minSubscribers &&
          Number(activeFilters.minSubscribers) > 0
        )
          queryParams.set("minSubscribers", activeFilters.minSubscribers);
        if (processedIds) queryParams.set("priorityIds", processedIds);

        router.push(`/youtube-data?${queryParams.toString()}`);
        return;
      } else {
        // Zero videos found -> Stay on keyword search page and show suggestions
        setVideos([]);
        setAllSuggestions((prev) => {
          if (prev && prev.length > 0) return prev;
          return suggestions;
        });
        setSimilarQueries(suggestions);
        setUnfilteredDbCount(countInDb);
      }
    } catch (error) {
      console.error("Error fetching YouTube results:", error);
    }
    setLoading(false);
  };

  const handleViewUnfilteredData = () => {
    const targetQuery = originalQuery || filters.query;
    if (!targetQuery) return;
    router.push(`/youtube-data?query=${encodeURIComponent(targetQuery)}`);
  };

  const handleSuggestedQueryClick = (suggestedTerm) => {
    setFilters((prev) => ({ ...prev, query: suggestedTerm }));
    fetchVideos(suggestedTerm, true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "query") {
      setOriginalQuery("");
      setTriedQueries(new Set());
      setAllSuggestions([]);
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
                Keyword Search Filters
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
            <div className="col-lg-3">
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
                Region
              </label>
              <div className="app-input-group">
                <span className="app-input-addon">
                  <Globe size={16} />
                </span>
                <input
                  type="text"
                  name="regionCode"
                  value={filters.regionCode}
                  onChange={handleChange}
                  className="app-input"
                  placeholder="IN"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="col-lg-3">
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
                Min Views
              </label>
              <div className="app-input-group">
                <span className="app-input-addon">
                  <Eye size={16} />
                </span>
                <input
                  type="number"
                  name="minViews"
                  value={filters.minViews}
                  onChange={handleChange}
                  className="app-input"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="col-lg-2">
              <label className="app-search-label">
                Min Subscribers
              </label>
              <div className="app-input-group">
                <span className="app-input-addon">
                  <Users size={16} />
                </span>
                <select
                  name="minSubscribers"
                  value={filters.minSubscribers}
                  onChange={handleChange}
                  className="app-select"
                >
                  <option value="1000">1k</option>
                  <option value="10000">10k</option>
                  <option value="25000">25k</option>
                  <option value="50000">50k</option>
                  <option value="75000">75k</option>
                  <option value="100000">100k</option>
                  <option value="1000000">1M+</option>
                </select>
              </div>
            </div>

            <div className="col-lg-3">
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

            <div className="col-lg-3">
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
          </div>
        </div>

        {/* No Videos Found / Query Expansion Suggestions */}
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
                No videos found for &quot;{filters.query}&quot;
              </h5>
            </div>

            {(() => {
              const suggestionsPool =
                allSuggestions && allSuggestions.length > 0
                  ? allSuggestions
                  : similarQueries;

              const displayedSuggestions = (suggestionsPool || []).filter(
                (term) => {
                  const label =
                    typeof term === "object" && term !== null
                      ? term.query ||
                      term.variation ||
                      term.search_variation ||
                      term.search_query ||
                      term.title ||
                      term.keyword ||
                      Object.values(term).find(
                        (v) => typeof v === "string",
                      ) ||
                      ""
                      : String(term || "");

                  const cleanLabel = label.trim().toLowerCase();
                  if (!cleanLabel || cleanLabel === "[object object]")
                    return false;
                  if (triedQueries.has(cleanLabel)) return false;
                  return true;
                },
              );

              if (displayedSuggestions.length > 0) {
                return (
                  <div style={{ marginTop: "14px" }}>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        color: "var(--text-secondary, #94a3b8)",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Sparkles size={16} color="#3b82f6" />
                      <span>Suggested Search Keywords</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      {displayedSuggestions.map((term, index) => {
                        const label =
                          typeof term === "object" && term !== null
                            ? term.query ||
                            term.variation ||
                            term.search_variation ||
                            term.search_query ||
                            term.title ||
                            term.keyword ||
                            Object.values(term).find(
                              (v) => typeof v === "string",
                            ) ||
                            ""
                            : String(term || "");

                        if (
                          !label ||
                          label === "[object Object]" ||
                          label === "object Object"
                        ) {
                          return null;
                        }

                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestedQueryClick(label)}
                            style={{
                              background: "var(--card-bg, #ffffff)",
                              border: "1.5px solid var(--card-border, #cbd5e1)",
                              borderRadius: "24px",
                              padding: "8px 16px",
                              fontSize: "0.875rem",
                              fontWeight: "600",
                              color: "var(--text-primary, #1e293b)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#3b82f6";
                              e.currentTarget.style.color = "#3b82f6";
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                              e.currentTarget.style.boxShadow =
                                "0 6px 14px rgba(37,99,235,0.2)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor =
                                "var(--card-border, #cbd5e1)";
                              e.currentTarget.style.color =
                                "var(--text-primary, #1e293b)";
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 2px 6px rgba(0,0,0,0.04)";
                            }}
                          >
                            <Search size={14} color="#3b82f6" />
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <p
                  style={{
                    color: "var(--text-secondary, #94a3b8)",
                    fontSize: "0.9rem",
                    margin: "8px 0 0 0",
                  }}
                >
                  Try adjusting your search terms, region, or subscriber/view filters.
                </p>
              );
            })()}

            {/* Model/Card: Existing DB Data without these filters */}
            {unfilteredDbCount > 0 && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "16px 20px",
                  backgroundColor: "var(--card-bg, #ffffff)",
                  border: "1.5px solid rgba(37, 99, 235, 0.35)",
                  borderRadius: "14px",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flex: "1 1 300px",
                  }}
                >
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(37, 99, 235, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Database size={20} color="#3b82f6" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: "700",
                        color: "var(--text-primary, #1e293b)",
                        marginBottom: "2px",
                      }}
                    >
                      <span>
                        <strong>{unfilteredDbCount}</strong> video{unfilteredDbCount !== 1 ? "s" : ""} already present for &quot;{originalQuery || filters.query}&quot; in the database without these filters
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary, #94a3b8)",
                      }}
                    >
                      You can view and analyze the previously saved videos directly on the YouTube Data page.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleViewUnfilteredData}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 18px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1d4ed8";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(37, 99, 235, 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(37, 99, 235, 0.25)";
                  }}
                >
                  <span>View in YouTube Data</span>
                  <ExternalLink size={15} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeTableKeywordCampaign;
