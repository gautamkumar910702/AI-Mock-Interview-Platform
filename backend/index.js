const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/Database");

const authRoutes = require("./routes/Auth");
const interviewRoutes = require("./routes/Interview");
const resumeRoutes = require("./routes/Resume");
const voiceRoutes = require("./routes/Voice");
const webcamRoutes = require("./routes/Webcam");
const interviewVideoRoutes = require("./routes/InterviewVideo");

const app = express();

const PORT = process.env.PORT || 5000;

// ==========================================
// Database
// ==========================================

connectDB();

// ==========================================
// Middlewares
// ==========================================

//app.use(cors());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ==========================================
// API Routes
// ==========================================

app.use("/api/auth", authRoutes);

app.use("/api/interview", interviewRoutes);

app.use("/api/interview-video", interviewVideoRoutes);

app.use("/api/resume", resumeRoutes);

app.use("/api/voice", voiceRoutes);

// Optional (Keep only if Webcam feature is different)
app.use("/api/webcam", webcamRoutes);

// ==========================================
// Home
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,

    message: "🚀 AI Mock Interview Platform API Running",
  });
});

// ==========================================
// 404
// ==========================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,

    message: "Route Not Found",
  });
});

// ==========================================
// Start Server
// ==========================================

app.listen(PORT, () => {
  console.log(`✅ Server Running : http://localhost:${PORT}`);
});
