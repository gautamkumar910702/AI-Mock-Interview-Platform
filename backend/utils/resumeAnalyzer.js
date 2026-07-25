const ai = require("./gemini");
const parseGeminiResponse = require("./parseGeminiResponse");

// =====================================
// Analyze Resume
// =====================================

const analyzeResume = async (resumeText) => {
  try {
    const prompt = `
You are an Expert ATS Resume Analyzer.

Analyze the following resume.

Return ONLY valid JSON.

Format:

{
  "atsScore":85,

  "strengths":[
    "Point 1",
    "Point 2"
  ],

  "weaknesses":[
    "Point 1",
    "Point 2"
  ],

  "missingSkills":[
    "Skill 1",
    "Skill 2"
  ],

  "suggestions":[
    "Suggestion 1",
    "Suggestion 2"
  ],

  "summary":"Overall summary."
}

Resume:

${resumeText}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",

      contents: prompt,
    });

    const result = parseGeminiResponse(response.text);
    // Validate Response

    if (!result || typeof result !== "object") {
      throw new Error("Invalid AI Response");
    }

    return {
      atsScore: result.atsScore || 0,

      strengths: result.strengths || [],

      weaknesses: result.weaknesses || [],

      missingSkills: result.missingSkills || [],

      suggestions: result.suggestions || [],

      summary: result.summary || "No Summary Available",
    };
  } catch (error) {
    console.log(error);

    throw new Error("Unable to Analyze Resume");
  }
};

module.exports = analyzeResume;
