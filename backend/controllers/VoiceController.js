const evaluateSpeech = require("../utils/speechEvaluation");

// =====================================
// Evaluate Voice Answer
// =====================================

const evaluateVoice = async (req, res) => {
  try {
    const { question, transcript } = req.body;

    if (!question || !transcript) {
      return res.status(400).json({
        success: false,

        message: "Question and Transcript are required",
      });
    }

    const result = await evaluateSpeech(
      question,

      transcript,
    );
    return res.status(200).json({
      success: true,

      message: "Voice Evaluated Successfully",

      evaluation: result,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: error.message || "Server Error",
    });
  }
};

module.exports = {
  evaluateVoice,
};
