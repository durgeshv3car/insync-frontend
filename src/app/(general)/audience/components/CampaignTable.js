"use client";

import React, { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import {
  Eye,
  ThumbsUp,
  MessageCircle,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Star } from "lucide-react";

function CampaignTable({ campaignData }) {
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [videosPerPage] = useState(20);

  const videos = Array.isArray(campaignData)
    ? campaignData.map((item) => item.youtubeQueryId).filter(Boolean)
    : [];

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


  return (
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
                    Select
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
                      width: "15%",
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
                      width: "11%",
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
                      width: "11%",
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
                      width: "10%",
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
                      width: "10%",
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
                      width: "10%",
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
                      width: "11%",
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
                      width: "5%",
                    }}
                  >
                    Region
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
                {videos.length === 0 && (
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
                          No campaign data available
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {paginatedVideos.map((v, idx) => (
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
                        textAlign: "center",
                        minWidth: 0,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedVideos.has(v.videoId)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleVideoSelect(v.videoId);
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
                            minWidth: 0,
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
                          {Number(v.views).toLocaleString()}
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
                          {Number(v.likes).toLocaleString()}
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
                          {Number(v.comments).toLocaleString()}
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
                          {Number(v.subscribers).toLocaleString()}
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
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        textAlign: "center",
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          backgroundColor: "#e9ecef",
                          color: "#495057",
                          borderRadius: "12px",
                          fontSize: "0.7rem",
                          fontWeight: "500",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {v.regionCode}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        textAlign: "center",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0px",
                        }}
                      >
                        {[
                          ...Array(
                            Math.max(0, Math.min(5, v.erBySubscribers || 0))
                          ),
                        ].map((_, i) => {
                          const starColor =
                            (v.erBySubscribers || 0) <= 0
                              ? "#dee2e6"
                              : (v.erBySubscribers || 0) === 1
                              ? "#ff6b6b"
                              : (v.erBySubscribers || 0) === 2
                              ? "#fd7e14"
                              : (v.erBySubscribers || 0) === 3
                              ? "#a1e57b"
                              : (v.erBySubscribers || 0) === 4
                              ? "#28a745"
                              : "#006400";

                          return (
                            <Star
                              key={i}
                              size={(v.erBySubscribers || 0) >= 5 ? 12 : 16}
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
                  <span style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                    Showing <strong>{startIndex + 1}</strong>-
                    <strong>{Math.min(endIndex, videos.length)}</strong> of{" "}
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
                            Math.min(currentPage + 1, totalPages)
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
  );
}

export default CampaignTable;
