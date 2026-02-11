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
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import PageHeaderDate from "@/components/shared/pageHeader/PageHeaderDate";

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
      `/Youtube-links?audienceId=${
        selectedAudience ? selectedAudience.value : ""
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
    <div>
      <PageHeader></PageHeader>

      <div className="container mt-3">
        <div className="row mb-4">
          <div className="col-md-3">
            <Select
              options={audienceOptions}
              value={selectedAudience}
              onChange={setSelectedAudience}
              isClearable
              isSearchable
              placeholder="Search or select audience..."
              styles={{
                menuList: (base) => ({
                  ...base,
                  maxHeight: "160px",
                }),
              }}
            />
          </div>

          <div className="col-md-9 d-flex justify-content-end gap-2">
            {campaignData.length > 0 && selectedAudience && (
              <Button
                variant="secondary"
                onClick={() => {
                  handleCsvDownload();
                }}
              >
                CSV Download
              </Button>
            )}
            {selectedAudience && (
              <Button variant="primary" onClick={handleAddVideos}>
                Add Videos
              </Button>
            )}
            <Button
              variant="success"
              onClick={() => setShowCreateCampaignModal(true)}
            >
              Create Audiences
            </Button>
          </div>
        </div>

        {selectedAudience ? (
          <CampaignTable selectedAudience={selectedAudience} campaignData={campaignData} />
        ) : (
          <CampaignTitleTable
            campaignData={campaignList}
            onEdit={handleEditAudience}
            onDelete={handleDeleteAudience}
          />
        )}
      </div>

      <Modal
        show={showCreateCampaignModal}
        onHide={() => {
          setEditingId(null);
          setCampaignTitle("");
          setShowCreateCampaignModal(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Audience</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Audience Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter audience title"
              value={campaignTitle}
              onChange={(e) => setCampaignTitle(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCreateCampaignModal(false)}
          >
            Close
          </Button>
          <Button variant="success" onClick={handleCreateCampaign}>
            {editingId ? "Save Changes" : "Create Audience"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default page;
