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
      <div className="auth-creative-inner">
        <div className="creative-card-wrapper">
          <div className=''>
            <div className="row flex-1 g-0">
              {/* Left Side - 70% White Background with Image */}
              <div className="col-lg-7 d-md-block d-sm-none order-0 order-lg-0">
                <div className="d-flex align-items-center justify-content-center p-5">
                  <Image
                    width={800}
                    height={399}
                    src="/images/dashboard_logo1.png"

                    alt="img"
                    className="img-fluid"
                  />
                </div>
              </div>

              {/* Right Side - 30% with Register Form */}
              <div className="col-lg-5 h-100 my-auto order-1 order-lg-1 position-relative">
                {/* Logo positioned at top center */}
                <div className="text-center pt-4 pb-3">
                  <img
                    src="/images/login_logo.png"
                    alt="logo"
                    className="img-fluid"
                    style={{ width: '240px', marginBottom: '30' }}
                  />
                </div>

                {/* Register Form */}
                <div className="creative-card-body card-body px-4 pb-5">
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