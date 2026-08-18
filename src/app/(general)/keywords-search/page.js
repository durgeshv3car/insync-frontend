"use client";

import React, { useState } from "react";
import YouTubeTableChannelCampaign from "./components/ChannelCampaign";
import YouTubeTableKeywordCampaign from "./components/KeywordCampaign";
import PageHeader from "@/components/shared/pageHeader/PageHeader";

function Page() {
  const [searchType, setSearchType] = useState("keyword");

  return (
    <div className="app-page-wrapper">
      {/* Header */}
      <PageHeader />

      {/* Content */}
      <div
        className="page-section"
        key={searchType}
        style={{
          animation: "fadeInUp 0.4s ease-out forwards",
        }}
      >
        {searchType === "channel" ? (
          <YouTubeTableChannelCampaign
            searchType={searchType}
            setSearchType={setSearchType}
          />
        ) : (
          <YouTubeTableKeywordCampaign
            searchType={searchType}
            setSearchType={setSearchType}
          />
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Page;
