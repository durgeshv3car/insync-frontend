import { FiMaximize2 } from "react-icons/fi";

const CardHeader = ({ title, refresh, remove, expanded }) => {
  return (
    <div className="card-header">
      <h5 className="card-title">{title}</h5>
      <div className="card-header-action">
        <div className="card-header-btn">
          <div
            data-toggle="tooltip"
            data-title="Maximize/Minimize"
            onClick={expanded}
          >
            <span className="avatar-text avatar-s bg-primary d-flex align-items-center justify-content-center">
              <FiMaximize2 size={14} color="white" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CardHeader;