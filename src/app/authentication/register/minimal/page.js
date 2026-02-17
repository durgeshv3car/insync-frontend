import RegisterForm from '@/components/authentication/RegisterForm'
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
      <main className="auth-minimal-wrapper">
        <div className="auth-minimal-inner">
          <div className="minimal-card-wrapper">
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
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
      <main className="auth-minimal-wrapper">
        <div className="auth-minimal-inner">
          <div className="minimal-card-wrapper">
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
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
    <main className="auth-minimal-wrapper">
      <div className="auth-minimal-inner">
        <div className="minimal-card-wrapper">
          <div className="card mb-4 mt-5 mx-4 mx-sm-0 position-relative">
            <div className="wd-50 bg-white p-2 rounded-circle shadow-lg position-absolute translate-middle top-0 start-50">
              <img src="/images/logo-abbr.png" alt="img" className="img-fluid" />
            </div>
            <div className="card-body p-sm-5">
              <RegisterForm path={"/authentication/login/minimal"} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default page