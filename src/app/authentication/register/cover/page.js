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
      <main className="auth-cover-wrapper">
        <div className="auth-cover-sidebar-inner">
          <div className="auth-cover-card-wrapper">
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
      <main className="auth-cover-wrapper">
        <div className="auth-cover-sidebar-inner">
          <div className="auth-cover-card-wrapper">
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
    <main className="auth-cover-wrapper">
      <div className="auth-cover-content-inner">
        <div className="auth-cover-content-wrapper">
          <div className="auth-img">
            <Image width={600} height={600} sizes='100vw' src="/images/auth/auth-cover-register-bg.svg" alt="img" className="img-fluid" />
          </div>
        </div>
      </div>
      <div className="auth-cover-sidebar-inner">
        <div className="auth-cover-card-wrapper">
          <div className="auth-cover-card p-sm-5">
            <div className="wd-50 mb-5">
              <img src="/images/logo-abbr.png" alt="img" className="img-fluid" />
            </div>
            <RegisterForm path={"/authentication/login/cover"} />
          </div>
        </div>
      </div>
    </main>
  )
}

export default page