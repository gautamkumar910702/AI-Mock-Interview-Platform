const ai = require("./gemini");
const parseGeminiResponse = require("./parseGeminiResponse");

// ========================================
// Evaluate Spoken Answer
// ========================================

const evaluateSpeech = async (question, answer) => {
  try {
    const prompt = `
You are an experienced Technical Interviewer.

Evaluate the following spoken interview answer.

Return ONLY valid JSON.

Format:

{
  "score":85,
  "feedback":"Detailed feedback",
  "strengths":[
    "Point 1",
    "Point 2"
  ],
  "improvements":[
    "Point 1",
    "Point 2"
  ]
}

Question:

${question}

Candidate Answer:

${answer}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: prompt,
    });

    const result = parseGeminiResponse(response.text);
    // ==========================
    // Validate AI Response
    // ==========================

    if (!result || typeof result !== "object") {
      throw new Error("Invalid AI Response");
    }

    return {
      score: result.score || 0,

      feedback: result.feedback || "No Feedback Available",

      strengths: result.strengths || [],

      improvements: result.improvements || [],
    };
  } catch (error) {
    console.log(error);

    throw new Error("Unable to Evaluate Speech");
  }
};

module.exports = evaluateSpeech;
