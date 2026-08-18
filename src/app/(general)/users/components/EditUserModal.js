"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateUser } from "@/services/users";
import { Pencil } from "lucide-react";

const EditUserModal = ({ show, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({ email: "", role: "" });
  const router = useRouter();

  // Sync when user changes
  useEffect(() => {
    if (user) {
      setFormData({ email: user.email || "", role: user.role || "" });
    }
  }, [user]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateUser(user._id, formData)
    onSave(user._id, formData);
  };

  const handleClose = () => {
    router.push("/users")
    onClose()
  }

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 9999 }}>
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px", overflow: "hidden", background: "var(--card-bg)" }}>
            {/* Header */}
            <div
              className="modal-header"
              style={{
                background: "var(--modal-header-bg)",
                borderBottom: "1px solid var(--modal-border)",
                padding: "18px 24px",
              }}
            >
              <h5 className="modal-title" style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "17px", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "10px",
                  background: "linear-gradient(135deg,#2563EB,#3B82F6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(37,99,235,0.3)"
                }}>
                  <Pencil size={16} color="#fff" />
                </div>
                Edit User
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
              />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ background: "var(--page-bg)", padding: "24px" }}>
                {/* Email Field */}
                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-primary)" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      borderRadius: "10px",
                      border: "1px solid var(--input-border)",
                      background: "var(--input-bg)",
                      padding: "10px 14px",
                      fontSize: "13.5px",
                      color: "var(--input-text)",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                      outline: "none",
                      transition: "all 0.2s ease"
                    }}
                  />
                </div>

                {/* Role Field */}
                <div className="mb-2">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-primary)" }}>
                    User Role
                  </label>
                  <select
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    style={{
                      borderRadius: "10px",
                      border: "1px solid var(--input-border)",
                      background: "var(--input-bg)",
                      padding: "10px 14px",
                      fontSize: "13.5px",
                      color: "var(--input-text)",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="" style={{ background: "var(--card-bg)", color: "var(--text-primary)" }}>Select Role</option>
                    <option value="admin" style={{ background: "var(--card-bg)", color: "var(--text-primary)" }}>admin</option>
                    <option value="super_admin" style={{ background: "var(--card-bg)", color: "var(--text-primary)" }}>super_admin</option>
                    <option value="user" style={{ background: "var(--card-bg)", color: "var(--text-primary)" }}>user</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer" style={{ background: "var(--modal-bg)", borderTop: "1px solid var(--modal-border)", padding: "16px 24px" }}>
                <button
                  type="button"
                  className="btn"
                  onClick={onClose}
                  style={{
                    background: "var(--page-bg)",
                    border: "1px solid var(--card-border)",
                    color: "var(--text-primary)",
                    borderRadius: "9px",
                    fontWeight: 600,
                    fontSize: "13px",
                    padding: "8px 20px"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{
                    background: "linear-gradient(135deg,#2563EB,#3B82F6)",
                    border: "none",
                    color: "#ffffff",
                    borderRadius: "9px",
                    fontWeight: 600,
                    fontSize: "13px",
                    padding: "8px 20px",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
                    transition: "all 0.2s ease"
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Custom backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ background: "rgba(15, 23, 42, 0.6)", zIndex: 9998, backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
    </>
  );
};

export default EditUserModal;
