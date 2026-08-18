"use client";

import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import Select from "react-select";
import CampaignTable from "./components/CampaignTable";
import {
  createAudienceData,
  deleteAudienceData,
  getAudienceData,
  updateAudienceData,
} from "@/services/audience";
import { useRouter } from "next/navigation";
import {
  DownloadCsvCampaignId,
  getCampaignData,
  getCampaignList,
} from "@/services/campaignData";
import CampaignTitleTable from "./components/CampaignTitleTable";
import { Users, Download, Plus, Video, Pencil } from "lucide-react";
import PageHeader from "@/components/shared/pageHeader/PageHeader";

function page() {
  const Router = useRouter();
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [selectedAudience, setSelectedAudience] = useState(null);
  const [audienceOptions, setAudienceOptions] = useState([]);
  const [campaignData, setCampaignData] = useState([]);
  const [campaignList, setCampaignList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  console.log("Selected Audience:", selectedAudience);

  const fetchAudienceData = async () => {
    try {
      const data = await getAudienceData();

      if (data.message) {
        const formattedOptions = data.campaigns.map((item) => ({
          value: item._id,
          label: item.title,
        }));

        setAudienceOptions(formattedOptions);
      }
    } catch (error) {
      console.error("Error fetching audience data:", error);
    }
  };
  const handleDeleteAudience = async (audienceId) => {
    console.log("Delete Audience ID:", audienceId);
    const res = await deleteAudienceData(audienceId);
    fetchCampaignList();
  };
  const handleEditAudience = async (data) => {
    console.log("Edit Audience ID:", data);
    setEditingId(data._id || null);
    setShowCreateCampaignModal(true);
    setCampaignTitle(data.title || "");
  };

  const fetchCampaignData = async (audienceId) => {
    if (!audienceId) {
      setCampaignData([]);
      return;
    }
    try {
      const data = await getCampaignData(audienceId);
      setCampaignData(data.campaignDataList || []);
    } catch (error) {
      console.error("Error fetching campaign data:", error);
    }
  };

  const fetchCampaignList = async () => {
    try {
      const data = await getCampaignList();
      console.log("Campaign List Data:", data);
      setCampaignList(data.campaigns || []);
    } catch (error) {
      console.error("Error fetching campaign list:", error);
    }
  };

  useEffect(() => {
    fetchAudienceData();
    fetchCampaignList();
    fetchCampaignData(selectedAudience?.value);
  }, [selectedAudience]);

  const handleAddVideos = () => {
    if (!selectedAudience) {
      return;
    }
    Router.push(
      `/youtube-data?audienceId=${selectedAudience ? selectedAudience.value : ""
      }`,
    );
  };

  const handleCreateCampaign = async () => {
    try {
      if (editingId) {
        const res = await updateAudienceData(editingId, campaignTitle);
        if (res) {
          setShowCreateCampaignModal(false);
          setCampaignTitle("");
          setEditingId(null);
          fetchAudienceData();
          fetchCampaignList();
        }
      } else {
        const res = await createAudienceData(campaignTitle);
        if (res) {
          setShowCreateCampaignModal(false);
          setCampaignTitle("");
          fetchAudienceData();
          fetchCampaignList();
        }
      }
    } catch (error) {
      console.error("Error saving audience:", error);
    }
  };

  const handleCsvDownload = async () => {
    const res = await DownloadCsvCampaignId(selectedAudience.value);
  };

  return (
    <div className="app-page-wrapper">
      <div className="container mt-3">
      <PageHeader />

        {/* Toolbar Card */}
        <div
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: "16px",
            padding: "18px 22px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          {/* Select Dropdown */}
          <div style={{ flex: "1 1 260px", minWidth: "220px", maxWidth: "380px" }}>
            <Select
              options={audienceOptions}
              value={selectedAudience}
              onChange={setSelectedAudience}
              isClearable
              isSearchable
              placeholder="Search or select audience..."
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              styles={{
                control: (base, state) => ({
                  ...base,
                  backgroundColor: "var(--input-bg)",
                  borderColor: state.isFocused ? "#2563EB" : "var(--input-border)",
                  boxShadow: state.isFocused ? "0 0 0 3.5px rgba(37, 99, 235, 0.2)" : "none",
                  color: "var(--text-primary)",
                  borderRadius: "12px",
                  padding: "2px 4px",
                  minHeight: "42px",
                  transition: "all 0.2s ease",
                }),
                singleValue: (base) => ({
                  ...base,
                  color: "var(--text-primary)",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                }),
                placeholder: (base) => ({
                  ...base,
                  color: "var(--text-secondary)",
                  fontSize: "0.88rem",
                }),
                input: (base) => ({
                  ...base,
                  color: "var(--text-primary)",
                }),
                menuList: (base) => ({
                  ...base,
                  maxHeight: "200px",
                  backgroundColor: "var(--card-bg)",
                  borderRadius: "12px",
                  padding: "4px",
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
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
                    ? "rgba(37, 99, 235, 0.1)"
                    : "transparent",
                  color: state.isFocused ? "#2563EB" : "var(--text-primary)",
                  fontSize: "0.85rem",
                  fontWeight: state.isFocused ? "600" : "500",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }),
                clearIndicator: (base) => ({
                  ...base,
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  "&:hover": { color: "#EF4444" },
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  color: "var(--text-secondary)",
                }),
              }}
            />
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {campaignData.length > 0 && selectedAudience && (
              <button
                onClick={handleCsvDownload}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "9px 18px",
                  borderRadius: "10px",
                  border: "1px solid rgba(59, 130, 246, 0.5)",
                  backgroundColor: "rgba(59, 130, 246, 0.08)",
                  color: "#3B82F6",
                  fontWeight: "700",
                  fontSize: "0.84rem",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563EB";
                  e.currentTarget.style.color = "#FFFFFF";
                  e.currentTarget.style.borderColor = "#2563EB";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.08)";
                  e.currentTarget.style.color = "#3B82F6";
                  e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <Download size={15} />
                CSV Download
              </button>
            )}

            {selectedAudience && (
              <button
                onClick={handleAddVideos}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "9px 18px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "0.84rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(37,99,235,0.45)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(37, 99, 235, 0.35)";
                }}
              >
                <Video size={15} />
                Add Videos
              </button>
            )}

            <button
              onClick={() => setShowCreateCampaignModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "9px 18px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "0.84rem",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(16,185,129,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(16, 185, 129, 0.35)";
              }}
            >
              <Plus size={15} />
              Create Audience
            </button>
          </div>
        </div>

        {/* Table Section */}
        {selectedAudience ? (
          <CampaignTable selectedAudience={selectedAudience} campaignData={campaignData} />
        ) : (
          <CampaignTitleTable
            campaignData={campaignList}
            onEdit={handleEditAudience}
            onDelete={handleDeleteAudience}
            onSelect={(v) => setSelectedAudience({ value: v._id, label: v.title })}
          />
        )}
      </div>

      {/* Create / Edit Audience Modal */}
      <Modal
        show={showCreateCampaignModal}
        onHide={() => {
          setEditingId(null);
          setCampaignTitle("");
          setShowCreateCampaignModal(false);
        }}
        centered
        backdropClassName="app-modal-overlay"
        contentClassName="app-modal-content"
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "var(--card-bg)",
            borderBottom: "1px solid var(--card-border)",
            padding: "20px 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #2563EB 0%, #6366F1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
              }}
            >
              {editingId ? <Pencil size={17} color="white" /> : <Plus size={17} color="white" />}
            </div>
            <Modal.Title
              style={{
                fontWeight: "800",
                color: "var(--text-primary)",
                fontSize: "1.05rem",
                margin: 0,
              }}
            >
              {editingId ? "Edit Audience" : "Create Audience"}
            </Modal.Title>
          </div>
        </Modal.Header>

        <Modal.Body style={{ backgroundColor: "var(--card-bg)", padding: "24px 28px" }}>
          <Form.Group controlId="campaignTitle">
            <label
              htmlFor="audienceTitleInput"
              style={{
                fontWeight: "700",
                color: "var(--text-primary)",
                fontSize: "0.74rem",
                textTransform: "uppercase",
                letterSpacing: "0.7px",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Audience Title
            </label>
            <input
              id="audienceTitleInput"
              type="text"
              placeholder="Enter audience title..."
              value={campaignTitle}
              onChange={(e) => setCampaignTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleCreateCampaign();
              }}
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
                e.currentTarget.style.borderColor = "var(--input-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer
          style={{
            backgroundColor: "var(--card-bg)",
            borderTop: "1px solid var(--card-border)",
            padding: "16px 28px",
            gap: "12px",
          }}
        >
          <button
            style={{
              padding: "9px 20px",
              borderRadius: "10px",
              border: "1px solid var(--card-border)",
              backgroundColor: "var(--card-bg)",
              color: "var(--text-primary)",
              fontWeight: "700",
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--table-hover-bg)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--card-bg)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            onClick={() => {
              setEditingId(null);
              setCampaignTitle("");
              setShowCreateCampaignModal(false);
            }}
          >
            Cancel
          </button>
          <button
            style={{
              padding: "9px 22px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "0.85rem",
              boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(37,99,235,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.35)";
            }}
            onClick={handleCreateCampaign}
          >
            {editingId ? "Update Audience" : "Save Audience"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default page;
