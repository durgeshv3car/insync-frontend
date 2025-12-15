"use client";
import React, { useEffect, useState } from "react";
import { Pencil, Trash2, User, Eye, EyeOff, ToggleRight } from "lucide-react";
import CreateUser from "./CreateUser";
import { useRouter } from "next/navigation";
import { deleteUser, getAllUsers } from "@/services/users";
import { getPermissionList } from "@/services/permissions";

function UserPage() {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [visibleTokens, setVisibleTokens] = useState({});

  const getUserData = async () => {
    const res = await getPermissionList();

    if (res.message) {
      setUsers(res.permissions);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const handleDelete = async (id) => {
    const res = await deleteUser(id);
    if (res.message) {
      getUserData();
    }
  };

  const toggleTokenVisibility = (id) => {
    setVisibleTokens((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatToken = (token, isVisible) => {
    if (isVisible) {
      return token;
    }
    if (token.length <= 8) {
      return token;
    }
    const start = token.substring(0, 4);
    const end = token.substring(token.length - 4);
    return `${start}${"•".repeat(Math.min(token.length - 8, 20))}${end}`;
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mt-5 ">
        <h2 className="mb-4 pt-4">Users</h2>
        <button
          className="btn btn-success mb-4"
          onClick={() => setShowModal(true)}
        >
          Add New User
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle shadow-sm rounded">
          <thead className="table-primary">
            <tr>
              <th>REPORT-ID</th>
              <th>Email</th>
              <th>TOKEN</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No users found
                </td>
              </tr>
            ) : (
              users?.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div
                        className="bg-primary text-white rounded-circle me-2 d-flex align-items-center justify-content-center"
                        style={{ width: "30px", height: "30px" }}
                      >
                        <User size={16} />
                      </div>
                      {user.reportId}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-secondary" style={{ fontFamily: "monospace", fontSize: "11px" }}>
                        {formatToken(user.token, visibleTokens[user._id])}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-secondary p-1"
                        onClick={() => toggleTokenVisibility(user._id)}
                        style={{ minWidth: "30px" }}
                      >
                        {visibleTokens[user._id] ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="text-end d-flex justify-content-end gap-2">
                    <button
                      className={`btn btn-sm ${user.active ? "btn-success" : "btn-outline-warning"}`}
                      onClick={() => {
                        const updatedUsers = users.map((u) =>
                          u._id === user._id ? { ...u, isActive: !u.isActive } : u
                        );
                        setUsers(updatedUsers);
                      }}
                      title={user.active ? "Active" : "Inactive"}
                    >
                      <ToggleRight size={16} />
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

      {showModal && (
        <CreateUser show={showModal} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

export default UserPage;
