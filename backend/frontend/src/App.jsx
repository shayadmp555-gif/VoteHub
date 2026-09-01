import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Results from "./pages/Results";
import Admin from "./pages/Admin";

import "./App.css";

// ================= API =================
// Local testing ke liye
const API = "https://votehub-8gj9.onrender.com";

function App() {
  const [page, setPage] = useState("login");

  // ================= USER =================

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      return null;
    }
  });

  // ================= PAGE CONTROL =================

  useEffect(() => {
    if (!user) {
      setPage("login");
      return;
    }

    // ================= ADMIN =================

    if (user.role === "admin") {
      setPage("admin");
      return;
    }

    // ================= PENDING / REJECTED =================

    if (
      user.isApproved !== true ||
      user.rejected === true
    ) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      setUser(null);
      setPage("login");
      return;
    }

    // ================= CANDIDATE =================

    if (user.role === "candidate") {
      setPage("candidate");
      return;
    }

    // ================= VOTER =================

    if (user.role === "user") {
      setPage("dashboard");
      return;
    }

    // ================= INVALID ROLE =================

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setPage("login");
  }, [user]);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = (loggedInUser, token) => {
    // Admin ko approval ki zarurat nahi
    if (
      loggedInUser.role !== "admin" &&
      (
        loggedInUser.isApproved !== true ||
        loggedInUser.rejected === true
      )
    ) {
      return;
    }

    // Save user
    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    );

    // Save token
    localStorage.setItem(
      "token",
      token
    );

    setUser(loggedInUser);

    // Redirect according to role
    if (loggedInUser.role === "admin") {
      setPage("admin");
    } else if (
      loggedInUser.role === "candidate"
    ) {
      setPage("candidate");
    } else {
      setPage("dashboard");
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setPage("login");
  };

  // =====================================================
  // LOGIN PAGE
  // =====================================================

  if (!user && page === "login") {
    return (
      <Login
        onLogin={handleLogin}
        goRegister={() =>
          setPage("register")
        }
      />
    );
  }

  // =====================================================
  // REGISTER PAGE
  // =====================================================

  if (!user && page === "register") {
    return (
      <Register
        goLogin={() =>
          setPage("login")
        }
      />
    );
  }

  // =====================================================
  // ADMIN
  // =====================================================

  if (
    user?.role === "admin" &&
    page === "admin"
  ) {
    return (
      <Admin
        user={user}
        logout={handleLogout}
      />
    );
  }

  // =====================================================
  // CANDIDATE
  // =====================================================

  if (
    user?.role === "candidate" &&
    page === "candidate"
  ) {
    return (
      <CandidatePortal
        user={user}
        logout={handleLogout}
      />
    );
  }

  // =====================================================
  // RESULTS
  // =====================================================

  if (
    user?.role === "user" &&
    user?.isApproved === true &&
    user?.rejected !== true &&
    page === "results"
  ) {
    return (
      <Results
        user={user}
        logout={handleLogout}
        goDashboard={() =>
          setPage("dashboard")
        }
      />
    );
  }

  // =====================================================
  // VOTER DASHBOARD
  // =====================================================

  if (
    user?.role === "user" &&
    user?.isApproved === true &&
    user?.rejected !== true &&
    page === "dashboard"
  ) {
    return (
      <Dashboard
        user={user}
        logout={handleLogout}
        goResults={() =>
          setPage("results")
        }
      />
    );
  }

  // =====================================================
  // FALLBACK
  // =====================================================

  return (
    <Login
      onLogin={handleLogin}
      goRegister={() =>
        setPage("register")
      }
    />
  );
}


// =====================================================
// CANDIDATE PORTAL
// =====================================================

function CandidatePortal({ user, logout }) {

  const [name, setName] = useState(
    user?.name || ""
  );

  const [party, setParty] = useState("");

  const [photo, setPhoto] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const token =
    localStorage.getItem("token") || "";


  // ===================================================
  // SUBMIT ELECTION PROFILE
  // ===================================================

  const submitElectionProfile =
    async (e) => {

      e.preventDefault();

      // Candidate name validation
      if (!name.trim()) {
        setMessage(
          "Candidate name is required."
        );
        return;
      }

      // Party validation
      if (!party.trim()) {
        setMessage(
          "Party name is required."
        );
        return;
      }

      // Token validation
      if (!token) {
        setMessage(
          "Please login again."
        );
        return;
      }

      try {

        setLoading(true);
        setMessage("");
        setSubmitted(false);

        const response =
          await fetch(
            `${API}/candidates`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                name: name.trim(),
                party: party.trim(),
                photo: photo.trim(),
              }),
            }
          );

        const data =
          await response.json();

        // API error
        if (!response.ok) {

          setMessage(
            data.message ||
            "Election profile submission failed."
          );

          return;
        }

        // Success
        setSubmitted(true);

        setMessage(
          "✅ Election profile submitted successfully. Waiting for admin approval."
        );

        // Clear fields
        setParty("");
        setPhoto("");

      } catch (error) {

        console.log(
          "Candidate profile error:",
          error
        );

        setMessage(
          "Server se connection nahi ho raha."
        );

      } finally {

        setLoading(false);

      }
    };


  // ===================================================
  // CANDIDATE UI
  // ===================================================

  return (
    <div className="auth-page">

      <div
        className="auth-card"
        style={{
          maxWidth: "550px",
        }}
      >

        {/* LOGO */}

        <div className="auth-logo">
          🗳️
        </div>


        {/* TITLE */}

        <h1>
          Candidate Portal
        </h1>

        <p className="auth-subtitle">
          Welcome, {user?.name}
        </p>


        {/* APPROVED ACCOUNT MESSAGE */}

        <div
          className="auth-message"
          style={{
            background: "#eaf8ef",
            color: "#21894d",
            marginTop: "20px",
          }}
        >
          ✅ Your candidate account has
          been approved by Admin.
        </div>


        {/* SUBMISSION MESSAGE */}

        {message && (
          <div
            className="auth-message"
            style={{
              marginTop: "15px",

              background: submitted
                ? "#eaf8ef"
                : "#fff8e6",

              color: submitted
                ? "#21894d"
                : "#a66b00",
            }}
          >
            {message}
          </div>
        )}


        {/* ELECTION PROFILE */}

        <div className="candidate-registration">

          <h2>
            Submit Election Profile
          </h2>

          <p>
            Enter your election details.
            Admin approval is required
            before you appear on the voter
            dashboard.
          </p>


          {/* FORM */}

          <form
            className="candidate-form"
            onSubmit={
              submitElectionProfile
            }
          >

            {/* NAME */}

            <label>
              Candidate Name
            </label>

            <input
              className="candidate-input"
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter candidate name"
              required
            />


            {/* PARTY */}

            <label>
              Party Name
            </label>

            <input
              className="candidate-input"
              type="text"
              value={party}
              onChange={(e) =>
                setParty(e.target.value)
              }
              placeholder="Enter party name"
              required
            />


            {/* PHOTO */}

            <label>
              Photo URL
            </label>

            <input
              className="candidate-input"
              type="text"
              value={photo}
              onChange={(e) =>
                setPhoto(e.target.value)
              }
              placeholder="Photo URL (optional)"
            />


            {/* SUBMIT */}

            <button
              className="candidate-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Submitting..."
                : "Submit Election Profile →"}
            </button>

          </form>

        </div>


        {/* LOGOUT */}

        <button
          onClick={logout}
          style={{
            marginTop: "20px",
          }}
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default App;