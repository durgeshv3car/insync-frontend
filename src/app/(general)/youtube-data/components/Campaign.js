"use client";
import React, { useState, useEffect } from "react";
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
  getLatestQueryResults,
  getQueryResults,
} from "@/services/youtube";
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
  });

  // Dummy data for analytics - Replace with your actual data
  const [analytics, setAnalytics] = useState({});
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  useEffect(() => {
    setAudienceId(searchParams.get("audienceId"));
  }, [searchParams]);

  const startIndex = (currentPage - 1) * filters.limit;
  const endIndex = startIndex + videos.length;

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await getQueryResults(filters);

      setVideos(res.results);
      setCurrentPage(res.pagination.currentPage);
      setCount(res.pagination.totalCount);
      setTotalPages(res.pagination.totalPages);
      setAnalytics(res.totals);
    } catch (error) {
      console.error("Error fetching YouTube results:", error);
    }
    setLoading(false);
  };

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const res = await getFiltersResults();
      console.log("Regions response:", res.regions);

      setRegions(res.regions);
    } catch (error) {
      console.error("Error fetching YouTube results:", error);
    }
    setLoading(false);
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
    setLoading(true);
    try {
      const payload = {
        query: filters.query,
        sortBy: filters.sortBy,
        videoType: filters.videoType,
        csvResults: filters.csvResults,
      };
      const res = await getcsvResults(payload);

      setCsvVideos(res.results);
    } catch (error) {
      console.error("Error fetching YouTube results:", error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };
  useEffect(() => {
    const init = async () => {
      const res = await getLatestQueryResults();
      setFilters((prev) => ({
        ...prev,
        query: res,
      }));
    };
    init();
  }, []); // ✅ only once

  useEffect(() => {
    fetchVideos();
    fetchCsvResults();
    fetchRegions();
    setSelectedVideos(new Set()); // Reset selection on filter/page change
  }, [filters]);

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

          <div className="row g-3 align-items-end">
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
                style={{ borderRadius: "6px", overflow: "hidden" }}
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
                  placeholder="Search channel..."
                  style={{
                    border: "1px solid #dee2e6",
                    fontSize: "0.85rem",
                    padding: "8px 12px",
                  }}
                />
              </div>
            </div>

            <div className="col-lg-3">
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
                Search Query
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
                  <Search size={16} style={{ color: "#6c757d" }} />
                </span>
                <input
                  type="text"
                  name="query"
                  value={filters.query}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Search query..."
                  style={{
                    border: "1px solid #dee2e6",
                    fontSize: "0.85rem",
                    padding: "8px 12px",
                  }}
                />
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
                <option value="popular">Popular</option>
                <option value="subscribers">Subscribers</option>
                <option value="engagement">Engagement</option>
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
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  color: "#495057",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                }}
              >
                Filter By Query
              </label>
              <select
                name="csvResults"
                value={filters.csvResults || "all"}
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
                {filters.query
                  ?.split(",")
                  .map((q) => q.trim())
                  .filter(Boolean)
                  .map((q, idx) => (
                    <option key={idx} value={q.toLowerCase()}>
                      {q}
                    </option>
                  ))}
              </select>
            </div>

            <div className="col-lg-3 d-flex gap-2 justify-content-start">
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "5px 10px",
                  backgroundColor: "#f0f4ff",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                }}
              >
                <span style={{ fontWeight: "600", color: "#0d6efd" }}>
                  {count}
                </span>
                <span style={{ color: "#6c757d" }}>
                  video{count !== 1 ? "s" : ""}
                </span>
              </div>

              {videos.length > 0 && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn btn-sm"
                    onClick={downloadCSV}
                    title="Download as CSV"
                    style={{
                      backgroundColor: "#0d6efd",
                      color: "#ffffff",
                      border: "1px solid #dee2e6",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                    }}
                  >
                    <Download
                      size={12}
                      style={{ marginRight: "4px", display: "inline" }}
                    />
                    CSV
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={downloadExcel}
                    title="Download as Excel"
                    style={{
                      backgroundColor: "#0d6efd",
                      color: "#ffffff",
                      border: "1px solid #dee2e6",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                    }}
                  >
                    <Download
                      size={14}
                      style={{ marginRight: "4px", display: "inline" }}
                    />
                    Excel
                  </button>
                  {audienceId && (
                    <button
                      className="btn btn-sm"
                      onClick={AddToCampaign}
                      title="Download as Excel"
                      style={{
                        backgroundColor: "#0d6efd",
                        color: "#ffffff",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                      }}
                    >
                      <Download
                        size={14}
                        style={{ marginRight: "4px", display: "inline" }}
                      />
                      Add to Campaign
                    </button>
                  )}
                </div>
              )}
            </div>
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
            <h6
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#1a1a1a",
                marginBottom: "4px",
              }}
            >
              Video Results ({videos.length})
            </h6>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6c757d",
                marginBottom: "0",
              }}
            >
              {videos.length > 0
                ? `Showing ${videos.length} video${
                    videos.length !== 1 ? "s" : ""
                  } total`
                : "No videos to display"}
            </p>
          </div>
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
                      width: "5%",
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
                      width: "18%",
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
                      width: "12%",
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
                      width: "12%",
                    }}
                  >
                    Keyword
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
                      width: "8%",
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
                      width: "8%",
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
                      width: "8%",
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
                      width: "8%",
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
                      width: "8%",
                    }}
                  >
                    Published
                  </th>
                  <th
                    style={{
                      padding: "14px",
                      textAlign: "center",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#495057",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "9%",
                    }}
                  >
                    ER Rate
                  </th>
                </tr>
              </thead>
              <tbody>
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

                {videos.map((v, idx) => (
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
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedVideos.has(v._id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleVideoSelect(v._id);
                        }}
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
