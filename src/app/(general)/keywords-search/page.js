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
        {/* Dynamic Component Rendering */}
        <div className="animate-fade-in">
          {searchType === 'channel' ? (
            <YouTubeTableChannelCampaign searchType={searchType} setSearchType={setSearchType} />
          ) : (
            <YouTubeTableKeywordCampaign searchType={searchType} setSearchType={setSearchType} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Page