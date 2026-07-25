import { useNavigate } from "react-router-dom";

import {
  FaRobot,
  FaMoon,
  FaPlayCircle,
  FaRocket,
  FaStar,
} from "react-icons/fa";

import "./Home.css";

function Home() {

  const navigate = useNavigate();

  return (
    <>
      {/* ================= NAVBAR ================= */}

      <header className="navbar">

        <div className="logo">

          <FaRobot className="logo-icon" />

          <h2>AI Mock Interview</h2>

        </div>

        <nav>

          <ul className="nav-links">

            <li>
              <a href="#">Home</a>
            </li>

            <li>
              <a href="#">Features</a>
            </li>

            <li>
              <a href="#">Interview Sets</a>
            </li>

            <li>
              <a href="#">Leaderboard</a>
            </li>

            <li>
              <a href="#">Pricing</a>
            </li>

            <li>
              <a href="#">About</a>
            </li>

          </ul>

        </nav>

        <div className="nav-buttons">

          <button className="theme-btn">
            <FaMoon />
          </button>

          <button
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="register-btn"
            onClick={() => navigate("/register")}
          >
            Register
          </button>

        </div>

      </header>

      {/* ================= HERO ================= */}

      <section className="hero">

        <div className="hero-left">

          <span className="badge">
            🚀 AI Powered Interview Platform
          </span>

          <h1>
            Ace Your Next
            <br />
            Interview With
            <span> AI Power ⚡</span>
          </h1>

          <p>
            Practice real interview questions,
            receive instant AI feedback,
            improve communication,
            and track your interview journey.
          </p>

          <div className="hero-buttons">

            <button
              className="start-btn"
              onClick={() => navigate("/login")}
            >
              <FaRocket />
              Start Free Interview
            </button>

            <button className="demo-btn">
              <FaPlayCircle />
              Watch Demo
            </button>

          </div>

          {/* Rating */}

          <div className="rating-section">

            <div className="users">

              <img src="https://i.pravatar.cc/45?img=1" alt="" />
              <img src="https://i.pravatar.cc/45?img=2" alt="" />
              <img src="https://i.pravatar.cc/45?img=3" alt="" />
              <img src="https://i.pravatar.cc/45?img=4" alt="" />
              <img src="https://i.pravatar.cc/45?img=5" alt="" />

            </div>

            <div>

              <div className="stars">

                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />

              </div>

              <h3>
                4.9/5
                <span> (12,000+ Users)</span>
              </h3>

            </div>

          </div>

        </div>

        {/* Right */}

        <div className="hero-right">

          <div className="question-card">

            <h3>Interview Question</h3>

            <p>
              Explain the concept of
              Object-Oriented Programming in Java.
            </p>

            <span>Java</span>

          </div>

          <div className="robot">

            <img
              src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
              alt="AI Robot"
            />

          </div>

          <div className="feedback-card">

            <h3>AI Feedback</h3>

            <ul>

              <li>✅ Good Explanation</li>
              <li>✅ Relevant Example</li>
              <li>❌ Improve Confidence</li>

            </ul>

          </div>

        </div>

      </section>
            {/* ===================== STATISTICS ===================== */}

      <section className="stats-section">

        <div className="stat-box">
          <h2>10,000+</h2>
          <p>Active Users</p>
        </div>

        <div className="stat-box">
          <h2>50,000+</h2>
          <p>Interviews Conducted</p>
        </div>

        <div className="stat-box">
          <h2>95%</h2>
          <p>Success Rate</p>
        </div>

        <div className="stat-box">
          <h2>500+</h2>
          <p>Interview Questions</p>
        </div>

      </section>

      {/* ===================== FEATURES ===================== */}

      <section className="features-section">

        <div className="section-title">

          <h2>Why Choose Our Platform?</h2>

          <p>
            Everything you need to crack technical interviews with
            confidence.
          </p>

        </div>

        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-icon">🎤</div>
            <h3>AI Voice Interview</h3>
            <p>
              Practice with realistic AI voice interviews and receive
              instant feedback.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Detailed Analytics</h3>
            <p>
              Track your strengths and weaknesses after every interview.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Resume Review</h3>
            <p>
              Upload your resume and receive AI suggestions instantly.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📥</div>
            <h3>PDF Reports</h3>
            <p>
              Download interview reports and improve continuously.
            </p>
          </div>

        </div>

      </section>

      {/* ===================== HOW IT WORKS ===================== */}

      <section className="work-section">

        <div className="section-title">

          <h2>How It Works?</h2>

          <p>
            Complete your mock interview in four simple steps.
          </p>

        </div>

        <div className="work-grid">

          <div className="work-card">
            <div className="work-number">1</div>
            <h3>Choose Topic</h3>
            <p>Select Java, React, DSA, Node.js or any interview category.</p>
          </div>

          <div className="work-card">
            <div className="work-number">2</div>
            <h3>Answer Questions</h3>
            <p>Answer AI-generated interview questions confidently.</p>
          </div>

          <div className="work-card">
            <div className="work-number">3</div>
            <h3>AI Evaluation</h3>
            <p>Get detailed feedback and improvement suggestions.</p>
          </div>

          <div className="work-card">
            <div className="work-number">4</div>
            <h3>Track Progress</h3>
            <p>Monitor your interview performance and become job ready.</p>
          </div>

        </div>

        <div className="journey-btn">

          <button
            onClick={() => navigate("/register")}
          >
            Start Your Journey →
          </button>

        </div>

      </section>

      {/* ===================== TESTIMONIALS ===================== */}

      <section className="testimonial-section">

        <div className="section-title">

          <h2>What Students Say</h2>

          <p>
            Thousands of students improved their interview skills using
            our AI Mock Interview platform.
          </p>

        </div>

        <div className="testimonial-grid">

          <div className="testimonial-card">

            <img
              src="https://i.pravatar.cc/100?img=11"
              alt=""
            />

            <h3>Rahul Sharma</h3>

            <span>Software Engineer</span>

            <div className="stars">⭐⭐⭐⭐⭐</div>

            <p>
              This platform helped me crack my first technical interview.
            </p>

          </div>

          <div className="testimonial-card">

            <img
              src="https://i.pravatar.cc/100?img=22"
              alt=""
            />

            <h3>Priya Verma</h3>

            <span>Frontend Developer</span>

            <div className="stars">⭐⭐⭐⭐⭐</div>

            <p>
              Amazing AI feedback and interview experience.
            </p>

          </div>

          <div className="testimonial-card">

            <img
              src="https://i.pravatar.cc/100?img=35"
              alt=""
            />

            <h3>Aman Singh</h3>

            <span>MERN Developer</span>

            <div className="stars">⭐⭐⭐⭐⭐</div>

            <p>
              Best platform for placement preparation.
            </p>

          </div>

        </div>

      </section>

      {/* ===================== COMPANIES ===================== */}

      <section className="company-section">

        <div className="section-title">

          <h2>Practice For Top Companies</h2>

        </div>

        <div className="company-grid">

          <div className="company-card">Google</div>
          <div className="company-card">Microsoft</div>
          <div className="company-card">Amazon</div>
          <div className="company-card">TCS</div>
          <div className="company-card">Infosys</div>
          <div className="company-card">Wipro</div>
          <div className="company-card">Accenture</div>
          <div className="company-card">Capgemini</div>

        </div>

      </section>

      {/* ===================== CTA ===================== */}

      <section className="cta-section">

        <div className="cta-content">

          <h2>Ready To Crack Your Dream Job?</h2>

          <p>
            Start practicing today with AI Mock Interview.
          </p>

          <button
            className="cta-btn"
            onClick={() => navigate("/register")}
          >
            Get Started Free
          </button>

        </div>

      </section>

      {/* ===================== FOOTER ===================== */}

      <footer className="footer">

        <div className="footer-top">

          <div className="footer-box">

            <h2>AI Mock Interview</h2>

            <p>
              Practice smarter with AI-powered interviews.
            </p>

          </div>

          <div className="footer-box">

            <h3>Quick Links</h3>

            <a href="#">Home</a>
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <a href="#">About</a>

          </div>

          <div className="footer-box">

            <h3>Resources</h3>

            <a href="#">Interview Tips</a>
            <a href="#">Blog</a>
            <a href="#">FAQ</a>

          </div>

          <div className="footer-box">

            <h3>Contact</h3>

            <p>support@aimockinterview.com</p>
            <p>+91 9876543210</p>

          </div>

        </div>

        <hr />

        <div className="footer-bottom">

          <p>
            © 2026 AI Mock Interview. All Rights Reserved.
          </p>

        </div>

      </footer>

    </>
  );
}

export default Home;