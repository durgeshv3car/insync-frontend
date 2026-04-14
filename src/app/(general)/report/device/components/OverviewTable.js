"use client";

import React, { useState } from "react";
import { Eye, ThumbsUp, MessageCircle, Users, ChevronLeft, ChevronRight } from "lucide-react";

function OverviewTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const tableData = [
    {
      id: 1,
      campaignName: "Summer Promo 2024",
      audience: "Tech Enthusiasts",
      videos: 5,
      views: "245,320",
      engagement: "8.5%",
      status: "Active",
    },
    {
      id: 2,
      campaignName: "Product Launch",
      audience: "Business Professionals",
      videos: 8,
      views: "189,450",
      engagement: "12.3%",
      status: "Active",
    },
    {
      id: 3,
      campaignName: "Brand Awareness",
      audience: "General Audience",
      videos: 12,
      views: "567,890",
      engagement: "6.2%",
      status: "Completed",
    },
    {
      id: 4,
      campaignName: "Holiday Special",
      audience: "Shoppers",
      videos: 15,
      views: "423,120",
      engagement: "9.8%",
      status: "Active",
    },
    {
      id: 5,
      campaignName: "Educational Series",
      audience: "Students",
      videos: 20,
      views: "312,560",
      engagement: "15.4%",
      status: "Active",
    },
    {
      id: 6,
      campaignName: "Influencer Collab",
      audience: "Social Media Users",
      videos: 6,
      views: "892,340",
      engagement: "22.1%",
      status: "Completed",
    },
    {
      id: 7,
      campaignName: "Regional Focus",
      audience: "Local Customers",
      videos: 10,
      views: "156,780",
      engagement: "11.6%",
      status: "Active",
    },
    {
      id: 8,
      campaignName: "B2B Initiative",
      audience: "Enterprise",
      videos: 7,
      views: "87,340",
      engagement: "18.9%",
      status: "Planning",
    },
  ];

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = tableData.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const statusStyles = {
      Active: { bg: "#d4edda", color: "#155724" },
      Completed: { bg: "#cfe2ff", color: "#084298" },
      Planning: { bg: "#fff3cd", color: "#997404" },
    };

    const style = statusStyles[status] || statusStyles.Active;

    return (
      <span
        style={{
          display: "inline-block",
          padding: "4px 12px",
          backgroundColor: style.bg,
          color: style.color,
          borderRadius: "12px",
          fontSize: "0.75rem",
          fontWeight: "600",
        }}
      >
        {status}
      </span>
    );
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
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
              <th style={{ padding: "14px", textAlign: "left", fontSize: "0.8rem", fontWeight: "700", color: "#495057" }}>
                Campaign Name
              </th>
              <th style={{ padding: "14px", textAlign: "left", fontSize: "0.8rem", fontWeight: "700", color: "#495057" }}>
                Audience
              </th>
              <th style={{ padding: "14px", textAlign: "center", fontSize: "0.8rem", fontWeight: "700", color: "#495057" }}>
                Videos
              </th>
              <th style={{ padding: "14px", textAlign: "left", fontSize: "0.8rem", fontWeight: "700", color: "#495057" }}>
                Views
              </th>
              <th style={{ padding: "14px", textAlign: "left", fontSize: "0.8rem", fontWeight: "700", color: "#495057" }}>
                Engagement
              </th>
              <th style={{ padding: "14px", textAlign: "center", fontSize: "0.8rem", fontWeight: "700", color: "#495057" }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={row.id}
                style={{
                  borderBottom: "1px solid #e9ecef",
                  backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8f9fa",
                  transition: "background-color 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f4ff")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : "#f8f9fa")
                }
              >
                <td style={{ padding: "14px", fontSize: "0.9rem", color: "#1a1a1a", fontWeight: "500" }}>
                  {row.campaignName}
                </td>
                <td style={{ padding: "14px", fontSize: "0.9rem", color: "#6c757d" }}>
                  {row.audience}
                </td>
                <td style={{ padding: "14px", textAlign: "center", fontSize: "0.9rem", color: "#1a1a1a", fontWeight: "500" }}>
                  {row.videos}
                </td>
                <td style={{ padding: "14px", fontSize: "0.9rem", color: "#1a1a1a" }}>
                  {row.views}
                </td>
                <td style={{ padding: "14px", fontSize: "0.9rem", color: "#1a1a1a", fontWeight: "600" }}>
                  {row.engagement}
                </td>
                <td style={{ padding: "14px", textAlign: "center" }}>
                  {getStatusBadge(row.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {tableData.length > itemsPerPage && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            backgroundColor: "#f8f9fa",
            borderTop: "1px solid #dee2e6",
          }}
        >
          <span style={{ fontSize: "0.9rem", color: "#6c757d" }}>
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, tableData.length)} of {tableData.length}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: "6px 12px",
                border: "1px solid #dee2e6",
                backgroundColor: "#ffffff",
                borderRadius: "4px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                opacity: currentPage === 1 ? 0.5 : 1,
                fontSize: "0.9rem",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  padding: "6px 10px",
                  border: currentPage === i + 1 ? "1px solid #0d6efd" : "1px solid #dee2e6",
                  backgroundColor: currentPage === i + 1 ? "#0d6efd" : "#ffffff",
                  color: currentPage === i + 1 ? "#ffffff" : "#1a1a1a",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: currentPage === i + 1 ? "600" : "400",
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: "6px 12px",
                border: "1px solid #dee2e6",
                backgroundColor: "#ffffff",
                borderRadius: "4px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                opacity: currentPage === totalPages ? 0.5 : 1,
                fontSize: "0.9rem",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OverviewTable;
