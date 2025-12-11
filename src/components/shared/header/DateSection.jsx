import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

function DateSection() {
  const [show, setShow] = useState(false);
  const [selectedRange, setSelectedRange] = useState('Select Date');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const dropdownRef = useRef(null);

  const dateRanges = [
    { value: 'CURRENT_DAY', label: 'Current Day', description: 'Today' },
    { value: 'PREVIOUS_DAY', label: 'Previous Day', description: 'Yesterday' },
    { value: 'WEEK_TO_DATE', label: 'Week to Date', description: 'Since Sunday' },
    { value: 'MONTH_TO_DATE', label: 'Month to Date', description: 'Since start of month' },
    { value: 'QUARTER_TO_DATE', label: 'Quarter to Date', description: 'Since start of quarter' },
    { value: 'YEAR_TO_DATE', label: 'Year to Date', description: 'Since start of year' },
    { value: 'PREVIOUS_WEEK', label: 'Previous Week', description: 'Last completed week' },
    { value: 'PREVIOUS_MONTH', label: 'Previous Month', description: 'Last completed month' },
    { value: 'PREVIOUS_QUARTER', label: 'Previous Quarter', description: 'Last completed quarter' },
    { value: 'PREVIOUS_YEAR', label: 'Previous Year', description: 'Last completed year' },
    { value: 'LAST_7_DAYS', label: 'Last 7 Days', description: 'Excluding today' },
    { value: 'LAST_14_DAYS', label: 'Last 14 Days', description: 'Excluding today' },
    { value: 'LAST_30_DAYS', label: 'Last 30 Days', description: 'Excluding today' },
    { value: 'LAST_60_DAYS', label: 'Last 60 Days', description: 'Excluding today' },
    { value: 'LAST_90_DAYS', label: 'Last 90 Days', description: 'Excluding today' },
    { value: 'LAST_365_DAYS', label: 'Last 365 Days', description: 'Excluding today' },
    { value: 'ALL_TIME', label: 'All Time', description: 'All available data' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show]);

  const handleRangeSelect = (range) => {
    setSelectedRange(range);
    setIsCustom(false);
  };

  const handleCustomDate = () => {
    setIsCustom(true);
    setSelectedRange('CUSTOM');
  };

  const handleApply = () => {
    const result = isCustom 
      ? { type: 'CUSTOM_DATES', startDate: customStartDate, endDate: customEndDate }
      : { type: selectedRange };
    
    console.log('Selected Date Range:', result);
    setShow(false);
  };

  const getSelectedLabel = () => {
    if (isCustom && customStartDate && customEndDate) {
      return `${customStartDate} to ${customEndDate}`;
    }
    return dateRanges.find(r => r.value === selectedRange)?.label || 'Select Date Range';
  };

  return (
    <div className="p-3">
      <div className="dropdown" ref={dropdownRef}>
        <button 
          className="btn btn-light border d-flex align-items-center gap-2"
          type="button"
          onClick={() => setShow(!show)}
          style={{ fontSize: '10px' }}
        >
          <Calendar size={16} />
          <span>{getSelectedLabel()}</span>
          <ChevronDown 
            size={16} 
            style={{ 
              transform: show ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }} 
          />
        </button>

        <div 
          className={`dropdown-menu ${show ? 'show' : ''}`}
          style={{ 
            width: '600px', 
            maxWidth: '90vw',
            left: 0,
            right: 'auto'
          }}
        >
          <div className="row g-0">
            {/* Left Section - Preset Ranges */}
            <div className="col-md-6 border-end">
              <div className="p-2 bg-light border-bottom">
                <small className="text-uppercase fw-semibold text-muted">Preset Ranges</small>
              </div>
              <div 
                className="p-2" 
                style={{ 
                  maxHeight: '350px', 
                  overflowY: 'auto' 
                }}
              >
                {dateRanges.map((range) => (
                  <div
                    key={range.value}
                    onClick={() => handleRangeSelect(range.value)}
                    className={`p-2 rounded mb-1 ${
                      selectedRange === range.value && !isCustom
                        ? 'bg-primary bg-opacity-10 border border-primary'
                        : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      if (selectedRange !== range.value || isCustom) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedRange !== range.value || isCustom) {
                        e.currentTarget.style.backgroundColor = '';
                      }
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>
                      {range.label}
                    </div>
                    <div style={{ fontSize: '11px' }} className="text-muted">
                      {range.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Section - Custom Range */}
            <div className="col-md-6">
              <div className="p-2 bg-light border-bottom">
                <small className="text-uppercase fw-semibold text-muted">Custom Range</small>
              </div>
              <div className="p-3">
                <div className="mb-3">
                  <label className="form-label fw-medium" style={{ fontSize: '12px' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={customStartDate}
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      handleCustomDate();
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium" style={{ fontSize: '12px' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={customEndDate}
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      handleCustomDate();
                    }}
                  />
                </div>

                {/* Selected Display */}
                <div className="p-2 bg-light rounded border mb-3">
                  <div style={{ fontSize: '11px' }} className="fw-semibold text-muted mb-1">
                    SELECTED
                  </div>
                  {isCustom ? (
                    <div style={{ fontSize: '12px' }}>
                      {customStartDate && customEndDate ? (
                        <span className="badge bg-primary">
                          {customStartDate} to {customEndDate}
                        </span>
                      ) : (
                        <span className="text-muted">Select dates</span>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px' }}>
                      <span className="badge bg-primary">
                        {dateRanges.find(r => r.value === selectedRange)?.label || 'None'}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  className="btn btn-primary btn-sm w-100"
                  onClick={handleApply}
                  disabled={isCustom && (!customStartDate || !customEndDate)}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

   
    </div>
  );
}

export default DateSection;