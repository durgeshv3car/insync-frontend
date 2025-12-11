import Link from "next/link";
import React from "react";
import { FiChevronRight, FiCommand, FiSearch } from "react-icons/fi";

const SearchModal = ({ audienceList, setSelectedAudience, setSearchQuery }) => {
  return (
    <div className="dropdown nxl-h-item nxl-header-search">
      <div
        className="nxl-head-link me-0"
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
      >
        <FiSearch size={20} />
      </div>

      <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-search-dropdown">
        <div className="input-group search-form">
          <span className="input-group-text">
            <i className="fs-6 text-muted">
              <FiSearch />
            </i>
          </span>

          {/* 🔍 Search input */}
          <input
            type="text"
            className="form-control search-input-field"
            placeholder="Search...."
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <span className="input-group-text">
            <button type="button" className="btn-close"></button>
          </span>
        </div>

        <div className="search-items-wrapper">
          <div className="dropdown-divider"></div>
          <div className="users-result px-4 py-2">
            <Title name={"Audience"} number={audienceList.length} />

            {audienceList.map(({ reportName, _id, insertionOrderId }) => (
              <Card
                key={_id}
                subTitle={insertionOrderId}
                title={reportName}
                badge={<FiChevronRight size={12} />}
                /** 👍 pass selected value to parent */
                onSelect={() =>
                  setSelectedAudience({
                    _id,
                    reportName,
                    insertionOrderId
                  })
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

// ------------------------------
const Title = ({ name, number }) => {
  return (
    <h4 className="fs-13 fw-normal text-gray-600 mb-3">
      {name}
      <span className="badge small bg-gray-200 rounded ms-1 text-dark">
        {number}
      </span>
    </h4>
  );
};

// ------------------------------
const Card = ({ icon, title, subTitle, badge, onSelect }) => {
  return (
    <div
      className="d-flex align-items-center justify-content-between hr-card"
      style={{ cursor: "pointer" }}
      /** ✔ when clicked → send selectedAudience */
      onClick={onSelect}
    >
      <div className="d-flex align-items-center gap-3">
        <div>
          <span className="font-body fw-bold d-block mb-1">{title}</span>
          <p className="fs-11 text-muted mb-0">{subTitle}</p>
        </div>
      </div>

      <span className="avatar-text avatar-md">{badge}</span>
    </div>
  );
};
