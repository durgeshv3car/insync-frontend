"use client";
import React, { useEffect, useState } from "react";
import { Pencil, Trash2, User } from "lucide-react";
import EditUserModal from "./EditUserModal";
import { useRouter } from "next/navigation";
import { deleteUser, deleteUserAudience, getAllUsers } from "@/services/users";
import { Modal, Button } from "react-bootstrap";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import Select from "react-select";
import { addAudienceToUser, getAudience } from "@/services/createaudience";

function UserPage() {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCampaignsModal, setShowCampaignsModal] = useState(false);
  const [campaignsData, setCampaignsData] = useState([]);
  const [removeAudienceId, setremoveAudienceId] = useState(null);

  const [allCampaigns, setAllCampaigns] = useState([]);
  const [selectedCampaignToAllocate, setSelectedCampaignToAllocate] = useState(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");

  const getUserData = async () => {
    const res = await getAllUsers();
    if (res.message) {
      setUsers(res.userData);
    }
  };

  const fetchAllCampaigns = async () => {
    try {
      const res = await getAudience();
      if (res && res.data) {
        setAllCampaigns(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    }
  };

  useEffect(() => {
    getUserData();
    fetchAllCampaigns();
  }, []);

  const handleEdit = (id, user) => {
    router.push(`/users?id=${id}`);
    setEditingUser(user);
    setShowModal(true);
  };

  const handleOpenCampaigns = (user) => {
    setSelectedUserEmail(user.email);
    setremoveAudienceId(user.email);
    setCampaignsData(user.AudienceId || []);
    setShowCampaignsModal(true);
  };

  const handleAllocateCampaign = async () => {
    if (!selectedCampaignToAllocate || !selectedUserEmail) return;
    try {
      const campaignId = selectedCampaignToAllocate.value;
      const res = await addAudienceToUser(selectedUserEmail, campaignId);
      if (res.message) {
        setSelectedCampaignToAllocate(null);

        const refreshedUsers = await getAllUsers();
        if (refreshedUsers.message && refreshedUsers.userData) {
          setUsers(refreshedUsers.userData);
          const updatedUser = refreshedUsers.userData.find(u => u.email === selectedUserEmail);
          if (updatedUser) {
            setCampaignsData(updatedUser.AudienceId || []);
          }
        }
      }
    } catch (err) {
      console.error("Allocation failed", err);
    }
  };

  const allocatedIds = new Set(campaignsData.map(c => c._id));
  const availableCampaignOptions = allCampaigns
    .filter(c => !allocatedIds.has(c._id))
    .map(c => ({
      value: c._id,
      label: c.reportName || c.title || c._id
    }));

  const handleSave = (_id, updatedData) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === _id ? { ...u, ...updatedData } : u))
    );
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    const res = await deleteUser(id);
    if (res.message) {
      getUserData();
    }
  };

  const handleDeleteAudience = async (audienceId) => {
    const res = await deleteUserAudience(removeAudienceId, audienceId);
    if (res.message) {
      setShowCampaignsModal(false);
      getUserData();
    }
  };

  return (
    <div>
      {/* ── Page Wrapper ── */}
      <div className="app-page-wrapper">
        <PageHeader />

        {/* <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="app-page-title">Users</h4>
            <p className="app-page-subtitle">Manage all users, roles and campaign allocations</p>
          </div>
          <div className="user-count-badge">
            <User size={15} />
            {users.length} Users
          </div>
        </div> */}

        {/* ── Main Card ── */}
        <div className="app-card">
          <div className="table-responsive">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              {/* ── Table Head ── */}
              <thead>
                <tr className="app-table-head">
                  {["ID", "EMAIL", "ROLE", "ACTIONS"].map((col, i) => (
                    <th key={col} className="app-table-th" style={{
                      textAlign: i === 2 ? "center" : i === 3 ? "right" : "left",
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* ── Table Body ── */}
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-secondary)", fontSize: "14px" }}>
                      <User size={40} style={{ marginBottom: "12px", opacity: 0.3, display: "block", margin: "0 auto 12px" }} />
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="app-table-row">
                      {/* ID cell */}
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
                            color: "#ffffff",
                          }}>
                            <User size={15} color="#fff" />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{
                              fontSize: "12px",
                              color: "var(--text-secondary)",
                              fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
                              letterSpacing: "-0.2px",
                            }}>
                              {user._id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email cell */}
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ fontSize: "13.5px", color: "var(--text-primary)", fontWeight: 600, letterSpacing: "-0.1px" }}>
                          {user.email}
                        </span>
                      </td>

                      {/* Role badge */}
                      <td style={{ padding: "16px 20px", textAlign: "center" }}>
                        {(() => {
                          const isSuper = user.role === "super_admin";
                          const isAdmin = user.role === "admin";
                          const bg = isSuper
                            ? "var(--badge-super-bg)"
                            : isAdmin
                              ? "var(--badge-admin-bg)"
                              : "var(--badge-user-bg)";
                          const color = isSuper
                            ? "var(--badge-super-color)"
                            : isAdmin
                              ? "var(--badge-admin-color)"
                              : "var(--badge-user-color)";
                          const border = isSuper
                            ? "var(--badge-super-border)"
                            : isAdmin
                              ? "var(--badge-admin-border)"
                              : "var(--badge-user-border)";
                          const dotBg = isSuper ? "#3B82F6" : isAdmin ? "#10B981" : "#94A3B8";

                          return (
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              width: "115px",
                              padding: "5px 0",
                              borderRadius: "20px",
                              fontSize: "11.5px",
                              fontWeight: 600,
                              background: bg,
                              color: color,
                              border: `1px solid ${border}`,
                              textTransform: "capitalize",
                              letterSpacing: "0.2px",
                              whiteSpace: "nowrap",
                            }}>
                              <span style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                backgroundColor: dotBg,
                                display: "inline-block",
                                flexShrink: 0,
                              }} />
                              {user.role ? user.role.replace("_", " ") : "user"}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Action buttons */}
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                          {/* Campaigns */}
                          <button
                            onClick={() => handleOpenCampaigns(user)}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: "6px",
                              padding: "7px 13px", borderRadius: "9px", border: "1px solid #DBEAFE",
                              background: "#EFF6FF", color: "#1D4ED8", fontSize: "12px", fontWeight: 600,
                              cursor: "pointer", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = "#2563EB";
                              e.currentTarget.style.color = "#ffffff";
                              e.currentTarget.style.borderColor = "#2563EB";
                              e.currentTarget.style.transform = "translateY(-1px)";
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.25)";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = "#EFF6FF";
                              e.currentTarget.style.color = "#1D4ED8";
                              e.currentTarget.style.borderColor = "#DBEAFE";
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
                            }}
                          >
                            <User size={14} /> Campaigns
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleEdit(user._id, user)}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: "6px",
                              padding: "7px 13px", borderRadius: "9px", border: "1px solid #FEF3C7",
                              background: "#FFFBEB", color: "#D97706", fontSize: "12px", fontWeight: 600,
                              cursor: "pointer", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = "#D97706";
                              e.currentTarget.style.color = "#ffffff";
                              e.currentTarget.style.borderColor = "#D97706";
                              e.currentTarget.style.transform = "translateY(-1px)";
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(217, 119, 6, 0.25)";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = "#FFFBEB";
                              e.currentTarget.style.color = "#D97706";
                              e.currentTarget.style.borderColor = "#FEF3C7";
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
                            }}
                          >
                            <Pencil size={14} /> Edit
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(user._id)}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: "6px",
                              padding: "7px 13px", borderRadius: "9px", border: "1px solid #FEE2E2",
                              background: "#FEF2F2", color: "#DC2626", fontSize: "12px", fontWeight: 600,
                              cursor: "pointer", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = "#DC2626";
                              e.currentTarget.style.color = "#ffffff";
                              e.currentTarget.style.borderColor = "#DC2626";
                              e.currentTarget.style.transform = "translateY(-1px)";
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(220, 38, 38, 0.25)";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = "#FEF2F2";
                              e.currentTarget.style.color = "#DC2626";
                              e.currentTarget.style.borderColor = "#FEE2E2";
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
                            }}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Table Footer ── */}
          {users.length > 0 && (
            <div className="app-table-footer user-table-footer">
              <span>
                Showing <strong>{users.length}</strong> users
              </span>
              <span>InSync User Management</span>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════
          CAMPAIGNS MODAL
      ══════════════════════════════════ */}
      <Modal show={showCampaignsModal} onHide={() => setShowCampaignsModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{
          background: "var(--modal-bg)",
          borderBottom: "1px solid var(--modal-border)",
          padding: "18px 24px",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
        }}>
          <Modal.Title style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "17px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "10px",
              background: "linear-gradient(135deg,#2563EB,#3B82F6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(37,99,235,0.3)"
            }}>
              <User size={16} color="#fff" />
            </div>
            Campaign Allocations
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ background: "var(--page-bg)", padding: "24px" }}>
          {/* Allocate Panel */}
          <div style={{
            background: "var(--card-bg)",
            borderRadius: "12px",
            border: "1px solid var(--card-border)",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <p style={{ margin: "0 0 12px", fontWeight: 700, color: "var(--text-primary)", fontSize: "14px" }}>
              Allocate New Campaign
            </p>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <Select
                  options={availableCampaignOptions}
                  value={selectedCampaignToAllocate}
                  onChange={setSelectedCampaignToAllocate}
                  placeholder="Select a campaign to allocate..."
                  isSearchable
                  isClearable
                  styles={{
                    control: (base) => ({ ...base, borderRadius: "9px", borderColor: "var(--card-border)", background: "var(--card-bg)", fontSize: "13px", minHeight: "40px" }),
                    singleValue: (base) => ({ ...base, color: "var(--text-primary)" }),
                    menu: (base) => ({ ...base, background: "var(--card-bg)", borderColor: "var(--card-border)" }),
                    option: (base, state) => ({ ...base, fontSize: "13px", background: state.isSelected ? "#2563EB" : state.isFocused ? "rgba(37, 99, 235, 0.1)" : "transparent", color: state.isSelected ? "#fff" : "var(--text-primary)" }),
                  }}
                />
              </div>
              <Button
                variant="primary"
                onClick={handleAllocateCampaign}
                disabled={!selectedCampaignToAllocate}
                style={{
                  background: "linear-gradient(135deg,#2563EB,#3B82F6)",
                  border: "none",
                  borderRadius: "9px",
                  fontWeight: 600,
                  fontSize: "13px",
                  padding: "9px 20px",
                  boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
                  whiteSpace: "nowrap",
                }}
              >
                Allocate
              </Button>
            </div>
          </div>

          {/* Campaigns Sub-table */}
          <div style={{
            background: "var(--card-bg)",
            borderRadius: "12px",
            border: "1px solid var(--card-border)",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--card-border)", background: "var(--table-header-bg)" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "0.6px", textTransform: "uppercase" }}>
                Allocated Campaigns ({campaignsData.length})
              </span>
            </div>
            <div className="table-responsive">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--table-header-bg)", borderBottom: "1px solid var(--card-border)" }}>
                    {["Report Name", "Advertiser ID", "Campaign ID", "Insertion Order ID", "Action"].map(col => (
                      <th key={col} style={{ padding: "11px 16px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "0.6px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaignsData.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-secondary)", fontSize: "13px" }}>
                        No campaigns allocated yet
                      </td>
                    </tr>
                  ) : (
                    campaignsData.map((c) => (
                      <tr
                        key={c._id}
                        className="app-table-row"
                      >
                        <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>{c.reportName}</td>
                        <td style={{ padding: "12px 16px", fontSize: "12.5px", color: "var(--text-secondary)" }}>{c.advertiserId}</td>
                        <td style={{ padding: "12px 16px", fontSize: "12.5px", color: "var(--text-secondary)" }}>{c.campaignId}</td>
                        <td style={{ padding: "12px 16px", fontSize: "12.5px", color: "var(--text-secondary)" }}>{c.insertionOrderId}</td>
                        <td style={{ padding: "12px 16px" }}>
                          {" "}
                          <button
                            onClick={() => handleDeleteAudience(c._id)}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: "5px",
                              padding: "5px 10px", borderRadius: "7px",
                              border: "1px solid #FECACA", background: "#FEF2F2",
                              color: "#DC2626", fontSize: "12px", fontWeight: 600,
                              cursor: "pointer", transition: "all 0.18s ease",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#DC2626"; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#DC2626"; }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer style={{ background: "var(--modal-bg)", borderTop: "1px solid var(--modal-border)", padding: "14px 24px" }}>
          <Button
            onClick={() => setShowCampaignsModal(false)}
            style={{
              background: "var(--page-bg)", border: "1px solid var(--card-border)",
              color: "var(--text-primary)", borderRadius: "9px",
              fontWeight: 600, fontSize: "13px", padding: "8px 20px",
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <EditUserModal
        show={showModal}
        onClose={() => setShowModal(false)}
        user={editingUser}
        onSave={handleSave}
      />
    </div>
  );
}

export default UserPage;
