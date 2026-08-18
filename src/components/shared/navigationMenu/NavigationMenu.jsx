import React, { useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PerfectScrollbar from "react-perfect-scrollbar";
import { FiSunrise } from "react-icons/fi";
import Menus from "./Menus";
import { NavigationContext } from "@/contentApi/navigationProvider";

const NavigationManu = () => {
  const { navigationOpen, setNavigationOpen } = useContext(NavigationContext);
  const [isHovered, setIsHovered] = useState(false);
  const pathName = usePathname();

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!navigationOpen && window.innerWidth > 1024) {
      document.documentElement.classList.remove("minimenu");
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!navigationOpen && window.innerWidth > 1024) {
      document.documentElement.classList.add("minimenu");
    }
  };

  return (
    <nav
      className={`nxl-navigation ${navigationOpen ? "mob-navigation-active" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="navbar-wrapper">
        <div className="m-header">
          <Link href="/" className="b-brand">
            {/* <!-- ========   change your logo hear   ============ --> */}
            <Image
              width={140}
              height={40}
              src="/images/logo360.png"
              alt="logo"
              className="logo logo-lg"
            />
            <Image
              width={140}
              height={40}
              src="/images/logo-abbr.png"
              alt="logo"
              className="logo logo-sm"
            />
          </Link>
        </div>

        <div className={`navbar-content`}>
          <PerfectScrollbar>
            <div
              style={{
                justifyContent: "space-between",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <ul className="nxl-navbar">
                <Menus />
              </ul>

              <div
                className="sidebar-footer-wrapper"
                style={{
                  width: "100%",
                  padding: "16px 8px 8px 8px",
                  marginTop: "auto",
                  borderTop: "1px solid #1C2541",
                }}
              >
                <div
                  className="sidebar-footer-badge"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid #1C2541",
                    borderRadius: "10px",
                    padding: "8px 6px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 2px 0",
                      color: "#8D99AE",
                      fontSize: "9px",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      textAlign: "center",
                    }}
                  >
                    Built by
                  </p>

                  {navigationOpen || isHovered ? (
                    <Image
                      width={500}
                      height={125}
                      style={{ width: "110px", height: "32px", objectFit: "contain" }}
                      src="/images/automate360.png"
                      alt="logo"
                    />
                  ) : (
                    <Image
                      width={500}
                      height={125}
                      style={{ width: "45px", height: "30px", objectFit: "contain" }}
                      src="/images/a360.png"
                      alt="logo"
                    />
                  )}
                </div>
              </div>
            </div>
          </PerfectScrollbar>
        </div>
      </div>
      <div
        onClick={() => setNavigationOpen(false)}
        className={`${navigationOpen ? "nxl-menu-overlay" : ""}`}
      ></div>
    </nav>
  );
};

export default NavigationManu;
