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

              <div style={{ width: "100%" }}>
                {navigationOpen || isHovered ? (
                  <p
                    style={{
                      marginLeft: "110px",
                      marginBottom: "-12px",
                      color: "#fff",
                      fontSize: "9px",
                    }}
                  >
                    Built by
                  </p>
                ) : (
                  <p
                    style={{
                      marginLeft: "45px",
                      marginBottom: "-12px",
                      color: "#fff",
                      fontSize: "9px",
                    }}
                  >
                    Built by
                  </p>
                )}

                {navigationOpen || isHovered ? (
                   <div
                   style={{
                      marginLeft: "30px"
                    }}
                  >
                  <Image
                    width={500}
                    height={125}
                    style={{ width: "110px", height: "35px" }}
                    src="/images/automate360.png"
                    alt="logo"
                    className=""
                  />
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      width={500}
                      height={125}
                      style={{ width: "55px", height: "35px" }}
                      src="/images/a360.png"
                      alt="logo"
                    />
                  </div>
                )}
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
