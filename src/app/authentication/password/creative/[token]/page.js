import PasswordForm from '@/components/authentication/PasswordForm'
import Image from 'next/image'
import React from 'react'

const page = ({params}) => {
  const { token } = params;
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
                  <PasswordForm token={token} path={"/authentication/login/creative"} />
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