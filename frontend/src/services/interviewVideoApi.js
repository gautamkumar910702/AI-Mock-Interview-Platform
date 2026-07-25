import api from "./api";

// ======================================================
// Upload Interview Video
// ======================================================

export const uploadInterviewVideo = async (formData) => {
  try {
    // ==================================================
    // Get Token
    // ==================================================

    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Authentication token not found.");
    }

    // ==================================================
    // Validate FormData
    // ==================================================

    if (!(formData instanceof FormData)) {
      throw new Error("Invalid video upload data.");
    }

    // ==================================================
    // Debug FormData
    // ==================================================

    console.log("========== VIDEO API REQUEST ==========");

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, {
          name: value.name,
          type: value.type,
          size: value.size,
        });
      } else {
        console.log(key, value);
      }
    }

    console.log("=======================================");

    // ==================================================
    // Upload Video
    // ==================================================

    const response = await api.post(
      "/interview-video/upload",

      formData,

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // IMPORTANT:
    // Do NOT manually set:
    //
    // "Content-Type": "multipart/form-data"
    //
    // Axios/browser will automatically add the correct
    // multipart boundary.

    // ==================================================
    // Debug Response
    // ==================================================

    console.log("Video Upload API Response:", response.data);

    return response.data;
  } catch (error) {
    console.error("========== VIDEO API ERROR ==========");

    console.error("Status:", error.response?.status);

    console.error("Backend Response:", error.response?.data);

    console.error("Error Message:", error.message);

    console.error("=====================================");

    throw error;
  }
};

// ======================================================
// Get Interview Video
// ======================================================

export const getInterviewVideo = async (interviewId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Authentication token not found.");
    }

    if (!interviewId) {
      throw new Error("Interview ID is required.");
    }

    const response = await api.get(
      `/interview-video/${interviewId}`,

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    if (error.response?.status !== 404) {
      console.error(
        "Get Interview Video Error:",
        error.response?.data || error.message,
      );
    }

    throw error;
  }
};

// ======================================================
// Get Interview Video History
// ======================================================

export const getInterviewVideoHistory = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Authentication token not found.");
    }

    const response = await api.get(
      "/interview-video/history",

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get Interview Video History Error:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// ======================================================
// Delete Interview Video
// ======================================================

export const deleteInterviewVideo = async (videoId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Authentication token not found.");
    }

    if (!videoId) {
      throw new Error("Video ID is required.");
    }

    const response = await api.delete(
      `/interview-video/${videoId}`,

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "Delete Interview Video Error:",
      error.response?.data || error.message,
    );

    throw error;
  }
};
