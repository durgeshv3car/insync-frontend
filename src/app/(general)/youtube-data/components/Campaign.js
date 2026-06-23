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
            opacity: isActive ? 1 : 0.4 
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
            transition: "all 0.2s ease"
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
      const res = await getQueryResults(filters);
      if (res && res.results) {
        setVideos(res.results);
        setCount(res.pagination?.totalCount || 0);
        setTotalPages(res.pagination?.totalPages || 0);
        setAnalytics(res.totals || {});

        // Update ID to videoId map
        setIdToVideoIdMap((prev) => {
          const newMap = { ...prev };
          res.results.forEach((v) => {
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
      console.warn("YouTube Data: No session user ID available.", { session, status });
      return;
    }

    const init = async () => {
      try {
        const uid = session.user.id;
        console.log("YouTube Data: Initializing queries for UserID:", uid);
        
        const [latestRes, listRes] = await Promise.all([
          getLatestQueryByUserId(uid).catch((err) => {
             console.error("YouTube Data: Latest query API failed:", err.message);
             return null;
          }),
          getRecentTenQueries(uid).catch((err) => {
             console.error("YouTube Data: Ten list API failed:", err.message);
             return [];
          }),
        ]);

        console.log("YouTube Data: API Raw Response - Latest:", latestRes, "List:", listRes);

        const paramChannelName = searchParams.get("channelName");
        const paramQuery = searchParams.get("query");

        let finalQuery = "";
        let finalChannelName = "";

        if (paramChannelName !== null || paramQuery !== null) {
          finalChannelName = paramChannelName || "";
          finalQuery = paramQuery || "";
          setChannelNameInput(finalChannelName);
          setQueryInput(finalQuery);
        } else {
          if (latestRes) {
            finalQuery = typeof latestRes === 'string' ? latestRes : (latestRes.query || latestRes.text || "");
            setQueryInput(finalQuery);
          }
        }

        // Set filters once with all initial data
        setFilters((prev) => ({
          ...prev,
          query: finalQuery,
          channelName: finalChannelName,
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
  }, [isReady, filters.query, filters.channelName, filters.regionCode, filters.videoType, filters.sortBy, filters.page, filters.limit, filters.userId, filters.csvResults]);

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
    link.download = `youtube_results_${
      new Date().toISOString().split("T")[0]
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
    link.download = `youtube_results_${
      new Date().toISOString().split("T")[0]
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
    <div
      style={{
        minHeight: "100vh",
      }}
    >
      <PageHeader>{/* <PageHeaderDate /> */}</PageHeader>
      <div className="container">
        {/* Filters Card */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "30px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid #e9ecef",
            marginTop: "16px",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <h6
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#1a1a1a",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Search & Filter
            </h6>
          </div>

          <div className="row g-3 align-items-start">
            <div className="col-lg-2">
              <label
                style={{
                  padding: "14px 0 10px 0",
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
                  borderRadius: "6px", 
                  overflow: "hidden",
                  transition: "box-shadow 0.3s ease, border-color 0.3s ease"
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
                  value={channelNameInput}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Search channel..."
                  style={{
                    border: "1px solid #dee2e6",
                    fontSize: "0.85rem",
                    padding: "8px 12px",
                    transition: "all 0.2s ease"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0d6efd"}
                  onBlur={(e) => e.target.style.borderColor = "#dee2e6"}
                />
              </div>
            </div>

            <div className="col-lg-3" style={{ transition: "all 0.3s ease" }}>
              <label
                style={{
                  padding: "14px 0 10px 0",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  color: "#495057",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  transition: "color 0.2s"
                }}
              >
                Search Query
              </label>
              <div 
                className="input-group" 
                style={{ 
                  borderRadius: "6px", 
                  overflow: "visible", 
                  position: "relative",
                  transition: "all 0.3s ease"
                }} 
                ref={historyRef}
              >
                <span 
                  className="input-group-text" 
                  style={{ 
                    border: "1px solid #dee2e6", 
                    backgroundColor: "#f8f9fa", 
                    cursor: recentQueries.length > 0 ? "pointer" : "default" 
                  }} 
                  onClick={() => recentQueries.length > 0 && setShowHistory(!showHistory)}
                >
                  <Search size={16} style={{ color: "#6c757d" }} />
                </span>
                <input
                  type="text"
                  name="query"
                  value={queryInput}
                  autoComplete="off"
                  onFocus={() => recentQueries.length > 0 && setShowHistory(true)}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Search query..."
                  style={{
                    border: "1px solid #dee2e6",
                    fontSize: "0.85rem",
                    padding: "8px 12px",
                  }}
                />
                {showHistory && recentQueries.length > 0 && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "#fff",
                    border: "1px solid #dee2e6",
                    borderRadius: "6px",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
                    zIndex: 2000,
                    marginTop: "4px",
                    maxHeight: "250px",
                    overflowY: "auto"
                  }}>
                    {recentQueries.map((q, idx) => (
                      <div
                        key={idx}
                        className="history-item"
                        style={{
                          padding: "10px 15px",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          backgroundColor: "#fff",
                          transition: "background-color 0.2s",
                          borderBottom: idx === recentQueries.length - 1 ? "none" : "1px solid #f1f5f9",
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                        onClick={() => {
                          setFilters(prev => ({ ...prev, query: q, page: 1 }));
                          setQueryInput(q);
                          setShowHistory(false);
                        }}
                      >
                        <i className="fa-solid fa-clock-rotate-left me-2 text-muted" style={{ fontSize: "0.75rem" }}></i>
                        {q}
                      </div>
                    ))}
                  </div>
                )}
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
                Video Type
              </label>
              <select
                name="videoType"
                value={filters.videoType}
                onChange={handleChange}
                className="form-select"
                style={{
                  border: "1px solid #dee2e6",
                  fontSize: "0.85rem",
                  borderRadius: "6px",
                  padding: "8px 12px",
                }}
              >
                <option value="all">All</option>
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
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
                Sort By
              </label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleChange}
                className="form-select"
                style={{
                  border: "1px solid #dee2e6",
                  fontSize: "0.85rem",
                  borderRadius: "6px",
                  padding: "8px 12px",
                }}
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

            <div className="col-lg-1">
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
                Region
              </label>
              <select
                name="regionCode"
                value={filters.regionCode}
                onChange={handleChange}
                className="form-select"
                style={{
                  border: "1px solid #dee2e6",
                  fontSize: "0.85rem",
                  borderRadius: "6px",
                  padding: "8px 12px",
                }}
              >
                <option value="all">All</option>
                {regions.map((code, idx) => (
                  <option key={idx} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-lg-2">
              <label
                style={{
                  padding: "14px 0 8px 0",
                  fontSize: "0.80rem",
                  fontWeight: "700",
                  color: "#495057",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                }}
              >
                Filters Keyword
              </label>
              <div 
                style={{ 
                  display: "flex", 
                  flexWrap: "wrap", 
                  gap: "6px",
                  padding: "6px 10px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                  border: "1px solid #dee2e6",
                  minHeight: "38px",
                  alignItems: "center",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  opacity: filters.query ? 1 : 0.6,
                }}
              >
                {/* "All" Chip */}
                <div
                  onClick={() => handleChange({ target: { name: "csvResults", value: "all" } })}
                  style={{
                    padding: "2px 10px",
                    borderRadius: "16px",
                    fontSize: "0.7rem",
                    fontWeight: "650",
                    cursor: "pointer",
                    backgroundColor: (filters.csvResults === "all" || !filters.csvResults) ? "#0d6efd" : "#ffffff",
                    color: (filters.csvResults === "all" || !filters.csvResults) ? "#ffffff" : "#6c757d",
                    border: "1px solid",
                    borderColor: (filters.csvResults === "all" || !filters.csvResults) ? "#0d6efd" : "#dee2e6",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    userSelect: "none",
                    transform: (filters.csvResults === "all" || !filters.csvResults) ? "scale(1.05)" : "scale(1)",
                    boxShadow: (filters.csvResults === "all" || !filters.csvResults) ? "0 2px 5px rgba(13, 110, 253, 0.2)" : "none"
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
                        onClick={() => handleChange({ target: { name: "csvResults", value: q.toLowerCase() } })}
                        style={{
                          padding: "2px 10px",
                          borderRadius: "16px",
                          fontSize: "0.7rem",
                          fontWeight: "650",
                          cursor: "pointer",
                          backgroundColor: isActive ? "#0d6efd" : "#ffffff",
                          color: isActive ? "#ffffff" : "#6c757d",
                          border: "1px solid",
                          borderColor: isActive ? "#0d6efd" : "#dee2e6",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          userSelect: "none",
                          transform: isActive ? "scale(1.05)" : "scale(1)",
                          boxShadow: isActive ? "0 2px 5px rgba(13, 110, 253, 0.2)" : "none",
                          animation: "appear 0.3s ease-out"
                        }}
                      >
                        {q}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Result Actions Bar (Left Aligned) */}
          <div 
            className="mt-4 d-flex align-items-center flex-wrap gap-3"
            style={{ borderTop: "none" }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "6px 14px",
                backgroundColor: "#f0f4ff",
                borderRadius: "8px",
                fontSize: "0.85rem",
                border: "1px solid #d0e2ff",
                color: "#0d6efd",
                fontWeight: "700"
              }}
            >
              <Users size={16} style={{ marginRight: "8px" }} />
              {count > 0 ? (
                <span>
                  Showing {Math.min((currentPage - 1) * filters.limit + 1, count)}-
                  {Math.min(currentPage * filters.limit, count)} of {count.toLocaleString()} 
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
                  backgroundColor: "#ffffff",
                  color: "#0d6efd",
                  border: "1px solid #0d6efd",
                  borderRadius: "8px",
                  padding: "6px 16px",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  width: "95px"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0d6efd"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.color = "#0d6efd"; }}
              >
                <Download size={14} style={{ marginRight: "6px" }} />
                CSV
              </button>
              <button
                className="btn btn-sm"
                onClick={downloadExcel}
                title="Download Excel"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#0d6efd",
                  border: "1px solid #0d6efd",
                  borderRadius: "8px",
                  padding: "6px 16px",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0d6efd"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.color = "#0d6efd"; }}
              >
                <Download size={14} style={{ marginRight: "6px" }} />
                Excel
              </button>
              {audienceId && (
                <button
                  className="btn btn-sm"
                  onClick={AddToCampaign}
                  style={{
                    backgroundColor: "#198754",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px 16px",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 4px rgba(25, 135, 84, 0.2)"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#157347"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#198754"}
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
        >
        </div>


        {/* Table Section */}
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
                borderCollapse: "separate",
                borderSpacing: "0",
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
                      padding: "14px",
                      textAlign: "center",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "4%",
                    }}
                  >
                    <input
                      type="checkbox"
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
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
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
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
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
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
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
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "8%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                      Views {getSortIcon("views")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("likes")}
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "8%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                      Likes {getSortIcon("likes")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("comments")}
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "11%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                      Comments {getSortIcon("comments")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("subscribers")}
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "13%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                      Subscribers {getSortIcon("subscribers")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("published")}
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "11%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                      Published {getSortIcon("published")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("engagement")}
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "10%",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                      ER Rate {getSortIcon("engagement")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Skeleton Loader Rows */}
                {loading && (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} style={{ borderBottom: "1px solid #e9ecef" }}>
                      {["5%", "18%", "12%", "12%", "8%", "8%", "8%", "8%", "8%", "9%"].map((w, j) => (
                        <td key={j} style={{ padding: "14px 12px", width: w }}>
                          <div style={{
                            height: j === 1 ? "36px" : "14px",
                            borderRadius: "6px",
                            background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                            backgroundSize: "200% 100%",
                            animation: "shimmer 1.4s infinite",
                            width: j === 0 ? "18px" : "85%",
                            margin: j === 0 ? "0 auto" : "0",
                          }} />
                        </td>
                      ))}
                    </tr>
                  ))
                )}

                {/* Empty State */}
                {videos.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan="11"
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

                {!loading && videos.map((v, idx) => (
                  <tr
                    key={v.videoId}
                    onClick={() => handleVideoSelect(v._id)}
                    style={{
                      borderBottom: "1px solid #e9ecef",
                      transition: "background-color 0.2s ease",
                      backgroundColor: selectedVideos.has(v._id)
                        ? "#f0f4ff"
                        : idx % 2 === 0
                          ? "#ffffff"
                          : "#f8f9fa",
                      cursor: "default",
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
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <input
                        type="checkbox"
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
                            borderRadius: "4px",
                            objectFit: "cover",
                            flexShrink: 0,
                            border: "1px solid #e9ecef",
                          }}
                        />
                        <div
                          style={{ flex: 1, minWidth: 0, overflow: "hidden" }}
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
    backgroundColor: "#e9ecef",
    flexShrink: 0,
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
            font-weight:600;
            font-size:0.8rem;
            color:#495057;
          ">
            ${v.channelName.charAt(0).toUpperCase()}
          </span>
        `;
      }}
    />
  ) : (
    <span
      style={{
        fontWeight: "600",
        fontSize: "0.8rem",
        color: "#495057",
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
                            color: "#1a1a1a",
                            flex: 1,
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
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#e7f1ff",
                            fontWeight: "600",
                            fontSize: "0.75rem",
                            color: "#0d6efd",
                            flexShrink: 0,
                          }}
                        >
                          {v.query.charAt(0).toUpperCase()}
                        </div>
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: "0.85rem",
                            color: "#1a1a1a",
                            flex: 1,
                          }}
                          title={v.query}
                        >
                          {v.query}
                        </span>
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
                          gap: "6px",
                          maxWidth: "100%",
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
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {Number(v.views).toLocaleString()}
                        </span>
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
                          gap: "6px",
                          maxWidth: "100%",
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
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {Number(v.likes).toLocaleString()}
                        </span>
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
                          gap: "6px",
                          maxWidth: "100%",
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
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {Number(v.comments).toLocaleString()}
                        </span>
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
                          gap: "6px",
                          maxWidth: "100%",
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
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {Number(v.subscribers).toLocaleString()}
                        </span>
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
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "20px",
                  backgroundColor: "#f8f9fa",
                  borderTop: "1px solid #dee2e6",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <label
                    htmlFor="limit"
                    style={{
                      marginBottom: "0",
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      fontWeight: "500",
                    }}
                  >
                    Rows per page:
                  </label>
                  <select
                    id="limit"
                    className="form-select form-select-sm"
                    style={{
                      width: "auto",
                      fontSize: "0.9rem",
                      border: "1px solid #dee2e6",
                      borderRadius: "6px",
                    }}
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
                  >
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                  </select>
                  <span style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                    Showing <strong>{startIndex + 1}</strong>-
                    <strong>{endIndex}</strong> of{" "}
                    <strong>{videos.length}</strong>
                  </span>
                </div>

                <nav aria-label="Page navigation">
                  <ul className="pagination pagination-sm mb-0">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
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
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
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
                            className={`page-item ${
                              currentPage === page ? "active" : ""
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
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
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
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
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

                <div className="d-flex align-items-center gap-2">
                  <label htmlFor="jumpToPage" className="mb-0 text-muted small">
                    Go to page:
                  </label>
                  <input
                    id="jumpToPage"
                    type="number"
                    className="form-control form-control-sm"
                    style={{ width: "70px" }}
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
