"use client";
import React, { useState } from 'react'
import YouTubeTableChannelCampaign from './components/ChannelCampaign'
import YouTubeTableKeywordCampaign from './components/KeywordCampaign'
import PageHeader from '@/components/shared/pageHeader/PageHeader';

function Page() {
  const [searchType, setSearchType] = useState('keyword'); // 'keyword' or 'channel'

  return (
    <div style={{ minHeight: "100vh" }}>
      <PageHeader />
      
      <div className="container mt-4">
        {/* Dynamic Component Rendering with Smooth Transition */}
        <div 
          key={searchType}
          style={{
            animation: "fadeInUp 0.4s ease-out forwards",
          }}
        >
          {searchType === 'channel' ? (
            <YouTubeTableChannelCampaign searchType={searchType} setSearchType={setSearchType} />
          ) : (
            <YouTubeTableKeywordCampaign searchType={searchType} setSearchType={setSearchType} />
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
    </div>
  )
}

export default Page