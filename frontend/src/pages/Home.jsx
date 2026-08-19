import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRobot,
  FaMoon,
  FaSun,
  FaPlayCircle,
  FaRocket,
  FaStar,
  FaArrowRight,
  FaCheckCircle,
  FaBrain,
  FaChartLine,
  FaFileAlt,
  FaTimes,
} from "react-icons/fa";
import "./Home.css";
// ======================================================
// HOME PAGE DATA
// ======================================================
const stats = [
  {
    value: "10K+",
    label: "Active Users",
  },
  {
    value: "50K+",
    label: "Interviews Completed",
  },
  {
    value: "95%",
    label: "Success Rate",
  },
  {
    value: "500+",
    label: "Interview Questions",
  },
];
const features = [
  {
    icon: <FaBrain />,
    title: "AI Voice Interview",
    description:
      "Practice realistic technical interviews with AI-powered questions and instant feedback.",
  },
  {
    icon: <FaChartLine />,
    title: "Detailed Analytics",
    description:
      "Understand your strengths, weaknesses, scores and overall interview performance.",
  },
  {
    icon: <FaFileAlt />,
    title: "AI Resume Review",
    description:
      "Upload your resume and get useful AI-powered suggestions to improve it.",
  },
  {
    icon: <FaArrowRight />,
    title: "Interview Reports",
    description:
      "Review your interview performance and track your improvement over time.",
  },
];
const steps = [
  {
    number: "01",
    title: "Choose Your Interview",
    description:
      "Select your preferred category, difficulty level and interview type.",
  },
  {
    number: "02",
    title: "Answer Questions",
    description:
      "Answer AI-generated questions just like you would in a real interview.",
  },
  {
    number: "03",
    title: "Get AI Feedback",
    description:
      "Receive detailed feedback, scores, strengths and improvement suggestions.",
  },
  {
    number: "04",
    title: "Track Your Progress",
    description:
      "Review your previous interviews and continuously improve your performance.",
  },
];
const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Software Engineer",
    image: "https://i.pravatar.cc/100?img=11",
    feedback:
      "This platform helped me practice consistently and improve my confidence before interviews.",
  },
  {
    name: "Priya Verma",
    role: "Frontend Developer",
    image: "https://i.pravatar.cc/100?img=22",
    feedback:
      "The AI feedback made it much easier to understand where I was making mistakes.",
  },
  {
    name: "Aman Singh",
    role: "MERN Developer",
    image: "https://i.pravatar.cc/100?img=35",
    feedback:
      "A very useful platform for technical interview preparation and regular practice.",
  },
];
const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "TCS",
  "Infosys",
  "Wipro",
  "Accenture",
  "Capgemini",
];
// ======================================================
// HOME COMPONENT
// ======================================================
function Home() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("aiMockTheme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return true;
  });
  const [showDemo, setShowDemo] = useState(false);
  // ====================================================
  // APPLY THEME
  // ====================================================
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
    localStorage.setItem(
      "aiMockTheme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);
  // ====================================================
  // CLOSE DEMO WITH ESCAPE
  // ====================================================
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowDemo(false);
      }
    };
    if (showDemo) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [showDemo]);
  // ====================================================
  // NAVIGATION HANDLERS
  // ====================================================
  const handleLogin = () => {
    navigate("/login");
  };
  const handleRegister = () => {
    navigate("/register");
  };
  const handleStartInterview = () => {
    navigate("/login");
  };
  // ====================================================
  // DEMO HANDLERS
  // ====================================================
  const handleWatchDemo = () => {
    setShowDemo(true);
  };
  const handleDemoLogin = () => {
    setShowDemo(false);
    navigate("/login");
  };
  const handleDemoRegister = () => {
    setShowDemo(false);
    navigate("/register");
  };
  // ====================================================
  // THEME HANDLER
  // ====================================================
  const toggleTheme = () => {
    setDarkMode((previousMode) => !previousMode);
  };
  return (
    <div className={`home-page ${darkMode ? "dark-mode" : "light-mode"}`}>
      {/* ==================================================
          NAVBAR
      ================================================== */}
      <header className="navbar">
        <div className="navbar-container">
          <div
            className="logo"
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                navigate("/");
              }
            }}
          >
            <div className="logo-icon-wrapper">
              <FaRobot className="logo-icon" />
            </div>
            <div className="logo-text">
              <h2>AI Mock</h2>
              <span>Interview</span>
            </div>
          </div>
          <nav className="desktop-nav">
            <ul className="nav-links">
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#how-it-works">How It Works</a>
              </li>
              <li>
                <a href="#companies">Companies</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
            </ul>
          </nav>
          <div className="nav-buttons">
            <button
              type="button"
              className="theme-btn"
              onClick={toggleTheme}
              aria-label={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            <button
              type="button"
              className="login-btn"
              onClick={handleLogin}
            >
              Login
            </button>
            <button
              type="button"
              className="register-btn"
              onClick={handleRegister}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>
      {/* ==================================================
          HERO SECTION
      ================================================== */}
      <main>
        <section
          className="hero"
          id="home"
        >
          <div className="hero-container">
            <div className="hero-left">
              <div className="hero-badge">
                <span className="badge-dot"></span>
                <span>
                  AI-Powered Interview Practice
                </span>
              </div>
              <h1>
                Prepare Smarter.
                <br />
                <span className="gradient-text">
                  Interview Better.
                </span>
              </h1>
              <p className="hero-description">
                Practice realistic technical interviews with AI,
                improve your answers, receive instant feedback,
                and build the confidence you need to crack your
                dream job.
              </p>
              <div className="hero-buttons">
                <button
                  type="button"
                  className="start-btn"
                  onClick={handleStartInterview}
                >
                  <FaRocket />
                  <span>
                    Start Free Interview
                  </span>
                  <FaArrowRight className="button-arrow" />
                </button>
                <button
                  type="button"
                  className="demo-btn"
                  onClick={handleWatchDemo}
                >
                  <FaPlayCircle />
                  <span>
                    Watch Demo
                  </span>
                </button>
              </div>
              <div className="hero-trust">
                <div className="user-avatars">
                  <img
                    src="https://i.pravatar.cc/45?img=1"
                    alt="User"
                  />
                  <img
                    src="https://i.pravatar.cc/45?img=2"
                    alt="User"
                  />
                  <img
                    src="https://i.pravatar.cc/45?img=3"
                    alt="User"
                  />
                  <img
                    src="https://i.pravatar.cc/45?img=4"
                    alt="User"
                  />
                  <span className="avatar-more">
                    +12K
                  </span>
                </div>
                <div className="trust-content">
                  <div className="stars">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                  </div>
                  <p>
                    <strong>4.9/5</strong>
                    <span>
                      Trusted by 12,000+ learners
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="hero-right">
              <div className="hero-visual">
                <div className="hero-glow"></div>
                <div className="ai-interview-card">
                  <div className="ai-card-header">
                    <div className="ai-card-title">
                      <div className="mini-ai-icon">
                        <FaRobot />
                      </div>
                      <div>
                        <span>AI Interviewer</span>
                        <small>
                          Technical Round
                        </small>
                      </div>
                    </div>
                    <span className="live-badge">
                      <span></span>
                      LIVE
                    </span>
                  </div>
                  <div className="question-content">
                    <span className="question-label">
                      QUESTION 01
                    </span>
                    <h3>
                      Explain the concept of
                      Object-Oriented Programming
                      in Java.
                    </h3>
                    <div className="question-tag">
                      Java
                    </div>
                  </div>
                  <div className="answer-wave">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="recording-status">
                    <span className="recording-dot"></span>
                    <span>
                      Listening to your answer...
                    </span>
                    <strong>
                      00:42
                    </strong>
                  </div>
                </div>
                <div className="robot-wrapper">
                  <div className="robot-ring"></div>
                  <div className="robot">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
                      alt="AI Interview Assistant"
                    />
                  </div>
                </div>
                <div className="feedback-card">
                  <div className="feedback-header">
                    <div className="feedback-icon">
                      <FaCheckCircle />
                    </div>
                    <div>
                      <span>AI Feedback</span>
                      <small>
                        Just now
                      </small>
                    </div>
                  </div>
                  <div className="feedback-score">
                    <strong>
                      8.7
                    </strong>
                    <span>
                      /10
                    </span>
                  </div>
                  <div className="feedback-items">
                    <div>
                      <FaCheckCircle />
                      <span>Good Explanation</span>
                    </div>
                    <div>
                      <FaCheckCircle />
                      <span>Relevant Example</span>
                    </div>
                    <div className="feedback-warning">
                      <span className="warning-icon">!</span>
                      <span>Improve Confidence</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
                {/* ==================================================
            STATISTICS
        ================================================== */}
        <section className="stats-section">
          <div className="stats-container">
            {stats.map((stat) => (
              <div
                className="stat-box"
                key={stat.label}
              >
                <h2>{stat.value}</h2>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
        {/* ==================================================
            FEATURES
        ================================================== */}
        <section
          className="features-section"
          id="features"
        >
          <div className="section-container">
            <div className="section-heading">
              <span className="section-eyebrow">
                POWERFUL FEATURES
              </span>
              <h2>
                Everything You Need
                <br />
                <span className="gradient-text">
                  To Crack Your Interview
                </span>
              </h2>
              <p>
                One platform to practice, analyze and improve
                every part of your interview performance.
              </p>
            </div>
            <div className="features-grid">
              {features.map((feature, index) => (
                <article
                  className="feature-card"
                  key={feature.title}
                >
                  <div className="feature-card-top">
                    <div className="feature-icon">
                      {feature.icon}
                    </div>
                    <span className="feature-number">
                      0{index + 1}
                    </span>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <div className="feature-link">
                    <span>Explore Feature</span>
                    <FaArrowRight />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        {/* ==================================================
            HOW IT WORKS
        ================================================== */}
        <section
          className="work-section"
          id="how-it-works"
        >
          <div className="section-container">
            <div className="section-heading centered">
              <span className="section-eyebrow">
                SIMPLE PROCESS
              </span>
              <h2>
                Your Journey To
                <br />
                <span className="gradient-text">
                  Interview Success
                </span>
              </h2>
              <p>
                Start practicing in minutes and turn your
                weaknesses into strengths.
              </p>
            </div>
            <div className="work-grid">
              {steps.map((step, index) => (
                <div
                  className="work-card"
                  key={step.number}
                >
                  <div className="work-card-header">
                    <div className="work-number">
                      {step.number}
                    </div>
                    {index !== steps.length - 1 && (
                      <div className="step-line">
                        <span></span>
                      </div>
                    )}
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
            <div className="journey-btn">
              <button
                type="button"
                onClick={handleRegister}
              >
                <span>Start Your Journey</span>
                <FaArrowRight />
              </button>
            </div>
          </div>
        </section>
        {/* ==================================================
            TESTIMONIALS
        ================================================== */}
        <section className="testimonial-section">
          <div className="section-container">
            <div className="section-heading centered">
              <span className="section-eyebrow">
                SUCCESS STORIES
              </span>
              <h2>
                Loved By
                <span className="gradient-text">
                  {" "}Learners
                </span>
              </h2>
              <p>
                See how students are using AI-powered practice
                to become more confident interview candidates.
              </p>
            </div>
            <div className="testimonial-grid">
              {testimonials.map((testimonial) => (
                <article
                  className="testimonial-card"
                  key={testimonial.name}
                >
                  <div className="testimonial-top">
                    <div className="testimonial-user">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                      />
                      <div>
                        <h3>{testimonial.name}</h3>
                        <span>{testimonial.role}</span>
                      </div>
                    </div>
                    <div className="quote-mark">
                      "
                    </div>
                  </div>
                  <div className="testimonial-stars">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                  </div>
                  <p>{testimonial.feedback}</p>
                  <div className="verified-review">
                    <FaCheckCircle />
                    <span>Verified Learner</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        {/* ==================================================
            COMPANIES
        ================================================== */}
        <section
          className="company-section"
          id="companies"
        >
          <div className="section-container">
            <div className="section-heading centered">
              <span className="section-eyebrow">
                PRACTICE WITH CONFIDENCE
              </span>
              <h2>
                Prepare For Your
                <span className="gradient-text">
                  {" "}Dream Company
                </span>
              </h2>
              <p>
                Practice questions inspired by the interview
                patterns of leading companies.
              </p>
            </div>
            <div className="company-grid">
              {companies.map((company) => (
                <div
                  className="company-card"
                  key={company}
                >
                  <div className="company-logo">
                    {company.charAt(0)}
                  </div>
                  <span>{company}</span>
                  <small>Interview Prep</small>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* ==================================================
            ABOUT / CTA
        ================================================== */}
        <section
          className="cta-section"
          id="about"
        >
          <div className="cta-container">
            <div className="cta-glow"></div>
            <div className="cta-content">
              <span className="cta-badge">
                <FaRobot />
                AI-Powered Preparation
              </span>
              <h2>
                Ready To Crack
                <br />
                <span>Your Dream Job?</span>
              </h2>
              <p>
                Stop preparing alone. Practice with AI,
                understand your mistakes, and walk into your
                next interview with confidence.
              </p>
              <button
                type="button"
                className="cta-btn"
                onClick={handleRegister}
              >
                <span>Get Started For Free</span>
                <FaArrowRight />
              </button>
              <div className="cta-trust">
                <FaCheckCircle />
                <span>No credit card required</span>
                <span className="trust-divider">•</span>
                <FaCheckCircle />
                <span>Start practicing instantly</span>
              </div>
            </div>
          </div>
        </section>
      </main>
            {/* ==================================================
          FOOTER
      ================================================== */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo-icon-wrapper">
                  <FaRobot />
                </div>
                <div>
                  <h2>AI Mock</h2>
                  <span>Interview</span>
                </div>
              </div>
              <p>
                Practice smarter with AI-powered mock interviews
                and build the confidence to land your dream job.
              </p>
              <div className="footer-rating">
                <div className="footer-stars">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
                <span>4.9/5 from 12K+ learners</span>
              </div>
            </div>
            <div className="footer-column">
              <h3>Product</h3>
              <a href="#home">Home</a>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#companies">Companies</a>
            </div>
            <div className="footer-column">
              <h3>Resources</h3>
              <a href="#features">Interview Tips</a>
              <a href="#how-it-works">How To Prepare</a>
              <a href="#about">FAQ</a>
              <a href="#companies">Career Guide</a>
            </div>
            <div className="footer-column">
              <h3>Contact</h3>
              <a href="mailto:gautamkumar910702@gmail.com">
                gautamkumar910702@gmail.com
              </a>
              <a href="tel:+919102237011">
                +91 9102237011
              </a>
              <span className="footer-location">
                India
              </span>
            </div>
          </div>
          <div className="footer-divider"></div>
          <div className="footer-bottom">
            <p>
              © 2026 AI Mock Interview. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#about">Privacy Policy</a>
              <a href="#about">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
      {/* ==================================================
          WATCH DEMO MODAL
      ================================================== */}
      {showDemo && (
        <div
          className="demo-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowDemo(false);
            }
          }}
        >
          <div className="demo-modal">
            {/* ===============================
                CLOSE BUTTON
            =============================== */}
            <button
              type="button"
              className="demo-close-btn"
              onClick={() => setShowDemo(false)}
              aria-label="Close demo"
            >
              <FaTimes />
            </button>
            {/* ===============================
                MODAL HEADER
            =============================== */}
            <div className="demo-modal-header">
              <span className="section-eyebrow">
                AI MOCK INTERVIEW
              </span>
              <h2>
                See How It
                <span className="gradient-text">
                  {" "}Works
                </span>
              </h2>
              <p>
                Experience how our AI interviewer helps you
                practice and improve your interview performance.
              </p>
            </div>
            {/* ===============================
                DEMO VIDEO
            =============================== */}
            <div className="demo-video-wrapper">
              <video
                className="demo-video"
                controls
                preload="metadata"
                playsInline
              >
                <source
                  src="/demo/ai-interview-demo.mp4"
                  type="video/mp4"
                />
                Your browser does not support video playback.
              </video>
            </div>
            {/* ===============================
                MODAL ACTIONS
            =============================== */}
            <div className="demo-modal-actions">
              <button
                type="button"
                className="demo-login-btn"
                onClick={handleDemoLogin}
              >
                Login
              </button>
              <button
                type="button"
                className="demo-register-btn"
                onClick={handleDemoRegister}
              >
                Register & Start
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Home;