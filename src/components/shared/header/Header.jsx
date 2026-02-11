// "use client";
// import React, { useContext, useEffect, useRef, useState } from "react";
// import {
//   FiAlignLeft,
//   FiArrowLeft,
//   FiArrowRight,
//   FiMaximize,
//   FiMinimize,
//   FiMoon,
//   FiSun,
// } from "react-icons/fi";
// import LanguagesModal from "./LanguagesModal";
// import DateSection from "./DateSection";
// import NotificationsModal from "./NotificationsModal";
// import ProfileModal from "./ProfileModal";
// import SearchModal from "./SearchModal";
// import TimesheetsModal from "./TimesheetsModal";
// import HeaderDropDownModal from "./HeaderDropDownModal";
// import MegaMenu from "./megaManu/MegaMenu";
// import { NavigationContext } from "@/contentApi/navigationProvider";
// import { usePathname } from "next/navigation";
// import { getAudience, getAudienceByUser } from "@/services/createaudience";
// import { useSession } from "next-auth/react";
// import { jwtDecode } from "jwt-decode";

// const Header = () => {
//   const { navigationOpen, setNavigationOpen } = useContext(NavigationContext);
//   const [openMegaMenu, setOpenMegaMenu] = useState(false);
//   const [navigationExpend, setNavigationExpend] = useState(false);
//   const [audienceList, setAudienceList] = useState([]);
//   const miniButtonRef = useRef(null);
//   const expendButtonRef = useRef(null);
//   const pathname = usePathname();
//   const checkpath = ["/reports/overview","/reports/device","/reports/demographics","/reports/creative","/reports/category"];
//   const isPathPresent = checkpath.includes(pathname);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedAudience, setSelectedAudience] = useState(null);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const { data: session, status } = useSession();
//   let userDetails = {
//     email: "",
//     name: "",
//     userId: "",
//     role: "",
//   };

//   if (session?.user?.token) {
//     const decoded = jwtDecode(session?.user?.token);
//     userDetails = {
//       email: decoded.email,
//       name: decoded.name,
//       userId: decoded.id,
//       role: decoded.role,
//     };
//   }

//   useEffect(() => {
//     // Load from localStorage first
//     const storedAudienceName = localStorage.getItem("audienceName");
//     const storedAudienceId = localStorage.getItem("audienceId");

//     if (storedAudienceName && storedAudienceId) {
//       setSelectedAudience({
//         reportName: storedAudienceName,
//         _id: storedAudienceId,
//       });
//     }

//     setIsInitialized(true);
//   }, []);

//   useEffect(() => {
//   if (!isInitialized) return;

//   const storedId = localStorage.getItem("audienceId");

//   if (selectedAudience?._id && selectedAudience._id !== storedId) {
//     window.location.reload();
//   }
// }, [selectedAudience]);

//   useEffect(() => {
//     const fetchAudiences = async () => {
//       try {
//         const res = await getAudienceByUser(userDetails.userId,userDetails.role);
//         setAudienceList(res.data);
//       } catch (error) {
//         console.log("Error fetching audience:", error);
//       }
//     };

//       fetchAudiences();

//   }, []);

//   useEffect(() => {
//     if (!isInitialized) return;

//     if (
//       selectedAudience?.reportName != undefined &&
//       selectedAudience?._id != undefined
//     ) {
//       localStorage.setItem("audienceName", selectedAudience.reportName);
//       localStorage.setItem("audienceId", selectedAudience._id);
//     }
//   }, [isInitialized, selectedAudience]);

//   useEffect(() => {
//     if (openMegaMenu) {
//       document.documentElement.classList.add("nxl-lavel-mega-menu-open");
//     } else {
//       document.documentElement.classList.remove("nxl-lavel-mega-menu-open");
//     }
//   }, [openMegaMenu]);

//   const handleThemeMode = (type) => {
//     if (type === "dark") {
//       document.documentElement.classList.add("app-skin-dark");
//       localStorage.setItem("skinTheme", "dark");
//     } else {
//       document.documentElement.classList.remove("app-skin-dark");
//       localStorage.setItem("skinTheme", "light");
//     }
//   };

//   useEffect(() => {
//     const handleResize = () => {
//       const newWindowWidth = window.innerWidth;
//       if (newWindowWidth <= 1024) {
//         document.documentElement.classList.remove("minimenu");
//         document.querySelector(".navigation-down-1600").style.display = "none";
//       } else if (newWindowWidth >= 1025 && newWindowWidth <= 1400) {
//         document.documentElement.classList.add("minimenu");
//         document.querySelector(".navigation-up-1600").style.display = "none";
//         document.querySelector(".navigation-down-1600").style.display = "block";
//       } else {
//         document.documentElement.classList.remove("minimenu");
//         document.querySelector(".navigation-up-1600").style.display = "block";
//         document.querySelector(".navigation-down-1600").style.display = "none";
//       }
//     };

//     window.addEventListener("resize", handleResize);

//     handleResize();

//     const savedSkinTheme = localStorage.getItem("skinTheme");
//     handleThemeMode(savedSkinTheme);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   const handleNavigationExpendUp = (e, pram) => {
//     e.preventDefault();
//     if (pram === "show") {
//       setNavigationExpend(true);
//       document.documentElement.classList.add("minimenu");
//     } else {
//       setNavigationExpend(false);
//       document.documentElement.classList.remove("minimenu");
//     }
//   };

//   const handleNavigationExpendDown = (e, pram) => {
//     e.preventDefault();
//     if (pram === "show") {
//       setNavigationExpend(true);
//       document.documentElement.classList.remove("minimenu");
//     } else {
//       setNavigationExpend(false);
//       document.documentElement.classList.add("minimenu");
//     }
//   };

//   const fullScreenMaximize = () => {
//     const elem = document.documentElement;

//     if (elem.requestFullscreen) {
//       elem.requestFullscreen();
//     } else if (elem.mozRequestFullScreen) {
//       elem.mozRequestFullScreen();
//     } else if (elem.webkitRequestFullscreen) {
//       elem.webkitRequestFullscreen();
//     } else if (elem.msRequestFullscreen) {
//       elem.msRequestFullscreen();
//     }

//     document.documentElement.classList.add("fsh-infullscreen");
//     document.querySelector("body").classList.add("full-screen-helper");
//   };
//   const fullScreenMinimize = () => {
//     if (document.exitFullscreen) {
//       document.exitFullscreen();
//     } else if (document.mozCancelFullScreen) {
//       document.mozCancelFullScreen();
//     } else if (document.webkitExitFullscreen) {
//       document.webkitExitFullscreen();
//     } else if (document.msExitFullscreen) {
//       document.msExitFullscreen();
//     }

//     document.documentElement.classList.remove("fsh-infullscreen");
//     document.querySelector("body").classList.remove("full-screen-helper");
//   };

//   return (
//     <header className="nxl-header">
//       <div className="header-wrapper">
//         {/* <!--! [Start] Header Left !--> */}
//         <div className="header-left d-flex align-items-center gap-4">
//           {/* <!--! [Start] nxl-head-mobile-toggler !--> */}
//           <a
//             href="#"
//             className="nxl-head-mobile-toggler"
//             onClick={(e) => {
//               e.preventDefault(), setNavigationOpen(true);
//             }}
//             id="mobile-collapse"
//           >
//             <div
//               className={`hamburger hamburger--arrowturn ${
//                 navigationOpen ? "is-active" : ""
//               }`}
//             >
//               <div className="hamburger-box">
//                 <div className="hamburger-inner"></div>
//               </div>
//             </div>
//           </a>
//           {/* <!--! [Start] nxl-head-mobile-toggler !-->
//                     <!--! [Start] nxl-navigation-toggle !--> */}
//           <div className="nxl-navigation-toggle navigation-up-1600">
//             <a
//               href="#"
//               onClick={(e) => handleNavigationExpendUp(e, "show")}
//               id="menu-mini-button"
//               ref={miniButtonRef}
//               style={{ display: navigationExpend ? "none" : "block" }}
//             >
//               <FiAlignLeft size={24} />
//             </a>
//             <a
//               href="#"
//               onClick={(e) => handleNavigationExpendUp(e, "hide")}
//               id="menu-expend-button"
//               ref={expendButtonRef}
//               style={{ display: navigationExpend ? "block" : "none" }}
//             >
//               <FiArrowRight size={24} />
//             </a>
//           </div>
//           <div className="nxl-navigation-toggle navigation-down-1600">
//             <a
//               href="#"
//               onClick={(e) => handleNavigationExpendDown(e, "hide")}
//               id="menu-mini-button"
//               ref={miniButtonRef}
//               style={{ display: navigationExpend ? "block" : "none" }}
//             >
//               <FiAlignLeft size={24} />
//             </a>
//             <a
//               href="#"
//               onClick={(e) => handleNavigationExpendDown(e, "show")}
//               id="menu-expend-button"
//               ref={expendButtonRef}
//               style={{ display: navigationExpend ? "none" : "block" }}
//             >
//               <FiArrowRight size={24} />
//             </a>
//           </div>
//           {/* <!--! [End] nxl-navigation-toggle !-->
//                     <!--! [Start] nxl-lavel-mega-menu-toggle !--> */}
//           <div className="nxl-lavel-mega-menu-toggle d-flex d-lg-none">
//             <a
//               href="#"
//               onClick={(e) => {
//                 e.preventDefault(), setOpenMegaMenu(true);
//               }}
//               id="nxl-lavel-mega-menu-open"
//             >
//               <FiAlignLeft size={24} />
//             </a>
//           </div>
//           {/* <!--! [End] nxl-lavel-mega-menu-toggle !-->
//                     <!--! [Start] nxl-lavel-mega-menu !--> */}
//           {isPathPresent && (
//             <div className="nxl-drp-link nxl-lavel-mega-menu">
//               <div className="nxl-lavel-mega-menu-toggle d-flex d-lg-none">
//                 <a
//                   href="#"
//                   onClick={(e) => {
//                     e.preventDefault(), setOpenMegaMenu(false);
//                   }}
//                   id="nxl-lavel-mega-menu-hide"
//                 >
//                   <i className="me-2">
//                     <FiArrowLeft />
//                   </i>
//                   <span>Back</span>
//                 </a>
//               </div>
//               <div>
//                 {" "}
//                 <DateSection />{" "}
//               </div>
//               {/* <!--! [Start] nxl-lavel-mega-menu-wrapper !--> */}
//             </div>
//           )}
//         </div>

//         {/* <!--! [End] Header Left !-->
//                 <!--! [Start] Header Right !--> */}
//         <div className="header-right ms-auto">
//           <div className="d-flex align-items-center">
//             {isPathPresent && (
//               <>
//                 <span className="text-primary fw-semibold">
//                   {selectedAudience?.reportName || "Select Audience"}
//                 </span>
//                 <SearchModal
//                   audienceList={audienceList}
//                   setSelectedAudience={setSelectedAudience}
//                   setSearchQuery={setSearchQuery}
//                 />
//               </>
//             )}

//             <ProfileModal />
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;

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
    "/reports/overview",
    "/reports/device",
    "/reports/demographics",
    "/reports/creative",
    "/reports/category",
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
    localStorage.setItem("count", defaultAudience.cpm);

    setIsInitialized(true);
  }, [audienceList]);

  // Update localStorage when audience changes
  useEffect(() => {
    if (!isInitialized || !selectedAudience) return;

    const updates = [
      { key: "audienceId", value: selectedAudience._id },
      { key: "audienceName", value: selectedAudience.reportName },
      { key: "insertionId", value: selectedAudience.insertionOrderId },
      { key: "count", value: selectedAudience.cpm },
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
            style={{ marginLeft: "10px", marginRight: "26px" }}
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
            width={120}
            height={32}
            priority
          />

          {isPathPresent && <DateSection />}
        </div>

        {/* RIGHT */}
        <div className="header-right ms-auto d-flex align-items-center gap-2">
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
