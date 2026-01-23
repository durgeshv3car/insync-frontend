import api from "@/lib/api";
import { getToken } from "@/lib/getToken";

/**
 * Register a new user
 */
export const registerUser = async ( name, role, email, password ) => {
  try {
    console.log(name,role,email,password)
    const res = await api.post(
      `/auth/register`,
      { name, role, email, password }
    );
    return res.data; 
  } catch (error) {
    console.error("Error registering user:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all users
 */
export const getAllUsers = async () => {
  try {
    const res = await api.get(`/auth/users`);
    return res.data; // Array of users
  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete user by ID
 */
export const deleteUser = async (id) => {
  try {
    const res = await api.delete(`/auth/delete/${id}`);
    return res.data; // success message
  } catch (error) {
    console.error("Error deleting user:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteUserAudience = async (email, audienceId) => {
  try {
    const res = await api.patch(
      `/auth/audience/remove`,
      {
        email,
        audienceId, 
      }
    );

    return res.data;
  } catch (error) {
    console.error(
      "Error deleting user audience:",
      error.response?.data || error.message
    );
    throw error;
  }
};

