// "use client";

// import LoginForm from '@/components/authentication/LoginForm';
// import Image from 'next/image';
// import React, { useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';

// const Page = () => {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   useEffect(() => {
//     if (status === "authenticated" && session?.user) {
//       router.push("/"); 
//     }
//   }, [status, session, router]);

//   if (status === "loading") {
//     return <div>Loading...</div>;
//   }

//   return (
//     <main className="min-vh-100 d-flex">
//       {/* Left Side - 70% */}
//       <div className="col-lg-8 bg-white d-flex align-items-center justify-content-center p-4">
//         <div className="w-100" style={{ maxWidth: '500px' }}>
//           {/* Logo */}
//           <div className="text-center mb-4">
//             <img 
//               src="/images/logo-abbr.png" 
//               alt="Logo" 
//               className="mb-3"
//               style={{ width: '80px', height: '80px' }}
//             />
//             <h2 className="fw-bold mb-2">Welcome Back</h2>
//             <p className="text-muted">Please login to your account</p>
//           </div>

//           {/* Login Form */}
//           <LoginForm 
//             registerPath={"/authentication/register/creative"} 
//             resetPath={"/authentication/reset/creative"} 
//           />
//         </div>
//       </div>

//       {/* Right Side - 30% */}
//       <div className="col-lg-4 bg-primary d-none d-lg-flex align-items-center justify-content-center p-5">
//         <div className="text-center text-white">
//           <Image 
//             width={300} 
//             height={300} 
//             src="/images/auth/auth-user.png" 
//             alt="Authentication illustration" 
//             className="img-fluid mb-4" 
//           />
//           <h4 className="fw-bold mb-3">Start Your Journey</h4>
//           <p className="opacity-75">
//             Join thousands of users who trust our platform
//           </p>
//         </div>
//       </div>
//     </main>
//   );
// }

// export default Page;


"use client";

import LoginForm from "@/components/authentication/LoginForm";
import Image from "next/image";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/report");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="vh-100 d-flex">
      {/* LEFT SIDE – Login */}
      <div className="col-lg-6 d-flex align-items-center justify-content-center px-4">
        <div style={{ maxWidth: 420, width: "100%" }}>
          <h2 className="fw-bold mb-2">Welcome Back!</h2>
          <p className="text-muted mb-4">
            Sign in to access your dashboard and continue optimizing your QA
            process.
          </p>

          <LoginForm
            registerPath="/authentication/register/creative"
            resetPath="/authentication/reset/creative"
          />
        </div>
      </div>

      {/* RIGHT SIDE – Marketing */}
      <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center position-relative text-white auth-gradient">
        <div className="p-5" style={{ maxWidth: 520 }}>
          <h1 className="fw-bold mb-4">
            Revolutionize QA with <br /> Smarter Automation
          </h1>

          <blockquote className="opacity-75 fs-5 mb-4">
            “SoftQA has completely transformed our testing process. It’s
            reliable, efficient, and ensures our releases are always
            top-notch.”
          </blockquote>

          <div className="d-flex align-items-center gap-3 mb-5">
            <Image
              src="/images/auth/avatar.png"
              alt="User"
              width={48}
              height={48}
              className="rounded-circle"
            />
            <div>
              <div className="fw-semibold">Michael Carter</div>
              <small className="opacity-75">
                Software Engineer at DevCore
              </small>
            </div>
          </div>

          <div className="mt-5">
            <small className="text-uppercase opacity-75">
              Join 1k+ teams
            </small>
            <div className="d-flex flex-wrap gap-4 mt-3 opacity-75">
              <Image src="/images/brands/discord.svg" alt="Discord" width={90} height={24} />
              <Image src="/images/brands/mailchimp.svg" alt="Mailchimp" width={90} height={24} />
              <Image src="/images/brands/grammarly.svg" alt="Grammarly" width={90} height={24} />
              <Image src="/images/brands/dropbox.svg" alt="Dropbox" width={90} height={24} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
