"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/shared/header/Header";
import NavigationManu from "@/components/shared/navigationMenu/NavigationMenu";
import SupportDetails from "@/components/supportDetails";
import useBootstrapUtils from "@/hooks/useBootstrapUtils";
import LoginForm from "@/components/authentication/LoginForm";
import Image from "next/image";
import React, { useEffect } from "react";
import Loading from "@/components/shared/Loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Layout = ({ children }) => {
  const pathName = usePathname();
  useBootstrapUtils(pathName);

  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Loading />;
  }

  if (session?.user?.token) {
    return (
      <>
        <Header />
        <NavigationManu />
        <main className="nxl-container">
          <div className="nxl-content">{children}</div>
        </main>
        <SupportDetails />
      </>
    );
  }

  return (
    <main className="auth-creative-wrapper">
      <div className="auth-creative-inner" style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
        <div className="creative-card-wrapper" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div className="row flex-1 g-0" style={{ flex: 1, minHeight: "100vh", alignItems: "stretch" }}>
              {/* Left Side - 70% White Background with Centered Image */}
              <div
                className="col-lg-7 d-none d-lg-flex align-items-center justify-content-center order-0"
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "40px",
                }}
              >
                <div className="w-100 d-flex align-items-center justify-content-center">
                  <Image
                    width={800}
                    height={399}
                    src="/images/dashboard_logo1.png"
                    alt="Showcase image"
                    className="img-fluid"
                    style={{
                      maxHeight: "85vh",
                      objectFit: "contain",
                      margin: "auto",
                    }}
                  />
                </div>
              </div>

              {/* Right Side - 30% with Login Form */}
              <div
                className="col-lg-5 col-12 order-1 position-relative d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: "var(--page-bg)",
                  minHeight: "100vh",
                  padding: "40px 20px",
                  transition: "background-color 0.25s ease",
                }}
              >
                <div style={{ width: "100%", maxWidth: "440px", margin: "auto" }}>
                  {/* Logo positioned at top center */}
                  <div className="text-center pb-3">
                    <img
                      src="/images/login_logo.png"
                      alt="logo"
                      className="img-fluid app-auth-logo"
                      style={{
                        width: "210px",
                        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))",
                      }}
                    />
                  </div>

                  {/* Login Form */}
                  <div className="creative-card-body card-body p-0">
                    <LoginForm
                      registerPath={"/authentication/register/creative"}
                      resetPath={"/authentication/reset/creative"}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Layout;
