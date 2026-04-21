"use client";

import React, { useRef } from "react";
import OverviewReport from "./overview/page";
import DeviceReport from "./device/page";
import DemographicsReport from "./demographics/page";
import { downloadDashboardPDF } from "@/utils/pdfExport";
import PageHeader from "@/components/shared/pageHeader/PageHeader";

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
    <>
      <PageHeader>
        <button
          className="btn btn-sm btn-ghost"
          onClick={downloadPDF}
          title="Download Data as PDF"
          style={{ textTransform: "none" }}
        >
          <i className="fas fa-download" style={{ marginRight: "8px" }} />{" "}
          Export PDF
        </button>
      </PageHeader>

      <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }} ref={mainContentRef}>
        {/* Stacked Content Rendering */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", paddingBottom: "4rem" }}>
          {/* Section 1: Overview */}
          <section>
            <OverviewReport />
          </section>



          {/* Section 2: Device */}
          <section>
            <DeviceReport />
          </section>



          {/* Section 3: Demographics */}
          <section>
            <DemographicsReport />
          </section>
        </div>
      </div>
    </>
  );
}
