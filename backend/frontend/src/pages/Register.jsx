import { useState } from "react";

const API = "http://localhost:5000/api";

function Register({ goLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

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
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Registration failed"
        );
        return;
      }

      setSuccess(true);

      setMessage(
        "Account created successfully! ⏳ Your request has been sent to the admin. Please wait for approval before logging in."
      );

      // Clear form
      setName("");
      setEmail("");
      setPassword("");

      // Do not automatically login or redirect
      // User must wait for admin approval

    } catch (error) {
      console.log(error);

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

        <h1>
          Create Account 🚀
        </h1>

        <p className="auth-subtitle">
          Join VoteHub and make your voice count
        </p>

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

        <form onSubmit={handleSubmit}>

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
          />

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
          />

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
          />

          <button
            type="submit"
            disabled={loading || success}
          >
            {loading
              ? "Creating..."
              : success
              ? "Waiting for Admin Approval ⏳"
              : "Create Account →"}
          </button>

        </form>

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