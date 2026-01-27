"use client";
import React, { useEffect, useState } from "react";
import { Pencil, Trash2, User } from "lucide-react";
import EditUserModal from "./EditUserModal";
import { useRouter } from "next/navigation";
import { deleteUser, deleteUserAudience, getAllUsers } from "@/services/users";
import { Modal, Button } from "react-bootstrap";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import PageHeaderDate from "@/components/shared/pageHeader/PageHeaderDate";

function UserPage() {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCampaignsModal, setShowCampaignsModal] = useState(false);
  const [campaignsData, setCampaignsData] = useState([]);
  const [removeAudienceId, setremoveAudienceId] = useState(null);

  const getUserData = async () => {
    const res = await getAllUsers();
    if (res.message) {
      setUsers(res.userData);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const handleEdit = (id, user) => {
    router.push(`/users?id=${id}`);
    setEditingUser(user);
    setShowModal(true);
  };

  const handleOpenCampaigns = (user) => {
    // currently using sample data; replace with API call if needed
    setremoveAudienceId(user.email);
    setCampaignsData(user.AudienceId);
    setShowCampaignsModal(true);
  };

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
      {/* <h2 className="mb-4 pt-4">Users</h2> */}

      <PageHeader>
        {/* <PageHeaderDate /> */}
      </PageHeader>

      <div className="container mt-3">

  <div  className="card stretch stretch-full  ">
     
      <div className="table-responsive">
        <table className="table table-hover mb-0 overflow-hidden" style={{borderRadius:"10px"}}>
          <thead className="table-secondary lh-lg">
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Role</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div
                        className="bg-primary text-white rounded-circle me-2 d-flex align-items-center justify-content-center"
                        style={{ width: "30px", height: "30px" }}
                      >
                        <User size={16} />
                      </div>
                      {user._id}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className="badge bg-secondary">{user.role}</span>
                  </td>

                  <td className="text-end d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleOpenCampaigns(user)}
                    >
                      <User size={16} /> Campaigns
                    </button>
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => handleEdit(user._id, user)}
                    >
                      <Pencil size={16} /> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(user._id)}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>

      </div>

      {/* Campaigns Modal */}
      <Modal
        show={showCampaignsModal}
        onHide={() => setShowCampaignsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Campaigns</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Advertiser ID</th>
                  <th>Campaign ID</th>
                  <th>Insertion Order ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaignsData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      No campaigns
                    </td>
                  </tr>
                ) : (
                  campaignsData.map((c) => (
                    <tr key={c._id}>
                      <td>{c.reportName}</td>
                      <td>{c.advertiserId}</td>
                      <td>{c.campaignId}</td>
                      <td>{c.insertionOrderId}</td>
                      <td>
                        {" "}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteAudience(c._id)}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCampaignsModal(false)}
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
