import React from 'react'
import YouTubeTable from './components/Campaign'
import PageHeader from "@/components/shared/pageHeader/PageHeader";

function page() {
  return (
    <div className="app-page-wrapper">
      <PageHeader />
      <YouTubeTable />
    </div>
  );
}

export default page