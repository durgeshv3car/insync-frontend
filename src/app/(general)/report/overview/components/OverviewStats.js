"use client";

import React from "react";
import { TrendingUp, Users, Target, BarChart3 } from "lucide-react";

function OverviewStats() {
  const leftStats = [
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
  ];

  const rightStats = [
    {
      title: "Total Videos",
      value: "245",
      icon: <BarChart3 size={24} />,
      color: "#fd7e14",
      bgColor: "#fff3e0",
    },
    {
      title: "Growth Rate",
      value: "32%",
      icon: <TrendingUp size={24} />,
      color: "#dc3545",
      bgColor: "#ffebee",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        marginBottom: "30px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h6
          style={{
            fontSize: "0.9rem",
            fontWeight: "600",
            color: "#1a1a1a",
            margin: "0 0 8px 0",
          }}
        >
          Campaign Overview
        </h6>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {leftStats.map((stat, idx) => (
            <div
              key={idx}
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
                  backgroundColor: stat.bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: stat.color,
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.75rem", color: "#6c757d", margin: 0 }}>
                  {stat.title}
                </p>
                <h4
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "#1a1a1a",
                    margin: "4px 0 0 0",
                  }}
                >
                  {stat.value}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h6
          style={{
            fontSize: "0.9rem",
            fontWeight: "600",
            color: "#1a1a1a",
            margin: "0 0 8px 0",
          }}
        >
          Performance Metrics
        </h6>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {rightStats.map((stat, idx) => (
            <div
              key={idx}
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
                  backgroundColor: stat.bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: stat.color,
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.75rem", color: "#6c757d", margin: 0 }}>
                  {stat.title}
                </p>
                <h4
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "#1a1a1a",
                    margin: "4px 0 0 0",
                  }}
                >
                  {stat.value}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OverviewStats;
