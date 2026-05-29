"use client";

import React, { useContext, useEffect, useState } from "react";
import { FiAlignLeft, FiArrowRight } from "react-icons/fi";
import Image from "next/image";
import DateSection from "./DateSection";
import SearchModal from "./SearchModal";
import ProfileModal from "./ProfileModal";
import { NavigationContext } from "@/contentApi/navigationProvider";
import { usePathname } from "next/navigation";
import { getAudienceByUser } from "@/services/createaudience";
import { useSession } from "next-auth/react";
import { jwtDecode } from "jwt-decode";

const Header = () => {
  const { navigationOpen, setNavigationOpen } = useContext(NavigationContext);

  const pathname = usePathname();
  const { data: session } = useSession();

  const [audienceList, setAudienceList] = useState([]);
  const [selectedAudience, setSelectedAudience] = useState(null);
  // const [navigationExpand, setNavigationExpand] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const isPathPresent = [
    "/report"
  ].includes(pathname);

  // Decode user
  let userDetails = { userId: "", role: "" };
  if (session?.user?.token) {
    const decoded = jwtDecode(session.user.token);
    userDetails = { userId: decoded.id, role: decoded.role };
  }

  // Fetch audiences
  useEffect(() => {
    const fetchAudiences = async () => {
      try {
        const res = await getAudienceByUser(
          userDetails.userId,
          userDetails.role,
        );
        setAudienceList(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    if (userDetails.userId) fetchAudiences();
  }, [session]);

  // Initialize audience from localStorage
  
  useEffect(() => {
    if (!audienceList.length) return;

    const storedId = localStorage.getItem("audienceId");
    const found = audienceList.find((a) => a._id === storedId);
    const defaultAudience = found || audienceList[0];

    setSelectedAudience(defaultAudience);

    localStorage.setItem("audienceId", defaultAudience._id);
    localStorage.setItem("audienceName", defaultAudience.reportName);
    localStorage.setItem("insertionId",defaultAudience.insertionOrderId); 
    localStorage.setItem("count", defaultAudience.cpcv);

    setIsInitialized(true);
  }, [audienceList]);

  // Update localStorage when audience changes
  useEffect(() => {
    if (!isInitialized || !selectedAudience) return;

    const updates = [
      { key: "audienceId", value: selectedAudience._id },
      { key: "audienceName", value: selectedAudience.reportName },
      { key: "insertionId", value: selectedAudience.insertionOrderId },
      { key: "count", value: selectedAudience.cpcv },
    ];

    updates.forEach(({ key, value }) => {
      localStorage.setItem(key, value);
      window.dispatchEvent(
        new CustomEvent("storage", {
          detail: { key, newValue: value },
        }),
      );
    });
  }, [selectedAudience, isInitialized]);

  // Handle desktop navigation toggle class
  useEffect(() => {
    const handleNavigationSync = () => {
      const isDesktop = window.innerWidth > 1024;
      if (isDesktop) {
        if (navigationOpen) {
          document.documentElement.classList.remove("minimenu");
        } else {
          document.documentElement.classList.add("minimenu");
        }
      } else {
        // Mobile: remove minimenu class, controlled by mob-navigation-active instead
        document.documentElement.classList.remove("minimenu");
      }
    };

    handleNavigationSync();
    window.addEventListener("resize", handleNavigationSync);
    return () => window.removeEventListener("resize", handleNavigationSync);
  }, [navigationOpen]);

  // Handle mobile menu auto-close on navigation
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;
    if (isMobile && navigationOpen) {
      setNavigationOpen(false);
    }
  }, [pathname]);

  return (
    <header className="nxl-header">
      <div className="header-wrapper">
        {/* LEFT */}
        <div className="header-left d-flex align-items-center gap-2">
          {/* Single Navigation Toggle for All Screens */}
          <button
            className="btn p-0 border-0 bg-transparent"
            onClick={() => setNavigationOpen(!navigationOpen)}
            style={{ marginLeft: "10px", marginRight: "14px" }}
          >
            {navigationOpen ? (
              <FiArrowRight size={24} />
            ) : (
              <FiAlignLeft size={24} />
            )}
          </button>

          <Image
            src="/images/logo360.png"
            alt="Logo"
            width={180}
            height={64}
            priority
            style={{padding:"12px", borderRadius:"8px",  filter:
      "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(2670%) hue-rotate(100deg) brightness(112%) contrast(104%)",}}
          />

        
        </div>

        {/* RIGHT */}
        <div className="header-right ms-auto d-flex align-items-center gap-2">

            {isPathPresent && <DateSection />}
          {isPathPresent && selectedAudience && (
            <SearchModal
              audienceList={audienceList}
              setSelectedAudience={setSelectedAudience}
              selectedAudience={selectedAudience}
            />
          )}

          <ProfileModal />
        </div>
      </div>
    </header>
  );
};

export default Header;
