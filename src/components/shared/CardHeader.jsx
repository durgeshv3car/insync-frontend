import Link from "next/link";
import React from "react";
import {
  FiAtSign,
  FiBell,
  FiCalendar,
  FiLifeBuoy,
  FiMoreVertical,
  FiSettings,
  FiTrash,
} from "react-icons/fi";


const CardHeader = ({ title, refresh, remove, expanded }) => {
  return (
    <div className="card-header">
      <h5 className="card-title">{title}</h5>
      <div className="card-header-action">
        <div className="card-header-btn">

          <div data-toggle="tooltip" data-title="Refresh" onClick={refresh}>
            <span
              className="avatar-text avatar-xs bg-warning"
              data-bs-toggle="refresh"
            >
              {" "}
            </span>
          </div>
          <div data-toggle="tooltip" data-title="Maximize/Minimize" onClick={expanded}>
            <span
              className="avatar-text avatar-xs bg-success"
              data-bs-toggle="expand"
            >
              {" "}
            </span>
          </div>
        </div>
    
      </div>
    </div>
  );
};

export default CardHeader;
