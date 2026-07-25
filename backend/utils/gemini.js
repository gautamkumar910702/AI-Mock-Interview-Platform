require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

// ======================================================
// Gemini API Key Validation
// ======================================================

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in the .env file.");
}

// ======================================================
// Gemini Client
// ======================================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ======================================================
// Export
// ======================================================

module.exports = ai;
