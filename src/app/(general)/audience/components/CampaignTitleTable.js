"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Pencil, Users } from "lucide-react";

function CampaignTitleTable({ campaignData, onEdit, onDelete, onSelect }) {
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const videos = campaignData || [];

  const handleDelete = (e, id) => {
    e.stopPropagation();
    onDelete(id);
  };

  const handleEdit = (e, v) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(v);
  };

  return (
    <div
      style={{
        backgroundColor: "var(--card-bg)",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
        border: "1px solid var(--card-border)",
        margin: "12px 0",
        boxSizing: "border-box",
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
            <Users size={18} color="white" />
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
              All Audiences
            </h6>
            <p
              style={{
                margin: 0,
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                fontWeight: "500",
              }}
            >
              Click a row to view its video data
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
          {videos.length} {videos.length === 1 ? "Audience" : "Audiences"}
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
            tableLayout: "auto",
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
                  padding: "16px 20px",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  width: "80%",
                }}
              >
                Audience Title
              </th>
              <th
                style={{
                  padding: "16px 20px",
                  textAlign: "right",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--text-secondary)",
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
                  colSpan="2"
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    borderBottom: "none",
                  }}
                >
                  <div>
                    <AlertCircle
                      size={44}
                      style={{
                        color: "var(--text-secondary)",
                        opacity: 0.3,
                        marginBottom: "16px",
                      }}
                    />
                    <h5
                      style={{
                        color: "var(--text-secondary)",
                        fontWeight: "500",
                        marginBottom: "8px",
                        fontSize: "0.95rem",
                      }}
                    >
                      No audiences found
                    </h5>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        opacity: 0.7,
                        marginBottom: "0",
                        fontSize: "0.85rem",
                      }}
                    >
                      Click "Create Audiences" to create one.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {videos.map((v, idx) => (
              <tr
                key={v._id || idx}
                onClick={() => onSelect && onSelect(v)}
                className="app-table-row"
                style={{
                  cursor: "pointer",
                }}
              >
                <td
                  style={{
                    padding: "14px 20px",
                    verticalAlign: "middle",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "10px",
                        background:
                          "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        fontWeight: "700",
                        fontSize: "0.85rem",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
                      }}
                    >
                      {v.title ? v.title.charAt(0).toUpperCase() : "A"}
                    </div>
                    <span
                      style={{
                        fontWeight: "600",
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {v.title}
                    </span>
                  </div>
                </td>
                <td
                  style={{
                    padding: "14px 20px",
                    verticalAlign: "middle",
                    textAlign: "right",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={(e) => handleEdit(e, v)}
                      title="Edit Audience"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "8px",
                        border: "1px solid var(--card-border)",
                        backgroundColor: "var(--card-bg)",
                        color: "#3B82F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#2563EB";
                        e.currentTarget.style.color = "#FFFFFF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--card-bg)";
                        e.currentTarget.style.color = "#3B82F6";
                      }}
                    >
                      <Pencil
                        size={17}
                        className="text-blue-500 hover:text-white cursor-pointer"
                      />
                    </button>

                    <button
                      onClick={(e) => handleDelete(e, v._id)}
                      title="Delete Audience"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "8px",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        backgroundColor: "var(--card-bg)",
                        color: "#EF4444",
                        display: "flex",
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
                        e.currentTarget.style.backgroundColor =
                          "var(--card-bg)";
                        e.currentTarget.style.color = "#EF4444";
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CampaignTitleTable;
