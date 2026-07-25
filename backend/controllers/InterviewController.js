const Interview = require("../models/Interview");

const ai = require("../utils/gemini");

const parseGeminiResponse = require("../utils/parseGeminiResponse");

const normalizeQuestion = (question) =>
  String(question || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// ======================================================
// Helper - Safe Number
// ======================================================

const safeNumber = (value, defaultValue = 0, min = 0, max = 100) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return defaultValue;
  }

  return Math.min(max, Math.max(min, number));
};

// ======================================================
// Start Interview
// ======================================================

const startInterview = async (req, res) => {
  try {
    const { category, difficulty, totalQuestions } = req.body;

    // ==================================================
    // Basic Validation
    // ==================================================

    if (
      !category ||
      !difficulty ||
      totalQuestions === undefined ||
      totalQuestions === null
    ) {
      return res.status(400).json({
        success: false,

        message: "Category, difficulty and total questions are required.",
      });
    }

    // ==================================================
    // Difficulty Validation
    // ==================================================

    const allowedDifficulties = ["Easy", "Medium", "Hard"];

    if (!allowedDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,

        message: "Difficulty must be Easy, Medium or Hard.",
      });
    }

    // ==================================================
    // Total Questions Validation
    // ==================================================

    const questionCount = Number(totalQuestions);

    if (
      !Number.isInteger(questionCount) ||
      questionCount < 1 ||
      questionCount > 20
    ) {
      return res.status(400).json({
        success: false,

        message: "Total questions must be between 1 and 20.",
      });
    }

    // ==================================================
    // Category Cleanup
    // ==================================================

    const cleanCategory = String(category).trim();

    if (!cleanCategory) {
      return res.status(400).json({
        success: false,

        message: "Please enter a valid interview category.",
      });
    }

    const previousInterviews = await Interview.find({
      user: req.user.id,
    })
      .select("category questions.question")
      .lean();

    const previousQuestionSet = new Set(
      previousInterviews
        .filter(
          (interview) =>
            normalizeQuestion(interview.category) ===
            normalizeQuestion(cleanCategory),
        )
        .flatMap((interview) =>
          (interview.questions || []).map((item) =>
            normalizeQuestion(item.question),
          ),
        )
        .filter(Boolean),
    );

    const previousQuestions = previousInterviews
      .filter(
        (interview) =>
          normalizeQuestion(interview.category) ===
          normalizeQuestion(cleanCategory),
      )
      .flatMap((interview) =>
        (interview.questions || []).map((item) => item.question),
      )
      .filter(Boolean);

    const previousQuestionsForPrompt = previousQuestions.length
      ? JSON.stringify(previousQuestions)
      : "[]";

    const generationNonce = `${Date.now()}-${Math.random()}`;

    // ==================================================
    // Gemini Prompt
    // ==================================================

    const prompt = `

You are an expert technical interviewer.

Generate exactly ${questionCount} ${difficulty}
interview questions for the category:

${cleanCategory}

IMPORTANT RULES:

1. Return ONLY valid JSON.
2. Do NOT return markdown.
3. Do NOT use triple backticks.
4. Do NOT provide any explanation outside JSON.
5. Do NOT repeat questions.
6. Questions must match the selected difficulty.
7. Questions should be useful in a real interview.
8. Generate exactly ${questionCount} questions.
9. Every array item must contain a "question" field.
10. Make every question meaningfully different from the others.
11. Vary the concepts, examples and wording across questions.
12. Do NOT generate any question from the user's previous question list below.
13. Generate new questions covering concepts not already in that list.
14. Generation request id: ${generationNonce}

Previous questions for this user and category:
${previousQuestionsForPrompt}

Return exactly this JSON structure:

[
  {
    "question": "First interview question"
  },
  {
    "question": "Second interview question"
  }
]

`;

    // ==================================================
    // Generate Questions Using Gemini
    // ==================================================

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",

      contents: prompt,

      config: {
        temperature: 0.9,
      },
    });

    // ==================================================
    // Get Raw Gemini Text
    // ==================================================

    const rawGeminiResponse = response?.text;

    console.log("\n========== START INTERVIEW GEMINI RAW RESPONSE ==========");

    console.log(rawGeminiResponse);

    console.log("=========================================================\n");

    // ==================================================
    // Empty Gemini Response Check
    // ==================================================

    if (!rawGeminiResponse || typeof rawGeminiResponse !== "string") {
      return res.status(502).json({
        success: false,

        message: "Gemini returned an empty response.",
      });
    }

    // ==================================================
    // Parse Gemini Response
    // ==================================================

    let generatedQuestions;

    try {
      generatedQuestions = parseGeminiResponse(rawGeminiResponse);
    } catch (parseError) {
      console.error("Start Interview Gemini Parse Error:", parseError);

      return res.status(502).json({
        success: false,

        message: "Unable to parse Gemini question response.",
      });
    }

    // ==================================================
    // Validate Parsed Response
    // ==================================================

    if (!Array.isArray(generatedQuestions)) {
      console.error(
        "Gemini question response is not an array:",
        generatedQuestions,
      );

      return res.status(502).json({
        success: false,

        message: "Gemini returned an invalid question format.",
      });
    }

    // ==================================================
    // Clean Generated Questions
    // ==================================================

    const seenQuestions = new Set(previousQuestionSet);

    const validQuestions = generatedQuestions
      .filter((item) => {
        if (!item || typeof item.question !== "string") {
          return false;
        }

        const question = item.question.trim();

        if (!question) {
          return false;
        }

        const normalizedQuestion = normalizeQuestion(question);

        if (seenQuestions.has(normalizedQuestion)) {
          return false;
        }

        seenQuestions.add(normalizedQuestion);
        item.question = question;
        return true;
      })
      .slice(0, questionCount);

    // ==================================================
    // Ensure Required Question Count
    // ==================================================

    if (validQuestions.length !== questionCount) {
      console.error(
        `Expected ${questionCount} questions but Gemini returned ${validQuestions.length} valid questions.`,
      );

      return res.status(502).json({
        success: false,

        message: `Gemini generated ${validQuestions.length} valid questions instead of ${questionCount}. Please try again.`,
      });
    }

    // ==================================================
    // Format Questions For MongoDB
    // ==================================================

    const formattedQuestions = validQuestions.map((item) => ({
      question: item.question.trim(),

      answer: "",

      feedback: "",

      score: 0,

      timeTaken: 0,

      answeredAt: null,

      aiStrengths: [],

      aiWeaknesses: [],

      betterAnswer: "",

      confidenceScore: 0,
    }));

    // ==================================================
    // Create Interview
    // ==================================================

    const interview = await Interview.create({
      user: req.user.id,

      category: cleanCategory,

      difficulty,

      totalQuestions: questionCount,

      questions: formattedQuestions,

      status: "Pending",
    });

    // ==================================================
    // Success Response
    // ==================================================

    return res.status(201).json({
      success: true,

      message: "Interview created successfully.",

      interviewId: interview._id,

      interview,
    });
  } catch (error) {
    console.error("Start Interview Error:", error);

    return res.status(500).json({
      success: false,

      message: error?.message || "Unable to start interview.",
    });
  }
}; // ======================================================
// Get Interview By ID
// ======================================================

const getInterview = async (req, res) => {
  try {
    const { id } = req.params;

    // ==================================================
    // Interview ID Validation
    // ==================================================

    if (!id) {
      return res.status(400).json({
        success: false,

        message: "Interview ID is required.",
      });
    }

    // ==================================================
    // Find Interview
    // ==================================================

    const interview = await Interview.findById(id).populate(
      "user",
      "fullName email profileImage",
    );

    // ==================================================
    // Interview Not Found
    // ==================================================

    if (!interview) {
      return res.status(404).json({
        success: false,

        message: "Interview not found.",
      });
    }

    // ==================================================
    // Ownership Check
    // ==================================================

    if (!interview.user || interview.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,

        message: "You are not authorized to access this interview.",
      });
    }

    // ==================================================
    // Success Response
    // ==================================================

    return res.status(200).json({
      success: true,

      interview,

      user: interview.user,
    });
  } catch (error) {
    console.error("Get Interview Error:", error);

    // ==================================================
    // Invalid MongoDB Object ID
    // ==================================================

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,

        message: "Invalid interview ID.",
      });
    }

    return res.status(500).json({
      success: false,

      message: error?.message || "Unable to load interview.",
    });
  }
};

// ======================================================
// Submit Interview Answer
// ======================================================

const submitAnswer = async (req, res) => {
  try {
    const {
      interviewId,

      questionIndex,

      answer,

      timeTaken,
    } = req.body;

    // ==================================================
    // Basic Validation
    // ==================================================

    if (!interviewId) {
      return res.status(400).json({
        success: false,

        message: "Interview ID is required.",
      });
    }

    if (questionIndex === undefined || questionIndex === null) {
      return res.status(400).json({
        success: false,

        message: "Question index is required.",
      });
    }

    // ==================================================
    // Convert Question Index
    // ==================================================

    const parsedQuestionIndex = Number(questionIndex);

    if (!Number.isInteger(parsedQuestionIndex)) {
      return res.status(400).json({
        success: false,

        message: "Question index must be a valid integer.",
      });
    }

    // ==================================================
    // Find Interview
    // ==================================================

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,

        message: "Interview not found.",
      });
    }

    // ==================================================
    // Ownership Check
    // ==================================================

    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,

        message: "You are not authorized to update this interview.",
      });
    }

    // ==================================================
    // Completed Interview Protection
    // ==================================================

    if (interview.status === "Completed") {
      return res.status(400).json({
        success: false,

        message: "This interview has already been completed.",
      });
    }

    // ==================================================
    // Question Index Validation
    // ==================================================

    if (
      parsedQuestionIndex < 0 ||
      parsedQuestionIndex >= interview.questions.length
    ) {
      return res.status(400).json({
        success: false,

        message: "Invalid question index.",
      });
    }

    // ==================================================
    // Clean Answer
    // ==================================================

    const cleanAnswer = typeof answer === "string" ? answer.trim() : "";

    // ==================================================
    // Safe Time Taken
    // ==================================================

    const parsedTimeTaken = safeNumber(timeTaken, 0, 0, 86400);

    // ==================================================
    // Update Current Question
    // ==================================================

    const currentQuestion = interview.questions[parsedQuestionIndex];

    currentQuestion.answer = cleanAnswer;

    currentQuestion.timeTaken = parsedTimeTaken;

    currentQuestion.answeredAt = new Date();

    // ==================================================
    // Change Pending -> In Progress
    // ==================================================

    if (interview.status === "Pending") {
      interview.status = "In Progress";
    }

    // ==================================================
    // Save Interview
    // ==================================================

    await interview.save();

    // ==================================================
    // Success Response
    // ==================================================

    return res.status(200).json({
      success: true,

      message: "Answer saved successfully.",

      questionIndex: parsedQuestionIndex,

      question: currentQuestion,
    });
  } catch (error) {
    console.error("Submit Answer Error:", error);

    // ==================================================
    // Invalid MongoDB ID
    // ==================================================

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,

        message: "Invalid interview ID.",
      });
    }

    return res.status(500).json({
      success: false,

      message: error?.message || "Unable to save answer.",
    });
  }
}; // ======================================================
// Finish Interview
// ======================================================

const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    // ==================================================
    // Interview ID Validation
    // ==================================================

    if (!interviewId) {
      return res.status(400).json({
        success: false,

        message: "Interview ID is required.",
      });
    }

    // ==================================================
    // Find Interview
    // ==================================================

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,

        message: "Interview not found.",
      });
    }

    // ==================================================
    // Ownership Check
    // ==================================================

    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,

        message: "You are not authorized to finish this interview.",
      });
    }

    // ==================================================
    // Already Completed Check
    // ==================================================

    if (interview.status === "Completed" && interview.aiEvaluated) {
      return res.status(200).json({
        success: true,

        message: "Interview has already been completed.",

        interview,
      });
    }

    // ==================================================
    // Questions Check
    // ==================================================

    if (
      !Array.isArray(interview.questions) ||
      interview.questions.length === 0
    ) {
      return res.status(400).json({
        success: false,

        message: "Interview does not contain any questions.",
      });
    }

    // ==================================================
    // Build Questions For Gemini
    // ==================================================

    const interviewData = interview.questions.map((item, index) => ({
      questionNumber: index + 1,

      question: item.question || "",

      answer: item.answer?.trim() || "Not Answered",

      timeTaken: Number(item.timeTaken) || 0,
    }));

    // ==================================================
    // Gemini Evaluation Prompt
    // ==================================================

    const prompt = `

You are a Senior Technical Interviewer and Interview Evaluator.

Evaluate the candidate's complete interview carefully.

INTERVIEW INFORMATION:

Category:
${interview.category}

Difficulty:
${interview.difficulty}

Total Questions:
${interview.questions.length}

You must evaluate EVERY question.

IMPORTANT RULES:

1. Return ONLY valid JSON.
2. Do NOT return markdown.
3. Do NOT use triple backticks.
4. Do NOT write any explanation outside JSON.
5. The "questions" array MUST contain exactly ${interview.questions.length} objects.
6. Keep each question score between 0 and 10.
7. Keep confidenceScore between 0 and 100.
8. Keep overallScore between 0 and 100.
9. Keep overallConfidence between 0 and 100.
10. Keep communicationScore between 0 and 100.
11. Keep technicalScore between 0 and 100.
12. If an answer is "Not Answered", give score 0.
13. Give useful and constructive feedback.
14. strengths and weaknesses MUST always be arrays.
15. betterAnswer must provide an improved interview answer.
16. Do not omit any required JSON field.

Return EXACTLY this JSON structure:

{
  "questions": [
    {
      "score": 8,
      "feedback": "Clear and relevant answer.",
      "strengths": [
        "Good understanding of the concept"
      ],
      "weaknesses": [
        "Could provide a practical example"
      ],
      "betterAnswer": "A stronger and more complete answer.",
      "confidenceScore": 80
    }
  ],
  "overallScore": 80,
  "overallFeedback": "Overall interview feedback.",
  "overallConfidence": 80,
  "communicationScore": 80,
  "technicalScore": 80
}

INTERVIEW QUESTIONS AND ANSWERS:

${JSON.stringify(interviewData, null, 2)}

`;

    // ==================================================
    // Call Gemini
    // ==================================================

    let response;

    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",

        contents: prompt,
      });
    } catch (geminiError) {
      console.error("Gemini Evaluation API Error:", geminiError);

      return res.status(502).json({
        success: false,

        message:
          geminiError?.message || "Unable to evaluate interview using Gemini.",
      });
    }

    // ==================================================
    // Raw Gemini Response
    // ==================================================

    const rawGeminiResponse = response?.text;

    console.log("\n========== FINISH INTERVIEW GEMINI RAW RESPONSE ==========");

    console.log(rawGeminiResponse);

    console.log(
      "===========================================================\n",
    );

    // ==================================================
    // Empty Response Protection
    // ==================================================

    if (!rawGeminiResponse || typeof rawGeminiResponse !== "string") {
      console.error("Gemini returned empty evaluation response.");

      return res.status(502).json({
        success: false,

        message: "Gemini returned an empty evaluation response.",
      });
    }

    // ==================================================
    // Parse Gemini Response
    // ==================================================

    let evaluation;

    try {
      evaluation = parseGeminiResponse(rawGeminiResponse);

      console.log("========== GEMINI PARSED EVALUATION ==========");

      console.log(JSON.stringify(evaluation, null, 2));

      console.log("================================================\n");
    } catch (parseError) {
      console.error("Finish Interview Gemini Parse Error:", parseError);

      console.error("Unparsed Gemini Response:", rawGeminiResponse);

      return res.status(502).json({
        success: false,

        message: "Unable to parse Gemini evaluation response.",
      });
    }

    // ==================================================
    // Evaluation Object Validation
    // ==================================================

    if (
      !evaluation ||
      typeof evaluation !== "object" ||
      Array.isArray(evaluation)
    ) {
      console.error("Invalid Gemini Evaluation Object:", evaluation);

      return res.status(502).json({
        success: false,

        message: "Gemini returned an invalid evaluation format.",
      });
    }

    // ==================================================
    // Questions Array Validation
    // ==================================================

    if (!Array.isArray(evaluation.questions)) {
      console.error("Gemini evaluation questions array missing:", evaluation);

      return res.status(502).json({
        success: false,

        message: "Gemini evaluation did not contain question results.",
      });
    }

    // ==================================================
    // Evaluation Count Validation
    // ==================================================

    if (evaluation.questions.length !== interview.questions.length) {
      console.error("Gemini Evaluation Count Mismatch:", {
        expected: interview.questions.length,

        received: evaluation.questions.length,
      });

      return res.status(502).json({
        success: false,

        message: `Gemini evaluated ${evaluation.questions.length} questions instead of ${interview.questions.length}. Please try again.`,
      });
    } // ==================================================
    // Save Question-Wise AI Evaluation
    // ==================================================

    evaluation.questions.forEach((item, index) => {
      const question = interview.questions[index];

      if (!question) {
        return;
      }

      // ==============================================
      // Question Score
      // Score Range: 0 - 10
      // ==============================================

      question.score = safeNumber(item?.score, 0, 0, 10);

      // ==============================================
      // Feedback
      // ==============================================

      question.feedback =
        typeof item?.feedback === "string" ? item.feedback.trim() : "";

      // ==============================================
      // AI Strengths
      // ==============================================

      question.aiStrengths = Array.isArray(item?.strengths)
        ? item.strengths
            .filter(
              (strength) => typeof strength === "string" && strength.trim(),
            )
            .map((strength) => strength.trim())
        : [];

      // ==============================================
      // AI Weaknesses
      // ==============================================

      question.aiWeaknesses = Array.isArray(item?.weaknesses)
        ? item.weaknesses
            .filter(
              (weakness) => typeof weakness === "string" && weakness.trim(),
            )
            .map((weakness) => weakness.trim())
        : [];

      // ==============================================
      // Better Answer
      // ==============================================

      question.betterAnswer =
        typeof item?.betterAnswer === "string" ? item.betterAnswer.trim() : "";

      // ==============================================
      // Confidence Score
      // Range: 0 - 100
      // ==============================================

      question.confidenceScore = safeNumber(item?.confidenceScore, 0, 0, 100);
    });

    // ==================================================
    // Overall Score
    // ==================================================

    interview.overallScore = safeNumber(evaluation.overallScore, 0, 0, 100);

    // ==================================================
    // Overall Feedback
    // ==================================================

    interview.overallFeedback =
      typeof evaluation.overallFeedback === "string"
        ? evaluation.overallFeedback.trim()
        : "";

    // ==================================================
    // Overall Confidence
    // ==================================================

    interview.overallConfidence = safeNumber(
      evaluation.overallConfidence,
      0,
      0,
      100,
    );

    // ==================================================
    // Communication Score
    // ==================================================

    interview.communicationScore = safeNumber(
      evaluation.communicationScore,
      0,
      0,
      100,
    );

    // ==================================================
    // Technical Score
    // ==================================================

    interview.technicalScore = safeNumber(evaluation.technicalScore, 0, 0, 100);

    // ==================================================
    // Calculate Confidence Level
    // ==================================================

    if (interview.overallConfidence >= 85) {
      interview.confidenceLevel = "Excellent";
    } else if (interview.overallConfidence >= 70) {
      interview.confidenceLevel = "Good";
    } else if (interview.overallConfidence >= 50) {
      interview.confidenceLevel = "Average";
    } else {
      interview.confidenceLevel = "Poor";
    }

    // ==================================================
    // Mark AI Evaluation Complete
    // ==================================================

    interview.aiEvaluated = true;

    // ==================================================
    // Complete Interview
    // ==================================================

    interview.status = "Completed";

    interview.completedAt = new Date();

    // ==================================================
    // Save Interview
    // ==================================================

    await interview.save();

    // ==================================================
    // Debug Saved Evaluation
    // ==================================================

    console.log("========== INTERVIEW EVALUATION SAVED ==========");

    console.log("Interview ID:", interview._id.toString());

    console.log("Overall Score:", interview.overallScore);

    console.log("Overall Confidence:", interview.overallConfidence);

    console.log("Communication Score:", interview.communicationScore);

    console.log("Technical Score:", interview.technicalScore);

    console.log("Confidence Level:", interview.confidenceLevel);

    console.log("===============================================\n");

    // ==================================================
    // Success Response
    // ==================================================

    return res.status(200).json({
      success: true,

      message: "Interview completed and evaluated successfully.",

      interview,
    });
  } catch (error) {
    console.error("Finish Interview Error:", error);

    // ==================================================
    // Invalid MongoDB Interview ID
    // ==================================================

    if (error?.name === "CastError") {
      return res.status(400).json({
        success: false,

        message: "Invalid interview ID.",
      });
    }

    // ==================================================
    // Mongoose Validation Error
    // ==================================================

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,

        message: error.message,
      });
    }

    // ==================================================
    // General Server Error
    // ==================================================

    return res.status(500).json({
      success: false,

      message: error?.message || "Unable to finish interview.",
    });
  }
}; // ======================================================
// Get Interview History
// ======================================================

const getInterviewHistory = async (req, res) => {
  try {
    // ==================================================
    // Get User Interviews
    // ==================================================

    const interviews = await Interview.find({
      user: req.user.id,
    })

      .select(
        `
          category
          difficulty
          totalQuestions
          overallScore
          overallFeedback
          overallConfidence
          communicationScore
          technicalScore
          confidenceLevel
          aiEvaluated
          status
          startedAt
          completedAt
          createdAt
          updatedAt
          `,
      )

      .sort({
        createdAt: -1,
      });

    // ==================================================
    // Success Response
    // ==================================================

    return res.status(200).json({
      success: true,

      total: interviews.length,

      interviews,
    });
  } catch (error) {
    console.error("Get Interview History Error:", error);

    return res.status(500).json({
      success: false,

      message: error?.message || "Unable to load interview history.",
    });
  }
};

// ======================================================
// Dashboard Statistics
// ======================================================

const getDashboardStats = async (req, res) => {
  try {
    // ==================================================
    // Get All User Interviews
    // ==================================================

    const interviews = await Interview.find({
      user: req.user.id,
    });

    // ==================================================
    // Total Interviews
    // ==================================================

    const totalInterviews = interviews.length;

    // ==================================================
    // Completed Interviews
    // ==================================================

    const completedInterviews = interviews.filter(
      (item) => item.status === "Completed",
    );

    // ==================================================
    // Pending / In Progress Interviews
    // ==================================================

    const pendingInterviews = interviews.filter(
      (item) => item.status !== "Completed",
    );

    const completed = completedInterviews.length;

    const pending = pendingInterviews.length;

    // ==================================================
    // Highest Score
    // ==================================================

    const highestScore =
      completed > 0
        ? Math.max(
            ...completedInterviews.map((item) =>
              safeNumber(item.overallScore, 0, 0, 100),
            ),
          )
        : 0;

    // ==================================================
    // Average Score
    // ==================================================

    const averageScore =
      completed > 0
        ? Math.round(
            completedInterviews.reduce(
              (total, item) => {
                return total + safeNumber(item.overallScore, 0, 0, 100);
              },

              0,
            ) / completed,
          )
        : 0;

    // ==================================================
    // Average Confidence
    // ==================================================

    const averageConfidence =
      completed > 0
        ? Math.round(
            completedInterviews.reduce(
              (total, item) => {
                return total + safeNumber(item.overallConfidence, 0, 0, 100);
              },

              0,
            ) / completed,
          )
        : 0;

    // ==================================================
    // Average Communication Score
    // ==================================================

    const averageCommunicationScore =
      completed > 0
        ? Math.round(
            completedInterviews.reduce(
              (total, item) => {
                return total + safeNumber(item.communicationScore, 0, 0, 100);
              },

              0,
            ) / completed,
          )
        : 0;

    // ==================================================
    // Average Technical Score
    // ==================================================

    const averageTechnicalScore =
      completed > 0
        ? Math.round(
            completedInterviews.reduce(
              (total, item) => {
                return total + safeNumber(item.technicalScore, 0, 0, 100);
              },

              0,
            ) / completed,
          )
        : 0;

    // ==================================================
    // Completed Percentage
    // ==================================================

    const completionRate =
      totalInterviews > 0 ? Math.round((completed / totalInterviews) * 100) : 0;

    // ==================================================
    // Recent Interviews
    // ==================================================

    const recentInterviews = await Interview.find({
      user: req.user.id,
    })

      .select(
        `
          category
          difficulty
          totalQuestions
          overallScore
          overallConfidence
          communicationScore
          technicalScore
          confidenceLevel
          aiEvaluated
          status
          startedAt
          completedAt
          createdAt
          `,
      )

      .sort({
        createdAt: -1,
      })

      .limit(5);

    // ==================================================
    // Success Response
    // ==================================================

    return res.status(200).json({
      success: true,

      stats: {
        totalInterviews,

        completed,

        pending,

        completionRate,

        highestScore,

        averageScore,

        averageConfidence,

        averageCommunicationScore,

        averageTechnicalScore,

        recentInterviews,
      },
    });
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);

    return res.status(500).json({
      success: false,

      message: error?.message || "Unable to load dashboard statistics.",
    });
  }
}; // ======================================================
// Dashboard Analytics
// ======================================================

const getDashboardAnalytics = async (req, res) => {
  try {
    // ==================================================
    // Get Completed Interviews
    // ==================================================

    const interviews = await Interview.find({
      user: req.user.id,

      status: "Completed",
    }).sort({
      createdAt: 1,
    });

    // ==================================================
    // Performance Analytics
    // ==================================================

    const performance = interviews.map((item, index) => ({
      interview: index + 1,

      interviewId: item._id,

      category: item.category,

      difficulty: item.difficulty,

      score: safeNumber(item.overallScore, 0, 0, 100),

      confidence: safeNumber(item.overallConfidence, 0, 0, 100),

      communication: safeNumber(item.communicationScore, 0, 0, 100),

      technical: safeNumber(item.technicalScore, 0, 0, 100),

      date: item.completedAt || item.createdAt,
    }));

    // ==================================================
    // Category Analytics
    // ==================================================

    const categoryMap = {};

    interviews.forEach((item) => {
      const category = item.category || "Other";

      if (!categoryMap[category]) {
        categoryMap[category] = {
          count: 0,

          totalScore: 0,
        };
      }

      categoryMap[category].count += 1;

      categoryMap[category].totalScore += safeNumber(
        item.overallScore,
        0,
        0,
        100,
      );
    });

    const categories = Object.keys(categoryMap).map((category) => {
      const data = categoryMap[category];

      return {
        name: category,

        value: data.count,

        averageScore:
          data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
      };
    });

    // ==================================================
    // Difficulty Analytics
    // ==================================================

    const difficultyMap = {
      Easy: {
        count: 0,

        totalScore: 0,
      },

      Medium: {
        count: 0,

        totalScore: 0,
      },

      Hard: {
        count: 0,

        totalScore: 0,
      },
    };

    interviews.forEach((item) => {
      const level = item.difficulty;

      if (!difficultyMap[level]) {
        return;
      }

      difficultyMap[level].count += 1;

      difficultyMap[level].totalScore += safeNumber(
        item.overallScore,
        0,
        0,
        100,
      );
    });

    const difficulty = Object.keys(difficultyMap).map((level) => {
      const data = difficultyMap[level];

      return {
        level,

        value: data.count,

        averageScore:
          data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
      };
    });

    // ==================================================
    // Weekly Analytics
    // ==================================================

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const weeklyMap = {
      Sun: {
        count: 0,
        totalScore: 0,
      },

      Mon: {
        count: 0,
        totalScore: 0,
      },

      Tue: {
        count: 0,
        totalScore: 0,
      },

      Wed: {
        count: 0,
        totalScore: 0,
      },

      Thu: {
        count: 0,
        totalScore: 0,
      },

      Fri: {
        count: 0,
        totalScore: 0,
      },

      Sat: {
        count: 0,
        totalScore: 0,
      },
    };

    interviews.forEach((item) => {
      const interviewDate = item.completedAt || item.createdAt;

      if (!interviewDate) {
        return;
      }

      const day = weekDays[new Date(interviewDate).getDay()];

      weeklyMap[day].count += 1;

      weeklyMap[day].totalScore += safeNumber(item.overallScore, 0, 0, 100);
    });

    const weekly = weekDays.map((day) => {
      const data = weeklyMap[day];

      return {
        day,

        count: data.count,

        averageScore:
          data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
      };
    });

    // ==================================================
    // Monthly Analytics
    // ==================================================

    const monthlyMap = {};

    interviews.forEach((item) => {
      const interviewDate = item.completedAt || item.createdAt;

      if (!interviewDate) {
        return;
      }

      const date = new Date(interviewDate);

      // Example:
      // 2026-07
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      const monthName = date.toLocaleString("default", {
        month: "short",
      });

      const year = date.getFullYear();

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthName,

          year,

          interviews: 0,

          totalScore: 0,
        };
      }

      monthlyMap[monthKey].interviews += 1;

      monthlyMap[monthKey].totalScore += safeNumber(
        item.overallScore,
        0,
        0,
        100,
      );
    });

    const monthly = Object.keys(monthlyMap)

      .sort()

      .map((monthKey) => {
        const data = monthlyMap[monthKey];

        return {
          month: data.month,

          year: data.year,

          interviews: data.interviews,

          averageScore:
            data.interviews > 0
              ? Math.round(data.totalScore / data.interviews)
              : 0,
        };
      });

    // ==================================================
    // Overall Analytics Summary
    // ==================================================

    const totalCompleted = interviews.length;

    const totalScore = interviews.reduce((total, item) => {
      return total + safeNumber(item.overallScore, 0, 0, 100);
    }, 0);

    const totalConfidence = interviews.reduce((total, item) => {
      return total + safeNumber(item.overallConfidence, 0, 0, 100);
    }, 0);

    const averageScore =
      totalCompleted > 0 ? Math.round(totalScore / totalCompleted) : 0;

    const averageConfidence =
      totalCompleted > 0 ? Math.round(totalConfidence / totalCompleted) : 0;

    // ==================================================
    // Success Response
    // ==================================================

    return res.status(200).json({
      success: true,

      analytics: {
        summary: {
          totalCompleted,

          averageScore,

          averageConfidence,
        },

        performance,

        categories,

        difficulty,

        weekly,

        monthly,
      },
    });
  } catch (error) {
    console.error("Get Dashboard Analytics Error:", error);

    return res.status(500).json({
      success: false,

      message: error?.message || "Unable to load dashboard analytics.",
    });
  }
};

// ======================================================
// Export Controllers
// ======================================================

module.exports = {
  startInterview,

  getInterview,

  submitAnswer,

  finishInterview,

  getInterviewHistory,

  getDashboardStats,

  getDashboardAnalytics,
};
