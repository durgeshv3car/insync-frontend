import React, { useState, useEffect, useRef } from "react";
import {
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiUsers,
  FiX,
  FiTarget,
} from "react-icons/fi";

const SearchModal = ({
  audienceList,
  setSelectedAudience,
  selectedAudience,
}) => {
  const [tempAudience, setTempAudience] = useState(selectedAudience || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAudienceList = audienceList.filter(
    (audience) =>
      audience.reportName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audience.insertionOrderId
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      ref={wrapperRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "6px 10px",
          borderRadius: "8px",
          cursor: "pointer",
          border: "1px solid transparent",
          background: "#3454d1",
          color: "#ffffff",
          transition: "all 0.2s ease",
          minWidth: "150px",
          fontSize: "12px",
          fontWeight: 400,
          textDecoration: "none",
          outline: "none",
          marginRight: "26px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#2a42a8";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#3454d1";
        }}
      >
        <FiTarget
          size={14}
          style={{
            marginRight: "6px",
            color: "#ffffff",
            flexShrink: 0,
          }}
        />

        <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
          <span
            style={{
              color: "#ffffff",
              display: "block",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              width: "100%",
            }}
          >
            {selectedAudience?.reportName || "Select Campaign"}
          </span>
        </div>

        <FiChevronDown
          size={14}
          style={{
            marginLeft: "10px",
            color: "rgba(255,255,255,0.8)",
            flexShrink: 0,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "120%",
            zIndex: 9999,
            minWidth: "420px",
            maxWidth: "480px",
            borderRadius: "14px",
            overflow: "hidden",
            background: "#fff",
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#f8fafc",
              padding: "24px",
              borderBottom: "1px solid #e2e8f0",
              position: "relative",
            }}
          >
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "transparent",
                border: "none",
                color: "#64748b",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#fee2e2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <FiX size={18} />
            </button>

            <h6
              style={{
                marginBottom: "16px",
                color: "#1e293b",
                fontWeight: 800,
                fontSize: "16px",
                letterSpacing: "-0.2px",
              }}
            >
              Select Campaign
            </h6>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <FiSearch
                size={18}
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#3454d1",
                  zIndex: 1,
                }}
              />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 48px",
                  borderRadius: "12px",
                  border: "2px solid #e2e8f0",
                  background: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 500,
                  outline: "none",
                  transition: "all 0.2s ease",
                  color: "#1e293b",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3454d1";
                  e.target.style.boxShadow = "0 0 0 4px rgba(52, 84, 209, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* List */}
          <div
            style={{
              maxHeight:
                searchQuery.length > 0
                  ? filteredAudienceList.length > 3
                    ? "210px"
                    : "360px"
                  : filteredAudienceList.length > 4
                    ? "280px"
                    : "360px",
              overflowY: "auto",
              padding: "16px",
              background: "#fff",
            }}
          >
            {filteredAudienceList.length > 0 ? (
              filteredAudienceList.map((audience) => (
                <AudienceCard
                  key={audience._id}
                  title={audience.reportName}
                  subTitle={`ID: ${audience.insertionOrderId}`}
                  isSelected={tempAudience?._id === audience._id}
                  onSelect={() => setTempAudience(audience)}
                />
              ))
            ) : (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#94a3b8",
                }}
              >
                <FiSearch
                  size={32}
                  style={{ marginBottom: "12px", opacity: 0.5 }}
                />
                <p style={{ fontSize: "14px", fontWeight: 500 }}>
                  No campaigns found
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "20px 24px",
              borderTop: "1px solid #e2e8f0",
              background: "#f8fafc",
            }}
          >
            <button
              style={{
                width: "100%",
                padding: "12px",
                background: "#3454d1",
                color: "#fff",
                borderRadius: "10px",
                border: "none",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                opacity: !tempAudience ? 0.6 : 1,
              }}
              disabled={!tempAudience}
              onClick={() => {
                setSelectedAudience(tempAudience);
                setIsOpen(false);
              }}
            >
              Confirm Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchModal;

// Card Component
const AudienceCard = ({ title, subTitle, onSelect, isSelected }) => (
  <div
    onClick={onSelect}
    style={{
      padding: "14px 18px",
      borderRadius: "12px",
      border: isSelected ? "2px solid #3454d1" : "2px solid #f1f5f9",
      marginBottom: "12px",
      cursor: "pointer",
      background: isSelected ? "#eff6ff" : "#ffffff",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      flexDirection: "column",
      gap: "2px",
      position: "relative",
      overflow: "hidden",
    }}
    onMouseEnter={(e) => {
      if (!isSelected) {
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.background = "#f8fafc";
        e.currentTarget.style.transform = "translateX(4px)";
      }
    }}
    onMouseLeave={(e) => {
      if (!isSelected) {
        e.currentTarget.style.borderColor = "#f1f5f9";
        e.currentTarget.style.background = "#ffffff";
        e.currentTarget.style.transform = "translateX(0)";
      }
    }}
  >
    {isSelected && (
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "4px",
          background: "#3454d1",
        }}
      />
    )}
    <div
      style={{
        fontWeight: 700,
        color: isSelected ? "#3454d1" : "#1e293b",
        fontSize: "14px",
      }}
    >
      {title}
    </div>
    <div
      style={{
        fontSize: "12px",
        color: isSelected ? "#3b82f6" : "#64748b",
        fontWeight: 500,
      }}
    >
      {subTitle}
    </div>
  </div>
);
