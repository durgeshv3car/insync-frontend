import api from "@/lib/api";

/**
 * Create a new token
 */
export const createToken = async (campaign_name, email) => {
  try {
    const res = await api.post(
      "/token/create",
      { campaign_name, email }
    );
    return res.data;
  } catch (error) {
    console.error("Error creating token:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all tokens
 */
export const getAllToken = async () => {
  try {
    const res = await api.get("/token/get");
    return res.data; // Array of token objects
  } catch (error) {
    console.error("Error fetching tokens:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete a token by ID
 */
export const deleteToken = async (id) => {
  try {
    const res = await api.delete(`/token/delete/${id}`);
    return res.data; // Success message
  } catch (error) {
    console.error("Error deleting token:", error.response?.data || error.message);
    throw error;
  }
};
