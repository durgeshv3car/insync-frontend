"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  ThumbsUp,
  MessageCircle,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Trash,
  Film,
} from "lucide-react";
import { deleteCampaignData } from "@/services/campaignData";

function CampaignTable({ selectedAudience, campaignData }) {
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [videosPerPage] = useState(20);

  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const v = Array.isArray(campaignData)
      ? campaignData.map((item) => item.youtubeQueryId).filter(Boolean)
      : [];
    setVideos(v);
  }, [campaignData]);

  useEffect(() => {
    if (selectedVideos.size > 0) {
      const selectedData = videos.filter((v) => selectedVideos.has(v.videoId));
      const payload = {
        campaignData,
        videos: selectedData,
      };

      console.log("Selected Videos Data:", payload);
      console.log("Complete video objects:", selectedData);
    }
  }, [selectedVideos, videos]);

  const handleVideoSelect = (videoId) => {
    setSelectedVideos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const totalPages = Math.ceil(videos.length / videosPerPage);
  const startIndex = (currentPage - 1) * videosPerPage;
  const endIndex = startIndex + videosPerPage;
  const paginatedVideos = videos.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (video) => {
    try {
      const res = await deleteCampaignData(selectedAudience.value, video._id);

      if (res.message) {
        setVideos((prev) => prev.filter((v) => v._id !== video._id));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--card-bg)",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
        border: "1px solid var(--card-border)",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Card Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 22px 16px",
          borderBottom: "1px solid var(--card-border)",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #2563EB 0%, #6366F1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
              flexShrink: 0,
            }}
          >
            <Film size={18} color="white" />
          </div>
          <div>
            <h6
              style={{
                margin: 0,
                fontWeight: "800",
                fontSize: "0.95rem",
                color: "var(--text-primary)",
                letterSpacing: "-0.2px",
              }}
            >
              Video Data
            </h6>
            <p
              style={{
                margin: 0,
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                fontWeight: "500",
              }}
            >
              Audience campaign videos
            </p>
          </div>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "5px 14px",
            borderRadius: "20px",
            backgroundColor: "rgba(37, 99, 235, 0.1)",
            color: "#3B82F6",
            fontWeight: "700",
            fontSize: "0.8rem",
            border: "1px solid rgba(37, 99, 235, 0.2)",
          }}
        >
          {videos.length} {videos.length === 1 ? "video" : "videos"}
        </span>
      </div>

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
                  padding: "16px 14px",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "18%",
                }}
              >
                Video
              </th>
              <th
                style={{
                  padding: "16px 14px",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "12%",
                }}
              >
                Channel
              </th>
              <th
                style={{
                  padding: "16px 14px",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "11%",
                }}
              >
                Keyword
              </th>
              <th
                style={{
                  padding: "16px 14px",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "10%",
                }}
              >
                Views
              </th>
              <th
                style={{
                  padding: "16px 14px",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "9%",
                }}
              >
                Likes
              </th>
              <th
                style={{
                  padding: "16px 14px",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "9%",
                }}
              >
                Comments
              </th>
              <th
                style={{
                  padding: "16px 14px",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "11%",
                }}
              >
                Subscribers
              </th>
              <th
                style={{
                  padding: "16px 14px",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "8%",
                }}
              >
                Published
              </th>
              <th
                style={{
                  padding: "16px 14px",
                  textAlign: "center",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "6%",
                }}
              >
                Region
              </th>
              <th
                style={{
                  padding: "16px 14px",
                  textAlign: "center",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "8%",
                }}
              >
                ER Rate
              </th>
              <th
                style={{
                  padding: "16px 14px",
                  textAlign: "center",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "8%",
                }}
              >
                ACTION
              </th>
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 && (
              <tr>
                <td
                  colSpan="11"
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    borderBottom: "none",
                  }}
                >
                  <div>
                    <AlertCircle
                      size={44}
                      style={{ color: "var(--text-secondary)", opacity: 0.3, marginBottom: "16px" }}
                    />
                    <h5
                      style={{
                        color: "var(--text-secondary)",
                        fontWeight: "500",
                        marginBottom: "8px",
                        fontSize: "0.95rem",
                      }}
                    >
                      No videos found
                    </h5>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        opacity: 0.7,
                        marginBottom: "0",
                        fontSize: "0.85rem",
                      }}
                    >
                      No campaign video data available for this audience.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {paginatedVideos.map((v, idx) => (
              <tr
                key={v.videoId || idx}
                className="app-table-row"
              >
                <td
                  style={{
                    padding: "14px 12px",
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
                        borderRadius: "8px",
                        objectFit: "cover",
                        flexShrink: 0,
                        border: "1px solid var(--card-border)",
                      }}
                    />
                    <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginBottom: "2px",
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
                          fontWeight: "600",
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
                    padding: "14px 12px",
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
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(59, 130, 246, 0.15)",
                        fontWeight: "700",
                        fontSize: "0.78rem",
                        color: "#3B82F6",
                        flexShrink: 0,
                      }}
                    >
                      {v.channelName ? v.channelName.charAt(0).toUpperCase() : "C"}
                    </div>
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        color: "var(--text-primary)",
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
                    padding: "14px 12px",
                    verticalAlign: "middle",
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: "20px",
                      backgroundColor: "rgba(37, 99, 235, 0.12)",
                      color: "#3B82F6",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={v.query}
                  >
                    {v.query}
                  </span>
                </td>
                <td
                  style={{
                    padding: "14px 12px",
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
                      size={14}
                      style={{ color: "#3B82F6", flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-primary)",
                        fontWeight: "600",
                      }}
                    >
                      {Number(v.views).toLocaleString()}
                    </span>
                  </div>
                </td>
                <td
                  style={{
                    padding: "14px 12px",
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
                      size={14}
                      style={{ color: "#3B82F6", flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-primary)",
                        fontWeight: "600",
                      }}
                    >
                      {Number(v.likes).toLocaleString()}
                    </span>
                  </div>
                </td>
                <td
                  style={{
                    padding: "14px 12px",
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
                      size={14}
                      style={{ color: "#3B82F6", flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-primary)",
                        fontWeight: "600",
                      }}
                    >
                      {Number(v.comments).toLocaleString()}
                    </span>
                  </div>
                </td>
                <td
                  style={{
                    padding: "14px 12px",
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
                      size={14}
                      style={{ color: "#3B82F6", flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-primary)",
                        fontWeight: "600",
                      }}
                    >
                      {Number(v.subscriberCount).toLocaleString()}
                    </span>
                  </div>
                </td>
                <td
                  style={{
                    padding: "14px 12px",
                    verticalAlign: "middle",
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      fontWeight: "500",
                    }}
                  >
                    {v.publishedAt ? v.publishedAt.split("T")[0] : "-"}
                  </span>
                </td>
                <td
                  style={{
                    padding: "14px 12px",
                    verticalAlign: "middle",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                    }}
                  >
                    {v.region || "US"}
                  </span>
                </td>
                <td
                  style={{
                    padding: "14px 12px",
                    verticalAlign: "middle",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "#10B981",
                    }}
                  >
                    {v.erRate ? `${v.erRate}%` : "0%"}
                  </span>
                </td>
                <td
                  style={{
                    padding: "14px 12px",
                    verticalAlign: "middle",
                    textAlign: "center",
                  }}
                >
                  <button
                    onClick={() => handleDelete(v)}
                    title="Delete Video from Audience"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      backgroundColor: "var(--card-bg)",
                      color: "#EF4444",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#EF4444";
                      e.currentTarget.style.color = "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--card-bg)";
                      e.currentTarget.style.color = "#EF4444";
                    }}
                  >
                    <Trash size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Section */}
        {videos.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              padding: "18px 24px",
              backgroundColor: "var(--card-bg)",
              borderTop: "1px solid var(--card-border)",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            {/* Count Info */}
            <span
              style={{
                fontSize: "0.83rem",
                color: "var(--text-secondary)",
                fontWeight: "500",
              }}
            >
              Showing{" "}
              <strong style={{ color: "var(--text-primary)" }}>{startIndex + 1}</strong>–
              <strong style={{ color: "var(--text-primary)" }}>{Math.min(endIndex, videos.length)}</strong>{" "}
              of{" "}
              <strong style={{ color: "var(--text-primary)" }}>{videos.length}</strong>
            </span>

            {/* Pagination Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {/* First */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "8px",
                  border: "1px solid var(--card-border)",
                  backgroundColor: currentPage === 1 ? "var(--table-header-bg)" : "var(--card-bg)",
                  color: currentPage === 1 ? "var(--text-secondary)" : "var(--text-primary)",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  opacity: currentPage === 1 ? 0.5 : 1,
                  transition: "all 0.15s ease",
                }}
              >«</button>

              {/* Prev */}
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "8px",
                  border: "1px solid var(--card-border)",
                  backgroundColor: currentPage === 1 ? "var(--table-header-bg)" : "var(--card-bg)",
                  color: currentPage === 1 ? "var(--text-secondary)" : "var(--text-primary)",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: currentPage === 1 ? 0.5 : 1,
                  transition: "all 0.15s ease",
                }}
              ><ChevronLeft size={14} /></button>

              {/* Current Page */}
              <span
                style={{
                  minWidth: "34px",
                  height: "34px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #2563EB 0%, #6366F1 100%)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  padding: "0 10px",
                  boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
                }}
              >{currentPage} / {totalPages}</span>

              {/* Next */}
              <button
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "8px",
                  border: "1px solid var(--card-border)",
                  backgroundColor: currentPage === totalPages ? "var(--table-header-bg)" : "var(--card-bg)",
                  color: currentPage === totalPages ? "var(--text-secondary)" : "var(--text-primary)",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  transition: "all 0.15s ease",
                }}
              ><ChevronRight size={14} /></button>

              {/* Last */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "8px",
                  border: "1px solid var(--card-border)",
                  backgroundColor: currentPage === totalPages ? "var(--table-header-bg)" : "var(--card-bg)",
                  color: currentPage === totalPages ? "var(--text-secondary)" : "var(--text-primary)",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  transition: "all 0.15s ease",
                }}
              >»</button>
            </div>

            {/* Go to page */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label
                htmlFor="aud-jumpToPage"
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  fontWeight: "600",
                  margin: 0,
                  whiteSpace: "nowrap",
                }}
              >
                Go to:
              </label>
              <input
                id="aud-jumpToPage"
                type="number"
                className="app-input"
                style={{
                  width: "65px",
                  padding: "5px 8px",
                  fontSize: "0.82rem",
                  textAlign: "center",
                  color: "var(--text-primary)",
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
  );
}

export default CampaignTable;
