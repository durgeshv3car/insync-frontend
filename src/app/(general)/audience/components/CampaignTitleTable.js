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

function CampaignTitleTable({
  campaignData,
  onEdit ,
  onDelete ,
}) {
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [currentPage] = useState(1);
  const [videosPerPage] = useState(20);

  const videos = campaignData;

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

  // Frontend pagination disabled — backend will handle it.
  const totalPages = 1;
  const startIndex = 0;
  const endIndex = videos.length;
  const paginatedVideos = videos;

  // No-op on frontend; kept to preserve UI but disable functionality.
  const handlePageChange = (page) => {};
  const handleDelete=(id)=>{
    onDelete(id);
  }

  const handleEdit=(e,v)=>{
    e.preventDefault();
    onEdit(v);
  }

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #e9ecef",
        margin: "12px 0",
        boxSizing: "border-box",
      }}
    >
      <div
        className="table-responsive"
        style={{ overflowX: "auto", width: "100%", maxWidth: "100%"}}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "auto",
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
                  padding: "14px 16px",
                  textAlign: "left",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  color: "#495057",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "80%",
                }}
              >
                Title
              </th>
              <th
                style={{
                  padding: "14px 16px",
                  textAlign: "right",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  color: "#495057",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "20%",
                }}
              >
                Action
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
                    padding: "14px 16px",
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
                    <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
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
                    </div>
                  </div>
                </td>
                <td
                  style={{
                    padding: "14px 16px",
                    verticalAlign: "middle",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "8px",
                      minWidth: 0,
                    }}
                  >
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={(e) => {
                          handleEdit(e, v);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          handleDelete(v._id || v.id || v);
                        }}
                      >
                        Delete
                      </button>
                    </div>
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
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                Showing <strong>{startIndex + 1}</strong>-
                <strong>{Math.min(endIndex, videos.length)}</strong> of{" "}
                <strong>{videos.length}</strong>
              </span>
            </div>

            <nav aria-label="Page navigation">
              <ul className="pagination pagination-sm mb-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
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
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
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
                      for (let i = currentPage - 1; i <= currentPage + 1; i++)
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
                      handlePageChange(Math.min(currentPage + 1, totalPages))
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

export default CampaignTitleTable;
