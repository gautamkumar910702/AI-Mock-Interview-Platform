import api from "./api";

// ======================================
// Upload Webcam Interview
// ======================================

export const uploadWebcamInterview = async (formData) => {
  const token = localStorage.getItem("token");

  const response = await api.post(
    "/webcam/upload",

    formData,

    {
      headers: {
        Authorization: `Bearer ${token}`,

        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

// ======================================
// Webcam History
// ======================================

export const getWebcamHistory = async () => {
  const token = localStorage.getItem("token");

  const response = await api.get(
    "/webcam/history",

    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
