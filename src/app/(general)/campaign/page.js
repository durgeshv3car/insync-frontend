import React from 'react'
import Campaign from './components/Campaign'
import PageHeader from "@/components/shared/pageHeader/PageHeader";

function page() {
  return (
    <div className="app-page-wrapper">
      <PageHeader />
      <Campaign />
    </div>
  );
}

export default page