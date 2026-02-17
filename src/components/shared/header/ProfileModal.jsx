import React, { useState, useRef, useEffect } from "react";
import { FiLogOut, FiChevronDown } from "react-icons/fi";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { jwtDecode } from "jwt-decode";

const ProfileModal = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  let userDetails = {
    email: "",
    name: "",
    userId: "",
  };
  // console.log(session)

  if (session?.user?.token) {
    const decoded = jwtDecode(session?.user?.token);
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

  await signOut({ redirect: false });
  router.push("/");
};


  return (
    <div style={{ position: "relative" }} ref={wrapperRef}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "6px 0",
          cursor: "pointer",
          background: "transparent",
          border: "none",
          color: "#ffffff",
          fontSize: "13px",
          fontWeight: 600,
          transition: "opacity 0.2s ease",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{userDetails.name}</span>
        <FiChevronDown size={14} style={{ marginLeft: "6px" }} />
      </div>
      <div 
        style={{
          display: isOpen ? "block" : "none",
          position: "absolute",
          right: 0,
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          padding: "8px",
          marginTop: "12px",
          background: "#fff",
          minWidth: "250px",
          zIndex: 1050
        }}
      >
        <div className="p-3 mb-2 rounded-3" style={{ background: "#f8fafc", border: "1px solid #f1f5f9" }}>
          <div className="d-flex align-items-center">
            <div className="ms-3">
              <h6 style={{ color: "#1e293b", fontWeight: 800, marginBottom: "2px", fontSize: "14px" }}>{userDetails.name}</h6>
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#64748b" }}>
                {userDetails.email}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="dropdown-item d-flex align-items-center p-3 rounded-3"
          style={{
            color: "#dc2626",
            fontWeight: 700,
            fontSize: "13.5px",
            transition: "all 0.2s ease",
            width: "100%",
            border: "none",
            background: "transparent",
            cursor: "pointer"
          }}
        >
          <FiLogOut className="me-3" size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
