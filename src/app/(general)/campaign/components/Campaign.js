"use client";
// import { createReportsDataContext } from "@/services/context";
import {
  addAudienceToUser,
  createAudience,
  deleteAudience,
  getAudience,
  updateAudience,
} from "@/services/createaudience";
import { createReportsDataAge } from "@/services/demographics";
import { createReportsDataDevice } from "@/services/device";
import { createReportsData } from "@/services/reports";
import Image from "next/image";

import React, { useState, useEffect } from "react";

const emptyCampaign = {
  reportName: "",
  advertiserId: "",
  campaignId: "",
  insertionOrderId: "",
  cpm: "",
};

const Campaign = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [audienceId, setAudienceId] = useState(null);

  useEffect(() => {
    const fetchAudiences = async () => {
      setLoading(true);
      try {
        const res = await getAudience(search);
        setCampaigns(res.data);
      } catch (error) {
        console.log("Error fetching audience:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAudiences();
  }, [search]);

  const openAddModal = () => {
    setCampaignData(emptyCampaign);
    setEditingIndex(null);
    setModalOpen(true);
  };

  const openEditModal = (index) => {
    setCampaignData(campaigns[index]);
    setEditingIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCampaignData(emptyCampaign);
    setEditingIndex(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCampaignData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const isValid =
      campaignData?.reportName?.trim() &&
      campaignData?.advertiserId?.trim() &&
      campaignData?.campaignId?.trim() &&
      campaignData?.insertionOrderId?.trim() &&
      campaignData?.cpm?.toString().trim();

    if (!isValid) return;
    setLoading(true);
    try {
      if (editingIndex !== null) {
        const id = campaignData._id || campaigns[editingIndex]?._id;
        const res = await updateAudience(id, campaignData);
        const params = {
          audienceId: res.audience._id,
          dataRange: "ALL_TIME",
        };
        if (res.audience._id) {
          await createReportsData(params);
          await createReportsDataDevice(params);
          await createReportsDataAge(params);
          // await createReportsDataContext(params);
        }
      } else {
        const res = await createAudience(campaignData);
        console.log("Create Audience Response:", res);
        const params = {
          audienceId: res.audience._id,
          dataRange: "ALL_TIME",
        };
        if (res.audience._id) {
          await createReportsData(params);
          await createReportsDataDevice(params);
          await createReportsDataAge(params);
          // await createReportsDataContext(params);
        }
      }

      // refresh list from backend
      const all = await getAudience();
      setCampaigns(all?.data || []);
      closeModal();
    } catch (err) {
      console.error("Error saving campaign:", err);
      closeModal();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAudience(id);
      const all = await getAudience();
      setCampaigns(all?.data || []);
    } catch (err) {
      console.error("Error deleting audience:", err);
    }
  };

  const openEmailModal = (id) => {
    setShowEmailModal(true);
    setError("");
    setAudienceId(id);
  };

  const handleAddUser = async () => {
    if (!email) return;

    try {
      setLoading(true);
      setError("");
      const res = await addAudienceToUser(email, audienceId);
      if (res.message) {
        closeModal();
        setShowEmailModal(false);
        setEmail("");
      }
    } catch (err) {
      setError("Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        {/* <h4>Processing...</h4> */}
        {/* <img src="/loader/loading.gif" alt="Loading..." width={100} height={100} /> */}
           <div className="box">
    <div className="bars">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body p-3 d-flex align-items-center justify-content-between">
        <h5 className="fw-bold mb-0">Campaigns</h5>
        <div className="d-flex gap-2 align-items-center">
          <button
            className="btn btn-sm btn-primary"
            onClick={openAddModal}
            title="Add Campaign"
          >
            <i className="feather-plus me-1"></i> Add
          </button>
        </div>
      </div>

      <div className="card-body p-3">
        <div className="table-responsive">
          <table className="table table-hover table-striped table-sm">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Advertiser ID</th>
                <th>Campaign ID</th>
                <th>Insertion Order ID</th>
                <th>CPM</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></div>
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && campaigns.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    No campaigns yet. Click "Add" to create one.
                  </td>
                </tr>
              )}

              {!loading &&
                campaigns.map((c, idx) => (
                  <tr key={c._id || idx}>
                    <td className="align-middle">{c.reportName}</td>
                    <td className="align-middle">{c.advertiserId}</td>
                    <td className="align-middle">{c.campaignId}</td>
                    <td className="align-middle">{c.insertionOrderId}</td>
                    <td className="align-middle">{c.cpm}</td>
                    <td className="text-end align-middle">
                      {/* action buttons as a single row with gap and inline SVG icons */}
                      <div
                        className="d-flex align-items-center justify-content-end"
                        style={{ gap: 8 }}
                      >
                        <button
                          className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
                          onClick={() => {
                            openEmailModal(c._id);
                          }}
                          title="Add User"
                          aria-label="Add User"
                          style={{ width: 36, height: 36, padding: 0 }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 20a8 8 0 0116 0"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 8v6m3-3h-6"
                            />
                          </svg>
                        </button>

                        <button
                          className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
                          onClick={() => openEditModal(idx)}
                          title="Edit"
                          aria-label="Edit"
                          style={{ width: 36, height: 36, padding: 0 }}
                        >
                          {/* edit SVG */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536M9 11l6 6H3v-6l6-6z"
                            />
                          </svg>
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                          onClick={() => handleDelete(c._id)}
                          title="Delete"
                          aria-label="Delete"
                          style={{ width: 36, height: 36, padding: 0 }}
                        >
                          {/* trash SVG */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-backdrop d-block">
          <div
            className="modal d-block"
            tabIndex={-1}
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleSave}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {editingIndex !== null ? "Edit Campaign" : "Add Campaign"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={closeModal}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row mb-3">
                      <div className="col-4 d-flex align-items-center">
                        <label className="fw-semibold mb-0">Report Name</label>
                      </div>
                      <div className="col-8">
                        <input
                          name="reportName"
                          value={campaignData?.reportName || ""}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="e.g. Q1 Performance"
                          required
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-4 d-flex align-items-center">
                        <label className="fw-semibold mb-0">
                          Advertiser ID
                        </label>
                      </div>
                      <div className="col-8">
                        <input
                          name="advertiserId"
                          value={campaignData?.advertiserId || ""}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="Advertiser ID"
                          required
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-4 d-flex align-items-center">
                        <label className="fw-semibold mb-0">Campaign ID</label>
                      </div>
                      <div className="col-8">
                        <input
                          name="campaignId"
                          value={campaignData?.campaignId || ""}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="Campaign ID"
                          required
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-4 d-flex align-items-center">
                        <label className="fw-semibold mb-0">
                          Insertion Order ID
                        </label>
                      </div>
                      <div className="col-8">
                        <input
                          name="insertionOrderId"
                          value={campaignData?.insertionOrderId || ""}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="Insertion Order ID"
                          required
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-4 d-flex align-items-center">
                        <label className="fw-semibold mb-0">CPM</label>
                      </div>
                      <div className="col-8">
                        <input
                          type="number"
                          name="cpm"
                          value={campaignData?.cpm || ""}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="Enter CPM"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={
                        !(
                          campaignData?.reportName?.trim() &&
                          campaignData?.advertiserId?.trim() &&
                          campaignData?.campaignId?.trim() &&
                          campaignData?.insertionOrderId?.trim() &&
                          campaignData?.cpm?.toString().trim()
                        )
                      }
                    >
                      {editingIndex !== null ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              {/* Header */}
              <div className="modal-header">
                <h5 className="modal-title">Add User</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEmailModal(false)}
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter user email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowEmailModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleAddUser()}
                  disabled={!email}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaign;
