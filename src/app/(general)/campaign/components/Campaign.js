"use client";
import { createAudience } from "@/services/createaudience";
import React, { useState } from "react";


const Campaign = () => {
  const [campaignData, setCampaignData] = useState({
    reportName: "",
    advertiserId: "",
    campaignId: "",
    insertionOrderId: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCampaignData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit =async (e) => {
    e.preventDefault();

    const res=await createAudience(campaignData)
    if (res.message){
        setCampaignData({
            reportName: "",
            advertiserId: "",
            campaignId: "",
            insertionOrderId: "",
        })
    }

  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card-body p-4">
        <div className="mb-4 d-flex align-items-center justify-content-between">
          <h5 className="fw-bold mb-0">Campaign Information</h5>
        </div>

        <div className="row mb-4 align-items-center">
          <div className="col-lg-4">
            <label htmlFor="reportNameInput" className="fw-semibold">
              Report Name:{" "}
            </label>
          </div>
          <div className="col-lg-8">
            <div className="input-group">
              <div className="input-group-text">
                <i className="feather-file-text"></i>
              </div>
              <input
                type="text"
                className="form-control"
                id="reportNameInput"
                placeholder="Report Name"
                name="reportName"
                value={campaignData.reportName}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="row mb-4 align-items-center">
          <div className="col-lg-4">
            <label htmlFor="advertiserIdInput" className="fw-semibold">
              Advertiser ID:{" "}
            </label>
          </div>
          <div className="col-lg-8">
            <div className="input-group">
              <div className="input-group-text">
                <i className="feather-hash"></i>
              </div>
              <input
                type="text"
                className="form-control"
                id="advertiserIdInput"
                placeholder="Advertiser ID"
                name="advertiserId"
                value={campaignData.advertiserId}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="row mb-4 align-items-center">
          <div className="col-lg-4">
            <label htmlFor="campaignIdInput" className="fw-semibold">
              Campaign ID:{" "}
            </label>
          </div>
          <div className="col-lg-8">
            <div className="input-group">
              <div className="input-group-text">
                <i className="feather-hash"></i>
              </div>
              <input
                type="text"
                className="form-control"
                id="campaignIdInput"
                placeholder="Campaign ID"
                name="campaignId"
                value={campaignData.campaignId}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="row mb-4 align-items-center">
          <div className="col-lg-4">
            <label htmlFor="insertionOrderIdInput" className="fw-semibold">
              Insertion Order ID:{" "}
            </label>
          </div>
          <div className="col-lg-8">
            <div className="input-group">
              <div className="input-group-text">
                <i className="feather-hash"></i>
              </div>
              <input
                type="text"
                className="form-control"
                id="insertionOrderIdInput"
                placeholder="Insertion Order ID"
                name="insertionOrderId"
                value={campaignData.insertionOrderId}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="row mt-6">
          <div className="col-lg-8 offset-lg-4">
            <button type="submit" className="btn btn-primary">
              Save Campaign
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Campaign;
