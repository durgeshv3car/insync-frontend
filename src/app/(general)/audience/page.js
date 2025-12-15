"use client";

import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import Select from "react-select";
import CampaignTable from "./components/CampaignTable";
import { createAudienceData, getAudienceData } from "@/services/audience";
import { useRouter } from "next/navigation";
import { getCampaignData } from "@/services/campaignData";

function page() {
  const Router = useRouter();
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [selectedAudience, setSelectedAudience] = useState(null);
  const [audienceOptions, setAudienceOptions] = useState([]);
  const [campaignData, setCampaignData] = useState([]);

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

  const fetchCampaignData = async (audienceId) => {
    try {
      const data = await getCampaignData(audienceId);
      setCampaignData(data.campaignDataList || []);
    } catch (error) {
      console.error("Error fetching campaign data:", error);
    }
  };

  useEffect(() => {
    fetchAudienceData();
    fetchCampaignData(selectedAudience?.value);
  }, [selectedAudience]);

  const handleAddVideos = () => {
    if (!selectedAudience) {
      return;
    }
    Router.push(
      `/Youtube-links?audienceId=${
        selectedAudience ? selectedAudience.value : ""
      }`
    );
  };

  const handleCreateCampaign = async () => {
    const res = await createAudienceData(campaignTitle);
    if (res) {
      setShowCreateCampaignModal(false);
      setCampaignTitle("");
    }
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2>Audience Page</h2>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <Select
            options={audienceOptions}
            value={selectedAudience}
            onChange={setSelectedAudience}
            isClearable
            isSearchable
            placeholder="Search or select audience..."
          />
        </div>

        <div className="col-md-6 d-flex justify-content-end gap-2">
          <Button variant="primary" onClick={handleAddVideos}>
            Add Videos
          </Button>
          <Button
            variant="success"
            onClick={() => setShowCreateCampaignModal(true)}
          >
            Create Audiences
          </Button>
        </div>
      </div>

      <CampaignTable campaignData={campaignData} />

      <Modal
        show={showCreateCampaignModal}
        onHide={() => setShowCreateCampaignModal(false)}
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
            Create Audience
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default page;
