"use client";

import React, { useRef } from "react";
import OverviewReport from "./overview/page";
import DeviceReport from "./device/page";
import DemographicsReport from "./demographics/page";
import { downloadDashboardPDF } from "@/utils/pdfExport";
import { FiDownload } from "react-icons/fi";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import "./overview/styles.css";
import "./device/styles.css";
import "./demographics/styles.css";

export default function UnifiedReportDashboard() {
  const mainContentRef = useRef(null);

  const downloadPDF = () => {
    let dateText = "All Time";
    if (typeof window !== "undefined") {
      const selectedRange = localStorage.getItem("selectedRange");
      if (selectedRange === "CUSTOM") {
        const start = localStorage.getItem("startDate");
        const end = localStorage.getItem("endDate");
        if (start && end) dateText = `${start} to ${end}`;
      } else if (selectedRange) {
        dateText = selectedRange;
      }
    }

    downloadDashboardPDF(mainContentRef, "data_Report", dateText, true);
  };

  return (
    <div className="app-page-wrapper">
      <PageHeader>
        <button
          className="report-export-btn"
          onClick={downloadPDF}
          title="Download Data as PDF"
        >
          <FiDownload size={14} />
          <span>Export PDF</span>
        </button>
      </PageHeader>

      <div
        ref={mainContentRef}
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--page-bg)",
          transition: "background-color 0.25s ease",
        }}
      >
        {/* Stacked Content Rendering */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            paddingBottom: "2rem",
          }}
        >
          {/* Section 1: Overview */}
          <section style={{ margin: 0, padding: 0 }}>
            <OverviewReport />
          </section>

          {/* Section 2: Device */}
          <section style={{ margin: 0, padding: 0 }}>
            <DeviceReport />
          </section>

          {/* Section 3: Demographics */}
          <section style={{ margin: 0, padding: 0 }}>
            <DemographicsReport />
          </section>
        </div>
      </div>
    </div>
  );
}
