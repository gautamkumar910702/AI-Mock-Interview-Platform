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
const allowedOrigins = ["http://localhost:5173", process.env.CLIENT_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, server-to-server)
      if (!origin) return callback(null, true);

      // Allow localhost and production URL
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel preview deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
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
