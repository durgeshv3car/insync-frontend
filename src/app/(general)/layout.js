"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/shared/header/Header";
import NavigationManu from "@/components/shared/navigationMenu/NavigationMenu";
import SupportDetails from "@/components/supportDetails";
import useBootstrapUtils from "@/hooks/useBootstrapUtils";
import LoginForm from "@/components/authentication/LoginForm";
import Image from "next/image";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Layout = ({ children }) => {
  const pathName = usePathname();
  useBootstrapUtils(pathName);

  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
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
      <div className="auth-creative-inner">
        <div className="creative-card-wrapper">
          <div className="card  overflow-hidden" style={{ zIndex: 1 }}>
            <div className="row flex-1 g-0">
              {/* Left Side - 70% White Background with Image */}
              <div className="col-lg-8 h-100 bg-white order-0 order-lg-0">
                <div className="h-100 d-flex align-items-center justify-content-center p-5">
                  <Image
                    width={499}
                    height={399}
                    sizes="100vw"
                    src="/images/dashboard_logo1.png"
                    alt="img"
                    className="img-fluid"
                  />
                </div>
              </div>

              {/* Right Side - 30% with Login Form */}
              <div className="col-lg-4 h-100 my-auto order-1 order-lg-1 position-relative">
                {/* Logo positioned at top center */}
                <div className="text-center pt-4 pb-3">
                  <img
                    src="/images/login_logo.png"
                    alt="logo"
                    className="img-fluid"
                    style={{ width: "240px", height: "160px" }}
                  />
                </div>

                {/* Login Form */}
                <div className="creative-card-body card-body px-4 pb-5">
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
    </main>
  );
};

export default Layout;
