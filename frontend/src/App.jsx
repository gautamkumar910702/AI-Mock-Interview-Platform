import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";

import Interview from "./pages/Interview";
import Result from "./pages/Result";
import History from "./pages/History";

import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import ResumeResult from "./pages/ResumeResult";
import ResumeHistory from "./pages/ResumeHistory";
import WebcamHistory from "./pages/WebcamHistory";
import InterviewRoomV2 from "./pages/InterviewRoomV2";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <Routes>

      {/* ================= Home ================= */}

      <Route path="/" element={<Home />} />

      {/* ================= Public Routes ================= */}

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      <Route
        path="/reset-password/:token"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* ================= Protected Routes ================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />
<Route
  path="/webcam-history"
  element={
    <ProtectedRoute>
      <WebcamHistory />
    </ProtectedRoute>
  }
/>
      <Route
        path="/interview"
        element={
          <ProtectedRoute>
            <Interview />
          </ProtectedRoute>
        }
      />
      <Route
  path="/interview-room/:id"
  element={
    <ProtectedRoute>
      <InterviewRoomV2 />
    </ProtectedRoute>
  }
/>

      <Route
        path="/result/:id"
        element={
          <ProtectedRoute>
            <Result />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />

      {/* ================= Resume Module ================= */}

      <Route
        path="/resume-analyzer"
        element={
          <ProtectedRoute>
            <ResumeAnalyzer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resume-result/:id"
        element={
          <ProtectedRoute>
            <ResumeResult />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resume-history"
        element={
          <ProtectedRoute>
            <ResumeHistory />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;