import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, RotateCcw  } from "lucide-react";

function DateSection() {
  const [show, setShow] = useState(false);
  const [selectedRange, setSelectedRange] = useState("LAST_30_DAYS");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const dropdownRef = useRef(null);

  const dateRanges = [
    { value: "CURRENT_DAY", label: "Current Day", description: "Today" },
    { value: "PREVIOUS_DAY", label: "Previous Day", description: "Yesterday" },
    {
      value: "WEEK_TO_DATE",
      label: "Week to Date",
      description: "Since Sunday",
    },
    {
      value: "MONTH_TO_DATE",
      label: "Month to Date",
      description: "Since start of month",
    },
    {
      value: "QUARTER_TO_DATE",
      label: "Quarter to Date",
      description: "Since start of quarter",
    },
    {
      value: "YEAR_TO_DATE",
      label: "Year to Date",
      description: "Since start of year",
    },
    {
      value: "PREVIOUS_WEEK",
      label: "Previous Week",
      description: "Last completed week",
    },
    {
      value: "PREVIOUS_MONTH",
      label: "Previous Month",
      description: "Last completed month",
    },
    {
      value: "PREVIOUS_QUARTER",
      label: "Previous Quarter",
      description: "Last completed quarter",
    },
    {
      value: "PREVIOUS_YEAR",
      label: "Previous Year",
      description: "Last completed year",
    },
    {
      value: "LAST_7_DAYS",
      label: "Last 7 Days",
      description: "Excluding today",
    },
    {
      value: "LAST_14_DAYS",
      label: "Last 14 Days",
      description: "Excluding today",
    },
    {
      value: "LAST_30_DAYS",
      label: "Last 30 Days",
      description: "Excluding today",
    },
    {
      value: "LAST_60_DAYS",
      label: "Last 60 Days",
      description: "Excluding today",
    },
    {
      value: "LAST_90_DAYS",
      label: "Last 90 Days",
      description: "Excluding today",
    },
    {
      value: "LAST_365_DAYS",
      label: "Last 365 Days",
      description: "Excluding today",
    },
    { value: "ALL_TIME", label: "All Time", description: "All available data" },
  ];

  // Load values from localStorage on mount
  useEffect(() => {
    const storedRange = localStorage.getItem("selectedRange");
    const storedStart = localStorage.getItem("startDate");
    const storedEnd = localStorage.getItem("endDate");

    if (storedRange && storedRange !== "Select Date") {
      setSelectedRange(storedRange);
      if (storedRange === "CUSTOM") {
        setIsCustom(true);
      }
    }
    if (storedStart) setCustomStartDate(storedStart);
    if (storedEnd) setCustomEndDate(storedEnd);

    // Mark as initialized after loading
    setIsInitialized(true);
  }, []);

  // Remove auto-save useEffect


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }
    };

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show]);

  const handleRangeSelect = (range) => {
    setSelectedRange(range);
    setIsCustom(false);
  };

  const handleCustomDate = () => {
    setIsCustom(true);
    setSelectedRange("CUSTOM");
  };

  const handleApply = () => {
    const updates = [
      { key: "selectedRange", value: selectedRange },
      { key: "startDate", value: customStartDate },
      { key: "endDate", value: customEndDate },
    ];

    updates.forEach(({ key, value }) => {
      localStorage.setItem(key, value);
      window.dispatchEvent(
        new CustomEvent("storage", {
          detail: { key, newValue: value },
        }),
      );
    });
    setShow(false);
  };

  const handleReset = () => {
    setSelectedRange("Select Date");
    setCustomStartDate("");
    setCustomEndDate("");
    setIsCustom(false);

    const keys = ["selectedRange", "startDate", "endDate"];
    keys.forEach((key) => {
      localStorage.removeItem(key);
      window.dispatchEvent(
        new CustomEvent("storage", {
          detail: { key, newValue: null },
        }),
      );
    });

    setShow(false);
  };

  const getSelectedLabel = () => {
    if (isCustom && customStartDate && customEndDate) {
      return `${customStartDate} to ${customEndDate}`;
    }
    const found = dateRanges.find((r) => r.value === selectedRange);
    return found?.label || "Select Date Range";
  };

  const hasSelection =
    selectedRange !== "Select Date" || customStartDate || customEndDate;

  return (
    <div className="date-section-wrapper">
      <div style={{ position: "relative" }} ref={dropdownRef}>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={() => setShow(!show)}
            style={{ 
              display: "flex",
              alignItems: "center",
              padding: "6px 10px",
              borderRadius: "8px",
              cursor: "pointer",
              border: "1px solid transparent",
              background: "#3454d1",
              transition: "all 0.2s ease",
              fontSize: "10px",
              fontWeight: 400,
              color: "#ffffff",
              outline: "none",
              minWidth: "150px",
              marginLeft: "26px"
            }}
          >
            <Calendar 
              size={14} 
              style={{ 
                marginRight: "8px", 
                color: "#ffffff",
                flexShrink: 0 
              }} 
            />

            <div style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              <span style={{ color: "#ffffff" }}>
                {getSelectedLabel()}
              </span>
            </div>

            <ChevronDown
              size={14}
              style={{
                marginLeft: "14px",
                color: "rgba(255,255,255,0.8)",
                flexShrink: 0,
                transform: show ? "rotate(180deg)" : "rotate(0deg)",
                transition: "all 0.3s ease",
              }}
            />
          </button>
        </div>

        <div
          style={{
            display: show ? "block" : "none",
            position: "absolute",
            width: "612px",
            maxWidth: "92vw",
            left: "auto",
            right: 0,
            padding: "0",
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            borderRadius: "14px",
            marginTop: "12px",
            background: "#ffffff",
            zIndex: 1050
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="row g-0" style={{ background: "#ffffff", borderRadius: "14px", overflow: "hidden" }}>
            {/* Left Section - Preset Ranges */}
            <div className="col-md-6 border-end" style={{ background: "#f8fafc" }}>
              <div className="p-3 border-bottom">
                <small className="text-uppercase fw-bold text-muted" style={{ letterSpacing: "1px", fontSize: "10px" }}>
                  Quick Selection
                </small>
              </div>
              <div
                className="p-2 custom-scrollbar"
                style={{
                  maxHeight: "380px",
                  overflowY: "auto",
                }}
              >
                {dateRanges.map((range) => (
                  <div
                    key={range.value}
                    onClick={() => handleRangeSelect(range.value)}
                    className="p-3 rounded-3 mb-1"
                    style={{ 
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      border: selectedRange === range.value && !isCustom ? "1.5px solid #3454d1" : "1.5px solid transparent",
                      background: selectedRange === range.value && !isCustom ? "#eff6ff" : "transparent"
                    }}
                  >
                    <div
                      style={{ 
                        fontSize: "14px", 
                        fontWeight: 700,
                        color: selectedRange === range.value && !isCustom ? "#3454d1" : "#1e293b"
                      }}
                    >
                      {range.label}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                      {range.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Section - Custom Range */}
            <div className="col-md-6" style={{ background: "#ffffff" }}>
              <div className="p-3 border-bottom">
                <small className="text-uppercase fw-bold text-muted" style={{ letterSpacing: "1px", fontSize: "10px" }}>
                  Custom Range
                </small>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                    START DATE
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    style={{ 
                      borderRadius: "10px", 
                      border: "1.5px solid #e2e8f0",
                      color: "#1e293b", 
                      padding: "10px",
                      fontSize: "13px",
                      fontWeight: 500
                    }}
                    value={customStartDate}
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      handleCustomDate();
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                    END DATE
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    style={{ 
                      borderRadius: "10px", 
                      border: "1.5px solid #e2e8f0",
                      color: "#1e293b", 
                      padding: "10px",
                      fontSize: "13px",
                      fontWeight: 500
                    }}
                    value={customEndDate}
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      handleCustomDate();
                    }}
                  />
                </div>

                {/* Status Display */}
                <div className="p-3 rounded-3 mb-4" style={{ background: "#f8fafc", border: "1px dashed #cbd5e1" }}>
                   <div className="d-flex align-items-center gap-2 mb-1">
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3454d1" }}></div>
                      <small className="fw-bold text-muted" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>ACTIVE SELECTION</small>
                   </div>
                   <div style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b" }}>
                      {isCustom ? (
                        customStartDate && customEndDate ? `${customStartDate} ➔ ${customEndDate}` : 'Choose dates above'
                      ) : (
                        dateRanges.find(r => r.value === selectedRange)?.label || 'None Selected'
                      )}
                   </div>
                </div>

                <div className="d-flex gap-2 pt-2">
                  <button
                    className="btn py-2 fw-bold text-white shadow-sm"
                    style={{ 
                      borderRadius: "10px", 
                      background: "#3454d1", 
                      border: "none",
                      fontSize: "13px",
                      flex: 1
                    }}
                    onClick={handleApply}
                    disabled={isCustom && (!customStartDate || !customEndDate)}
                  >
                    Apply Selection
                  </button>
                  {hasSelection && (
                    <button
                      className="btn btn-outline-light d-flex align-items-center justify-content-center shadow-sm"
                      style={{ 
                        borderRadius: "10px", 
                        border: "1.5px solid #e2e8f0", 
                        padding: "0 15px"
                      }}
                      onClick={handleReset}
                      title="Reset To Default"
                    >
                      <RotateCcw size={18} color="#1e293b" />

                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <style jsx="true">{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>
      </div>
    </div>
  );
}

export default DateSection;
