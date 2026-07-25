import api from "./api";

// ======================================
// Evaluate Voice Answer
// ======================================

export const evaluateVoice = async (question, transcript) => {
  const token = localStorage.getItem("token");

  const response = await api.post(
    "/voice/evaluate",

    {
      question,
      transcript,
    },

    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
