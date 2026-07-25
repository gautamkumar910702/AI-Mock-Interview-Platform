import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import { toast } from "react-toastify";

import ThemeToggle from "../components/ThemeToggle";

import PerformanceChart from "../charts/PerformanceChart";
import WeeklyChart from "../charts/WeeklyChart";
import CategoryChart from "../charts/CategoryChart";

import {
  FaUserCircle,
  FaPlay,
  FaHistory,
  FaUser,
  FaChartLine,
  FaCheckCircle,
  FaTrophy,
  FaClipboardList,
  FaFilePdf,
  FaFolderOpen,
} from "react-icons/fa";

import "./Dashboard.css";

function Dashboard() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    totalInterviews: 0,
    completed: 0,
    pending: 0,
    averageScore: 0,
    highestScore: 0,
    recentInterviews: [],
  });

  // =============================
  // Analytics State
  // =============================

  const [analytics, setAnalytics] = useState({
    performance: [],
    weekly: [],
    categories: [],
  });

  // =============================
  // Fetch Dashboard
  // =============================

  async function fetchDashboard() {

    try {

      const token = localStorage.getItem("token");

      // ================= User Profile =================

      const profileResponse = await api.get(
        "/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(profileResponse.data.user);

      // ================= Dashboard Stats =================

      const statsResponse = await api.get(
        "/interview/dashboard-stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStats(statsResponse.data.stats);

      // ================= Dashboard Analytics =================

      const analyticsResponse = await api.get(
        "/interview/dashboard-analytics",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnalytics(analyticsResponse.data.analytics);

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Unable to Load Dashboard"
      );

      if ([401, 403].includes(error.response?.status)) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      }

    } finally {

      setLoading(false);

    }

  }

  // =============================
  // Load Dashboard
  // =============================

  useEffect(() => {
    const task = setTimeout(fetchDashboard, 0);

    return () => clearTimeout(task);
  }, []);

  // =============================
  // Loading
  // =============================

  if (loading) {

    return (
      <div className="dashboard-loading">
        <h2>Loading Dashboard...</h2>
      </div>
    );

  }

  return (

    <div className="dashboard">

      {/* ================= Header ================= */}

      <div className="dashboard-header">

        <div className="user-info">

          {user?.profileImage ? (

            <img
              src={user.profileImage}
              alt="Profile"
              className="dashboard-profile"
            />

          ) : (

            <FaUserCircle className="user-icon" />

          )}

          <div>

            <h2>
              Welcome, {user?.fullName} 👋
            </h2>

            <p>
              Ready for your next AI Mock Interview?
            </p>

          </div>

        </div>

        <ThemeToggle />

      </div>

      {/* ================= Statistics ================= */}

      <div className="stats-grid">

        <div className="stat-card">
          <FaClipboardList className="stat-icon blue" />
          <h3>Total Interviews</h3>
          <h2>{stats.totalInterviews}</h2>
        </div>

        <div className="stat-card">
          <FaCheckCircle className="stat-icon green" />
          <h3>Completed</h3>
          <h2>{stats.completed}</h2>
        </div>

        <div className="stat-card">
          <FaChartLine className="stat-icon orange" />
          <h3>Average Score</h3>
          <h2>{stats.averageScore}%</h2>
        </div>

        <div className="stat-card">
          <FaTrophy className="stat-icon yellow" />
          <h3>Highest Score</h3>
          <h2>{stats.highestScore}%</h2>
        </div>

      </div>

      {/* ================= Analytics ================= */}

      <div className="analytics-grid">

        <div className="chart-card">
          <PerformanceChart
            data={analytics.performance}
          />
        </div>

        <div className="chart-card">
          <WeeklyChart
            data={analytics.weekly}
          />
        </div>

        <div className="chart-card chart-full">
          <CategoryChart
            data={analytics.categories}
          />
        </div>

      </div>
            {/* ================= Quick Actions ================= */}

      <div className="action-grid">

        <button
          className="action-btn start-btn"
          onClick={() => navigate("/interview")}
        >
          <FaPlay />
          Start Interview
        </button>

        <button
          className="action-btn history-btn"
          onClick={() => navigate("/history")}
        >
          <FaHistory />
          Interview History
        </button>

        <button
          className="action-btn profile-btn"
          onClick={() => navigate("/profile")}
        >
          <FaUser />
          My Profile
        </button>

        <button
          className="action-btn resume-btn"
          onClick={() => navigate("/resume-analyzer")}
        >
          <FaFilePdf />
          Resume Analyzer
        </button>

        <button
          className="action-btn resume-history-btn"
          onClick={() => navigate("/resume-history")}
        >
          <FaFolderOpen />
          Resume History
        </button>
       <button
  className="action-btn webcam-btn"
  onClick={() => navigate("/webcam-history")}
>
  📹 Webcam History
</button>

      </div>

      {/* ================= Recent Interviews ================= */}

      <div className="recent-section">

        <h2>Recent Interviews</h2>

        {stats.recentInterviews.length === 0 ? (

          <div className="empty-card">

            <p>
              No interviews found. Start your first interview!
            </p>

          </div>

        ) : (

          <div className="recent-list">

            {stats.recentInterviews.map((item) => (

              <div
                className="recent-card"
                key={item._id}
              >

                <div>

                  <h3>{item.category}</h3>

                  <p>
                    <strong>Difficulty :</strong>{" "}
                    {item.difficulty}
                  </p>

                  <p>
                    <strong>Status :</strong>{" "}
                    {item.status}
                  </p>

                </div>

                <div className="recent-score">

                  <h2>{item.overallScore}%</h2>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* ================= Footer ================= */}

      <div className="dashboard-footer">

        <p>
          Keep practicing to improve your interview performance 🚀
        </p>

      </div>

    </div>

  );

}

export default Dashboard;