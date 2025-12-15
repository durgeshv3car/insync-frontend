"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPermission } from "@/services/permissions";

const CreateUser = ({ show, onClose }) => {
  const [formData, setFormData] = useState({ email: "", reportId: "" });
  const router = useRouter();

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    try {
      const res = await createPermission(formData);
      console.log("Response:", res);

      // Optional redirect
      // router.push("/permissionList");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleClose = () => {
    router.push("/permissionList");
    onClose();
  };

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content shadow-lg">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Create User</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={handleClose}
              ></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Report ID</label>
                  <input
                    type="txt"
                    name="reportId"
                    className="form-control"
                    value={formData.reportId}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
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
        style={{ background: "rgba(0,0,0,0.5)", zIndex: 1040 }}
        onClick={onClose}
      />
    </>
  );
};

export default CreateUser;
