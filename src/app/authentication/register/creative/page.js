import RegisterForm from '@/components/authentication/RegisterForm'
import Image from 'next/image'
import React from 'react'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { jwtDecode } from "jwt-decode"

const page = async () => {
  // Check if user is authenticated and has super_admin role
  const session = await getServerSession(authOptions)
  
  // If no token found or role is not super_admin, show 404 permission error
  if (!session?.user?.token) {
    return (
      <main className="auth-creative-wrapper">
        <div className="auth-creative-inner">
          <div className="creative-card-wrapper">
            <div className="d-flex align-items-center justify-content-center" style={{ background:"white", minHeight: '100vh' }}>
              <div className="text-center">
                <h1 className="display-1 fw-bold text-danger">404</h1>
                <h2 className="mb-4">Permission Denied</h2>
                <p className="text-muted">You do not have permission to access this page.</p>
                <p className="text-muted">Please contact your administrator.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const decoded = jwtDecode(session.user.token)
  
  if (decoded.role !== "super_admin") {
    return (
      <main className="auth-creative-wrapper">
        <div className="auth-creative-inner">
          <div className="creative-card-wrapper">
            <div className="d-flex align-items-center justify-content-center" style={{ background:"white", minHeight: '100vh' }}>
              <div className="text-center">
                <h1 className="display-1 fw-bold text-danger">404</h1>
                <h2 className="mb-4">Permission Denied</h2>
                <p className="text-muted">You do not have permission to access this page.</p>
                <p className="text-muted">Only super administrators can register new users.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
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

              {/* Right Side - 30% with Register Form */}
              <div
                className="col-lg-5 col-12 order-1 position-relative"
                style={{
                  backgroundColor: "var(--page-bg)",
                  minHeight: "100vh",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "20px 0",
                  transition: "background-color 0.25s ease",
                }}
              >
                {/* Logo positioned at top center */}
                <div className="text-center pt-3 pb-2">
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

                {/* Register Form */}
                <div
                  className="creative-card-body card-body px-4 pb-4"
                  style={{ width: "100%", maxWidth: "440px", margin: "0 auto" }}
                >
                  <RegisterForm path={"/authentication/login/creative"} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default page