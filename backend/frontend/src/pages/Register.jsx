import { useState } from "react";

const API = import.meta.env.VITE_API_URL ||
 "http://localhost:5000/api";

function Register({ goLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState("user");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // ================= REGISTER =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch(
        `${API}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role,
          }),
        }
      );

      const data = await response.json();

      // ================= ERROR =================

      if (!response.ok) {
        setMessage(
          data.message ||
            "Registration failed."
        );

        return;
      }

      // ================= SUCCESS =================

      setSuccess(true);

      setMessage(
        role === "candidate"
          ? "🗳️ Candidate registration submitted successfully! Please wait for admin approval."
          : "👤 Voter registration submitted successfully! Please wait for admin approval."
      );

      // Clear form
      setName("");
      setEmail("");
      setPassword("");

    } catch (error) {
      console.log(
        "Registration Error:",
        error
      );

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

        {/* ================= LOGO ================= */}

        <div className="auth-logo">
          🗳️
        </div>

        <h1>
          Create Account 🚀
        </h1>

        <p className="auth-subtitle">
          Join VoteHub and make your voice count
        </p>

        {/* ================= MESSAGE ================= */}

        {message && (
          <div
            className="auth-message"
            style={{
              background: success
                ? "#eaf8ef"
                : "#fff0f0",

              color: success
                ? "#21894d"
                : "#c33d3d",
            }}
          >
            {message}
          </div>
        )}

        {/* ================= FORM ================= */}

        <form onSubmit={handleSubmit}>

          {/* ================= NAME ================= */}

          <label>
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
            disabled={loading || success}
          />

          {/* ================= EMAIL ================= */}

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
            required
            disabled={loading || success}
          />

          {/* ================= PASSWORD ================= */}

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Create password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            minLength={6}
            required
            disabled={loading || success}
          />

          {/* ================= ROLE ================= */}

          <label>
            Register As
          </label>

          <div className="role-options">

            {/* ================= VOTER ================= */}

            <button
              type="button"
              className={
                role === "user"
                  ? "role-option selected"
                  : "role-option"
              }
              onClick={() =>
                setRole("user")
              }
              disabled={loading || success}
            >

              <span className="role-icon">
                👤
              </span>

              <span className="role-content">

                <strong>
                  Voter
                </strong>

                <small>
                  Vote in the election
                </small>

              </span>

            </button>

            {/* ================= CANDIDATE ================= */}

            <button
              type="button"
              className={
                role === "candidate"
                  ? "role-option selected"
                  : "role-option"
              }
              onClick={() =>
                setRole("candidate")
              }
              disabled={loading || success}
            >

              <span className="role-icon">
                🗳️
              </span>

              <span className="role-content">

                <strong>
                  Candidate
                </strong>

                <small>
                  Stand in the election
                </small>

              </span>

            </button>

          </div>

          {/* ================= SUBMIT ================= */}

          <button
            type="submit"
            disabled={
              loading || success
            }
          >

            {loading
              ? "Creating..."
              : success
              ? "Waiting for Admin Approval ⏳"
              : "Create Account →"}

          </button>

        </form>

        {/* ================= LOGIN ================= */}

        <p className="auth-switch">

          Already have an account?

          <button
            type="button"
            onClick={goLogin}
          >
            Login
          </button>

        </p>

      </div>

    </div>
  );
}

export default Register;