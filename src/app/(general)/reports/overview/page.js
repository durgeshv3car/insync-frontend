"use client";

import React from "react";
import { TrendingUp, Users, Target, BarChart3, Eye, Heart, MessageCircle } from "lucide-react";

function OverviewPage() {
  const leftCards = [
    {
      title: "Total Campaigns",
      value: "12",
      icon: <Target size={24} />,
      color: "#0d6efd",
      bgColor: "#e7f1ff",
    },
    {
      title: "Active Audiences",
      value: "8",
      icon: <Users size={24} />,
      color: "#198754",
      bgColor: "#e8f5e9",
    },
    {
      title: "Total Videos",
      value: "245",
      icon: <BarChart3 size={24} />,
      color: "#fd7e14",
      bgColor: "#fff3e0",
    },
  ];

  const rightCards = [
    {
      title: "Total Views",
      value: "2.4M",
      icon: <Eye size={24} />,
      color: "#0d6efd",
      bgColor: "#e7f1ff",
    },
    {
      title: "Total Likes",
      value: "156K",
      icon: <Heart size={24} />,
      color: "#dc3545",
      bgColor: "#ffebee",
    },

  ];

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
  ];

  const additionalCards = [
    {
      title: "Revenue",
      value: "$12.5K",
      icon: <BarChart3 size={24} />,
      color: "#0d6efd",
      bgColor: "#e7f1ff",
    },
    {
      title: "ROI",
      value: "245%",
      icon: <TrendingUp size={24} />,
      color: "#198754",
      bgColor: "#e8f5e9",
    },
  ];

  const additionalTableData = [
    {
      id: 1,
      metric: "Top Video",
      value: "Summer Promo",
      views: "245,320",
      status: "Trending",
    },
    {
      id: 2,
      metric: "Best Engagement",
      value: "Product Launch",
      views: "189,450",
      status: "Active",
    },
    {
      id: 3,
      metric: "Most Shared",
      value: "Brand Awareness",
      views: "567,890",
      status: "Completed",
    },
  ];

  const thirdSectionTableData = [
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

  const renderCard = (card) => (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #e9ecef",
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "8px",
          backgroundColor: card.bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: card.color,
          flexShrink: 0,
        }}
      >
        {card.icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "0.75rem", color: "#6c757d", margin: 0 }}>
          {card.title}
        </p>
        <h4
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "#1a1a1a",
            margin: "4px 0 0 0",
          }}
        >
          {card.value}
        </h4>
      </div>
    </div>
  );

  const renderAdditionalCard = (card) => (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #e9ecef",
      }}
    >
      <p style={{ fontSize: "0.75rem", color: "#6c757d", margin: 0, marginBottom: "8px" }}>
        {card.title}
      </p>
      <h4
        style={{
          fontSize: "1.25rem",
          fontWeight: "700",
          color: "#1a1a1a",
          margin: "0 0 12px 0",
        }}
      >
        {card.value}
      </h4>
      <p style={{ fontSize: "0.85rem", color: "#495057", margin: 0 }}>
        {card.subtitle}
      </p>
      <p style={{ fontSize: "0.8rem", color: "#6c757d", margin: "8px 0 0 0" }}>
        {card.metric}
      </p>
    </div>
  );

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: "700",
            color: "#1a1a1a",
            marginBottom: "8px",
          }}
        >
          Overview
        </h1>
        <p style={{ fontSize: "0.95rem", color: "#6c757d", margin: 0 }}>
          Monitor your campaigns and audience performance metrics
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Left Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Cards on top - 3 cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            {leftCards.map((card, idx) => (
              <div key={idx}>{renderCard(card)}</div>
            ))}
          </div>

          {/* Table below cards */}
          <div>
            <h6
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#1a1a1a",
                marginBottom: "16px",
              }}
            >
              Recent Campaigns
            </h6>
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
                    {tableData.map((row, idx) => (
                      <tr
                        key={row.id}
                        style={{
                          borderBottom: "1px solid #e9ecef",
                          backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8f9fa",
                        }}
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
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 12px",
                              backgroundColor: "#d4edda",
                              color: "#155724",
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                            }}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* 4 cards on top */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {rightCards.map((card, idx) => (
              <div key={idx}>{renderCard(card)}</div>
            ))}
          </div>

          {/* Additional cards section */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {additionalCards.map((card, idx) => (
              <div key={idx}>{renderCard(card)}</div>
            ))}
          </div>

          {/* Table section */}
          <div>
            <h6
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#1a1a1a",
                marginBottom: "16px",
              }}
            >
              Performance Details
            </h6>
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
                        Metric
                      </th>
                      <th style={{ padding: "14px", textAlign: "left", fontSize: "0.8rem", fontWeight: "700", color: "#495057" }}>
                        Value
                      </th>
                      <th style={{ padding: "14px", textAlign: "left", fontSize: "0.8rem", fontWeight: "700", color: "#495057" }}>
                        Views
                      </th>
                      <th style={{ padding: "14px", textAlign: "center", fontSize: "0.8rem", fontWeight: "700", color: "#495057" }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {additionalTableData.map((row, idx) => (
                      <tr
                        key={row.id}
                        style={{
                          borderBottom: "1px solid #e9ecef",
                          backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8f9fa",
                        }}
                      >
                        <td style={{ padding: "14px", fontSize: "0.9rem", color: "#1a1a1a", fontWeight: "500" }}>
                          {row.metric}
                        </td>
                        <td style={{ padding: "14px", fontSize: "0.9rem", color: "#6c757d" }}>
                          {row.value}
                        </td>
                        <td style={{ padding: "14px", fontSize: "0.9rem", color: "#1a1a1a" }}>
                          {row.views}
                        </td>
                        <td style={{ padding: "14px", textAlign: "center" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 12px",
                              backgroundColor: row.status === "Trending" ? "#fff3cd" : row.status === "Completed" ? "#cfe2ff" : "#d4edda",
                              color: row.status === "Trending" ? "#997404" : row.status === "Completed" ? "#084298" : "#155724",
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                            }}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3rd Section - Full Width Table */}
      <div style={{ marginTop: "30px" }}>
        <h6
          style={{
            fontSize: "1rem",
            fontWeight: "600",
            color: "#1a1a1a",
            marginBottom: "16px",
          }}
        >
          All Campaigns
        </h6>
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
                {thirdSectionTableData.map((row, idx) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: "1px solid #e9ecef",
                      backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8f9fa",
                    }}
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
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          backgroundColor: row.status === "Active" ? "#d4edda" : row.status === "Completed" ? "#cfe2ff" : "#fff3cd",
                          color: row.status === "Active" ? "#155724" : row.status === "Completed" ? "#084298" : "#997404",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewPage;