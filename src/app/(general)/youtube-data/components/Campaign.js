"use client";
import React, { useState, useEffect, useRef } from "react";
import { Star } from "lucide-react";
import {
  Search,
  Eye,
  ThumbsUp,
  MessageCircle,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Globe,
  Download,
  TrendingUp,
  Video,
  ArrowUp,
  ArrowDown,
  Tag,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getcsvResults,
  getFiltersResults,
  getLatestQueryByUserId,
  getRecentTenQueries,
  getQueryResults,
} from "@/services/youtube";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { createCampaignData } from "@/services/campaignData";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import PageHeaderDate from "@/components/shared/pageHeader/PageHeaderDate";

const formatCompactNumber = (val) => {
  const num = Number(val);
  if (isNaN(num) || num === null || num === undefined) return "0";
  if (num >= 1000000) {
    const formatted = (num / 1000000).toFixed(2);
    return formatted.endsWith(".00")
      ? `${parseInt(formatted)}M`
      : `${formatted.replace(/0+$/, "").replace(/\.$/, "")}M`;
  }
  if (num >= 1000) {
    const formatted = (num / 1000).toFixed(1);
    return formatted.endsWith(".0")
      ? `${parseInt(formatted)}K`
      : `${formatted}K`;
  }
  return num.toLocaleString();
};

const formatPublishedDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const YouTubeTable = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);
  const [csvVideos, setCsvVideos] = useState([]);
  const [regions, setRegions] = useState([]);
  const [audienceId, setAudienceId] = useState(null);
  // Persistent cross-query basket: Map<_id, videoObject>
  const [selectedBasket, setSelectedBasket] = useState(new Map());
  const [showBasketPanel, setShowBasketPanel] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const [similarQueries, setSimilarQueries] = useState([]);
  const regionCode = [
    { code: "IN", name: "India" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
  ];
  const [isReady, setIsReady] = useState(false);
  const [filters, setFilters] = useState({
    channelName: "",
    query: "",
    regionCode: "all",
    minViews: "",
    minSubscribers: "",
    startDate: "",
    endDate: "",
    videoType: "all",
    sortBy: "engagement",
    page: currentPage,
    limit: 50,
    csvResults: "all",
    userId: "",
  });

  const handleSort = (field) => {
    setFilters((prev) => {
      let nextSortBy = field;

      if (field === "published") {
        // Toggle between recent and oldest
        nextSortBy = prev.sortBy === "recent" ? "oldest" : "recent";
      } else {
        // Toggle between field and engagement
        nextSortBy = prev.sortBy === field ? "engagement" : field;
      }

      return {
        ...prev,
        sortBy: nextSortBy,
        page: 1,
      };
    });
    setCurrentPage(1);
  };

  const getSortIcon = (field) => {
    let isActive = false;

    if (field === "published") {
      isActive = filters.sortBy === "recent" || filters.sortBy === "oldest";
      const isOldest = filters.sortBy === "oldest";

      return isOldest ? (
        <ArrowDown
          size={13}
          strokeWidth={2.4}
          style={{ color: "#2563EB", marginLeft: "4px", flexShrink: 0 }}
        />
      ) : (
        <ArrowUp
          size={13}
          strokeWidth={2.4}
          style={{
            color: isActive ? "#2563EB" : "#94A3B8",
            marginLeft: "4px",
            opacity: isActive ? 1 : 0.4,
            flexShrink: 0,
          }}
        />
      );
    } else {
      isActive = filters.sortBy === field;
      return (
        <ArrowUp
          size={13}
          strokeWidth={2.4}
          style={{
            color: isActive ? "#2563EB" : "#94A3B8",
            marginLeft: "4px",
            opacity: isActive ? 1 : 0.4,
            flexShrink: 0,
            transition: "all 0.2s ease",
          }}
        />
      );
    }
  };

  // Dummy data for analytics - Replace with your actual data
  const [analytics, setAnalytics] = useState({});
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [idToVideoIdMap, setIdToVideoIdMap] = useState({});
  const { data: session, status } = useSession();
  const [recentQueries, setRecentQueries] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Local text state for debounced inputs
  const [channelNameInput, setChannelNameInput] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {
    setAudienceId(searchParams.get("audienceId"));
  }, [searchParams]);

  const startIndex = (currentPage - 1) * filters.limit;
  const endIndex = startIndex + videos.length;

  const fetchVideos = async () => {
    // Safety check: don't fetch if we don't have a user context yet
    if (!filters.userId && !isReady) return;

    setLoading(true);
    try {
      const priorityParam =
        filters.priorityIds ||
        searchParams.get("priorityIds") ||
        searchParams.get("processedIds") ||
        "";
      const payload = {
        ...filters,
        priorityIds: priorityParam || undefined,
      };

      const res = await getQueryResults(payload);
      if (res) {
        let videoList = res.results || [];

        // Ensure priority videos (processed by the latest query) appear on TOP, followed by remaining DB videos
        if (priorityParam) {
          const prioritySet = new Set(
            priorityParam
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          );
          if (prioritySet.size > 0) {
            const topList = [];
            const bottomList = [];
            videoList.forEach((v) => {
              if (
                (v._id && prioritySet.has(String(v._id))) ||
                (v.videoId && prioritySet.has(String(v.videoId)))
              ) {
                topList.push(v);
              } else {
                bottomList.push(v);
              }
            });
            videoList = [...topList, ...bottomList];
          }
        }

        setVideos(videoList);
        setCount(res.pagination?.totalCount || 0);
        setTotalPages(res.pagination?.totalPages || 0);
        setAnalytics(res.totals || {});
        setSimilarQueries(res.similarQueries || []);

        // Update ID to videoId map
        setIdToVideoIdMap((prev) => {
          const newMap = { ...prev };
          videoList.forEach((v) => {
            if (v._id && v.videoId) {
              newMap[v._id] = v.videoId;
            }
          });
          return newMap;
        });

        // Pre-check any videos on this page that are already in the basket
        setSelectedVideos((prevSelected) => {
          const newSet = new Set(prevSelected);
          // Only keep IDs that belong to the current page's results
          const pageIds = new Set(res.results.map((v) => v._id).filter(Boolean));
          // Remove stale IDs (not on this page)
          for (const id of newSet) {
            if (!pageIds.has(id)) newSet.delete(id);
          }
          // Re-add basket IDs that appear on this page
          setSelectedBasket((basket) => {
            for (const id of basket.keys()) {
              if (pageIds.has(id)) newSet.add(id);
            }
            return basket; // basket itself unchanged here
          });
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error fetching YouTube results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQueryClick = (suggestedTerm) => {
    setQueryInput(suggestedTerm);
    setFilters((prev) => ({
      ...prev,
      query: suggestedTerm,
      page: 1,
    }));
    setCurrentPage(1);
  };

  const fetchRegions = async () => {
    try {
      const res = await getFiltersResults();
      console.log("Regions response:", res.regions);
      setRegions(res.regions);
    } catch (error) {
      console.error("Error fetching YouTube results:", error);
    }
  };

  const AddToCampaign = async () => {
    const basketIds = Array.from(selectedBasket.keys());
    console.log("Audience ID:", audienceId);
    console.log("Basket video IDs:", basketIds);
    if (basketIds.length === 0) return;
    const res = await createCampaignData(audienceId, basketIds);
    if (res.message) {
      setSelectedBasket(new Map());
      setSelectedVideos(new Set());
      router.push("/audience");
    }
  };
  const fetchCsvResults = async () => {
    try {
      const selectedIds = Array.from(selectedVideos)
        .map((id) => idToVideoIdMap[id])
        .filter(Boolean)
        .join(",");

      const payload = {
        ...filters,
        selectedIds: selectedIds || undefined,
      };

      const res = await getcsvResults(payload);
      setCsvVideos(res.results);
    } catch (error) {
      console.error("Error fetching YouTube results:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Text inputs: show loader immediately, debounce the actual filter update
    if (name === "channelName" || name === "query") {
      if (name === "channelName") setChannelNameInput(value);
      if (name === "query") setQueryInput(value);

      setLoading(true); // show loader right away

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setCurrentPage(1);
        setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
      }, 600);
    } else {
      // Dropdowns: update immediately
      setCurrentPage(1);
      setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.id) {
      console.warn("YouTube Data: No session user ID available.", {
        session,
        status,
      });
      return;
    }

    const init = async () => {
      try {
        const uid = session.user.id;
        console.log("YouTube Data: Initializing queries for UserID:", uid);

        const [latestRes, listRes] = await Promise.all([
          getLatestQueryByUserId(uid).catch((err) => {
            console.error(
              "YouTube Data: Latest query API failed:",
              err.message,
            );
            return null;
          }),
          getRecentTenQueries(uid).catch((err) => {
            console.error("YouTube Data: Ten list API failed:", err.message);
            return [];
          }),
        ]);

        console.log(
          "YouTube Data: API Raw Response - Latest:",
          latestRes,
          "List:",
          listRes,
        );

        const paramChannelName = searchParams.get("channelName");
        const paramQuery = searchParams.get("query");
        const paramRegionCode = searchParams.get("regionCode");
        const paramSortBy = searchParams.get("sortBy");
        const paramMinViews = searchParams.get("minViews");
        const paramMinSubscribers = searchParams.get("minSubscribers");
        const paramDateRange = searchParams.get("dateRange");
        const paramPriorityIds =
          searchParams.get("priorityIds") || searchParams.get("processedIds");

        let finalQuery = "";
        let finalChannelName = "";

        if (paramChannelName !== null || paramQuery !== null) {
          finalChannelName = paramChannelName || "";
          finalQuery = paramQuery || "";
          setChannelNameInput(finalChannelName);
          setQueryInput(finalQuery);
        } else {
          if (latestRes) {
            finalQuery =
              typeof latestRes === "string"
                ? latestRes
                : latestRes.query || latestRes.text || "";
            setQueryInput(finalQuery);
          }
        }

        // Set filters once with all initial data
        setFilters((prev) => ({
          ...prev,
          query: finalQuery,
          channelName: finalChannelName,
          regionCode: paramRegionCode || prev.regionCode,
          sortBy: paramSortBy || prev.sortBy,
          minViews: paramMinViews || prev.minViews,
          minSubscribers: paramMinSubscribers || prev.minSubscribers,
          dateRange: paramDateRange || prev.dateRange,
          priorityIds: paramPriorityIds || prev.priorityIds,
          userId: uid,
        }));

        if (listRes && Array.isArray(listRes)) {
          setRecentQueries(listRes);
        } else {
          setRecentQueries([]);
        }

        // Mark as ready to trigger first fetch
        setIsReady(true);
      } catch (err) {
        console.error("YouTube Data: Critical error in init workflow:", err);
        setIsReady(true); // Still set ready to allow manual searches
      }
    };
    init();
  }, [session, status, searchParams]);

  // Main fetch hook - fires whenever filters change, but only after init is done
  useEffect(() => {
    if (isReady && filters.userId) {
      fetchVideos();
      fetchRegions();
      setSelectedVideos(new Set());
    }
  }, [
    isReady,
    filters.query,
    filters.channelName,
    filters.regionCode,
    filters.videoType,
    filters.sortBy,
    filters.page,
    filters.limit,
    filters.userId,
    filters.csvResults,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCsvResults();
    }, 800);
    return () => clearTimeout(timer);
  }, [filters, selectedVideos]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setFilters((prev) => ({ ...prev, page }));
  };

  const downloadCSV = async () => {
    const headers = [
      "Video Title",
      "Channel Name",
      "Views",
      "Likes",
      "Comments",
      "Subscribers",
      "Published Date",
      "Video Link",
      "Rating",
    ];

    const rows = csvVideos.map((v) => [
      `"${v.title.replace(/"/g, '""')}"`,
      `"${v.channelName.replace(/"/g, '""')}"`,
      v.views,
      v.likes,
      v.comments,
      v.subscribers,
      new Date(v.publishedDate).toLocaleDateString(),
      v.regionCode,
      v.link,
      v.erBySubscribers,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `youtube_results_${new Date().toISOString().split("T")[0]
      }.csv`;
    link.click();
  };

  const downloadExcel = () => {
    const table = `
      <table>
        <thead>
          <tr>
            <th>Video Title</th>
            <th>Channel Name</th>
            <th>Views</th>
            <th>Likes</th>
            <th>Comments</th>
            <th>Subscribers</th>
            <th>Published Date</th>
            <th>Video Link</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          ${csvVideos
        .map(
          (v) => `
            <tr>
              <td>${v.title}</td>
              <td>${v.channelName}</td>
              <td>${v.views}</td>
              <td>${v.likes}</td>
              <td>${v.comments}</td>
              <td>${v.subscribers}</td>
              <td>${new Date(v.publishedDate).toLocaleDateString()}</td>
              <td>${v.link}</td>
              <td>${v.erBySubscribers}</td>
            </tr>
          `,
        )
        .join("")}
        </tbody>
      </table>
    `;

    const blob = new Blob([table], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `youtube_results_${new Date().toISOString().split("T")[0]
      }.xls`;
    link.click();
  };

  const handleVideoSelect = (id) => {
    if (!id) return;
    const video = videos.find((v) => v._id === id);
    setSelectedVideos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        // Remove from persistent basket
        setSelectedBasket((basket) => {
          const newBasket = new Map(basket);
          newBasket.delete(id);
          return newBasket;
        });
      } else {
        newSet.add(id);
        // Add full video object to persistent basket
        if (video) {
          setSelectedBasket((basket) => {
            const newBasket = new Map(basket);
            newBasket.set(id, video);
            return newBasket;
          });
        }
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (!videos || videos.length === 0) return;

    const allIdsOnPage = videos.map((v) => v._id).filter(Boolean);
    if (allIdsOnPage.length === 0) return;

    const areAllSelected = allIdsOnPage.every((id) => selectedVideos.has(id));

    setSelectedVideos((prev) => {
      const newSet = new Set(prev);
      setSelectedBasket((basket) => {
        const newBasket = new Map(basket);
        if (areAllSelected) {
          allIdsOnPage.forEach((id) => {
            newSet.delete(id);
            newBasket.delete(id);
          });
        } else {
          allIdsOnPage.forEach((id) => {
            newSet.add(id);
            const video = videos.find((v) => v._id === id);
            if (video) newBasket.set(id, video);
          });
        }
        return newBasket;
      });
      return newSet;
    });
  };

  const handleRemoveFromBasket = (id) => {
    setSelectedBasket((basket) => {
      const newBasket = new Map(basket);
      newBasket.delete(id);
      return newBasket;
    });
    setSelectedVideos((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleClearBasket = () => {
    setSelectedBasket(new Map());
    setSelectedVideos(new Set());
  };

  return (
    <div>
      <div>
        {/* Filters Card */}
        <div className="yt-search-card">
          <div className="yt-top-bar">
            <div className="yt-badge-wrap">
              <div className="yt-icon-badge">
                <Sparkles size={16} />
              </div>
              <span className="yt-section-label">
                Search &amp; Filter Data
              </span>
            </div>
          </div>

          <div className="yt-filters-panel">
            <div className="yt-filters-grid">
              {/* Channel Name */}
              <div className="yt-filter-item">
                <div className="yt-filter-item-head">
                  <span className="yt-filter-micro-icon channel">
                    <Globe size={13} />
                  </span>
                  <label className="yt-filter-label">Channel Name</label>
                </div>
                <div className="yt-input-wrap">
                  <input
                    type="text"
                    name="channelName"
                    value={channelNameInput}
                    onChange={handleChange}
                    className="yt-compact-input"
                    placeholder="Search channel..."
                  />
                </div>
              </div>

              {/* Search Query */}
              <div className="yt-filter-item">
                <div className="yt-filter-item-head">
                  <span className="yt-filter-micro-icon query">
                    <Search size={13} />
                  </span>
                  <label className="yt-filter-label">Search Query</label>
                </div>
                <div className="yt-input-wrap" ref={historyRef}>
                  <input
                    type="text"
                    name="query"
                    value={queryInput}
                    autoComplete="off"
                    onFocus={() =>
                      recentQueries.length > 0 && setShowHistory(true)
                    }
                    onChange={handleChange}
                    className="yt-compact-input"
                    placeholder="Search query..."
                  />
                  {showHistory && recentQueries.length > 0 && (
                    <div className="yt-history-dropdown">
                      {recentQueries.map((q, idx) => (
                        <div
                          key={idx}
                          className="yt-history-item"
                          onClick={() => {
                            setFilters((prev) => ({
                              ...prev,
                              query: q,
                              page: 1,
                            }));
                            setQueryInput(q);
                            setShowHistory(false);
                          }}
                        >
                          <i
                            className="fa-solid fa-clock-rotate-left me-2 text-muted"
                            style={{ fontSize: "0.75rem" }}
                          ></i>
                          {q}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Video Type */}
              <div className="yt-filter-item">
                <div className="yt-filter-item-head">
                  <span className="yt-filter-micro-icon type">
                    <Video size={13} />
                  </span>
                  <label className="yt-filter-label">Video Type</label>
                </div>
                <div className="yt-input-wrap">
                  <select
                    name="videoType"
                    value={filters.videoType}
                    onChange={handleChange}
                    className="yt-compact-select"
                  >
                    <option value="all">All</option>
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                </div>
              </div>

              {/* Sort By */}
              <div className="yt-filter-item">
                <div className="yt-filter-item-head">
                  <span className="yt-filter-micro-icon sort">
                    <TrendingUp size={13} />
                  </span>
                  <label className="yt-filter-label">Sort By</label>
                </div>
                <div className="yt-input-wrap">
                  <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleChange}
                    className="yt-compact-select"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="recent">Recent</option>
                    <option value="oldest">Oldest</option>
                    <option value="views">Views</option>
                    <option value="likes">Likes</option>
                    <option value="comments">Comments</option>
                    <option value="subscribers">Subscribers</option>
                    <option value="engagement">Engagement</option>
                    <option value="erscore">Top Rated</option>
                  </select>
                </div>
              </div>

              {/* Region */}
              <div className="yt-filter-item">
                <div className="yt-filter-item-head">
                  <span className="yt-filter-micro-icon region">
                    <Globe size={13} />
                  </span>
                  <label className="yt-filter-label">Region</label>
                </div>
                <div className="yt-input-wrap">
                  <select
                    name="regionCode"
                    value={filters.regionCode}
                    onChange={handleChange}
                    className="yt-compact-select"
                  >
                    <option value="all">All</option>
                    {regions.map((code, idx) => (
                      <option key={idx} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Keywords */}
              <div className="yt-filter-item">
                <div className="yt-filter-item-head">
                  <span className="yt-filter-micro-icon keywords">
                    <Tag size={13} />
                  </span>
                  <label className="yt-filter-label">Filter Keywords</label>
                </div>
                <div className="yt-chips-container">
                  {/* "All" Chip */}
                  <button
                    type="button"
                    className={`yt-chip-btn ${filters.csvResults === "all" || !filters.csvResults ? "active" : ""}`}
                    onClick={() =>
                      handleChange({
                        target: { name: "csvResults", value: "all" },
                      })
                    }
                  >
                    All
                  </button>

                  {/* Keyword Chips */}
                  {filters.query
                    ?.split(",")
                    .map((q) => q.trim())
                    .filter(Boolean)
                    .map((q, idx) => {
                      const isActive = filters.csvResults === q.toLowerCase();
                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`yt-chip-btn ${isActive ? "active" : ""}`}
                          onClick={() =>
                            handleChange({
                              target: {
                                name: "csvResults",
                                value: q.toLowerCase(),
                              },
                            })
                          }
                        >
                          {q}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* Result Actions Bar */}
          <div className="yt-actions-toolbar">
            <div className="yt-count-pill">
              <span className="yt-count-icon-badge">
                <Users size={13} />
              </span>
              {count > 0 ? (
                <span className="yt-count-text">
                  Showing{" "}
                  <strong className="yt-count-num">
                    {Math.min((currentPage - 1) * filters.limit + 1, count)}-
                    {Math.min(currentPage * filters.limit, count)}
                  </strong>{" "}
                  of{" "}
                  <strong className="yt-count-num">{count.toLocaleString()}</strong>{" "}
                  videos
                </span>
              ) : (
                <span className="yt-count-text">No videos to display</span>
              )}
            </div>

            <div className="yt-export-btn-group">
              <button
                type="button"
                className="yt-export-btn csv"
                onClick={downloadCSV}
                title="Download CSV"
              >
                <Download size={13} strokeWidth={2.4} />
                <span>CSV</span>
              </button>

              <button
                type="button"
                className="yt-export-btn excel"
                onClick={downloadExcel}
                title="Download Excel"
              >
                <Download size={13} strokeWidth={2.4} />
                <span>EXCEL</span>
              </button>

              {audienceId && (
                <>
                  {/* Basket counter badge */}
                  <div style={{ position: "relative", display: "inline-flex" }}>
                    <button
                      className="btn btn-sm"
                      onClick={() => setShowBasketPanel((v) => !v)}
                      title={`${selectedBasket.size} video${selectedBasket.size !== 1 ? "s" : ""} selected across all queries`}
                      style={{
                        backgroundColor: selectedBasket.size > 0 ? "#0d6efd" : "#e9ecef",
                        color: selectedBasket.size > 0 ? "#ffffff" : "#6c757d",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 14px",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                        boxShadow: selectedBasket.size > 0 ? "0 2px 4px rgba(13,110,253,0.25)" : "none",
                      }}
                    >
                      🗂
                      <span
                        style={{
                          backgroundColor: selectedBasket.size > 0 ? "#ffffff" : "#adb5bd",
                          color: selectedBasket.size > 0 ? "#0d6efd" : "#ffffff",
                          borderRadius: "12px",
                          padding: "1px 7px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          minWidth: "22px",
                          textAlign: "center",
                        }}
                      >
                        {selectedBasket.size}
                      </span>
                      Basket
                    </button>

                    {/* Basket slide-out panel */}
                    {showBasketPanel && (
                      <div
                        style={{
                          position: "fixed",
                          top: 0,
                          right: 0,
                          width: "360px",
                          height: "100vh",
                          backgroundColor: "#ffffff",
                          boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
                          zIndex: 9999,
                          display: "flex",
                          flexDirection: "column",
                          animation: "slideIn 0.25s ease-out",
                        }}
                      >
                        {/* Panel Header */}
                        <div
                          style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid #e9ecef",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            backgroundColor: "#f8f9fa",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "#1a1a1a" }}>
                              🗂 Video Basket
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#6c757d", marginTop: "2px" }}>
                              {selectedBasket.size} video{selectedBasket.size !== 1 ? "s" : ""} selected across all queries
                            </div>
                          </div>
                          <button
                            onClick={() => setShowBasketPanel(false)}
                            style={{
                              background: "none",
                              border: "none",
                              fontSize: "1.2rem",
                              cursor: "pointer",
                              color: "#6c757d",
                              lineHeight: 1,
                              padding: "4px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            ✕
                          </button>
                        </div>

                        {/* Panel Body */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
                          {selectedBasket.size === 0 ? (
                            <div
                              style={{
                                textAlign: "center",
                                color: "#adb5bd",
                                marginTop: "60px",
                                fontSize: "0.85rem",
                              }}
                            >
                              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🗂</div>
                              No videos in basket yet.<br />
                              Select videos from any query to add them here.
                            </div>
                          ) : (
                            Array.from(selectedBasket.values()).map((v) => (
                              <div
                                key={v._id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "10px 0",
                                  borderBottom: "1px solid #f1f3f5",
                                }}
                              >
                                {v.thumbnail ? (
                                  <img
                                    src={v.thumbnail}
                                    alt=""
                                    style={{
                                      width: "64px",
                                      height: "44px",
                                      objectFit: "cover",
                                      borderRadius: "4px",
                                      flexShrink: 0,
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "64px",
                                      height: "44px",
                                      backgroundColor: "#e9ecef",
                                      borderRadius: "4px",
                                      flexShrink: 0,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "1.2rem",
                                    }}
                                  >
                                    🎬
                                  </div>
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div
                                    style={{
                                      fontSize: "0.78rem",
                                      fontWeight: "600",
                                      color: "#212529",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                    title={v.title}
                                  >
                                    {v.title}
                                  </div>
                                  <div style={{ fontSize: "0.72rem", color: "#6c757d", marginTop: "2px" }}>
                                    {v.channelName || ""}  {v.csvResults ? `• ${v.csvResults}` : ""}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveFromBasket(v._id)}
                                  title="Remove from basket"
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#dc3545",
                                    fontSize: "1rem",
                                    padding: "4px",
                                    borderRadius: "4px",
                                    flexShrink: 0,
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Panel Footer */}
                        <div
                          style={{
                            padding: "14px 16px",
                            borderTop: "1px solid #e9ecef",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <button
                            onClick={AddToCampaign}
                            disabled={selectedBasket.size === 0}
                            style={{
                              backgroundColor: selectedBasket.size > 0 ? "#198754" : "#adb5bd",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "8px",
                              padding: "10px 16px",
                              fontSize: "0.85rem",
                              fontWeight: "700",
                              cursor: selectedBasket.size > 0 ? "pointer" : "not-allowed",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "8px",
                              transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => { if (selectedBasket.size > 0) e.currentTarget.style.backgroundColor = "#157347"; }}
                            onMouseLeave={(e) => { if (selectedBasket.size > 0) e.currentTarget.style.backgroundColor = "#198754"; }}
                          >
                            <Star size={15} />
                            Add {selectedBasket.size} Video{selectedBasket.size !== 1 ? "s" : ""} To Campaign
                          </button>
                          <button
                            onClick={handleClearBasket}
                            disabled={selectedBasket.size === 0}
                            style={{
                              backgroundColor: "transparent",
                              color: selectedBasket.size > 0 ? "#dc3545" : "#adb5bd",
                              border: `1px solid ${selectedBasket.size > 0 ? "#dc3545" : "#dee2e6"}`,
                              borderRadius: "8px",
                              padding: "8px 16px",
                              fontSize: "0.82rem",
                              fontWeight: "600",
                              cursor: selectedBasket.size > 0 ? "pointer" : "not-allowed",
                              transition: "all 0.2s",
                            }}
                          >
                            Clear Basket
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Backdrop */}
                    {showBasketPanel && (
                      <div
                        onClick={() => setShowBasketPanel(false)}
                        style={{
                          position: "fixed",
                          inset: 0,
                          backgroundColor: "rgba(0,0,0,0.3)",
                          zIndex: 9998,
                        }}
                      />
                    )}
                  </div>

                  {/* Main Add To Campaign button */}
                  <button
                    className="btn btn-sm"
                    onClick={AddToCampaign}
                    disabled={selectedBasket.size === 0}
                    style={{
                      background:
                        selectedBasket.size > 0
                          ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                          : "#adb5bd",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "8px 18px",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow:
                        selectedBasket.size > 0
                          ? "0 4px 12px rgba(16, 185, 129, 0.35)"
                          : "none",
                      cursor:
                        selectedBasket.size > 0 ? "pointer" : "not-allowed",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedBasket.size > 0) {
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedBasket.size > 0) {
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    <Star size={14} style={{ marginRight: "6px" }} />
                    Add To Campaign
                    {selectedBasket.size > 0 && (
                      <span
                        style={{
                          marginLeft: "6px",
                          backgroundColor: "rgba(255,255,255,0.25)",
                          borderRadius: "10px",
                          padding: "1px 6px",
                          fontSize: "0.72rem",
                          fontWeight: "700",
                        }}
                      >
                        {selectedBasket.size}
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div
          style={{
            marginBottom: "0px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        ></div>

        {/* Table Section */}
        <div className="yt-table-card">
          <div className="yt-table-responsive">
            <table className="yt-data-table">
              <thead className="yt-table-head">
                <tr>
                  <th
                    className="yt-th"
                    style={{
                      width: "3.5%",
                      textAlign: "center",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="yt-checkbox"
                      checked={
                        videos.length > 0 &&
                        videos
                          .map((v) => v._id)
                          .filter(Boolean)
                          .every((id) => selectedVideos.has(id))
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th
                    className="yt-th"
                    style={{
                      width: "25.5%",
                    }}
                  >
                    Video
                  </th>
                  <th
                    className="yt-th"
                    style={{
                      width: "14%",
                    }}
                  >
                    Channel
                  </th>
                  <th
                    className="yt-th"
                    style={{
                      width: "10.5%",
                    }}
                  >
                    Keyword
                  </th>
                  <th
                    onClick={() => handleSort("views")}
                    className="yt-th sortable"
                    style={{
                      width: "9%",
                    }}
                  >
                    <div className="yt-th-inner">
                      Views {getSortIcon("views")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("likes")}
                    className="yt-th sortable"
                    style={{
                      width: "8%",
                    }}
                  >
                    <div className="yt-th-inner">
                      Likes {getSortIcon("likes")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("comments")}
                    className="yt-th sortable"
                    style={{
                      width: "8%",
                    }}
                  >
                    <div className="yt-th-inner">
                      Comments {getSortIcon("comments")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("subscribers")}
                    className="yt-th sortable"
                    style={{
                      width: "9%",
                    }}
                  >
                    <div className="yt-th-inner">
                      Subscribers {getSortIcon("subscribers")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("published")}
                    className="yt-th sortable"
                    style={{
                      width: "8%",
                    }}
                  >
                    <div className="yt-th-inner">
                      Published {getSortIcon("published")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("erscore")}
                    className="yt-th sortable"
                    style={{
                      width: "8%",
                      textAlign: "center",
                    }}
                  >
                    <div className="yt-th-inner" style={{ justifyContent: "center" }}>
                      ER RATE {getSortIcon("erscore")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Skeleton Loader Rows */}
                {loading &&
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr
                      key={`skeleton-${i}`}
                      className="yt-table-row"
                    >
                      {[
                        "3.5%",
                        "25.5%",
                        "14%",
                        "10.5%",
                        "9%",
                        "8%",
                        "8%",
                        "9%",
                        "8%",
                        "8%",
                      ].map((w, j) => (
                        <td key={j} className="yt-td" style={{ width: w, textAlign: j === 0 || j === 9 ? "center" : "left" }}>
                          <div
                            style={{
                              height: j === 1 ? "40px" : "14px",
                              borderRadius: "6px",
                              background:
                                "linear-gradient(90deg, var(--skeleton-base, #f1f5f9) 25%, var(--skeleton-highlight, #e2e8f0) 50%, var(--skeleton-base, #f1f5f9) 75%)",
                              backgroundSize: "200% 100%",
                              animation: "shimmer 1.4s infinite",
                              width: j === 0 ? "18px" : j === 1 ? "85%" : "70%",
                              margin: j === 0 || j === 9 ? "0 auto" : "0",
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}

                {/* Empty State */}
                {videos.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan="10"
                      style={{
                        textAlign: "center",
                        padding: "50px 20px",
                        borderBottom: "none",
                      }}
                    >
                      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <AlertCircle
                          size={44}
                          style={{ color: "#ef4444", marginBottom: "14px" }}
                        />
                        <h5
                          style={{
                            color: "var(--text-primary, #1e293b)",
                            fontWeight: "700",
                            marginBottom: "6px",
                            fontSize: "1.15rem",
                          }}
                        >
                          No videos found {filters.query ? `for "${filters.query}"` : ""}
                        </h5>

                        {similarQueries && similarQueries.length > 0 ? (
                          <div style={{ marginTop: "18px" }}>
                            <p
                              style={{
                                color: "#64748b",
                                marginBottom: "12px",
                                fontSize: "0.95rem",
                                fontWeight: "600",
                              }}
                            >
                              Did you mean?
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              {similarQueries.map((term, index) => {
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
                                    onClick={() =>
                                      handleSuggestedQueryClick(label)
                                    }
                                    style={{
                                      background: "#f8fafc",
                                      border: "1.5px solid #cbd5e1",
                                      borderRadius: "20px",
                                      padding: "6px 14px",
                                      fontSize: "0.85rem",
                                      fontWeight: "600",
                                      color: "#1e293b",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "6px",
                                      transition: "all 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.borderColor =
                                        "#3b82f6";
                                      e.currentTarget.style.color = "#2563eb";
                                      e.currentTarget.style.backgroundColor =
                                        "#eff6ff";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.borderColor =
                                        "#cbd5e1";
                                      e.currentTarget.style.color = "#1e293b";
                                      e.currentTarget.style.backgroundColor =
                                        "#f8fafc";
                                    }}
                                  >
                                    <Search size={13} color="#3b82f6" />
                                    <span>{label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <p
                            style={{
                              color: "#94a3b8",
                              marginBottom: "0",
                              fontSize: "0.9rem",
                              marginTop: "8px",
                            }}
                          >
                            {filters.query
                              ? "Try adjusting your search terms or filter parameters"
                              : "Enter a search query to find videos"}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {!loading &&
                  videos.map((v, idx) => (
                    <tr
                      key={v.videoId || v._id || idx}
                      onClick={() => handleVideoSelect(v._id)}
                      className={`yt-table-row ${selectedVideos.has(v._id) ? "selected" : ""}`}
                      style={{ cursor: "pointer" }}
                    >
                      {/* Checkbox cell */}
                      <td className="yt-td" style={{ textAlign: "center" }}>
                        <input
                          type="checkbox"
                          className="yt-checkbox"
                          checked={selectedVideos.has(v._id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleVideoSelect(v._id)}
                        />
                      </td>

                      {/* Video cell */}
                      <td className="yt-td">
                        <div className="yt-video-cell">
                          <img
                            src={v.thumbnail}
                            alt={v.title}
                            className="yt-video-thumb"
                          />
                          <div className="yt-video-info">
                            <div
                              className="yt-video-title"
                              title={v.title}
                            >
                              {v.title}
                            </div>
                            <a
                              href={v.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="yt-video-link"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Watch Video →
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Channel cell */}
                      <td className="yt-td">
                        <div className="yt-channel-cell">
                          <div className="yt-channel-avatar">
                            {v.logo ? (
                              <img
                                src={v.logo}
                                alt={v.channelName}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.parentNode.innerHTML = `<span>${(v.channelName || "C").charAt(0).toUpperCase()}</span>`;
                                }}
                              />
                            ) : (
                              <span>{(v.channelName || "C").charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <span
                            className="yt-channel-name"
                            title={v.channelName}
                          >
                            {v.channelName}
                          </span>
                        </div>
                      </td>

                      {/* Keyword cell */}
                      <td className="yt-td">
                        <span
                          className="yt-keyword-badge"
                          title={v.query}
                        >
                          {v.query}
                        </span>
                      </td>

                      {/* Views cell */}
                      <td className="yt-td">
                        <div className="yt-metric-cell">
                          <Eye
                            size={16}
                            className="yt-metric-icon"
                          />
                          <span
                            className="yt-metric-val"
                            title={`${Number(v.views || 0).toLocaleString()} views`}
                          >
                            {formatCompactNumber(v.views)}
                          </span>
                        </div>
                      </td>

                      {/* Likes cell */}
                      <td className="yt-td">
                        <div className="yt-metric-cell">
                          <ThumbsUp
                            size={16}
                            className="yt-metric-icon"
                          />
                          <span
                            className="yt-metric-val"
                            title={`${Number(v.likes || 0).toLocaleString()} likes`}
                          >
                            {formatCompactNumber(v.likes)}
                          </span>
                        </div>
                      </td>

                      {/* Comments cell */}
                      <td className="yt-td">
                        <div className="yt-metric-cell">
                          <MessageCircle
                            size={16}
                            className="yt-metric-icon"
                          />
                          <span
                            className="yt-metric-val"
                            title={`${Number(v.comments || 0).toLocaleString()} comments`}
                          >
                            {formatCompactNumber(v.comments)}
                          </span>
                        </div>
                      </td>

                      {/* Subscribers cell */}
                      <td className="yt-td">
                        <div className="yt-metric-cell">
                          <Users
                            size={16}
                            className="yt-metric-icon"
                          />
                          <span
                            className="yt-metric-val"
                            title={`${Number(v.subscribers || 0).toLocaleString()} subscribers`}
                          >
                            {formatCompactNumber(v.subscribers)}
                          </span>
                        </div>
                      </td>

                      {/* Published Date cell */}
                      <td className="yt-td">
                        <span
                          className="yt-published-date"
                          title={v.publishedDate ? new Date(v.publishedDate).toLocaleDateString() : ""}
                        >
                          {formatPublishedDate(v.publishedDate)}
                        </span>
                      </td>

                      {/* ER Rate cell */}
                      <td className="yt-td" style={{ textAlign: "center" }}>
                        <div className="yt-stars-wrap">
                          {[1, 2, 3, 4, 5].map((i) => {
                            const rating = Number(v.erBySubscribers) || 0;
                            const isFilled = rating >= i;

                            const starColor = isFilled
                              ? rating === 1
                                ? "#ff6b6b"
                                : rating === 2
                                  ? "#fd7e14"
                                  : rating === 3
                                    ? "#a1e57b"
                                    : rating === 4
                                      ? "#28a745"
                                      : "#006400"
                              : "#dee2e6";

                            return (
                              <Star
                                key={i}
                                size={15}
                                strokeWidth={1.5}
                                color={starColor}
                                fill={starColor}
                                style={{ flexShrink: 0 }}
                              />
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Pagination */}
            {videos.length > 0 && (
              <div
                className="app-table-footer"
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "24px",
                  borderTop: "1px solid var(--card-border)",
                  backgroundColor: "var(--card-bg)",
                }}
              >
                {/* Rows per page & Count */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <label
                    htmlFor="limit"
                    style={{
                      marginBottom: "0",
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      fontWeight: "600",
                    }}
                  >
                    Rows per page:
                  </label>
                  <select
                    id="limit"
                    value={filters.limit}
                    onChange={(e) => {
                      const newLimit = Number(e.target.value);
                      handlePageChange(1);
                      setFilters((prev) => ({
                        ...prev,
                        limit: newLimit,
                        page: 1,
                      }));
                    }}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "8px",
                      border: "1px solid var(--input-border)",
                      backgroundColor: "var(--card-bg)",
                      color: "var(--text-primary)",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option
                      value={50}
                      style={{
                        backgroundColor: "var(--card-bg)",
                        color: "var(--text-primary)",
                      }}
                    >
                      50
                    </option>
                    <option
                      value={100}
                      style={{
                        backgroundColor: "var(--card-bg)",
                        color: "var(--text-primary)",
                      }}
                    >
                      100
                    </option>
                    <option
                      value={200}
                      style={{
                        backgroundColor: "var(--card-bg)",
                        color: "var(--text-primary)",
                      }}
                    >
                      200
                    </option>
                  </select>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      marginLeft: "4px",
                    }}
                  >
                    Showing{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {startIndex + 1}
                    </strong>
                    -
                    <strong style={{ color: "var(--text-primary)" }}>
                      {endIndex}
                    </strong>{" "}
                    of{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {videos.length}
                    </strong>
                  </span>
                </div>

                {/* Page Navigation Buttons */}
                <nav
                  aria-label="Page navigation"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <ul className="pagination pagination-sm mb-0">
                    <li
                      className={`page-item ${currentPage === 1 ? "disabled" : ""
                        }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        title="First page"
                      >
                        «
                      </button>
                    </li>

                    <li
                      className={`page-item ${currentPage === 1 ? "disabled" : ""
                        }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          handlePageChange(Math.max(currentPage - 1, 1))
                        }
                        disabled={currentPage === 1}
                        title="Previous page"
                      >
                        <ChevronLeft size={16} />
                      </button>
                    </li>

                    {(() => {
                      const pages = [];
                      const maxVisible = 5;

                      if (totalPages <= maxVisible + 2) {
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        if (currentPage <= 3) {
                          for (let i = 1; i <= 4; i++) pages.push(i);
                          pages.push("...");
                          pages.push(totalPages);
                        } else if (currentPage >= totalPages - 2) {
                          pages.push(1);
                          pages.push("...");
                          for (let i = totalPages - 3; i <= totalPages; i++)
                            pages.push(i);
                        } else {
                          pages.push(1);
                          pages.push("...");
                          for (
                            let i = currentPage - 1;
                            i <= currentPage + 1;
                            i++
                          )
                            pages.push(i);
                          pages.push("...");
                          pages.push(totalPages);
                        }
                      }

                      return pages.map((page, idx) => {
                        if (page === "...") {
                          return (
                            <li
                              key={`ellipsis-${idx}`}
                              className="page-item disabled"
                            >
                              <span className="page-link">...</span>
                            </li>
                          );
                        }
                        return (
                          <li
                            key={page}
                            className={`page-item ${currentPage === page ? "active" : ""
                              }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        );
                      });
                    })()}

                    <li
                      className={`page-item ${currentPage === totalPages ? "disabled" : ""
                        }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          handlePageChange(
                            Math.min(currentPage + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                        title="Next page"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </li>

                    <li
                      className={`page-item ${currentPage === totalPages ? "disabled" : ""
                        }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        title="Last page"
                      >
                        »
                      </button>
                    </li>
                  </ul>
                </nav>

                {/* Jump to Page */}
                <div className="d-flex align-items-center gap-2">
                  <label
                    htmlFor="jumpToPage"
                    className="mb-0 small"
                    style={{
                      color: "var(--text-secondary)",
                      fontWeight: "600",
                    }}
                  >
                    Go to page:
                  </label>
                  <input
                    id="jumpToPage"
                    type="number"
                    style={{
                      width: "70px",
                      padding: "5px 10px",
                      borderRadius: "8px",
                      border: "1px solid var(--input-border)",
                      backgroundColor: "var(--input-bg)",
                      color: "var(--text-primary)",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      textAlign: "center",
                      outline: "none",
                    }}
                    min="1"
                    max={totalPages}
                    placeholder={currentPage.toString()}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        const page = parseInt(e.target.value);
                        if (page >= 1 && page <= totalPages) {
                          handlePageChange(page);
                          e.target.value = "";
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeTable;
