import { useState } from "react";
import "./App.css";

import ApplicantDashboard from "./components/ApplicantDashboard";
import AuthorityDashboard from "./components/AuthorityDashboard";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("applicant");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Check if user is already logged in
  const savedUser = localStorage.getItem("user");

  if (savedUser) {
    const user = JSON.parse(savedUser);

    if (user.role === "authority") {
      return <AuthorityDashboard />;
    }

    return <ApplicantDashboard />;
  }

  // =========================================================
  // LOGIN / REGISTER
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin
        ? `${API_URL}/api/login`
        : `${API_URL}/api/register`;

      const payload = isLogin
        ? {
            email,
            password,
          }
        : {
            name,
            email,
            password,
            role,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Something went wrong.");
        return;
      }

      // =====================================================
      // LOGIN SUCCESS
      // =====================================================

      if (isLogin) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        setMessage(`Welcome ${data.user.name}!`);

        // Reload App so dashboard opens
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }

      // =====================================================
      // REGISTER SUCCESS
      // =====================================================

      else {
        setMessage(
          "Account created successfully! You can now sign in."
        );

        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        setTimeout(() => {
          setIsLogin(true);
          setMessage("");
        }, 1000);
      }
    } catch (err) {
      console.error("Backend Error:", err);

      setError(
        "Unable to connect to backend. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SWITCH LOGIN / REGISTER
  // =========================================================

  const switchMode = () => {
    setIsLogin(!isLogin);

    setMessage("");
    setError("");

    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  // =========================================================
  // LOGIN / REGISTER UI
  // =========================================================

  return (
    <div className="auth-page">

      {/* LEFT SECTION */}

      <div className="auth-brand">

        <div className="brand-content">

          <div className="brand-logo">
            G
          </div>

          <p className="brand-eyebrow">
            INDUSTRIAL APPROVAL SYSTEM
          </p>

          <h1>
            Intelligent
            <br />
            Government
            <br />
            Services.
          </h1>

          <p className="brand-description">
            A unified digital platform for managing industrial
            applications, approvals and compliance requirements.
          </p>

          <div className="brand-features">

            <div>
              <span>✓</span>
              Smart approval identification
            </div>

            <div>
              <span>✓</span>
              Transparent application tracking
            </div>

            <div>
              <span>✓</span>
              Secure government workflow
            </div>

          </div>

        </div>

        <div className="brand-footer">
          SIH 26130 • Intelligent Approval System
        </div>

      </div>


      {/* RIGHT SECTION */}

      <div className="auth-section">

        <div className="auth-card">

          {/* HEADER */}

          <div className="auth-header">

            <p className="eyebrow">
              {isLogin
                ? "WELCOME BACK"
                : "GET STARTED"}
            </p>

            <h2>
              {isLogin
                ? "Sign in to your account"
                : "Create your account"}
            </h2>

            <p>
              {isLogin
                ? "Access your industrial approval portal."
                : "Register to access the industrial approval portal."}
            </p>

          </div>


          {/* ROLE SELECTOR */}

          <div className="role-selector">

            <button
              type="button"
              className={
                role === "applicant"
                  ? "role-active"
                  : ""
              }
              onClick={() => setRole("applicant")}
            >
              <span className="role-icon">
                👤
              </span>

              <div>
                <strong>
                  Applicant
                </strong>

                <small>
                  Submit & track applications
                </small>
              </div>

            </button>


            <button
              type="button"
              className={
                role === "authority"
                  ? "role-active"
                  : ""
              }
              onClick={() => setRole("authority")}
            >
              <span className="role-icon">
                🏛
              </span>

              <div>
                <strong>
                  Authority
                </strong>

                <small>
                  Review & manage approvals
                </small>
              </div>

            </button>

          </div>


          {/* SUCCESS */}

          {message && (
            <div className="success-message">
              ✓ {message}
            </div>
          )}


          {/* ERROR */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}


          {/* FORM */}

          <form onSubmit={handleSubmit}>

            {!isLogin && (
              <div className="form-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />

              </div>
            )}


            <div className="form-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>


            {!isLogin && (
              <div className="form-group">

                <label>
                  Organization / Department
                </label>

                <input
                  type="text"
                  placeholder={
                    role === "authority"
                      ? "Enter department name"
                      : "Enter organization name"
                  }
                  required
                />

              </div>
            )}


            <div className="form-group">

              <div className="label-row">

                <label>
                  Password
                </label>

                {isLogin && (
                  <button
                    type="button"
                    className="forgot-btn"
                  >
                    Forgot password?
                  </button>
                )}

              </div>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>


            {!isLogin && (
              <div className="form-group">

                <label>
                  Confirm Password
                </label>

                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                />

              </div>
            )}


            {isLogin && (
              <label className="remember">

                <input type="checkbox" />

                <span>
                  Remember me
                </span>

              </label>
            )}


            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >

              {loading
                ? "Please wait..."
                : isLogin
                ? "Sign In"
                : "Create Account"}

              {!loading && (
                <span>
                  →
                </span>
              )}

            </button>

          </form>


          {/* SWITCH */}

          <div className="auth-switch">

            <span>
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}
            </span>

            <button
              type="button"
              onClick={switchMode}
            >
              {isLogin
                ? "Create account"
                : "Sign in"}
            </button>

          </div>


          {/* SECURITY */}

          <div className="security-note">

            <span>
              🔒
            </span>

            <p>
              Your information is protected with
              secure government-grade authentication.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;