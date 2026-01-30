import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Register a new user
 */
export const registerUser = async ( name, role, email, password ) => {
  try {
    const token = await getToken();
    console.log(name,role,email,password)
    const res = await axios.post(
      `${API_URL}/auth/register`,
      { name, role, email, password },
      {
        headers: {
          Authorization: token,
        },
      }
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
    const token = await getToken();
    const res = await axios.get(`${API_URL}/auth/users`, {
      headers: {
        Authorization: token,
      },
    });
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
    const token = await getToken();
    const res = await axios.delete(`${API_URL}/auth/delete/${id}`, {
      headers: {
        Authorization: token,
      },
    });
    return res.data; // success message
  } catch (error) {
    console.error("Error deleting user:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteUserAudience = async (email, audienceId) => {
  try {
    const token = await getToken();
    const res = await axios.patch(
      `${API_URL}/auth/audience/remove`,
      {
        email,
        audienceId, 
      },
      {
        headers: {
          Authorization: token,
        },
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
