"use client";
import React, { useState } from "react";

const NewReport = ({ show, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    advertiserID: "",
    insertionId: "",
    startDate: "",
    endDate: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      title: "",
      advertiserID: "",
      insertionId: "",
      startDate: "",
      endDate: ""
    });
  };

  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content ">
            <div style={{ backgroundColor: "#007ACC", color: "white" }} className="modal-header">
              <h5 className="modal-title">Create New Report</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Advertiser ID</label>
                  <input
                    type="text"
                    name="advertiserID"
                    className="form-control"
                    value={formData.advertiserID}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Insertion ID</label>
                  <input
                    type="text"
                    name="insertionId"
                    className="form-control"
                    value={formData.insertionId}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-control"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-control"
                    value={formData.endDate}
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
                  Create Report
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ background: "rgba(0,0,0,0.5)", zIndex: 1040 }}
        onClick={onClose}
      />
    </>
  );
};

export default NewReport;
