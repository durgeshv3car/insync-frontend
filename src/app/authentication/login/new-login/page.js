"use client";

import LoginForm from '@/components/authentication/LoginForm';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/"); 
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-vh-100 d-flex">
      {/* Left Side - 70% */}
      <div className="col-lg-8 bg-white d-flex align-items-center justify-content-center p-4">
        <div className="w-100" style={{ maxWidth: '500px' }}>
          {/* Logo */}
          <div className="text-center mb-4">
            <img 
              src="/images/logo-abbr.png" 
              alt="Logo" 
              className="mb-3"
              style={{ width: '80px', height: '80px' }}
            />
            <h2 className="fw-bold mb-2">Welcome Back</h2>
            <p className="text-muted">Please login to your account</p>
          </div>

          {/* Login Form */}
          <LoginForm 
            registerPath={"/authentication/register/creative"} 
            resetPath={"/authentication/reset/creative"} 
          />
        </div>
      </div>

      {/* Right Side - 30% */}
      <div className="col-lg-4 bg-primary d-none d-lg-flex align-items-center justify-content-center p-5">
        <div className="text-center text-white">
          <Image 
            width={300} 
            height={300} 
            src="/images/auth/auth-user.png" 
            alt="Authentication illustration" 
            className="img-fluid mb-4" 
          />
          <h4 className="fw-bold mb-3">Start Your Journey</h4>
          <p className="opacity-75">
            Join thousands of users who trust our platform
          </p>
        </div>
      </div>
    </main>
  );
}

export default Page;