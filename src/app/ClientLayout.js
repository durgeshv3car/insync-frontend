"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import NavigationProvider from "@/contentApi/navigationProvider";
import SettingSideBarProvider from "@/contentApi/settingSideBarProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "Automate | Dashboard",
  description: "Automate is a admin Dashboard create for multipurpose,",
};

export default function ClientLayout({ children }) {
  useEffect(() => {
    const savedTheme = localStorage.getItem("appTheme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return (
    <SessionProvider>
      <SettingSideBarProvider>
        <NavigationProvider>
          <ToastContainer position="top-right" autoClose={3000} />
          {children}
        </NavigationProvider>
      </SettingSideBarProvider>
    </SessionProvider>
  );
}
