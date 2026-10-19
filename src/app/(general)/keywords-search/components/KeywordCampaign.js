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
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { getYouTubeResults } from "@/services/youtube";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const REGION_OPTIONS = [
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "all", name: "Worldwide (All)", flag: "🌐" },
];

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

  const activeFilterCount = [
    filters.regionCode && filters.regionCode !== "IN",
    filters.sortBy && filters.sortBy !== "relevance",
    Boolean(filters.minViews && Number(filters.minViews) > 0),
    filters.minSubscribers && filters.minSubscribers !== "1000",
    filters.dateRange && filters.dateRange !== "none",
    filters.maxResults && filters.maxResults !== "100",
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setFilters((prev) => ({
      ...prev,
      regionCode: "IN",
      sortBy: "relevance",
      minViews: "",
      minSubscribers: "1000",
      dateRange: "none",
      maxResults: "100",
    }));
  };

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
        {/* Discovery Filter Card */}
        <div className="discovery-card">
          {/* Top Bar: Title + Segmented Control */}
          <div className="discovery-top-bar">
            <div className="discovery-badge-wrap">
              <div className="discovery-icon-badge">
                <Sparkles size={16} />
              </div>
              <span className="discovery-section-label">
                KEYWORD SEARCH FILTERS
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

          {/* Primary Hero Search Bar */}
          <div className="discovery-hero-row">
            <div className="discovery-search-wrapper">
              <span className="discovery-search-icon">
                <Search size={18} />
              </span>
              <input
                type="text"
                name="query"
                value={filters.query}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                className="discovery-search-input"
                placeholder="Search keywords, video topics, or creator tags (e.g. AI tools, tech reviews, travel vlog)..."
                autoComplete="off"
              />
            </div>

            <button
              className="discovery-search-btn"
              type="button"
              disabled={loading}
              onClick={handleSubmit}
            >
              <Search size={16} />
              <span>{loading ? "Searching..." : "Search"}</span>
            </button>
          </div>

          {/* Advanced Filter Toolbar Container */}
          <div className="discovery-filters-panel">
            {/* Filter Section Header */}
            <div className="discovery-filters-header">
              <div className="discovery-filters-title-wrap">
                <span className="discovery-filters-icon-badge">
                  <Filter size={13} />
                </span>
                <span className="discovery-filters-title">
                  Search &amp; Audience Filters
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
                  title="Reset all filters to default"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Compact Filters Grid */}
            <div className="discovery-filters-grid">
              {/* Region */}
              <div
                className={`discovery-filter-item ${
                  filters.regionCode !== "IN" ? "is-active" : ""
                }`}
              >
                <div className="discovery-filter-item-head">
                  <span className="discovery-filter-micro-icon region">
                    <Globe size={13} />
                  </span>
                  <label className="discovery-filter-label">Region</label>
                </div>
                <div className="discovery-input-wrap">
                  <select
                    name="regionCode"
                    value={filters.regionCode}
                    onChange={handleChange}
                    className="discovery-compact-select"
                  >
                    {REGION_OPTIONS.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.flag} {r.name}
                      </option>
                    ))}
                    {!REGION_OPTIONS.some((r) => r.code === filters.regionCode) &&
                      filters.regionCode && (
                        <option value={filters.regionCode}>
                          🌐 {filters.regionCode.toUpperCase()}
                        </option>
                      )}
                  </select>
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

              {/* Min Views */}
              <div
                className={`discovery-filter-item ${
                  Boolean(filters.minViews && Number(filters.minViews) > 0)
                    ? "is-active"
                    : ""
                }`}
              >
                <div className="discovery-filter-item-head">
                  <span className="discovery-filter-micro-icon views">
                    <Eye size={13} />
                  </span>
                  <label className="discovery-filter-label">Min Views</label>
                </div>
                <div className="discovery-input-wrap">
                  <input
                    type="number"
                    name="minViews"
                    value={filters.minViews}
                    onChange={handleChange}
                    className="discovery-compact-input"
                    placeholder="0 (Any views)"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              {/* Min Subscribers */}
              <div
                className={`discovery-filter-item ${
                  filters.minSubscribers !== "1000" ? "is-active" : ""
                }`}
              >
                <div className="discovery-filter-item-head">
                  <span className="discovery-filter-micro-icon subscribers">
                    <Users size={13} />
                  </span>
                  <label className="discovery-filter-label">Min Subscribers</label>
                </div>
                <div className="discovery-input-wrap">
                  <select
                    name="minSubscribers"
                    value={filters.minSubscribers}
                    onChange={handleChange}
                    className="discovery-compact-select"
                  >
                    <option value="1000">⭐ 1K+ (Emerging)</option>
                    <option value="10000">🌟 10K+ (Micro)</option>
                    <option value="25000">💫 25K+ (Growing)</option>
                    <option value="50000">🚀 50K+ (Established)</option>
                    <option value="75000">💎 75K+ (Mid-Tier)</option>
                    <option value="100000">🏆 100K+ (Macro)</option>
                    <option value="500000">✨ 500K+ (Mega)</option>
                    <option value="1000000">👑 1M+ (Celebrity)</option>
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
                  filters.maxResults !== "100" ? "is-active" : ""
                }`}
              >
                <div className="discovery-filter-item-head">
                  <span className="discovery-filter-micro-icon max">
                    <BookOpen size={13} />
                  </span>
                  <label className="discovery-filter-label">Max Results</label>
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
        </div>

        {/* No Videos Found / Query Expansion Suggestions */}
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
                No videos found for &quot;{filters.query}&quot;
              </h5>
            </div>

            {(() => {
              const apiPool =
                allSuggestions && allSuggestions.length > 0
                  ? allSuggestions
                  : similarQueries || [];

              // Extract labels
              const extractedLabels = (apiPool || [])
                .map((term) => {
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
                  return label.trim();
                })
                .filter((label) => {
                  const clean = label.toLowerCase();
                  return (
                    clean &&
                    clean !== "[object object]" &&
                    clean !== "object object" &&
                    !triedQueries.has(clean)
                  );
                });

              // Smart fallback queries based on current query
              const baseQ = (filters.query || "").trim();
              const fallbackVariations = baseQ
                ? [
                  `${baseQ} tutorial`,
                  `${baseQ} review`,
                  `${baseQ} guide`,
                  `${baseQ} tips`,
                  `${baseQ} highlights`,
                  `best ${baseQ}`,
                  `${baseQ} 2024`,
                  `${baseQ} analysis`,
                ]
                : [
                  "AI tools",
                  "Tech reviews",
                  "Gaming highlights",
                  "Podcasts",
                  "Digital Marketing",
                  "Coding tutorials",
                ];

              const combinedSuggestions = Array.from(
                new Set([...extractedLabels, ...fallbackVariations]),
              )
                .filter((term) => {
                  const clean = term.toLowerCase();
                  return (
                    clean !== baseQ.toLowerCase() && !triedQueries.has(clean)
                  );
                })
                .slice(0, 10);

              return (
                <div style={{ marginTop: "14px" }}>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      color: "var(--text-secondary, #64748b)",
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Sparkles size={15} color="#3b82f6" />
                    <span>Suggested Search Keywords</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    {combinedSuggestions.map((label, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestedQueryClick(label)}
                        className="discovery-suggestion-chip"
                      >
                        <Search size={13} color="#3b82f6" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Model/Card: Existing DB Data without these filters */}
            {unfilteredDbCount > 0 && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "14px 18px",
                  backgroundColor: "var(--card-bg, #ffffff)",
                  border: "1.5px solid rgba(37, 99, 235, 0.35)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
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
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(37, 99, 235, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Database size={18} color="#3b82f6" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "0.9rem",
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
                        fontSize: "0.775rem",
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
                    padding: "8px 16px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>View in YouTube Data</span>
                  <ExternalLink size={14} />
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
