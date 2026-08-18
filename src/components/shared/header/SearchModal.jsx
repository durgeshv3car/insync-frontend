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
  // Detect current theme (Light / Dark)
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "dark";

  const colors = {
    background: isDark ? "#0f172a" : "#ffffff",
    secondaryBackground: isDark ? "#1e293b" : "#f8fafc",
    border: isDark ? "#334155" : "#e2e8f0",
    text: isDark ? "#f8fafc" : "#1e293b",
    secondaryText: isDark ? "#94a3b8" : "#64748b",
    accent: "#2563eb",
    accentSoft: isDark ? "rgba(37,99,235,0.08)" : "#eef2ff",
    shadow: isDark
      ? "0 24px 40px rgba(0,0,0,0.55)"
      : "0 24px 40px rgba(15,23,42,0.12)",
  };
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
        className="header-pill-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          minWidth: "160px",
          background: "transparent",
          border: `1px solid ${colors.border}`,
          color: colors.text,
        }}
      >
        <FiTarget
          size={14}
          style={{
            marginRight: "8px",
            color: colors.accent,
            flexShrink: 0,
          }}
        />

        <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
          <span
            style={{
              color: colors.text,
              display: "block",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              width: "100%",
              fontSize: "12.5px",
            }}
          >
            {selectedAudience?.reportName || "Select Campaign"}
          </span>
        </div>

        <FiChevronDown
          size={14}
          style={{
            marginLeft: "10px",
            color: colors.secondaryText,
            flexShrink: 0,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            display: isOpen ? undefined : "none",
            position: "absolute",
            right: 0,
            top: "120%",
            zIndex: 9999,
            minWidth: "420px",
            maxWidth: "480px",
            borderRadius: "14px",
            overflow: "hidden",
            background: colors.background,
            border: `1px solid ${colors.border}`,
            boxShadow: colors.shadow,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: colors.secondaryBackground,
              padding: "24px",
              borderBottom: `1px solid ${colors.border}`,
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
                color: colors.secondaryText,
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
                (e.currentTarget.style.background = isDark
                  ? "rgba(255,255,255,0.03)"
                  : "#fee2e2")
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
                color: colors.text,
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
                  color: colors.accent,
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
                  border: `2px solid ${colors.border}`,
                  background: colors.background,
                  fontSize: "14px",
                  fontWeight: 500,
                  outline: "none",
                  transition: "all 0.2s ease",
                  color: colors.text,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.accent;
                  e.target.style.boxShadow = `0 0 0 4px rgba(37,99,235,0.12)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.border;
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
              background: colors.background,
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
                    color: colors.secondaryText,
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
              borderTop: `1px solid ${colors.border}`,
              background: colors.secondaryBackground,
            }}
          >
            <button
              className="confirm-selection-btn"
              style={{
                width: "100%",
                padding: "12px",
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                color: "#fff",
                WebkitTextFillColor: "#FFFFFF",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.12)",
                borderRadius: "10px",
                border: "none",
                fontWeight: 700,
                fontSize: "14px",
                cursor: !tempAudience ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: 1,
                boxShadow: "0 8px 20px rgba(37, 99, 235, 0.30)",
                filter: "none",
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
const AudienceCard = ({ title, subTitle, onSelect, isSelected }) => {
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "dark";

  const colors = {
    background: isDark ? "#0f172a" : "#ffffff",
    secondaryBackground: isDark ? "#1e293b" : "#f8fafc",
    border: isDark ? "#334155" : "#e2e8f0",
    text: isDark ? "#f8fafc" : "#1e293b",
    secondaryText: isDark ? "#94a3b8" : "#64748b",
    accent: "#2563eb",
    accentSoft: isDark ? "rgba(37,99,235,0.08)" : "#eef2ff",
  };

  return (
    <div
      onClick={onSelect}
      style={{
        padding: "14px 18px",
        borderRadius: "12px",
        border: isSelected ? `2px solid ${colors.accent}` : `2px solid ${colors.border}`,
        marginBottom: "12px",
        cursor: "pointer",
        background: isSelected ? colors.accentSoft : colors.background,
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = colors.border;
          e.currentTarget.style.background = colors.secondaryBackground;
          e.currentTarget.style.transform = "translateX(4px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = colors.border;
          e.currentTarget.style.background = colors.background;
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
            background: colors.accent,
          }}
        />
      )}
      <div
        style={{
          fontWeight: 700,
          color: isSelected ? colors.accent : colors.text,
          fontSize: "14px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: isSelected ? colors.accent : colors.secondaryText,
          fontWeight: 500,
        }}
      >
        {subTitle}
      </div>
    </div>
  );
};
