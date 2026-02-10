import React, { useState, useEffect } from "react";

import {
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiUsers,
  FiX,
} from "react-icons/fi";

const SearchModal = ({
  audienceList,
  setSelectedAudience,
  selectedAudience,
}) => {
  const [tempAudience, setTempAudience] = useState(selectedAudience || null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter audience list based on search query
  const filteredAudienceList = audienceList.filter(
    (audience) =>
      audience.reportName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audience.insertionOrderId
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const handleCloseDropdown = () => {
    // Close the Bootstrap dropdown
    const dropdownElement = document.querySelector(".dropdown-menu.show");
    if (dropdownElement) {
      const button = dropdownElement.previousElementSibling;
      if (button) {
        button.click();
      }
    }
  };

  return (
    <div className="dropdown">
      {/* Dropdown Toggle Button */}
      <button
        className="btn d-flex align-items-center gap-2"
        data-bs-toggle="dropdown"
        data-bs-auto-close="false"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "white",
          padding: "10px 16px",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: "500",
          transition: "all 0.3s ease",
          maxWidth: "320px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <FiUsers size={16} color="white" />
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {selectedAudience?.reportName || "Select Campaign"}
        </span>
        <FiChevronDown size={16} color="white" />
      </button>

      {/* Dropdown Menu */}
      <div
        className="dropdown-menu dropdown-menu-end shadow-lg"
        style={{
          minWidth: "420px",
          maxWidth: "480px",
          borderRadius: "16px",
          border: "none",
          padding: "0",
          marginTop: "8px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          background: "linear-gradient(to bottom, #ffffff, #f9fafb)",
        }}
      >
        {/* Header with Gradient */}
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "20px 24px",
            color: "white",
            position: "relative",
          }}
        >
          {/* Close Button */}
          <button
            onClick={handleCloseDropdown}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "white",
              cursor: "pointer",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.3)";
              e.currentTarget.style.transform = "rotate(90deg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "rotate(0deg)";
            }}
          >
            <FiX size={20} />
          </button>

          <h6
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "12px",
              paddingRight: "40px",
            }}
          >
            Select Your Campaign
          </h6>

          {/* Search Input */}
          <div className="position-relative">
            <FiSearch
              size={18}
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search Campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: "48px",
                paddingRight: searchQuery ? "48px" : "16px",
                height: "48px",
                border: "none",
                borderRadius: "12px",
                fontSize: "14px",
                backgroundColor: "white",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 8px 16px -4px rgba(0, 0, 0, 0.2)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "#f3f4f6",
                  border: "none",
                  color: "#6b7280",
                  cursor: "pointer",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                  zIndex: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e5e7eb";
                  e.currentTarget.style.color = "#374151";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                  e.currentTarget.style.color = "#6b7280";
                }}
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div
          style={{
            padding: "16px 24px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "white",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "#6b7280",
            }}
          >
            Available Campaigns
          </span>
          <span
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontSize: "11px",
              fontWeight: "700",
              padding: "6px 12px",
              borderRadius: "20px",
              boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
            }}
          >
            {filteredAudienceList.length}
          </span>
        </div>

        {/* Results List */}
        <div
          style={{
            maxHeight: "380px",
            overflowY: "auto",
            padding: "0 16px 16px",
            backgroundColor: "white",
          }}
          className="custom-scrollbar"
        >
          {filteredAudienceList.length > 0 ? (
            filteredAudienceList.map(
              (audience) => (
                <AudienceCard
                  key={audience._id}
                  title={audience.reportName}
                  subTitle={audience.insertionOrderId}
                  isSelected={tempAudience?._id === audience._id}
                  onSelect={() => {
                    setTempAudience(audience);
                  }}
                />
              ),
            )
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#9ca3af",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  margin: "0 auto 20px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiSearch size={36} style={{ opacity: 0.4 }} />
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                No audiences found
              </p>
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "13px",
                  color: "#9ca3af",
                }}
              >
                Try adjusting your search terms
              </p>
            </div>
          )}
        </div>
        {/* Footer OK Button */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid #e5e7eb",
            background: "white",
            position: "sticky",
            bottom: 0,
          }}
        >
          <button
            className="btn w-100"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "12px",
              fontWeight: "600",
              fontSize: "14px",
            }}
            disabled={!tempAudience}
            onClick={() => {
              setSelectedAudience(tempAudience);

              handleCloseDropdown();
            }}
          >
            OK
          </button>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
        }
      `}</style>
    </div>
  );
};

export default SearchModal;

// Audience Card Component
const AudienceCard = ({ title, subTitle, onSelect, isSelected }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: "16px 18px",
        borderRadius: "12px",
        marginBottom: "8px",
        cursor: "pointer",
        backgroundColor: isSelected
          ? "#f0f9ff"
          : isHovered
            ? "#f9fafb"
            : "white",
        border: isSelected
          ? "2px solid #667eea"
          : isHovered
            ? "2px solid #e5e7eb"
            : "2px solid #f3f4f6",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow:
          isHovered || isSelected
            ? "0 4px 12px rgba(0, 0, 0, 0.08)"
            : "0 1px 3px rgba(0, 0, 0, 0.05)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "15px",
            fontWeight: "600",
            color: isSelected ? "#667eea" : "#111827",
            marginBottom: "6px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "#6b7280",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {subTitle || "No ID"}
        </div>
      </div>
      <div
        style={{
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "10px",
          background: isSelected
            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            : isHovered
              ? "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)"
              : "#f9fafb",
          color: isSelected ? "white" : "#6b7280",
          transition: "all 0.2s ease",
          flexShrink: 0,
          marginLeft: "16px",
          boxShadow: isSelected
            ? "0 4px 12px rgba(102, 126, 234, 0.3)"
            : "none",
        }}
      >
        {isSelected ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <FiChevronRight size={18} />
        )}
      </div>
    </div>
  );
};
