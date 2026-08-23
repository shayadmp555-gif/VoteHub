import { useState } from "react";

const API = "http://localhost:5000/api";

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

        // Pending account
        if (data.status === "pending") {
          setMessageType("pending");
        }

        // Rejected account
        else if (data.status === "rejected") {
          setMessageType("rejected");
        }

        // Normal error
        else {
          setMessageType("error");
        }

        return;
      }

      // ================= LOGIN SUCCESS =================

      setMessageType("success");
      setMessage("Login successful! Redirecting...");

      // Only successful login reaches here
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
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          🗳️
        </div>

        <h1>Welcome Back 👋</h1>

        <p className="auth-subtitle">
          Login to your VoteHub account
        </p>

        {message && (
          <div
            className="auth-message"
            style={{
              background:
                messageType === "success"
                  ? "#eaf8ef"
                  : messageType === "pending"
                  ? "#fff8e6"
                  : "#fff0f0",

              color:
                messageType === "success"
                  ? "#21894d"
                  : messageType === "pending"
                  ? "#a66b00"
                  : "#c33d3d",
            }}
          >
            {messageType === "pending" && "⏳ "}
            {messageType === "rejected" && "❌ "}

            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label>Email Address</label>

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

          <label>Password</label>

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
          >
            {loading
              ? "Logging in..."
              : "Login →"}
          </button>

        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <p className="auth-switch">

          Don't have an account?

          <button
            type="button"
            onClick={goRegister}
          >
            Create Account
          </button>

        </p>

      </div>

    </div>
  );
}

export default Login;