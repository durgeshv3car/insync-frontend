"use client";

import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { loginUser } from "@/lib/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useRouter } from "next/navigation";

const LoginForm = ({ registerPath, resetPath }) => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email format")
        .required("Email or Username is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await loginUser({
          email: values.email,
          password: values.password,
        });
        if (res.ok) {
          toast.success(res.message || "Login successful");
          router.push("/report");
        } else {
          toast.error(res.error || "Login failed");
        }
      } catch (error) {
        toast.error(error.message || "Something went wrong!");
      }
    },
  });

  return (
    <>
      <ToastContainer />
      <h2
        className="fs-22 fw-bolder mb-2"
        style={{ color: "var(--text-primary)", letterSpacing: "-0.3px" }}
      >
        Login to your account
      </h2>
      <p
        className="fs-13 mb-4"
        style={{ color: "var(--text-secondary)", fontWeight: "500" }}
      >
        Welcome back! Please enter your credentials to continue
      </p>

      <form onSubmit={formik.handleSubmit} className="w-100 mt-3">
        {/* Email */}
        <div className="mb-3">
          <label
            htmlFor="loginEmail"
            style={{
              fontWeight: "700",
              color: "var(--text-primary)",
              fontSize: "0.74rem",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              marginBottom: "6px",
              display: "block",
            }}
          >
            Email or Username
          </label>
          <input
            id="loginEmail"
            type="email"
            name="email"
            placeholder="Email or Username"
            value={formik.values.email}
            onChange={formik.handleChange}
            style={{
              width: "100%",
              padding: "11px 16px",
              borderRadius: "12px",
              border: "1px solid var(--input-border)",
              backgroundColor: "var(--input-bg)",
              color: "var(--text-primary)",
              fontSize: "0.88rem",
              fontWeight: "500",
              outline: "none",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#2563EB";
              e.currentTarget.style.boxShadow = "0 0 0 3.5px rgba(37, 99, 235, 0.2)";
            }}
            onBlur={(e) => {
              formik.handleBlur(e);
              e.currentTarget.style.borderColor = "var(--input-border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-danger mt-1 fs-12 fw-medium">{formik.errors.email}</div>
          )}
        </div>

        {/* Password */}
        <div className="mb-3">
          <label
            htmlFor="loginPassword"
            style={{
              fontWeight: "700",
              color: "var(--text-primary)",
              fontSize: "0.74rem",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              marginBottom: "6px",
              display: "block",
            }}
          >
            Password
          </label>
          <div className="position-relative">
            <input
              id="loginPassword"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={formik.values.password}
              onChange={formik.handleChange}
              style={{
                width: "100%",
                padding: "11px 44px 11px 16px",
                borderRadius: "12px",
                border: "1px solid var(--input-border)",
                backgroundColor: "var(--input-bg)",
                color: "var(--text-primary)",
                fontSize: "0.88rem",
                fontWeight: "500",
                outline: "none",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563EB";
                e.currentTarget.style.boxShadow = "0 0 0 3.5px rgba(37, 99, 235, 0.2)";
              }}
              onBlur={(e) => {
                formik.handleBlur(e);
                e.currentTarget.style.borderColor = "var(--input-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />

            <span
              className="position-absolute top-50 translate-middle-y c-pointer"
              style={{ right: "14px", color: "var(--text-secondary)", display: "flex" }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </span>
          </div>
          {formik.touched.password && formik.errors.password && (
            <div className="text-danger mt-1 fs-12 fw-medium">{formik.errors.password}</div>
          )}
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <input
              type="checkbox"
              name="rememberMe"
              id="rememberMe"
              checked={formik.values.rememberMe}
              onChange={formik.handleChange}
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "4px",
                accentColor: "#2563EB",
                cursor: "pointer",
              }}
            />
            <label
              className="c-pointer mb-0 fs-13"
              htmlFor="rememberMe"
              style={{ color: "var(--text-secondary)", fontWeight: "500" }}
            >
              Remember Me
            </label>
          </div>
          <div>
            <Link
              href={resetPath}
              style={{ color: "#3B82F6", fontWeight: "600", fontSize: "0.83rem", textDecoration: "none" }}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-4">
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "0.92rem",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              letterSpacing: "0.3px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(37, 99, 235, 0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(37, 99, 235, 0.35)";
            }}
          >
            Login
          </button>
        </div>
      </form>

    </>
  );
};

export default LoginForm;
