import { useState } from "react";

const API = import.meta.env.VITE_API_URL ||
 "https://votehub-8gj9.onrender.com/api";

function Login({ onLogin, goRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(
        `${API}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      // ================= LOGIN FAILED =================

      if (!response.ok) {
        setMessage(data.message || "Login failed");

        if (data.status === "pending") {
          setMessageType("pending");
        } else if (data.status === "rejected") {
          setMessageType("rejected");
        } else {
          setMessageType("error");
        }

        return;
      }

      // ================= LOGIN SUCCESS =================

      setMessageType("success");
      setMessage("Login successful! Redirecting...");

      onLogin(data.user, data.token);

    } catch (error) {
      console.log(error);

      setMessageType("error");

      setMessage(
        "Server se connection nahi ho raha."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* =================================================
          CONSTITUTION / INDIA SECTION
      ================================================= */}

      <div className="constitution-panel">

        <div className="india-symbol">
          🇮🇳
        </div>

        <p className="constitution-label">
          CONSTITUTION OF INDIA
        </p>

        <h1 className="constitution-title">
          We, the People of India
        </h1>

        <p className="constitution-text">
          Secure your right to participate,
          choose your representative and
          make your voice count.
        </p>

        <div className="constitution-values">

          <div>
            <span>⚖️</span>
            <strong>Justice</strong>
          </div>

          <div>
            <span>🕊️</span>
            <strong>Liberty</strong>
          </div>

          <div>
            <span>🤝</span>
            <strong>Equality</strong>
          </div>

          <div>
            <span>🇮🇳</span>
            <strong>Fraternity</strong>
          </div>

        </div>

        <div className="constitution-quote">

          <span>“</span>

          <p>
            Your Vote is Your Voice
          </p>

          <small>
            Participate. Choose. Make a Difference.
          </small>

        </div>

        <div className="india-line">
          <span></span>
          <b>🟠</b>
          <span></span>
        </div>

        <p className="constitution-footer">
          Digital Democracy • Secure Voting • VoteHub
        </p>

      </div>


      {/* =================================================
          LOGIN SECTION
      ================================================= */}

      <div className="login-section">

        <div className="auth-card">

          <div className="auth-logo">
            🗳️
          </div>

          <p className="login-brand">
            Vote<span>Hub</span>
          </p>

          <h2>
            Welcome Back 👋
          </h2>

          <p className="auth-subtitle">
            Login to your VoteHub account
          </p>


          {/* ================= MESSAGE ================= */}

          {message && (
            <div
              className={`auth-message ${messageType}`}
            >
              {messageType === "pending" && "⏳ "}
              {messageType === "rejected" && "❌ "}
              {messageType === "success" && "✅ "}

              {message}
            </div>
          )}


          {/* ================= LOGIN FORM ================= */}

          <form onSubmit={handleSubmit}>

            <label>
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="username"
              required
            />


            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="current-password"
              required
            />


            <button
              type="submit"
              disabled={loading}
              className="login-submit"
            >
              {loading
                ? "Logging in..."
                : "Login →"}
            </button>

          </form>


          {/* ================= DIVIDER ================= */}

          <div className="auth-divider">
            <span>OR</span>
          </div>


          {/* ================= REGISTER ================= */}

          <p className="auth-switch">

            Don't have an account?

            <button
              type="button"
              onClick={goRegister}
            >
              Create Account
            </button>

          </p>


          {/* ================= SECURITY ================= */}

          <div className="login-security">

            <span>🔐</span>

            <div>
              <strong>
                Secure Digital Voting
              </strong>

              <small>
                Your account and vote are protected
              </small>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;