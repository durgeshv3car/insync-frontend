import React from "react";
import { Sparkles } from "lucide-react";

const Loading = ({ title = "Loading Insync", subtitle = "Preparing your workspace" }) => {
  return (
    <div className="app-loading-screen">
      <div className="app-loading-card">
        {/* Animated Dual Rings with Centered Glow Icon */}
        <div className="app-loading-spinner-wrap">
          <div className="app-loading-spinner-outer" />
          <div className="app-loading-spinner-inner" />
          <div className="app-loading-icon-center">
            <Sparkles size={22} color="#ffffff" />
          </div>
        </div>

        {/* Text and animated dots */}
        <h4 className="app-loading-title">{title}</h4>
        <p className="app-loading-subtitle">
          <span>{subtitle}</span>
          <span className="app-loading-dots" />
        </p>
      </div>
    </div>
  );
};

export default Loading;