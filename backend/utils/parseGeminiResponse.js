// ======================================================
// Parse Gemini JSON Response
// ======================================================

const parseGeminiResponse = (text) => {
  try {
    // ==================================================
    // Basic Validation
    // ==================================================

    if (!text || typeof text !== "string") {
      throw new Error("Empty Gemini response.");
    }

    // ==================================================
    // Remove Markdown Code Blocks
    // ==================================================

    let cleaned = text
      .replace(/```json/gi, "")
      .replace(/```javascript/gi, "")
      .replace(/```js/gi, "")
      .replace(/```/g, "")
      .trim();

    // ==================================================
    // FIRST TRY:
    // Parse Complete Response Directly
    // ==================================================

    try {
      return JSON.parse(cleaned);
    } catch (directParseError) {
      console.log(
        "Direct Gemini JSON parsing failed. Trying JSON extraction...",
      );
    }

    // ==================================================
    // Find First JSON Character
    // ==================================================

    const firstArrayIndex = cleaned.indexOf("[");

    const firstObjectIndex = cleaned.indexOf("{");

    let jsonStartIndex = -1;

    let jsonType = null;

    // ==================================================
    // Determine Whether Response Starts With
    // Array or Object
    // ==================================================

    if (
      firstArrayIndex !== -1 &&
      (firstObjectIndex === -1 || firstArrayIndex < firstObjectIndex)
    ) {
      jsonStartIndex = firstArrayIndex;

      jsonType = "array";
    } else if (firstObjectIndex !== -1) {
      jsonStartIndex = firstObjectIndex;

      jsonType = "object";
    }

    // ==================================================
    // No JSON Found
    // ==================================================

    if (jsonStartIndex === -1) {
      throw new Error("No JSON object or array found in Gemini response.");
    }

    // ==================================================
    // Find JSON End
    // ==================================================

    let jsonEndIndex = -1;

    if (jsonType === "array") {
      jsonEndIndex = cleaned.lastIndexOf("]");
    } else {
      jsonEndIndex = cleaned.lastIndexOf("}");
    }

    if (jsonEndIndex === -1 || jsonEndIndex < jsonStartIndex) {
      throw new Error("Incomplete JSON returned by Gemini.");
    }

    // ==================================================
    // Extract JSON
    // ==================================================

    const extractedJson = cleaned
      .slice(jsonStartIndex, jsonEndIndex + 1)
      .trim();

    // ==================================================
    // Debug Extracted JSON
    // ==================================================

    console.log("========== EXTRACTED GEMINI JSON ==========");

    console.log(extractedJson);

    console.log("===========================================\n");

    // ==================================================
    // Parse Extracted JSON
    // ==================================================

    return JSON.parse(extractedJson);
  } catch (error) {
    console.error("Gemini Parse Error:", error.message);

    throw new Error("Invalid Gemini JSON Response.");
  }
};

module.exports = parseGeminiResponse;
