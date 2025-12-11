"use client"
import React, { useState } from 'react';
import NewReport from './FilterComponents/NewReport';

const ReportsFilter = () => {
  const [filters, setFilters] = useState({
    advertiser: 'Intellectads- Fly Dubai (USD)',
    campaign: 'All campaigns',
    country: 'All countries',
    sort: 'View by date',
    view: 'Client view',
    dateRange: '24 Sep, 2025 - 30 Sep, 2025',
    widgets: 'Age groups, App/Site names, App/Site na...'
  });

  const [showNewReportModal, setShowNewReportModal] = useState(false);

  const handleSaveNewReport = (reportData) => {
    console.log('New Report Created:', reportData);
    setShowNewReportModal(false);
  };

  return (
    <div className="">
      {/* Header */}
      <div className="bg-white border-bottom">
        <div className="container-fluid py-3 px-4">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h4 mb-0 text-dark fw-normal">Reports</h1>
            <div className="d-flex gap-3">
                <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" onClick={() => setShowNewReportModal(true)}>
                    create new report
                    </button>
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 position-relative">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
                </svg>
                Filter
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary" style={{fontSize: '10px', padding: '2px 6px'}}>
                  4
                </span>
              </button>
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white border-bottom shadow-sm">
        <div className="container-fluid py-2 px-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h6 mb-0 fw-semibold text-dark">Filter</h2>
            <button className="btn btn-link text-decoration-none text-secondary p-0" style={{fontSize: '12px'}}>
              Clear all
            </button>
          </div>

          {/* Filters Grid */}
          <div className="row g-2 mb-3">
            <div className="col-lg-2 col-md-3">
              <label className="form-label text-muted small mb-1">Advertiser</label>
              <select className="form-select form-select-sm" value={filters.advertiser} onChange={(e) => setFilters({...filters, advertiser: e.target.value})}>
                <option>Intellectads- Fly Dubai (USD)</option>
                <option>Other Advertiser</option>
              </select>
            </div>
            <div className="col-lg-2 col-md-3">
              <label className="form-label text-muted small mb-1">Campaign</label>
              <select className="form-select form-select-sm text-muted" value={filters.campaign} onChange={(e) => setFilters({...filters, campaign: e.target.value})}>
                <option>All campaigns</option>
                <option>Campaign 1</option>
                <option>Campaign 2</option>
              </select>
            </div>
            <div className="col-lg-2 col-md-3">
              <label className="form-label text-muted small mb-1">Country</label>
              <select className="form-select form-select-sm text-muted" value={filters.country} onChange={(e) => setFilters({...filters, country: e.target.value})}>
                <option>All countries</option>
                <option>Lithuania</option>
                <option>Latvia</option>
                <option>Moldova</option>
              </select>
            </div>
            <div className="col-lg-2 col-md-3">
              <label className="form-label text-muted small mb-1">Sort</label>
              <select className="form-select form-select-sm" value={filters.sort} onChange={(e) => setFilters({...filters, sort: e.target.value})}>
                <option>View by date</option>
                <option>View by impressions</option>
                <option>View by clicks</option>
              </select>
            </div>
            <div className="col-lg-2 col-md-3">
              <label className="form-label text-muted small mb-1">View</label>
              <select className="form-select form-select-sm" value={filters.view} onChange={(e) => setFilters({...filters, view: e.target.value})}>
                <option>Client view</option>
                <option>Admin view</option>
              </select>
            </div>
            <div className="col-lg-2 col-md-3">
              <label className="form-label text-muted small mb-1">Dates</label>
              <div className="input-group input-group-sm">
                <input 
                  type="text" 
                  className="form-control form-control-sm" 
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                />
                <span className="input-group-text bg-white p-1">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Widgets and Update Button Row */}
          <div className="row g-2">
            <div className="col-lg-4 col-md-6">
              <label className="form-label text-muted small mb-1">Select widgets</label>
              <select className="form-select form-select-sm text-truncate" value={filters.widgets} onChange={(e) => setFilters({...filters, widgets: e.target.value})}>
                <option>Age groups, App/Site names, App/Site na...</option>
                <option>All widgets</option>
                <option>Custom selection</option>
              </select>
            </div>
            <div className="col-lg-2 col-md-6 d-flex align-items-end">
              <button className="btn btn-primary btn-sm w-100">
                Update report
              </button>
            </div>
          </div>
        </div>
      </div>

  
      {/* Bootstrap Icons CSS - Add this to your project */}
      <style>{`
        .form-select-sm,
        .form-control-sm {
          font-size: 12px;
          padding: 0.3rem 0.5rem;
          border-color: #dee2e6;
          height: 32px;
        }
        
        .form-select-sm:focus,
        .form-control-sm:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
        }
        
        .form-label {
          font-weight: 500;
          font-size: 11px;
          line-height: 1.2;
        }
        
        .btn-sm {
          font-size: 12px;
          padding: 0.3rem 0.6rem;
          height: 32px;
        }
        
        .input-group-text {
          border-left: 0;
          background-color: white;
          color: #6c757d;
          padding: 0.3rem 0.5rem;
          font-size: 11px;
        }
        
        .form-control-sm {
          border-right: 0;
        }
        
        .bg-light {
          background-color: #f8f9fa !important;
        }
        
        .input-group-sm {
          gap: 0;
        }
      `}</style>

      <NewReport 
        show={showNewReportModal} 
        onClose={() => setShowNewReportModal(false)} 
        onSave={handleSaveNewReport} 
      />
    </div>
  );
};

export default ReportsFilter;