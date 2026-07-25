import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

import { toast } from "react-toastify";

import {
  FaHistory,
  FaSearch,
  FaEye,
  FaChartLine,
} from "react-icons/fa";

import "./History.css";

function History() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [interviews, setInterviews] = useState([]);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All");

  async function fetchHistory() {

    try {

      const token = localStorage.getItem("token");

      const response = await api.get(

        "/interview/history",

        {

          headers: {

            Authorization: `Bearer ${token}`,

          },

        }

      );

      setInterviews(response.data.interviews);

    }

    catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Unable to Load History"

      );

    }

    finally {

      setLoading(false);

    }

  }

  // ==========================
  // Fetch Interview History
  // ==========================

  useEffect(() => {

    const task = setTimeout(fetchHistory, 0);

    return () => clearTimeout(task);

  }, []);

  // ==========================
  // Categories
  // ==========================

  const categories = useMemo(() => {

    const unique = [

      ...new Set(

        interviews.map(

          (item) => item.category

        )

      ),

    ];

    return ["All", ...unique];

  }, [interviews]);

  // ==========================
  // Filter
  // ==========================

  const filteredInterviews = interviews.filter((item) => {

    const matchCategory =

      category === "All"

        ? true

        : item.category === category;

    const matchSearch =

      item.category

        .toLowerCase()

        .includes(

          search.toLowerCase()

        );

    return matchCategory && matchSearch;

  });

  if (loading) {

    return (

      <div className="history-loading">

        <h2>Loading History...</h2>

      </div>

    );

  }  return (

    <div className="history-page">

      {/* Header */}

      <div className="history-header">

        <div>

          <h1>

            <FaHistory />

            Interview History

          </h1>

          <p>

            View all your previous AI mock interviews.

          </p>

        </div>

      </div>

      {/* Search & Filter */}

      <div className="history-controls">

        <div className="search-box">

          <FaSearch />

          <input
            type="text"
            placeholder="Search by Technology..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        >

          {categories.map((item) => (

            <option
              key={item}
              value={item}
            >
              {item}
            </option>

          ))}

        </select>

      </div>

      {/* No History */}

      {filteredInterviews.length === 0 ? (

        <div className="empty-history">

          <FaChartLine />

          <h2>No Interviews Found</h2>

          <p>

            Start your first AI interview to see history here.

          </p>

        </div>

      ) : (

        <div className="history-grid">

          {filteredInterviews.map((item) => (

            <div
              className="history-card"
              key={item._id}
            >

              <div className="history-top">

                <h3>{item.category}</h3>

                <span
                  className={`status ${item.status.toLowerCase()}`}
                >
                  {item.status}
                </span>

              </div>

              <div className="history-info">

                <p>

                  <strong>Difficulty :</strong>

                  {item.difficulty}

                </p>

                <p>

                  <strong>Score :</strong>

                  {item.overallScore}/100

                </p>

                <p>

                  <strong>Date :</strong>

                  {new Date(
                    item.createdAt
                  ).toLocaleDateString()}

                </p>

              </div>

              <button
                className="view-btn"
                onClick={() =>
                  navigate(`/result/${item._id}`)
                }
              >

                <FaEye />

                View Result

              </button>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}

export default History;