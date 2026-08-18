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
        <ArrowDown size={12} style={{ color: "#0d6efd", marginLeft: "4px" }} />
      ) : (
        <ArrowUp
          size={12}
          style={{
            color: isActive ? "#0d6efd" : "#adb5bd",
            marginLeft: "4px",
            opacity: isActive ? 1 : 0.4,
          }}
        />
      );
    } else {
      isActive = filters.sortBy === field;
      return (
        <ArrowUp
          size={12}
          style={{
            color: isActive ? "#0d6efd" : "#adb5bd",
            marginLeft: "4px",
            opacity: isActive ? 1 : 0.4,
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
    console.log("Audience ID:", audienceId);
    console.log("Complete video objects:", selectedData);
    const res = await createCampaignData(audienceId, selectedData);
    if (res.message) {
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
    setSelectedVideos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
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
      if (areAllSelected) {
        allIdsOnPage.forEach((id) => newSet.delete(id));
      } else {
        allIdsOnPage.forEach((id) => newSet.add(id));
      }
      return newSet;
    });
  };

  useEffect(() => {
    setSelectedData(Array.from(selectedVideos));
  }, [selectedVideos]);

  return (
    <div>
      <div>
        {/* Filters Card */}
        <div className="app-search-card">
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
              }}
            >
              <Globe size={16} />
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
              Search & Filter Data
            </h6>
          </div>

          <div className="row g-3 align-items-start">
            <div className="col-lg-2">
              <label className="app-search-label">Channel Name</label>
              <div className="app-input-group">
                <span className="app-input-addon">
                  <Globe size={16} />
                </span>
                <input
                  type="text"
                  name="channelName"
                  value={channelNameInput}
                  onChange={handleChange}
                  className="app-input"
                  placeholder="Search channel..."
                />
              </div>
            </div>

            <div className="col-lg-3">
              <label className="app-search-label">Search Query</label>
              <div
                className="app-input-group"
                ref={historyRef}
                style={{ position: "relative" }}
              >
                <span
                  className="app-input-addon"
                  style={{
                    cursor: recentQueries.length > 0 ? "pointer" : "default",
                  }}
                  onClick={() =>
                    recentQueries.length > 0 && setShowHistory(!showHistory)
                  }
                >
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  name="query"
                  value={queryInput}
                  autoComplete="off"
                  onFocus={() =>
                    recentQueries.length > 0 && setShowHistory(true)
                  }
                  onChange={handleChange}
                  className="app-input"
                  placeholder="Search query..."
                />
                {showHistory && recentQueries.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "var(--card-bg)",
                      border: "1px solid var(--card-border)",
                      borderRadius: "10px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                      zIndex: 2000,
                      marginTop: "4px",
                      maxHeight: "250px",
                      overflowY: "auto",
                    }}
                  >
                    {recentQueries.map((q, idx) => (
                      <div
                        key={idx}
                        className="history-item"
                        style={{
                          padding: "10px 15px",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          color: "var(--text-primary)",
                          transition: "background-color 0.2s",
                          borderBottom:
                            idx === recentQueries.length - 1
                              ? "none"
                              : "1px solid var(--card-border)",
                        }}
                        onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--table-hover-bg)")
                        }
                        onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "transparent")
                        }
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

            <div className="col-lg-2">
              <label className="app-search-label">Video Type</label>
              <div className="app-input-group">
                <span className="app-input-addon">
                  <Video size={16} />
                </span>
                <select
                  name="videoType"
                  value={filters.videoType}
                  onChange={handleChange}
                  className="app-select"
                >
                  <option value="all">All</option>
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </select>
              </div>
            </div>

            <div className="col-lg-2">
              <label className="app-search-label">Sort By</label>
              <div className="app-input-group">
                <span className="app-input-addon">
                  <TrendingUp size={16} />
                </span>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleChange}
                  className="app-select"
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

            <div className="col-lg-1">
              <label className="app-search-label">Region</label>
              <div className="app-input-group">
                <select
                  name="regionCode"
                  value={filters.regionCode}
                  onChange={handleChange}
                  className="app-select"
                  style={{ paddingLeft: "10px" }}
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

            <div className="col-lg-2">
              <label className="app-search-label">Filter Keywords</label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  padding: "6px 10px",
                  backgroundColor: "var(--input-bg)",
                  borderRadius: "12px",
                  border: "1px solid var(--input-border)",
                  minHeight: "42px",
                  alignItems: "center",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  opacity: filters.query ? 1 : 0.6,
                }}
              >
                {/* "All" Chip */}
                <div
                  onClick={() =>
                    handleChange({
                      target: { name: "csvResults", value: "all" },
                    })
                  }
                  style={{
                    padding: "3px 12px",
                    borderRadius: "16px",
                    fontSize: "0.72rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    backgroundColor:
                      filters.csvResults === "all" || !filters.csvResults
                        ? "#2563EB"
                        : "transparent",
                    color:
                      filters.csvResults === "all" || !filters.csvResults
                        ? "#ffffff"
                        : "var(--text-secondary)",
                    border: "1px solid",
                    borderColor:
                      filters.csvResults === "all" || !filters.csvResults
                        ? "#2563EB"
                        : "var(--card-border)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    userSelect: "none",
                    boxShadow:
                      filters.csvResults === "all" || !filters.csvResults
                        ? "0 2px 8px rgba(37,99,235,0.3)"
                        : "none",
                  }}
                >
                  All
                </div>

                {/* Keyword Chips */}
                {filters.query
                  ?.split(",")
                  .map((q) => q.trim())
                  .filter(Boolean)
                  .map((q, idx) => {
                    const isActive = filters.csvResults === q.toLowerCase();
                    return (
                      <div
                        key={idx}
                        onClick={() =>
                          handleChange({
                            target: {
                              name: "csvResults",
                              value: q.toLowerCase(),
                            },
                          })
                        }
                        style={{
                          padding: "3px 12px",
                          borderRadius: "16px",
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          backgroundColor: isActive ? "#2563EB" : "transparent",
                          color: isActive ? "#ffffff" : "var(--text-secondary)",
                          border: "1px solid",
                          borderColor: isActive
                            ? "#2563EB"
                            : "var(--card-border)",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          userSelect: "none",
                          boxShadow: isActive
                            ? "0 2px 8px rgba(37,99,235,0.3)"
                            : "none",
                        }}
                      >
                        {q}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Result Actions Bar */}
          <div className="mt-4 d-flex align-items-center flex-wrap gap-3">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "8px 16px",
                backgroundColor: "rgba(37,99,235,0.12)",
                borderRadius: "10px",
                fontSize: "0.85rem",
                border: "1px solid rgba(37,99,235,0.25)",
                color: "#3B82F6",
                fontWeight: "700",
              }}
            >
              <Users size={16} style={{ marginRight: "8px" }} />
              {count > 0 ? (
                <span>
                  Showing{" "}
                  {Math.min((currentPage - 1) * filters.limit + 1, count)}-
                  {Math.min(currentPage * filters.limit, count)} of{" "}
                  {count.toLocaleString()}
                </span>
              ) : (
                "No videos to display"
              )}
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm"
                onClick={downloadCSV}
                title="Download CSV"
                style={{
                  backgroundColor: "var(--card-bg)",
                  color: "#3B82F6",
                  border: "1px solid #3B82F6",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563EB";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--card-bg)";
                  e.currentTarget.style.color = "#3B82F6";
                }}
              >
                <Download
                  size={15}
                  color="currentColor"
                  strokeWidth={2.2}
                  style={{ marginRight: "6px", color: "inherit" }}
                />
                CSV
              </button>

              <button
                className="btn btn-sm"
                onClick={downloadExcel}
                title="Download Excel"
                style={{
                  backgroundColor: "var(--card-bg)",
                  color: "#3B82F6",
                  border: "1px solid #3B82F6",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563EB";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--card-bg)";
                  e.currentTarget.style.color = "#3B82F6";
                }}
              >
                <Download
                  size={15}
                  color="currentColor"
                  strokeWidth={2.2}
                  style={{ marginRight: "6px", color: "inherit" }}
                />
                Excel
              </button>

              {audienceId && (
                <button
                  className="btn btn-sm"
                  onClick={AddToCampaign}
                  style={{
                    background:
                      "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "8px 18px",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-1px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <Star size={14} style={{ marginRight: "6px" }} />
                  Add To Campaign
                </button>
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
        <div
          style={{
            backgroundColor: "var(--card-bg)",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
            border: "1px solid var(--card-border)",
            transition: "background-color 0.25s ease, border-color 0.25s ease",
          }}
        >
          <div
            className="table-responsive"
            style={{ overflowX: "auto", width: "100%", maxWidth: "100%" }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: "0",
                tableLayout: "fixed",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "var(--table-header-bg)",
                    borderBottom: "2px solid var(--table-border)",
                  }}
                >
                  <th
                    style={{
                      padding: "14px",
                      textAlign: "center",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "4%",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={
                        videos.length > 0 &&
                        videos
                          .map((v) => v._id)
                          .filter(Boolean)
                          .every((id) => selectedVideos.has(id))
                      }
                      onChange={handleSelectAll}
                      style={{
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                      }}
                    />
                  </th>
                  <th
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "16%",
                    }}
                  >
                    Video
                  </th>
                  <th
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "10%",
                    }}
                  >
                    Channel
                  </th>
                  <th
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "10%",
                    }}
                  >
                    Keyword
                  </th>
                  <th
                    onClick={() => handleSort("views")}
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "8%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Views {getSortIcon("views")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("likes")}
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "8%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Likes {getSortIcon("likes")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("comments")}
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "11%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Comments {getSortIcon("comments")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("subscribers")}
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "13%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Subscribers {getSortIcon("subscribers")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("published")}
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "11%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Published {getSortIcon("published")}
                    </div>
                  </th>
                  <th
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "9%",
                    }}
                  >
                    Region
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Skeleton Loader Rows */}
                {loading &&
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr
                      key={`skeleton-${i}`}
                      style={{ borderBottom: "1px solid var(--table-border)" }}
                    >
                      {[
                        "5%",
                        "18%",
                        "12%",
                        "12%",
                        "8%",
                        "8%",
                        "8%",
                        "8%",
                        "8%",
                        "9%",
                      ].map((w, j) => (
                        <td key={j} style={{ padding: "14px 12px", width: w }}>
                          <div
                            style={{
                              height: j === 1 ? "36px" : "14px",
                              borderRadius: "6px",
                              background:
                                "linear-gradient(90deg, var(--skeleton-base, #1e293b) 25%, var(--skeleton-highlight, #334155) 50%, var(--skeleton-base, #1e293b) 75%)",
                              backgroundSize: "200% 100%",
                              animation: "shimmer 1.4s infinite",
                              width: j === 0 ? "18px" : "85%",
                              margin: j === 0 ? "0 auto" : "0",
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
                      colSpan="11"
                      style={{
                        textAlign: "center",
                        padding: "50px 20px",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <AlertCircle
                          size={44}
                          style={{ color: "#ef4444", marginBottom: "14px" }}
                        />
                        <h5
                          style={{
                            color: "#1e293b",
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
                      key={v.videoId}
                      onClick={() => handleVideoSelect(v._id)}
                      className="app-table-row"
                      style={{
                        cursor: "pointer",
                        backgroundColor: selectedVideos.has(v._id)
                          ? "var(--table-hover-bg)"
                          : "transparent",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px",
                          verticalAlign: "middle",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          checked={selectedVideos.has(v._id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleVideoSelect(v._id)}
                          style={{
                            width: "18px",
                            height: "18px",
                            cursor: "pointer",
                          }}
                        />
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          verticalAlign: "middle",
                          maxWidth: "0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            maxWidth: "100%",
                          }}
                        >
                          <img
                            src={v.thumbnail}
                            alt={v.title}
                            width={48}
                            height={36}
                            style={{
                              borderRadius: "6px",
                              objectFit: "cover",
                              flexShrink: 0,
                              border: "1px solid var(--card-border)",
                            }}
                          />
                          <div
                            style={{ flex: 1, minWidth: 0, overflow: "hidden" }}
                          >
                            <div
                              style={{
                                fontWeight: "600",
                                color: "var(--text-primary)",
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
                                color: "#3B82F6",
                                textDecoration: "none",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "block",
                                fontWeight: 600,
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
                          maxWidth: "0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            maxWidth: "100%",
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              overflow: "hidden",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background:
                                "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                              flexShrink: 0,
                              color: "#ffffff",
                            }}
                          >
                            {v.logo ? (
                              <img
                                src={v.logo}
                                alt={v.channelName}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.parentNode.innerHTML = `
                                  <span style="
                                    font-weight:700;
                                    font-size:0.8rem;
                                    color:#ffffff;
                                  ">
                                    ${v.channelName.charAt(0).toUpperCase()}
                                  </span>
                                `;
                                }}
                              />
                            ) : (
                              <span
                                style={{
                                  fontWeight: "700",
                                  fontSize: "0.8rem",
                                  color: "#ffffff",
                                }}
                              >
                                {v.channelName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: "0.85rem",
                              color: "var(--text-primary)",
                              fontWeight: 500,
                              flex: 1,
                            }}
                            title={v.channelName}
                          >
                            {v.channelName}
                          </span>
                        </div>
                      </td>
                      {/* Keyword cell */}
                      <td
                        style={{
                          padding: "12px",
                          verticalAlign: "middle",
                          maxWidth: "0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            maxWidth: "100%",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              background: "rgba(37, 99, 235, 0.15)",
                              color: "#3B82F6",
                              border: "1px solid rgba(37, 99, 235, 0.3)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={v.query}
                          >
                            {v.query}
                          </span>
                        </div>
                      </td>

                      {/* Views cell */}
                      <td
                        style={{
                          padding: "12px",
                          verticalAlign: "middle",
                          maxWidth: "0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            maxWidth: "100%",
                          }}
                        >
                          <Eye
                            size={14}
                            style={{ color: "#3B82F6", flexShrink: 0 }}
                          />
                          <span
                            style={{
                              fontSize: "0.82rem",
                              color: "var(--text-primary)",
                              fontWeight: "600",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {Number(v.views).toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Likes cell */}
                      <td
                        style={{
                          padding: "12px",
                          verticalAlign: "middle",
                          maxWidth: "0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            maxWidth: "100%",
                          }}
                        >
                          <ThumbsUp
                            size={14}
                            style={{ color: "#3B82F6", flexShrink: 0 }}
                          />
                          <span
                            style={{
                              fontSize: "0.82rem",
                              color: "var(--text-primary)",
                              fontWeight: "600",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {Number(v.likes).toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Comments cell */}
                      <td
                        style={{
                          padding: "12px",
                          verticalAlign: "middle",
                          maxWidth: "0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            maxWidth: "100%",
                          }}
                        >
                          <MessageCircle
                            size={14}
                            style={{ color: "#3B82F6", flexShrink: 0 }}
                          />
                          <span
                            style={{
                              fontSize: "0.82rem",
                              color: "var(--text-primary)",
                              fontWeight: "600",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {Number(v.comments).toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Subscribers cell */}
                      <td
                        style={{
                          padding: "12px",
                          verticalAlign: "middle",
                          maxWidth: "0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            maxWidth: "100%",
                          }}
                        >
                          <Users
                            size={14}
                            style={{ color: "#3B82F6", flexShrink: 0 }}
                          />
                          <span
                            style={{
                              fontSize: "0.82rem",
                              color: "var(--text-primary)",
                              fontWeight: "600",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {Number(v.subscribers).toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Published Date cell */}
                      <td
                        style={{
                          padding: "12px",
                          verticalAlign: "middle",
                          maxWidth: "0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.82rem",
                            color: "var(--text-secondary)",
                            fontWeight: "500",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "block",
                          }}
                        >
                          {new Date(v.publishedDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "2px",
                          }}
                        >
                          {[1, 2, 3, 4, 5].map((i) => {
                            const rating = v.erBySubscribers || 0;

                            const starColor =
                              rating >= i
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
                                size={16}
                                color={starColor}
                                fill={starColor}
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
