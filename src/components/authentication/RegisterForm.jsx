"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { registerUser } from "@/services/users";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiEye, FiEyeOff } from "react-icons/fi";

const RegisterForm = ({ path }) => {
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      role: "user",
      termsCondition: true,
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Full name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      role: Yup.string().required("Role is required"),
      termsCondition: Yup.bool().oneOf([true], "You must accept terms"),
    }),
    onSubmit: async (values, { resetForm }) => {
      console.log(values.fullName, values.role, values.email, values.password)
      try {
        const res = await registerUser(values.fullName, values.role, values.email, values.password);
        if (res.message) {
          toast.success(res.message);
          resetForm();
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
        Register for account
      </h2>
      <p
        className="fs-13 mb-4"
        style={{ color: "var(--text-secondary)", fontWeight: "500" }}
      >
        Create a new user account with specified permissions
      </p>

      <form onSubmit={formik.handleSubmit} className="w-100 mt-3">
        {/* Full Name */}
        <div className="mb-3">
          <label
            htmlFor="fullName"
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
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formik.values.fullName}
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
          {formik.touched.fullName && formik.errors.fullName && (
            <div className="text-danger mt-1 fs-12 fw-medium">{formik.errors.fullName}</div>
          )}
        </div>

        {/* Email */}
        <div className="mb-3">
          <label
            htmlFor="email"
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
            Email Address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="v.dhama@intellectads.co.in"
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

        {/* Password with show/hide */}
        <div className="mb-3">
          <label
            htmlFor="password"
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
              id="password"
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

        {/* Role Dropdown */}
        <div className="mb-3">
          <label
            htmlFor="role"
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
            User Role
          </label>
          <select
            id="role"
            name="role"
            value={formik.values.role}
            onChange={formik.handleChange}
            style={{
              width: "100%",
              padding: "11px 16px",
              borderRadius: "12px",
              border: "1px solid var(--input-border)",
              backgroundColor: "var(--input-bg)",
              color: "var(--text-primary)",
              fontSize: "0.88rem",
              fontWeight: "600",
              outline: "none",
              cursor: "pointer",
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
          >
            <option value="user" style={{ backgroundColor: "var(--card-bg)", color: "var(--text-primary)" }}>
              User
            </option>
            <option value="admin" style={{ backgroundColor: "var(--card-bg)", color: "var(--text-primary)" }}>
              Admin
            </option>
          </select>
          {formik.touched.role && formik.errors.role && (
            <div className="text-danger mt-1 fs-12 fw-medium">{formik.errors.role}</div>
          )}
        </div>

        {/* Terms */}
        <div className="mt-3">
          <div className="d-flex align-items-center gap-2">
            <input
              type="checkbox"
              name="termsCondition"
              id="termsCondition"
              checked={formik.values.termsCondition}
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
              htmlFor="termsCondition"
              style={{ color: "var(--text-secondary)", fontWeight: "500" }}
            >
              I agree to all the{" "}
              <a href="#" style={{ color: "#3B82F6", fontWeight: "600", textDecoration: "none" }}>
                Terms &amp; Conditions
              </a>{" "}
              and{" "}
              <a href="#" style={{ color: "#3B82F6", fontWeight: "600", textDecoration: "none" }}>
                Fees
              </a>
              .
            </label>
          </div>
          {formik.touched.termsCondition && formik.errors.termsCondition && (
            <div className="text-danger mt-1 fs-12 fw-medium">{formik.errors.termsCondition}</div>
          )}
        </div>

        {/* Submit */}
        <div className="mt-4 pt-2">
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
            Create Account
          </button>
        </div>
      </form>

      <div className="mt-4 pt-2 fs-14" style={{ color: "var(--text-secondary)" }}>
        <span>Already have an account?</span>
        <Link
          href={path}
          style={{ color: "#3B82F6", fontWeight: "700", marginLeft: "6px", textDecoration: "none" }}
        >
          Login
        </Link>
      </div>
    </>
  );
};

export default RegisterForm;
