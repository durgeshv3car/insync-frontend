"use client";
import { createReportsDataCity } from "@/services/city";
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
import { getSearchJobStatus } from "@/services/youtube";
import Image from "next/image";
import {
  Search,
  Loader2,
  CheckCircle2,
  Layout,
  Database,
  BarChart3,
  PieChart,
  MapPin,
  Pencil,
} from "lucide-react";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import { getAllUsers } from "@/services/users";

const emptyCampaign = {
  reportName: "",
  advertiserId: "",
  campaignId: "",
  insertionOrderId: "",
  cpcv: "",
  active: true,
};

const CampaignLoader = ({ progress, status }) => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 campaign-loader">
      <div className="campaign-loader-card">
        {/* Animated Icon */}
        <div className="campaign-loader-icon-wrap">
          <div className="ai-loader-pulse">
            <Database color="white" size={32} />
          </div>
        </div>

        <h4 className="campaign-loader-title">Creating Campaign Reports</h4>
        <p className="campaign-loader-subtitle">{status}</p>

        {/* Progress Bar Container */}
        <div className="campaign-progress-track">
          {/* Progress Bar Fill */}
          <div
            className="campaign-progress-fill"
            style={{ width: `${progress}%` }}
          >
            <div className="ai-loader-shimmer" />
          </div>
        </div>

        <div className="d-flex justify-content-between campaign-loader-meta">
          <span>{Math.round(progress)}% Complete</span>
          <span>Please wait...</span>
        </div>
      </div>
    </div>
  );
};

const Campaign = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [search, setSearch] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [audienceId, setAudienceId] = useState(null);
  const [userOptions, setUserOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchAudiences = async () => {
      setLoading(true);
      setProgress(10);
      setLoadingStatus("Fetching campaigns...");
      try {
        const res = await getAudience(search);
        setCampaigns(res.data);
        setProgress(100);
      } catch (error) {
        console.log("Error fetching audience:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchAudiences();
  }, [search]);

  useEffect(() => {
    if (showEmailModal) {
      const fetchUsers = async () => {
        try {
          const res = await getAllUsers();
          if (res.message && res.userData) {
            const formatted = res.userData.map((user) => ({
              value: user.email,
              label: `${user.email} (${user.role || "User"})`,
            }));
            setUserOptions(formatted);
          }
        } catch (error) {
          console.error("Failed to fetch users", error);
        }
      };
      fetchUsers();
    }
  }, [showEmailModal]);

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

  const pollJob = async (jobId, type) => {
    const POLLING_INTERVAL = 3000;
    const MAX_ATTEMPTS = 200; // Total ~10 minutes

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      try {
        const statusData = await getSearchJobStatus(jobId);
        const status = statusData.status || statusData.job?.status;

        if (status === "completed") {
          return statusData;
        }

        if (status === "failed") {
          throw new Error(
            `${type} job failed: ${statusData.error?.message || "Internal processing error"}`,
          );
        }
      } catch (err) {
        console.warn(`Polling error for ${type}:`, err);
        // Only throw if it's a structural failure, otherwise continue polling
        if (err.message.includes("job failed")) throw err;
      }

      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
    }
    throw new Error(`${type} job timed out after 10 minutes`);
  };

  const handleToggleActive = async (index) => {
    const c = campaigns[index];
    const updatedCampaign = { ...c, active: c.active !== false ? false : true };

    // Update local state first for instant visual feedback (optimistic update)
    const originalCampaigns = [...campaigns];
    const newCampaigns = [...campaigns];
    newCampaigns[index] = updatedCampaign;
    setCampaigns(newCampaigns);

    try {
      await updateAudience(c._id, {
        reportName: updatedCampaign.reportName,
        advertiserId: updatedCampaign.advertiserId,
        campaignId: updatedCampaign.campaignId,
        insertionOrderId: updatedCampaign.insertionOrderId,
        cpcv: updatedCampaign.cpcv,
        active: updatedCampaign.active,
      });
    } catch (err) {
      console.error("Failed to toggle active status:", err);
      // Revert if API call fails
      setCampaigns(originalCampaigns);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const isValid =
      campaignData?.reportName?.trim() &&
      campaignData?.advertiserId?.trim() &&
      campaignData?.campaignId?.trim() &&
      campaignData?.insertionOrderId?.trim() &&
      campaignData?.cpcv?.toString().trim();

    if (!isValid) return;
    setLoading(true);
    setProgress(5);
    setLoadingStatus("Initializing campaign...");
    try {
      let res;
      if (editingIndex !== null) {
        const id = campaignData._id || campaigns[editingIndex]?._id;
        setLoadingStatus("Updating campaign details...");
        res = await updateAudience(id, campaignData);
        setProgress(20);
      } else {
        setLoadingStatus("Creating active audience...");
        res = await createAudience(campaignData);
        setProgress(20);
      }

      if (editingIndex === null && res.audience?._id) {
        const params = {
          audienceId: res.audience._id,
          dataRange: "ALL_TIME",
        };

        setLoadingStatus("Generating Overview reports...");
        const overviewRes = await createReportsData(params);
        if (overviewRes.jobId) {
          await pollJob(overviewRes.jobId, "Overview");
        }
        setProgress(40);

        setLoadingStatus("Processing Device analytics...");
        const deviceRes = await createReportsDataDevice(params);
        if (deviceRes.jobId) {
          await pollJob(deviceRes.jobId, "Device");
        }
        setProgress(60);

        setLoadingStatus("Analyzing Demographics data...");
        const ageRes = await createReportsDataAge(params);
        if (ageRes.jobId) {
          await pollJob(ageRes.jobId, "Demographics");
        }
        setProgress(80);

        setLoadingStatus("Mapping Geographic performance...");
        const cityRes = await createReportsDataCity(params);
        if (cityRes.jobId) {
          await pollJob(cityRes.jobId, "City");
        }
        setProgress(95);
      }

      setLoadingStatus("Refreshing campaign list...");
      const all = await getAudience();
      setCampaigns(all?.data || []);
      setProgress(100);
      setTimeout(() => closeModal(), 500);
    } catch (err) {
      console.error("Error saving campaign:", err);
      closeModal();
    } finally {
      setTimeout(() => setLoading(false), 800);
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
    setSelectedUser(null);
    setEmail("");
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
    return <CampaignLoader progress={progress} status={loadingStatus} />;
  }

  return (
    <div
      style={{
        backgroundColor: "var(--card-bg)",
        borderRadius: "16px",
        border: "1px solid var(--card-border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
        overflow: "hidden",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        className="p-4 d-flex align-items-center justify-content-between"
        style={{ borderBottom: "1px solid var(--card-border)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
            }}
          >
            <Database size={18} />
          </div>
          <h5
            style={{
              fontWeight: "700",
              color: "var(--text-primary)",
              margin: 0,
              fontSize: "1.05rem",
              letterSpacing: "0.2px",
            }}
          >
            Campaigns
          </h5>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <button
            onClick={openAddModal}
            title="Add Campaign"
            style={{
              background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "8px 18px",
              fontSize: "0.85rem",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <i className="feather-plus"></i> Add Campaign
          </button>
        </div>
      </div>

      <div className="p-0">
        <div className="table-responsive">
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--table-header-bg)",
                  borderBottom: "2px solid var(--table-border)",
                }}
              >
                <th
                  style={{
                    padding: "14px 18px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Report Name
                </th>
                <th
                  style={{
                    padding: "14px 18px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Advertiser ID
                </th>
                <th
                  style={{
                    padding: "14px 18px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Campaign ID
                </th>
                <th
                  style={{
                    padding: "14px 18px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Insertion Order ID
                </th>
                <th
                  style={{
                    padding: "14px 18px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  CPCV
                </th>
                <th
                  className="text-center"
                  style={{
                    padding: "14px 18px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Status
                </th>
                <th
                  className="text-end"
                  style={{
                    padding: "14px 18px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div
                      className="spinner-border spinner-border-sm text-primary me-2"
                      role="status"
                    ></div>
                    <span
                      style={{
                        color: "var(--text-secondary)",
                        fontWeight: 500,
                      }}
                    >
                      Loading campaigns...
                    </span>
                  </td>
                </tr>
              )}

              {!loading && campaigns.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-5"
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    No campaigns found. Click "Add Campaign" to create one.
                  </td>
                </tr>
              )}

              {!loading &&
                campaigns.map((c, idx) => (
                  <tr key={c._id || idx} className="app-table-row">
                    <td
                      className="align-middle"
                      style={{
                        padding: "14px 18px",
                        color: "var(--text-primary)",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                      }}
                    >
                      {c.reportName}
                    </td>
                    <td
                      className="align-middle"
                      style={{
                        padding: "14px 18px",
                        color: "var(--text-secondary)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {c.advertiserId}
                    </td>
                    <td
                      className="align-middle"
                      style={{
                        padding: "14px 18px",
                        color: "var(--text-secondary)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {c.campaignId}
                    </td>
                    <td
                      className="align-middle"
                      style={{
                        padding: "14px 18px",
                        color: "var(--text-secondary)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {c.insertionOrderId}
                    </td>
                    <td
                      className="align-middle"
                      style={{
                        padding: "14px 18px",
                        color: "var(--text-primary)",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                      }}
                    >
                      {c.cpcv}
                    </td>
                    <td
                      className="text-center align-middle"
                      style={{ padding: "14px 18px" }}
                    >
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <span
                          className="status-pill"
                          style={{
                            backgroundColor:
                              c.active !== false
                                ? "rgba(16, 185, 129, 0.15)"
                                : "rgba(100, 116, 139, 0.15)",
                            color:
                              c.active !== false
                                ? "#10B981"
                                : "var(--text-secondary)",
                            border: `1px solid ${
                              c.active !== false
                                ? "rgba(16, 185, 129, 0.3)"
                                : "var(--card-border)"
                            }`,
                          }}
                        >
                          {c.active !== false ? "Active" : "Inactive"}
                        </span>

                        <div className="form-check form-switch mb-0 d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id={`active-switch-${c._id || idx}`}
                            checked={c.active !== false}
                            onChange={() => handleToggleActive(idx)}
                            style={{
                              cursor: "pointer",
                              alignSelf: "center",
                              marginTop: 0,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td
                      className="text-end align-middle"
                      style={{ padding: "14px 18px" }}
                    >
                      <div
                        className="d-flex align-items-center justify-content-end"
                        style={{ gap: 8 }}
                      >
                        <button
                          onClick={() => openEmailModal(c._id)}
                          title="Add User"
                          aria-label="Add User"
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "8px",
                            border: "1px solid var(--card-border)",
                            backgroundColor: "var(--card-bg)",
                            color: "#3B82F6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#2563EB";
                            e.currentTarget.style.color = "#FFFFFF";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--card-bg)";
                            e.currentTarget.style.color = "#3B82F6";
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
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
                          onClick={() => openEditModal(idx)}
                          title="Edit"
                          aria-label="Edit"
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "8px",
                            border: "1px solid var(--card-border)",
                            backgroundColor: "var(--card-bg)",
                            color: "#3B82F6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#2563EB";
                            e.currentTarget.style.color = "#FFFFFF";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--card-bg)";
                            e.currentTarget.style.color = "#3B82F6";
                          }}
                        >
                          <Pencil
                            size={17}
                            className="text-blue-500 hover:text-white cursor-pointer"
                          />
                        </button>

                        <button
                          onClick={() => handleDelete(c._id)}
                          title="Delete"
                          aria-label="Delete"
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "8px",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            backgroundColor: "var(--card-bg)",
                            color: "#EF4444",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#EF4444";
                            e.currentTarget.style.color = "#FFFFFF";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--card-bg)";
                            e.currentTarget.style.color = "#EF4444";
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
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

      {/* Add / Edit Campaign Modal */}
      {modalOpen && (
        <div className="modal-backdrop d-block app-modal-overlay">
          <div
            className="modal d-block"
            tabIndex={-1}
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content app-modal-content">
                <form onSubmit={handleSave}>
                  <div
                    className="modal-header"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      borderBottom: "1px solid var(--card-border)",
                      padding: "22px 28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "12px",
                          background:
                            "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
                        }}
                      >
                        <Database size={18} />
                      </div>
                      <h5
                        className="modal-title"
                        style={{
                          fontWeight: "700",
                          color: "var(--text-primary)",
                          margin: 0,
                          fontSize: "1.1rem",
                          letterSpacing: "0.2px",
                        }}
                      >
                        {editingIndex !== null
                          ? "Edit Campaign Details"
                          : "Create New Campaign"}
                      </h5>
                    </div>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={closeModal}
                      style={{
                        filter: "invert(1)",
                        opacity: 1,
                      }}
                    ></button>
                  </div>

                  <div className="modal-body" style={{ padding: "28px" }}>
                    <div className="row mb-4 align-items-center">
                      <div className="col-4">
                        <label
                          className="fw-bold mb-0"
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.78rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.6px",
                          }}
                        >
                          Report Name
                        </label>
                      </div>
                      <div className="col-8">
                        <div className="app-input-group">
                          <input
                            name="reportName"
                            value={campaignData?.reportName || ""}
                            onChange={handleInputChange}
                            className="app-input"
                            style={{ paddingLeft: "14px" }}
                            placeholder="e.g. Q1 Performance Campaign"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-4 align-items-center">
                      <div className="col-4">
                        <label
                          className="fw-bold mb-0"
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.78rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.6px",
                          }}
                        >
                          Advertiser ID
                        </label>
                      </div>
                      <div className="col-8">
                        <div className="app-input-group">
                          <input
                            name="advertiserId"
                            value={campaignData?.advertiserId || ""}
                            onChange={handleInputChange}
                            className="app-input"
                            style={{ paddingLeft: "14px" }}
                            placeholder="Enter Advertiser ID"
                            required
                            readOnly={editingIndex !== null}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-4 align-items-center">
                      <div className="col-4">
                        <label
                          className="fw-bold mb-0"
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.78rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.6px",
                          }}
                        >
                          Campaign ID
                        </label>
                      </div>
                      <div className="col-8">
                        <div className="app-input-group">
                          <input
                            name="campaignId"
                            value={campaignData?.campaignId || ""}
                            onChange={handleInputChange}
                            className="app-input"
                            style={{ paddingLeft: "14px" }}
                            placeholder="Enter Campaign ID"
                            required
                            readOnly={editingIndex !== null}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-4 align-items-center">
                      <div className="col-4">
                        <label
                          className="fw-bold mb-0"
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.78rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.6px",
                          }}
                        >
                          Insertion Order ID
                        </label>
                      </div>
                      <div className="col-8">
                        <div className="app-input-group">
                          <input
                            name="insertionOrderId"
                            value={campaignData?.insertionOrderId || ""}
                            onChange={handleInputChange}
                            className="app-input"
                            style={{ paddingLeft: "14px" }}
                            placeholder="Enter Insertion Order ID"
                            required
                            readOnly={editingIndex !== null}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-4 align-items-center">
                      <div className="col-4">
                        <label
                          className="fw-bold mb-0"
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.78rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.6px",
                          }}
                        >
                          CPCV Rate ($)
                        </label>
                      </div>
                      <div className="col-8">
                        <div className="app-input-group">
                          <input
                            type="number"
                            name="cpcv"
                            value={campaignData?.cpcv || ""}
                            onChange={handleInputChange}
                            className="app-input"
                            style={{ paddingLeft: "14px" }}
                            placeholder="0.0000"
                            min="0"
                            step="0.0001"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row mb-2 align-items-center">
                      <div className="col-4">
                        <label
                          className="fw-bold mb-0"
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.78rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.6px",
                          }}
                        >
                          Active Traffic Status
                        </label>
                      </div>
                      <div className="col-8 d-flex align-items-center">
                        <div className="form-check form-switch mb-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="campaign-active-modal"
                            name="active"
                            checked={campaignData?.active !== false}
                            onChange={(e) => {
                              setCampaignData((prev) => ({
                                ...prev,
                                active: e.target.checked,
                              }));
                            }}
                            style={{
                              cursor: "pointer",
                              transform: "scale(1.2)",
                              transformOrigin: "left",
                            }}
                          />
                          <label
                            className="form-check-label ms-3"
                            htmlFor="campaign-active-modal"
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: "600",
                              color:
                                campaignData?.active !== false
                                  ? "#10B981"
                                  : "var(--text-secondary)",
                            }}
                          >
                            {campaignData?.active !== false
                              ? "Active (Receiving Traffic/Reports)"
                              : "Inactive"}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="modal-footer"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      borderTop: "1px solid var(--card-border)",
                      padding: "20px 28px",
                      gap: "12px",
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        padding: "9px 22px",
                        borderRadius: "12px",
                        border: "1px solid var(--card-border)",
                        backgroundColor: "var(--card-bg)",
                        color: "var(--text-primary)",
                        fontWeight: "700",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                      onClick={closeModal}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--table-hover-bg)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--card-bg)")
                      }
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: "9px 24px",
                        borderRadius: "12px",
                        border: "none",
                        background:
                          "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                        color: "#ffffff",
                        fontWeight: "700",
                        fontSize: "0.85rem",
                        letterSpacing: "0.3px",
                        boxShadow: "0 4px 16px rgba(37, 99, 235, 0.4)",
                        cursor: "pointer",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateY(-1px)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "translateY(0)")
                      }
                      disabled={
                        !(
                          campaignData?.reportName?.trim() &&
                          campaignData?.advertiserId?.trim() &&
                          campaignData?.campaignId?.trim() &&
                          campaignData?.insertionOrderId?.trim() &&
                          campaignData?.cpcv?.toString().trim()
                        )
                      }
                    >
                      {editingIndex !== null
                        ? "Update Campaign"
                        : "Create Campaign"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User to Campaign Modal */}
      {showEmailModal && (
        <div
          className="modal fade show d-block app-modal-overlay"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content app-modal-content">
              {/* Header */}
              <div
                className="modal-header"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderBottom: "1px solid var(--card-border)",
                  padding: "22px 28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "12px",
                      background:
                        "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
                    }}
                  >
                    <Search size={18} />
                  </div>
                  <h5
                    className="modal-title"
                    style={{
                      fontWeight: "700",
                      color: "var(--text-primary)",
                      margin: 0,
                      fontSize: "1.1rem",
                      letterSpacing: "0.2px",
                    }}
                  >
                    Add User to Campaign
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEmailModal(false)}
                  style={{
                    filter: "invert(1)",
                    opacity: 1,
                  }}
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body" style={{ padding: "28px" }}>
                {error && (
                  <div
                    className="alert alert-danger py-2 px-3 mb-3"
                    style={{
                      borderRadius: "10px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}
                  >
                    {error}
                  </div>
                )}
                <div className="mb-2">
                  <label
                    className="form-label fw-bold"
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.78rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                      marginBottom: "10px",
                    }}
                  >
                    Select User Email
                  </label>
                  <Select
                    options={userOptions}
                    value={selectedUser}
                    onChange={(val) => {
                      setSelectedUser(val);
                      setEmail(val ? val.value : "");
                    }}
                    isClearable
                    isSearchable
                    placeholder="Search user email..."
                    menuPortalTarget={
                      typeof window !== "undefined" ? document.body : null
                    }
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: "var(--input-bg)",
                        borderColor: state.isFocused
                          ? "#2563EB"
                          : "var(--input-border)",
                        boxShadow: state.isFocused
                          ? "0 0 0 3.5px rgba(37, 99, 235, 0.25)"
                          : "none",
                        color: "var(--text-primary)",
                        borderRadius: "12px",
                        padding: "3px 6px",
                        minHeight: "44px",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "var(--text-primary)",
                        fontWeight: "500",
                        fontSize: "0.88rem",
                      }),
                      input: (base) => ({
                        ...base,
                        color: "var(--text-primary)",
                      }),
                      menuList: (base) => ({
                        ...base,
                        maxHeight: "180px",
                        backgroundColor: "var(--card-bg)",
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                      option: (base, state) => ({
                        ...base,
                        whiteSpace: "normal",
                        wordBreak: "break-all",
                        backgroundColor: state.isFocused
                          ? "var(--table-hover-bg)"
                          : "var(--card-bg)",
                        color: "var(--text-primary)",
                        fontSize: "0.85rem",
                        padding: "10px 14px",
                        cursor: "pointer",
                      }),
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div
                className="modal-footer"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderTop: "1px solid var(--card-border)",
                  padding: "20px 28px",
                  gap: "12px",
                }}
              >
                <button
                  style={{
                    padding: "9px 22px",
                    borderRadius: "12px",
                    border: "1px solid var(--card-border)",
                    backgroundColor: "var(--card-bg)",
                    color: "var(--text-primary)",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onClick={() => setShowEmailModal(false)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--table-hover-bg)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--card-bg)")
                  }
                >
                  Cancel
                </button>
                <button
                  style={{
                    padding: "9px 24px",
                    borderRadius: "12px",
                    border: "none",
                    background:
                      "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                    color: "#ffffff",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    letterSpacing: "0.3px",
                    boxShadow: "0 4px 16px rgba(37, 99, 235, 0.4)",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onClick={() => handleAddUser()}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-1px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                  disabled={!email}
                >
                  Add User
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
