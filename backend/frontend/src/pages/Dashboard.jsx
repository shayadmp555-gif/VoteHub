import { useEffect, useState } from "react";

const API = "https://votehub-8gj9.onrender.com/api";

function Dashboard({ user, logout, goResults }) {
  const [candidates, setCandidates] = useState([]);
  const [electionStatus, setElectionStatus] = useState("running");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [candidateName, setCandidateName] = useState("");
  const [candidateParty, setCandidateParty] = useState("");
  const [candidatePhoto, setCandidatePhoto] = useState("");
  const [candidateLoading, setCandidateLoading] = useState(false);

  const token = localStorage.getItem("token") || "";

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API}/candidates`);
      const data = await response.json();

      console.log("APPROVED CANDIDATES RESPONSE:", data);

      if (!response.ok) {
        setCandidates([]);
        setMessage(data.message || "Candidates load failed.");
        return;
      }

      let candidateList = [];

      if (Array.isArray(data)) {
        candidateList = data;
      } else if (Array.isArray(data.candidates)) {
        candidateList = data.candidates;
      } else if (Array.isArray(data.data)) {
        candidateList = data.data;
      }

      candidateList = candidateList.filter(
        (candidate) => candidate.status === "approved"
      );

      setCandidates(candidateList);
    } catch (error) {
      console.error("Candidates connection error:", error);
      setCandidates([]);
      setMessage("Server se connection nahi ho raha.");
    } finally {
      setLoading(false);
    }
  };

  const fetchElectionStatus = async () => {
    try {
      const response = await fetch(`${API}/election/status`);
      const data = await response.json();

      console.log("Election Status:", data);

      if (response.ok) {
        setElectionStatus(data.status || "running");
      }
    } catch (error) {
      console.log("Election status error:", error);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchElectionStatus();
  }, []);

  const submitCandidate = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    if (!candidateName.trim()) {
      setMessage("Candidate name is required.");
      return;
    }

    if (!candidateParty.trim()) {
      setMessage("Party name is required.");
      return;
    }

    try {
      setCandidateLoading(true);
      setMessage("");

      const response = await fetch(`${API}/candidates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: candidateName.trim(),
          party: candidateParty.trim(),
          photo: candidatePhoto.trim(),
        }),
      });

      const data = await response.json();

      console.log("Candidate registration:", data);

      if (!response.ok) {
        setMessage(
          data.message || "Candidate registration failed."
        );
        return;
      }

      setMessage(
        "✅ Candidate application submitted. Waiting for Admin approval."
      );

      setCandidateName("");
      setCandidateParty("");
      setCandidatePhoto("");
      setShowCandidateForm(false);
    } catch (error) {
      console.error("Candidate registration error:", error);
      setMessage("Server se connection nahi ho raha.");
    } finally {
      setCandidateLoading(false);
    }
  };

  const vote = async (candidateId) => {
    if (!token) {
      setMessage("Please login first.");
      return;
    }

    if (electionStatus === "ended") {
      setMessage("🏁 Election has ended. Voting is closed.");
      return;
    }

    if (user?.hasVoted) {
      setMessage("You have already voted.");
      return;
    }

    const confirmVote = window.confirm(
      "Are you sure you want to vote for this candidate?"
    );

    if (!confirmVote) return;

    try {
      const response = await fetch(`${API}/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          candidateId,
        }),
      });

      const data = await response.json();

      console.log("Vote response:", data);

      if (!response.ok) {
        setMessage(data.message || "Voting failed.");
        return;
      }

      const updatedUser = {
        ...user,
        hasVoted: true,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setMessage(
        "✅ Your vote has been submitted successfully!"
      );

      setCandidates((old) =>
        old.map((candidate) =>
          candidate._id === candidateId
            ? {
                ...candidate,
                votes: Number(candidate.votes || 0) + 1,
              }
            : candidate
        )
      );
    } catch (error) {
      console.error("Voting error:", error);
      setMessage("Voting failed. Please try again.");
    }
  };

  const getInitial = (name) => {
    return name?.charAt(0)?.toUpperCase() || "?";
  };

  const isElectionEnded = electionStatus === "ended";

  return (
    <div className="dashboard">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <div className="nav-brand">
          🗳️ Vote<span>Hub</span>
        </div>

        {/* DESKTOP NAVIGATION */}
        <div className="nav-right">

          <button
            onClick={() => {
              fetchCandidates();
              fetchElectionStatus();
            }}
          >
            🏠 Home
          </button>

          <button
            onClick={() => {
              setShowMobileMenu(false);
              goResults();
            }}
          >
            📊 Results
          </button>

          <button
            onClick={() => {
              setShowCandidateForm(!showCandidateForm);
              setMessage("");
              setShowMobileMenu(false);
            }}
          >
            📝 Candidate
          </button>

          <div className="user-info">
            <div className="avatar">
              {getInitial(user?.name)}
            </div>

            <span>{user?.name}</span>
          </div>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="mobile-menu-btn"
          onClick={() =>
            setShowMobileMenu(!showMobileMenu)
          }
          aria-label="Open menu"
        >
          ☰
        </button>

        {/* MOBILE MENU */}
        {showMobileMenu && (
          <div className="mobile-nav-menu">

            <button
              onClick={() => {
                fetchCandidates();
                fetchElectionStatus();
                setShowMobileMenu(false);
              }}
            >
              🏠 Home
            </button>

            <button
              onClick={() => {
                setShowMobileMenu(false);
                goResults();
              }}
            >
              📊 Results
            </button>

            <button
              onClick={() => {
                setShowCandidateForm(!showCandidateForm);
                setMessage("");
                setShowMobileMenu(false);
              }}
            >
              📝 Candidate
            </button>

            <div className="mobile-user-info">
              <div className="avatar">
                {getInitial(user?.name)}
              </div>

              <span>{user?.name}</span>
            </div>

            <button
              className="mobile-logout-btn"
              onClick={() => {
                setShowMobileMenu(false);
                logout();
              }}
            >
              🚪 Logout
            </button>

          </div>
        )}
      </nav>

      {/* ================= MAIN ================= */}

      <main className="dashboard-content">

        {/* HERO */}

        <section className="constitution-hero">

          <div className="hero-emblem">
            ⚖️
          </div>

          <div className="hero-content">

            <p className="hero-label">
              🇮🇳 DEMOCRATIC INDIA
            </p>

            <h1>
              Your Vote.
              <br />
              Your Voice.
              <br />
              Your Democracy.
            </h1>

            <p>
              Welcome to VoteHub, a digital
              voting platform inspired by the
              democratic values of the
              Constitution of India.
            </p>

          </div>

          <div className="hero-status">

            <div className="status-icon">
              {isElectionEnded ? "🏁" : "🗳️"}
            </div>

            <span>ELECTION</span>

            <strong>
              {isElectionEnded ? "ENDED" : "RUNNING"}
            </strong>

          </div>

        </section>

        {/* MESSAGE */}

        {message && (
          <div className="message">
            <span>{message}</span>

            <button onClick={() => setMessage("")}>
              ×
            </button>
          </div>
        )}

        {/* PREAMBLE */}

        <section className="preamble-card">

          <div className="preamble-icon">
            📜
          </div>

          <div className="preamble-content">

            <p className="section-label">
              THE CONSTITUTION OF INDIA
            </p>

            <h2>
              We, the People of India
            </h2>

            <p className="preamble-text">
              "We, the people of India, having
              solemnly resolved to constitute
              India into a Sovereign Socialist
              Secular Democratic Republic and
              to secure to all its citizens
              Justice, Liberty and Equality..."
            </p>

            <div className="preamble-values">
              <span>⚖️ Justice</span>
              <span>🕊️ Liberty</span>
              <span>🤝 Equality</span>
              <span>🇮🇳 Fraternity</span>
            </div>

          </div>
        </section>

        {/* RIGHTS */}

        <section className="rights-section">

          <div className="rights-heading">

            <div>
              <p className="section-label">
                DEMOCRATIC PARTICIPATION
              </p>

              <h2>
                Your Right to Vote
              </h2>
            </div>

            <span className="constitution-mark">
              🇮🇳
            </span>

          </div>

          <div className="rights-grid">

            <div className="right-card">
              <div className="right-icon">🗳️</div>

              <h3>
                Make Your Voice Heard
              </h3>

              <p>
                Every vote is an important
                part of the democratic process.
              </p>
            </div>

            <div className="right-card">
              <div className="right-icon">⚖️</div>

              <h3>
                One Person, One Vote
              </h3>

              <p>
                Your vote represents your
                choice in the election.
              </p>
            </div>

            <div className="right-card">
              <div className="right-icon">🔐</div>

              <h3>
                Vote Responsibly
              </h3>

              <p>
                Choose your candidate carefully
                and vote responsibly.
              </p>
            </div>

          </div>
        </section>

        {/* CANDIDATE REGISTRATION */}

        {showCandidateForm && (
          <section className="candidate-registration">

            <div className="registration-header">

              <div>
                <p className="section-label">
                  CANDIDATE APPLICATION
                </p>

                <h2>
                  Register as a Candidate
                </h2>

                <p>
                  Submit your election profile
                  for Admin approval.
                </p>
              </div>

              <div className="registration-icon">
                🏛️
              </div>

            </div>

            <form
              className="candidate-form"
              onSubmit={submitCandidate}
            >

              <div className="form-group">
                <label>
                  Candidate Name
                </label>

                <input
                  type="text"
                  placeholder="Enter candidate name"
                  value={candidateName}
                  onChange={(e) =>
                    setCandidateName(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Party Name
                </label>

                <input
                  type="text"
                  placeholder="Enter party name"
                  value={candidateParty}
                  onChange={(e) =>
                    setCandidateParty(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Candidate Photo URL
                </label>

                <input
                  type="text"
                  placeholder="Optional photo URL"
                  value={candidatePhoto}
                  onChange={(e) =>
                    setCandidatePhoto(e.target.value)
                  }
                />
              </div>

              <div className="form-buttons">

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={candidateLoading}
                >
                  {candidateLoading
                    ? "Submitting..."
                    : "Submit Application →"}
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setShowCandidateForm(false);
                    setMessage("");
                  }}
                >
                  Cancel
                </button>

              </div>
            </form>
          </section>
        )}

        {/* VOTING CLOSED */}

        {isElectionEnded && (
          <section className="closed-election">

            <div className="closed-icon">
              🏁
            </div>

            <div>
              <h2>
                Election Has Ended
              </h2>

              <p>
                Voting is now closed. You can
                view the final election results.
              </p>
            </div>

            <button
              onClick={goResults}
              className="primary-btn"
            >
              View Final Results →
            </button>

          </section>
        )}

        {/* CANDIDATES */}

        <section className="candidates-section">

          <div className="section-title">

            <div>
              <p className="section-label">
                ELECTION
              </p>

              <h2>
                Meet the Candidates
              </h2>

              <p>
                {isElectionEnded
                  ? "Voting is closed."
                  : "Review the approved candidates and make your choice."}
              </p>
            </div>

            <span className="candidate-count">
              {candidates.length} Candidates
            </span>

          </div>{/* LOADING */}

          {loading ? (

            <div className="empty">

              <div className="loading-icon">
                🗳️
              </div>

              <h3>
                Loading Candidates...
              </h3>

              <p>
                Please wait.
              </p>

            </div>

          ) : (

            <div className="candidate-grid">

              {candidates.map((candidate, index) => (

                <div
                  className="candidate-card"
                  key={candidate._id || index}
                >

                  <div className="candidate-top">

                    {candidate.photo ? (

                      <img
                        src={candidate.photo}
                        alt={candidate.name}
                        className="candidate-photo"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />

                    ) : (

                      <div className="candidate-avatar">
                        {getInitial(candidate.name)}
                      </div>

                    )}

                    <span className="candidate-number">
                      #{index + 1}
                    </span>

                  </div>

                  <div className="candidate-details">

                    <span className="approved-badge">
                      ✓ APPROVED
                    </span>

                    <h3>
                      {candidate.name || "Candidate"}
                    </h3>

                    <p className="party">
                      🏛️{" "}
                      {candidate.party || "Independent"}
                    </p>

                  </div>

                  <div className="candidate-bottom">

                    <div className="vote-count">

                      <strong>
                        {Number(candidate.votes || 0)}
                      </strong>

                      <span>
                        Votes
                      </span>

                    </div>

                    <button
                      className="vote-btn"
                      disabled={
                        user?.hasVoted ||
                        isElectionEnded
                      }
                      onClick={() =>
                        vote(candidate._id)
                      }
                    >
                      {isElectionEnded
                        ? "Election Ended"
                        : user?.hasVoted
                        ? "Vote Submitted ✓"
                        : "Vote Now →"}
                    </button>

                  </div>

                </div>

              ))}

            </div>
          )}

          {/* NO CANDIDATES */}

          {!loading && candidates.length === 0 && (

            <div className="empty">

              <div className="empty-icon">
                🏛️
              </div>

              <h3>
                No Approved Candidates
              </h3>

              <p>
                Candidates will appear here
                after Admin approval.
              </p>

              <button
                className="primary-btn"
                onClick={fetchCandidates}
              >
                🔄 Refresh Candidates
              </button>

            </div>

          )}

        </section>

        {/* DEMOCRACY MESSAGE */}

        <section className="democracy-banner">

          <div className="democracy-symbol">
            🇮🇳
          </div>

          <div>

            <p className="section-label">
              DEMOCRACY IN ACTION
            </p>

            <h2>
              Every Vote Matters
            </h2>

            <p>
              Participate responsibly and
              make your democratic choice.
            </p>

          </div>

          <div className="democracy-quote">
            "We, the People"
          </div>

        </section>

      </main>

      {/* FOOTER */}

      <footer className="vote-footer">

        <div className="footer-emblem">
          🇮🇳
        </div>

        <strong>
          VoteHub
        </strong>

        <p>
          Secure Digital Voting •
          Inspired by the Democratic
          Values of India
        </p>

        <small>
          © 2026 VoteHub • Democracy • Equality •
          Participation
        </small>

      </footer>

    </div>
  );
}

export default Dashboard;