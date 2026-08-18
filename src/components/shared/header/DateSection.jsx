

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, RotateCcw } from "lucide-react";
import { formatDate } from "@/utils/dateFormatter";

function DateSection() {
  const [show, setShow] = useState(false);
  const [selectedRange, setSelectedRange] = useState("LAST_30_DAYS");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const dropdownRef = useRef(null);

  // Detect current theme (Light / Dark)
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "dark";

  // Theme Colors
  const colors = {
    background: isDark ? "#111827" : "#FFFFFF",
    secondaryBackground: isDark ? "#1E293B" : "#F8FAFC",
    border: isDark ? "#334155" : "#E2E8F0",
    text: isDark ? "#F8FAFC" : "#334155",
    secondaryText: isDark ? "#94A3B8" : "#64748B",
    accent: "#2563EB",
    accentSoft: isDark ? "#1E3A8A" : "#EFF6FF",
    shadow: isDark
      ? "0 20px 40px rgba(0,0,0,.55)"
      : "0 20px 40px rgba(15,23,42,.12)",
  };

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
    {
      value: "ALL_TIME",
      label: "All Time",
      description: "All available data",
    },
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

    setIsInitialized(true);
  }, []);

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
          detail: {
            key,
            newValue: value,
          },
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
          detail: {
            key,
            newValue: null,
          },
        }),
      );
    });

    setShow(false);
  };

  const getSelectedLabel = () => {
    if (isCustom && customStartDate && customEndDate) {
      return `${formatDate(customStartDate)} to ${formatDate(customEndDate)}`;
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
            className="header-pill-btn"
            onClick={() => setShow(!show)}
            style={{
              minWidth: "170px",
              background: "transparent",
              border: `1px solid ${colors.border}`,
              color: colors.text,
              borderRadius: "10px",
              transition: "all .25s ease",
            }}
          >
            <Calendar
              size={15}
              style={{
                marginRight: "8px",
                color: colors.accent,
                flexShrink: 0,
              }}
            />

            <div
              style={{
                flex: 1,
                textAlign: "left",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <span
                style={{
                  color: colors.text,
                  fontSize: "12.5px",
                  fontWeight: 600,
                }}
              >
                {getSelectedLabel()}
              </span>
            </div>

            <ChevronDown
              size={15}
              style={{
                marginLeft: "10px",
                color: colors.secondaryText,
                flexShrink: 0,
                transform: show ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform .25s ease",
              }}
            />
          </button>
        </div>

        <div
          style={{
            display: show ? undefined : "none",
            position: "absolute",
            width: "620px",
            maxWidth: "92vw",
            right: 0,
            left: "auto",
            marginTop: "12px",
            borderRadius: "14px",
            overflow: "hidden",
            border: `1px solid ${colors.border}`,
            background: colors.background,
            boxShadow: colors.shadow,
            zIndex: 1050,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="row g-0"
            style={{
              background: colors.background,
            }}
          >
            {/* Left Section */}
            <div
              className="col-md-6 border-end"
              style={{
                background: colors.secondaryBackground,
                borderColor: colors.border,
              }}
            >
              <div
                className="p-3 border-bottom"
                style={{
                  borderColor: colors.border,
                }}
              >
                <small
                  style={{
                    color: colors.secondaryText,
                    letterSpacing: "1px",
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
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
                    className="mb-1"
                    style={{
                      cursor: "pointer",
                      borderRadius: "10px",
                      padding: "12px",
                      transition: "all .2s ease",

                      border:
                        selectedRange === range.value && !isCustom
                          ? `1.5px solid ${colors.accent}`
                          : "1.5px solid transparent",

                      background:
                        selectedRange === range.value && !isCustom
                          ? colors.accentSoft
                          : "transparent",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13.5px",
                        fontWeight: 700,
                        color:
                          selectedRange === range.value && !isCustom
                            ? colors.accent
                            : colors.text,
                      }}
                    >
                      {range.label}
                    </div>

                    <div
                      style={{
                        marginTop: "3px",
                        fontSize: "12px",
                        color: colors.secondaryText,
                        fontWeight: 500,
                      }}
                    >
                      {range.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Section - Custom Range */}
            {/* Right Section - Custom Range */}
            <div
              className="col-md-6"
              style={{
                background: colors.background,
              }}
            >
              <div
                className="p-3 border-bottom"
                style={{
                  borderColor: colors.border,
                }}
              >
                <small
                  style={{
                    color: colors.secondaryText,
                    letterSpacing: "1px",
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Custom Range
                </small>
              </div>

              <div className="p-4">
                {/* START DATE */}

                <div className="mb-4">
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: ".6px",
                      color: colors.secondaryText,
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    START DATE
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    style={{
                      borderRadius: "10px",
                      border: `1px solid ${colors.border}`,
                      background: colors.secondaryBackground,
                      color: colors.text,
                      padding: "10px 12px",
                      fontSize: "13px",
                      fontWeight: 500,
                      boxShadow: "none",
                    }}
                    value={customStartDate}
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      handleCustomDate();
                    }}
                  />
                </div>

                {/* END DATE */}

                <div className="mb-4">
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: ".6px",
                      color: colors.secondaryText,
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    END DATE
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    style={{
                      borderRadius: "10px",
                      border: `1px solid ${colors.border}`,
                      background: colors.secondaryBackground,
                      color: colors.text,
                      padding: "10px 12px",
                      fontSize: "13px",
                      fontWeight: 500,
                      boxShadow: "none",
                    }}
                    value={customEndDate}
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      handleCustomDate();
                    }}
                  />
                </div>

                {/* Active Selection */}

                <div
                  className="mb-4"
                  style={{
                    borderRadius: "12px",
                    padding: "14px",
                    background: colors.accentSoft,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: colors.accent,
                      }}
                    />

                    <small
                      style={{
                        color: colors.secondaryText,
                        fontWeight: 700,
                        fontSize: "10px",
                        letterSpacing: ".5px",
                      }}
                    >
                      ACTIVE SELECTION
                    </small>
                  </div>

                  <div
                    style={{
                      color: colors.text,
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    {isCustom
                      ? customStartDate && customEndDate
                        ? `${formatDate(customStartDate)} ➜ ${formatDate(customEndDate)}`
                        : "Choose dates above"
                      : dateRanges.find((r) => r.value === selectedRange)
                          ?.label || "None Selected"}
                  </div>
                </div>

                {/* Buttons */}

                <div className="d-flex gap-2">
                  <button
                    className="btn"
                    style={{
                      flex: 1,
                      borderRadius: "10px",
                      padding: "10px",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "13px",
                      border: "none",
                      background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                      boxShadow: "0 8px 20px rgba(37,99,235,.30)",
                    }}
                    onClick={handleApply}
                    disabled={isCustom && (!customStartDate || !customEndDate)}
                  >
                    Apply Selection
                  </button>

                  {hasSelection && (
                    <button
                      className="btn d-flex align-items-center justify-content-center"
                      style={{
                        width: "48px",
                        borderRadius: "10px",
                        border: `1px solid ${colors.border}`,
                        background: colors.secondaryBackground,
                        color: colors.text,
                      }}
                      onClick={handleReset}
                      title="Reset To Default"
                    >
                      <RotateCcw size={18} color={colors.text} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <style jsx="true">{`
          /* ===========================
      PREMIUM CUSTOM SCROLLBAR
  ============================ */

          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: ${colors.secondaryBackground};
            border-radius: 20px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${colors.border};
            border-radius: 20px;
            transition: 0.25s;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${colors.secondaryText};
          }

          /* Firefox */

          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: ${colors.border} ${colors.secondaryBackground};
          }

          /* ===========================
      INPUTS
  ============================ */

          input[type="date"] {
            transition: all 0.25s ease;
          }

          input[type="date"]:focus {
            border-color: ${colors.accent} !important;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12) !important;
            outline: none;
          }

          input[type="date"]::-webkit-calendar-picker-indicator {
            cursor: pointer;
            opacity: 0.8;
            transition: 0.25s;
            ${isDark
              ? `
      filter: invert(1);
    `
              : ""}
          }

          input[type="date"]::-webkit-calendar-picker-indicator:hover {
            opacity: 1;
          }

          /* ===========================
      BUTTON ANIMATION
  ============================ */

          button {
            transition: all 0.22s ease;
          }

          button:hover:not(:disabled) {
            transform: translateY(-1px);
          }

          button:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }

          /* ===========================
      DROPDOWN ANIMATION
  ============================ */

          .date-section-wrapper {
            animation: fadeIn 0.18s ease;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(6px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default DateSection;












// import React, { useState, useRef, useEffect } from "react";
// import { Calendar, ChevronDown, RotateCcw  } from "lucide-react";
// import { formatDate } from "@/utils/dateFormatter";

// function DateSection() {
//   const [show, setShow] = useState(false);
//   const [selectedRange, setSelectedRange] = useState("LAST_30_DAYS");
//   const [customStartDate, setCustomStartDate] = useState("");
//   const [customEndDate, setCustomEndDate] = useState("");
//   const [isCustom, setIsCustom] = useState(false);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const dropdownRef = useRef(null);

//   const dateRanges = [
//     { value: "CURRENT_DAY", label: "Current Day", description: "Today" },
//     { value: "PREVIOUS_DAY", label: "Previous Day", description: "Yesterday" },
//     {
//       value: "WEEK_TO_DATE",
//       label: "Week to Date",
//       description: "Since Sunday",
//     },
//     {
//       value: "MONTH_TO_DATE",
//       label: "Month to Date",
//       description: "Since start of month",
//     },
//     {
//       value: "QUARTER_TO_DATE",
//       label: "Quarter to Date",
//       description: "Since start of quarter",
//     },
//     {
//       value: "YEAR_TO_DATE",
//       label: "Year to Date",
//       description: "Since start of year",
//     },
//     {
//       value: "PREVIOUS_WEEK",
//       label: "Previous Week",
//       description: "Last completed week",
//     },
//     {
//       value: "PREVIOUS_MONTH",
//       label: "Previous Month",
//       description: "Last completed month",
//     },
//     {
//       value: "PREVIOUS_QUARTER",
//       label: "Previous Quarter",
//       description: "Last completed quarter",
//     },
//     {
//       value: "PREVIOUS_YEAR",
//       label: "Previous Year",
//       description: "Last completed year",
//     },
//     {
//       value: "LAST_7_DAYS",
//       label: "Last 7 Days",
//       description: "Excluding today",
//     },
//     {
//       value: "LAST_14_DAYS",
//       label: "Last 14 Days",
//       description: "Excluding today",
//     },
//     {
//       value: "LAST_30_DAYS",
//       label: "Last 30 Days",
//       description: "Excluding today",
//     },
//     {
//       value: "LAST_60_DAYS",
//       label: "Last 60 Days",
//       description: "Excluding today",
//     },
//     {
//       value: "LAST_90_DAYS",
//       label: "Last 90 Days",
//       description: "Excluding today",
//     },
//     {
//       value: "LAST_365_DAYS",
//       label: "Last 365 Days",
//       description: "Excluding today",
//     },
//     { value: "ALL_TIME", label: "All Time", description: "All available data" },
//   ];

//   // Load values from localStorage on mount
//   useEffect(() => {
//     const storedRange = localStorage.getItem("selectedRange");
//     const storedStart = localStorage.getItem("startDate");
//     const storedEnd = localStorage.getItem("endDate");

//     if (storedRange && storedRange !== "Select Date") {
//       setSelectedRange(storedRange);
//       if (storedRange === "CUSTOM") {
//         setIsCustom(true);
//       }
//     }
//     if (storedStart) setCustomStartDate(storedStart);
//     if (storedEnd) setCustomEndDate(storedEnd);

//     // Mark as initialized after loading
//     setIsInitialized(true);
//   }, []);

//   // Remove auto-save useEffect

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShow(false);
//       }
//     };

//     if (show) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [show]);

//   const handleRangeSelect = (range) => {
//     setSelectedRange(range);
//     setIsCustom(false);
//   };

//   const handleCustomDate = () => {
//     setIsCustom(true);
//     setSelectedRange("CUSTOM");
//   };

//   const handleApply = () => {
//     const updates = [
//       { key: "selectedRange", value: selectedRange },
//       { key: "startDate", value: customStartDate },
//       { key: "endDate", value: customEndDate },
//     ];

//     updates.forEach(({ key, value }) => {
//       localStorage.setItem(key, value);
//       window.dispatchEvent(
//         new CustomEvent("storage", {
//           detail: { key, newValue: value },
//         }),
//       );
//     });
//     setShow(false);
//   };

//   const handleReset = () => {
//     setSelectedRange("Select Date");
//     setCustomStartDate("");
//     setCustomEndDate("");
//     setIsCustom(false);

//     const keys = ["selectedRange", "startDate", "endDate"];
//     keys.forEach((key) => {
//       localStorage.removeItem(key);
//       window.dispatchEvent(
//         new CustomEvent("storage", {
//           detail: { key, newValue: null },
//         }),
//       );
//     });

//     setShow(false);
//   };

//   const getSelectedLabel = () => {
//     if (isCustom && customStartDate && customEndDate) {
//       return `${formatDate(customStartDate)} to ${formatDate(customEndDate)}`;
//     }
//     const found = dateRanges.find((r) => r.value === selectedRange);
//     return found?.label || "Select Date Range";
//   };

//   const hasSelection =
//     selectedRange !== "Select Date" || customStartDate || customEndDate;

//   return (
//     <div className="date-section-wrapper">
//       <div style={{ position: "relative" }} ref={dropdownRef}>
//         <div className="d-flex align-items-center gap-2">
//           <button
//             type="button"
//             className="header-pill-btn"
//             onClick={() => setShow(!show)}
//             style={{
//               minWidth: "155px",
//             }}
//           >
//             <Calendar
//               size={14}
//               style={{
//                 marginRight: "8px",
//                 color: "#60A5FA",
//                 flexShrink: 0
//               }}
//             />

//             <div style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//               <span style={{ color: "#F8FAFC", fontSize: "12.5px" }}>
//                 {getSelectedLabel()}
//               </span>
//             </div>

//             <ChevronDown
//               size={14}
//               style={{
//                 marginLeft: "10px",
//                 color: "#8D99AE",
//                 flexShrink: 0,
//                 transform: show ? "rotate(180deg)" : "rotate(0deg)",
//                 transition: "transform 0.2s ease",
//               }}
//             />
//           </button>
//         </div>

//         <div
//           style={{
//             display: show ? "block" : "none",
//             position: "absolute",
//             width: "612px",
//             maxWidth: "92vw",
//             left: "auto",
//             right: 0,
//             padding: "0",
//             border: "1px solid #e2e8f0",
//             boxShadow: "0 24px 40px -4px rgba(0, 0, 0, 0.14), 0 8px 20px -4px rgba(0, 0, 0, 0.08)",
//             borderRadius: "14px",
//             marginTop: "12px",
//             background: "#ffffff",
//             zIndex: 1050
//           }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div className="row g-0" style={{ background: "#ffffff", borderRadius: "14px", overflow: "hidden" }}>
//             {/* Left Section - Preset Ranges */}
//             <div className="col-md-6 border-end" style={{ background: "#f8fafc" }}>
//               <div className="p-3 border-bottom">
//                 <small className="text-uppercase fw-bold text-muted" style={{ letterSpacing: "1px", fontSize: "10px" }}>
//                   Quick Selection
//                 </small>
//               </div>
//               <div
//                 className="p-2 custom-scrollbar"
//                 style={{
//                   maxHeight: "380px",
//                   overflowY: "auto",
//                 }}
//               >
//                 {dateRanges.map((range) => (
//                   <div
//                     key={range.value}
//                     onClick={() => handleRangeSelect(range.value)}
//                     className="p-3 rounded-3 mb-1"
//                     style={{
//                       cursor: "pointer",
//                       transition: "all 0.2s ease",
//                       border: selectedRange === range.value && !isCustom ? "1.5px solid #4f46e5" : "1.5px solid transparent",
//                       background: selectedRange === range.value && !isCustom ? "#eef2ff" : "transparent"
//                     }}
//                   >
//                     <div
//                       style={{
//                         fontSize: "14px",
//                         fontWeight: 700,
//                         color: selectedRange === range.value && !isCustom ? "#4f46e5" : "#1e293b"
//                       }}
//                     >
//                       {range.label}
//                     </div>
//                     <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
//                       {range.description}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Right Section - Custom Range */}
//             <div className="col-md-6" style={{ background: "#ffffff" }}>
//               <div className="p-3 border-bottom">
//                 <small className="text-uppercase fw-bold text-muted" style={{ letterSpacing: "1px", fontSize: "10px" }}>
//                   Custom Range
//                 </small>
//               </div>
//               <div className="p-4">
//                 <div className="mb-4">
//                   <label className="form-label fw-bold text-dark" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
//                     START DATE
//                   </label>
//                   <input
//                     type="date"
//                     className="form-control"
//                     style={{
//                       borderRadius: "10px",
//                       border: "1.5px solid #e2e8f0",
//                       color: "#1e293b",
//                       padding: "10px",
//                       fontSize: "13px",
//                       fontWeight: 500
//                     }}
//                     value={customStartDate}
//                     onChange={(e) => {
//                       setCustomStartDate(e.target.value);
//                       handleCustomDate();
//                     }}
//                   />
//                 </div>

//                 <div className="mb-4">
//                   <label className="form-label fw-bold text-dark" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
//                     END DATE
//                   </label>
//                   <input
//                     type="date"
//                     className="form-control"
//                     style={{
//                       borderRadius: "10px",
//                       border: "1.5px solid #e2e8f0",
//                       color: "#1e293b",
//                       padding: "10px",
//                       fontSize: "13px",
//                       fontWeight: 500
//                     }}
//                     value={customEndDate}
//                     onChange={(e) => {
//                       setCustomEndDate(e.target.value);
//                       handleCustomDate();
//                     }}
//                   />
//                 </div>

//                 {/* Status Display */}
//                 <div className="p-3 rounded-3 mb-4" style={{ background: "#f5f3ff", border: "1px dashed #c7d2fe" }}>
//                    <div className="d-flex align-items-center gap-2 mb-1">
//                       <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4f46e5" }}></div>
//                       <small className="fw-bold text-muted" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>ACTIVE SELECTION</small>
//                    </div>
//                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b" }}>
//                       {isCustom ? (
//                         customStartDate && customEndDate ? `${formatDate(customStartDate)} ➔ ${formatDate(customEndDate)}` : 'Choose dates above'
//                       ) : (
//                         dateRanges.find(r => r.value === selectedRange)?.label || 'None Selected'
//                       )}
//                    </div>
//                 </div>

//                 <div className="d-flex gap-2 pt-2">
//                   <button
//                     className="btn py-2 fw-bold text-white shadow-sm"
//                     style={{
//                       borderRadius: "10px",
//                       background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
//                       border: "none",
//                       fontSize: "13px",
//                       flex: 1,
//                       boxShadow: "0 4px 14px rgba(79, 70, 229, 0.35)"
//                     }}
//                     onClick={handleApply}
//                     disabled={isCustom && (!customStartDate || !customEndDate)}
//                   >
//                     Apply Selection
//                   </button>
//                   {hasSelection && (
//                     <button
//                       className="btn btn-outline-light d-flex align-items-center justify-content-center shadow-sm"
//                       style={{
//                         borderRadius: "10px",
//                         border: "1.5px solid #e2e8f0",
//                         padding: "0 15px"
//                       }}
//                       onClick={handleReset}
//                       title="Reset To Default"
//                     >
//                       <RotateCcw size={18} color="#1e293b" />

//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         <style jsx="true">{`
//           .custom-scrollbar::-webkit-scrollbar {
//             width: 4px;
//           }
//           .custom-scrollbar::-webkit-scrollbar-track {
//             background: #f1f1f1;
//             border-radius: 10px;
//           }
//           .custom-scrollbar::-webkit-scrollbar-thumb {
//             background: #cbd5e1;
//             border-radius: 10px;
//           }
//           .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//             background: #94a3b8;
//           }
//         `}</style>
//       </div>
//     </div>
//   );
// }

// export default DateSection;
