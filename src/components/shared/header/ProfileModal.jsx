"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiLogOut, FiChevronDown } from "react-icons/fi";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { jwtDecode } from "jwt-decode";

const ProfileModal = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const getTheme = () => {
      if (typeof document === "undefined") return false;
      return document.documentElement.getAttribute("data-theme") === "dark";
    };

    setIsDark(getTheme());

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          setIsDark(getTheme());
          break;
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Theme Colors (Same as DateSection)
  const colors = {
    background: isDark ? "#111827" : "#F8FAFC",
    secondaryBackground: isDark ? "#1E293B" : "#ffffff",
    border: isDark ? "#334155" : "#D1D5DB",
    text: isDark ? "#F8FAFC" : "#111827",
    secondaryText: isDark ? "#94A3B8" : "#475569",
    accent: "#2563EB",
    accentSoft: isDark ? "#1E3A8A" : "#EFF6FF",
    danger: "#B91C1C",
    dangerSoft: isDark ? "#450A0A" : "#FEE2E2",
    shadow: isDark
      ? "0 20px 40px rgba(0,0,0,.55)"
      : "0 20px 40px rgba(15,23,42,.12)",
  };

  let userDetails = {
    email: "",
    name: "",
    userId: "",
  };

  if (session?.user?.token) {
    const decoded = jwtDecode(session.user.token);

    userDetails = {
      email: decoded.email,
      name: decoded.name,
      userId: decoded.id,
    };
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();

    await signOut({
      redirect: false,
    });

    router.push("/");
  };

  const userInitial = userDetails.name
    ? userDetails.name.charAt(0).toUpperCase()
    : "U";

  const pillStyles = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    border: `1px solid ${colors.border}`,
    borderRadius: "14px",
    background: isDark ? "#0F172A" : "#FFFFFF",
    padding: "10px 16px",
    transition: "all .25s ease",
    color: colors.text,
    userSelect: "none",
    minWidth: "210px",
    height: "52px",
    boxShadow: isDark
      ? "0 12px 30px rgba(0,0,0,.35)"
      : "0 10px 25px rgba(15,23,42,.08)",
  };

  const dropdownStyles = {
    display: isOpen ? "block" : "none",
    position: "absolute",
    right: 0,
    top: "calc(100% + 8px)",
    width: "290px",
    borderRadius: "16px",
    overflow: "hidden",
    border: `1px solid ${colors.border}`,
    background: isDark ? "rgba(15,23,42,.96)" : "rgba(255,255,255,.98)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    boxShadow: isDark
      ? "0 30px 60px rgba(0,0,0,.45)"
      : "0 25px 50px rgba(15,23,42,.12)",
    animation: "dropdown .22s ease",
    zIndex: 9999,
  };

  const cardStyles = {
    background: colors.secondaryBackground,
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    padding: "14px",
    transition: ".25s",
  };

  const buttonStyles = {
    width: "100%",
    height: "44px",
    border: "none",
    borderRadius: "12px",
    background: isDark ? "linear-gradient(135deg,#EF4444,#DC2626)" : "#B91C1C",
    color: "#FFFFFF",
    WebkitTextFillColor: "#FFFFFF",
    fill: "#FFFFFF",
    fontWeight: 700,
    fontSize: "14px",
    letterSpacing: "0.02em",
    cursor: "pointer",
    transition: ".25s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow: isDark
      ? "0 10px 24px rgba(239,68,68,.25)"
      : "0 14px 28px rgba(185,28,28,.28)",
  };

  return (
    <div
      style={{ position: "relative" }}
      ref={wrapperRef}
      className="profile-modal-root"
    >
      <div
        className="profile-modal-trigger"
        aria-label="User Profile Menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        style={pillStyles}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            WebkitTextFillColor: "#FFFFFF",
            fontWeight: 700,
            fontSize: "14px",
            flexShrink: 0,
            boxShadow: "0 8px 18px rgba(37,99,235,.25)",
          }}
        >
          {userInitial}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              color: colors.text,
              fontSize: "13px",
              fontWeight: 700,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "120px",
            }}
          >
            {userDetails.name || "User"}
          </span>
        </div>

        <FiChevronDown
          size={15}
          style={{
            color: colors.secondaryText,
            marginLeft: "4px",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .25s ease",
          }}
        />
      </div>

      <div className="profile-modal-dropdown" style={dropdownStyles}>
        <div style={{ padding: "10px" }}>
          <div style={cardStyles} className="profile-modal-card">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  position: "relative",
                  width: 46,
                  height: 46,
                }}
              >
                <div
                  className="profile-avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: isDark
                      ? "linear-gradient(135deg,#3B82F6,#2563EB,#1D4ED8)"
                      : "linear-gradient(135deg,#1D4ED8,#2563EB,#0EA5E9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 17,
                  }}
                >
                  <span>{userInitial}</span>
                </div>

                <span
                  style={{
                    position: "absolute",
                    right: 2,
                    bottom: 2,
                    width: 12,
                    height: 12,
                    background: "#22C55E",
                    borderRadius: "50%",
                    border: `2px solid ${colors.background}`,
                  }}
                />
              </div>
              <div
                className="profile-modal-info"
                style={{ overflow: "hidden" }}
              >
                <h6
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 700,
                    color: colors.text,
                  }}
                >
                  {userDetails.name}
                </h6>

                <div
                  className="profile-modal-email"
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: colors.secondaryText,
                  }}
                >
                  {userDetails.email}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: "0 14px 14px" }}>
            <div
              style={{
                height: 1,
                background: colors.border,
                margin: "12px 0",
              }}
            />
            <button
              onClick={handleLogout}
              className="profile-modal-signout"
              style={{
                ...buttonStyles,
                color: "#fff",
              }}
            >
              <FiLogOut size={17} className="logout-icon" />

              <span className="profile-modal-signout-text">Sign Out</span>
            </button>
          </div>
        </div>

        <style jsx>{`
          .profile-modal-dropdown {
            animation: dropdown 0.22s ease;
          }

          .profile-modal-trigger:hover {
            transform: translateY(-2px);
            box-shadow: 0 16px 36px rgba(37, 99, 235, 0.15);
            border-color: #2563eb;
          }

          .profile-modal-signout {
            background: ${isDark
              ? "linear-gradient(135deg,#EF4444,#DC2626)"
              : "#b91c1c"} !important;
            color: #ffffff !important;
            border: none !important;
          }

          .profile-modal-signout,
          .profile-modal-signout span,
          .profile-modal-signout svg {
            color: #ffffff !important;
            stroke: #ffffff !important;
          }

          .profile-modal-signout:hover {
            transform: translateY(-2px);
            box-shadow: 0 18px 35px rgba(239, 68, 68, 0.35);
          }

          .profile-modal-signout:active {
            transform: translateY(0px);
          }

          .profile-modal-info {
            margin-bottom: 14px;
          }

          .profile-modal-info h6 {
            margin-bottom: 6px;
            letter-spacing: 0.01em;
          }

          .profile-modal-email {
            opacity: 0.75;
          }

          @keyframes dropdown {
            0% {
              opacity: 0;
              transform: translateY(12px) scale(0.96);
            }

            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @media (max-width: 768px) {
            .profile-modal-dropdown {
              width: 300px !important;
              min-width: 300px !important;
            }
          }

          @media (max-width: 480px) {
            .profile-modal-dropdown {
              right: 0;
              width: 240px !important;
              min-width: 240px !important;
            }

            .profile-modal-trigger span {
              max-width: 100px;
            }
          }

          .profile-modal-card {
            transition: 0.25s;
          }

          .profile-modal-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 18px 45px rgba(37, 99, 235, 0.12);
          }

          .profile-modal-signout,
          .profile-modal-signout * {
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
          }

          .profile-modal-signout svg {
            color: #ffffff !important;
            stroke: #ffffff !important;
          }

          /* Dropdown avatar letter */
          .profile-avatar,
          .profile-avatar * {
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
          }

          /* Sign Out button */
          .profile-modal-signout {
            color: #ffffff !important;
          }

          /* Sign Out text */
          .profile-modal-signout-text {
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
          }

          .logout-icon {
            color: #fff !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ProfileModal;
