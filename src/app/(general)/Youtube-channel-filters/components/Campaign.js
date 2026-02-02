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

const YouTubeTable = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    channelName: "",
    query: "",
    sortBy: "relevance",
    maxResults: 100,
  });

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await getYouTubeResultsByChannel(filters);
      console.log("YouTube Results:", res);
      if (res) {
        // Capture videos from either .results (standard) or .data
        const videoData = res.results || (Array.isArray(res.data) ? res.data : []);
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
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      {/* <h4>Processing...</h4> */}
       {/* <Image src="/loader/loading.gif" alt="Loading..." width={100} height={100} /> */}


  <div className="box">
    <div className="bars">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
  
    </div>
  );
}

  return (
    <div style={{ minHeight: "100vh" }}>

  <PageHeader>

      </PageHeader>


      <div className="container mt-3">

    
        {/* Filter Card */}
        <div style={{ 
          backgroundColor: "#ffffff", 
          borderRadius: "12px", 
          padding: "12px", 
          marginBottom: "30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          border: "1px solid #e9ecef"
        }}>
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
              Search Filters
            </h6>
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
              <div className="input-group" style={{ borderRadius: "6px", overflow: "hidden" }}>
                <span className="input-group-text" style={{ border: "1px solid #dee2e6", backgroundColor: "#f8f9fa" }}>
                  <Globe size={16} style={{ color: "#6c757d" }} />
                </span>
                <input
                  type="text"
                  name="channelName"
                  value={filters.channelName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter channel name..."
                  style={{ border: "1px solid #dee2e6", fontSize: "0.85rem", padding: "8px 12px" }}
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
                      placeholder="Enter search terms..."
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
                          ? "#e9ecef"
                          : "#0d6efd",
                      color:
                        loading || !filters.channelName || !filters.query
                          ? "#6c757d"
                          : "#ffffff",
                      border: "none",
                      fontWeight: "600",
                      padding: "10px 16px",
                      borderRadius: "6px",
                      cursor:
                        loading || !filters.channelName || !filters.query
                          ? "not-allowed"
                          : "pointer",
                      fontSize: "0.95rem",
                      transition: "all 0.3s ease",
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
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "0.85rem", color: "#6c757d", marginBottom: "0" }}>
              {videos.length > 0 ? `Showing ${videos.length} video${videos.length !== 1 ? 's' : ''}` : "No videos to display"}
            </p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="container">
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #e9ecef"
      }}>
        <div className="table-responsive" style={{ overflowX: "auto", width: "100%", maxWidth: "100%" }}>
          <table style={{ 
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed"
          }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                <th style={{ 
                  padding: "10px",
                  textAlign: "left",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  color: "#495057",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "21%"
                }}>Video</th>
                <th style={{ 
                  padding: "10px",
                  textAlign: "left",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  color: "#495057",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "13%"
                }}>Channel</th>
                <th style={{ 
                  padding: "14px",
                  textAlign: "left",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  color: "#495057",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "13%"
                }}>Views</th>
                <th style={{ 
                  padding: "14px",
                  textAlign: "left",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  color: "#495057",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "12%"
                }}>Likes</th>
                <th style={{ 
                  padding: "14px",
                  textAlign: "left",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  color: "#495057",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "12%"
                }}>Comments</th>
                <th style={{ 
                  padding: "14px",
                  textAlign: "left",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  color: "#495057",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "13%"
                }}>Subscribers</th>
                <th style={{ 
                  padding: "14px",
                  textAlign: "left",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  color: "#495057",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "10%"
                }}>Published</th>

              </tr>
            </thead>
            <tbody>
              {videos.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "60px 20px", borderBottom: "1px solid #dee2e6" }}>
                    <div>
                      <AlertCircle size={48} style={{ color: "#dee2e6", marginBottom: "16px" }} />
                      <h5 style={{ color: "#6c757d", fontWeight: "500", marginBottom: "8px", fontSize: "1.1rem" }}>
                        No videos found
                      </h5>
                      <p style={{ color: "#adb5bd", marginBottom: "0", fontSize: "0.95rem" }}>
                        {filters.query ? "Try adjusting your search terms or filters" : "Enter a search query to find videos"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {videos.map((v, idx) => (
                <tr key={v.videoId} style={{
                  borderBottom: "1px solid #e9ecef",
                  transition: "background-color 0.2s ease",
                  backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8f9fa",
                  cursor: "pointer"
                }} 
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f4ff"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : "#f8f9fa"}
                >
                  <td style={{ padding: "12px", verticalAlign: "middle", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        width={48}
                        height={36}
                        style={{
                          borderRadius: "4px",
                          objectFit: "cover",
                          flexShrink: 0,
                          border: "1px solid #e9ecef"
                        }}
                      />
                      <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                        <div style={{
                          fontWeight: "500",
                          color: "#1a1a1a",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginBottom: "4px",
                          fontSize: "0.85rem"
                        }} title={v.title}>
                          {v.title}
                        </div>
                        <a href={v.link} target="_blank" rel="noopener noreferrer" style={{
                          fontSize: "0.75rem",
                          color: "#0d6efd",
                          textDecoration: "none",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block"
                        }}>
                          Watch Video →
                        </a>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "middle", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                      <div style={{
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
                        flexShrink: 0
                      }}>
                        {v.channelName.charAt(0).toUpperCase()}
                      </div>
                      <span style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: "0.85rem",
                        color: "#1a1a1a",
                        minWidth: 0
                      }} title={v.channelName}>
                        {v.channelName}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "middle", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Eye size={12} style={{ color: "#6c757d", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.8rem", color: "#1a1a1a", fontWeight: "500" }}>
                        {formatNumber(v.views)}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "middle", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <ThumbsUp size={12} style={{ color: "#6c757d", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.8rem", color: "#1a1a1a", fontWeight: "500" }}>
                        {formatNumber(v.likes)}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "middle", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <MessageCircle size={12} style={{ color: "#6c757d", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.8rem", color: "#1a1a1a", fontWeight: "500" }}>
                        {formatNumber(v.comments)}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "middle", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Users size={12} style={{ color: "#6c757d", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.8rem", color: "#1a1a1a", fontWeight: "500" }}>
                        {formatNumber(v.subscribers)}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px", verticalAlign: "middle", minWidth: 0 }}>
                    <span style={{ fontSize: "0.8rem", color: "#6c757d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                      {new Date(v.publishedDate).toLocaleDateString()}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {videos.length > 0 && (
          <div style={{
            padding: "16px",
            backgroundColor: "#f8f9fa",
            borderTop: "1px solid #dee2e6",
            fontSize: "0.9rem",
            color: "#6c757d"
          }}>
            Showing <strong>{videos.length}</strong> video{videos.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default YouTubeTable;
