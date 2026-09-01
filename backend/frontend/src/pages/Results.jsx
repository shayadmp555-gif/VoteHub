import { useEffect, useState } from "react";
import axios from "axios";
import "./Results.css";

const API =
  import.meta.env.VITE_API_URL ||
  "https://votehub-8gj9.onrender.com/api";

function Results() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [electionStatus, setElectionStatus] = useState("Running");

  // ================= FETCH RESULTS =================

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Results API:", `${API}/candidates`);

      const response = await axios.get(
        `${API}/candidates`,
        {
          timeout: 30000,
        }
      );

      console.log("Results Response:", response.data);

      const data = response.data;

      let candidateList = [];

      if (Array.isArray(data)) {
        candidateList = data;
      } else if (Array.isArray(data.candidates)) {
        candidateList = data.candidates;
      } else if (Array.isArray(data.data)) {
        candidateList = data.data;
      }

      // Only approved candidates
      const approvedCandidates = candidateList.filter(
        (candidate) =>
          candidate.status === "approved"
      );

      // Sort by votes
      approvedCandidates.sort(
        (a, b) =>
          Number(b.votes || 0) -
          Number(a.votes || 0)
      );

      setCandidates(approvedCandidates);

      setElectionStatus("Running");
    } catch (err) {
      console.error(
        "RESULTS API ERROR:",
        err
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Data:",
        err.response?.data
      );

      setCandidates([]);

      if (err.response) {
        setError(
          err.response.data?.message ||
            `Server error: ${err.response.status}`
        );
      } else if (err.request) {
        setError(
          "Server se connection nahi ho raha. Render backend check karo."
        );
      } else {
        setError(
          "Results load nahi ho rahe."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= INITIAL LOAD =================

  useEffect(() => {
    fetchResults();
  }, []);

  // ================= TOTAL VOTES =================

  const totalVotes = candidates.reduce(
    (total, candidate) =>
      total +
      Number(candidate.votes || 0),
    0
  );

  // ================= INITIAL =================

  const getInitial = (name) => {
    if (!name) return "?";

    return name
      .charAt(0)
      .toUpperCase();
  };

  // ================= REFRESH =================

  const handleRefresh = () => {
    fetchResults();
  };

  // ================= PRINT / PDF =================

  const handleDownloadPDF = () => {
    window.print();
  };

  // ================= UI =================

  return (
    <div className="results-page">

      {/* ================= HERO ================= */}

      <section className="results-hero">

        <div className="hero-content">

          <span className="hero-label">
            ELECTION RESULTS
          </span>

          <h1>
            Election Results 🏆
          </h1>

          <p>
            Current election results.
          </p>

        </div>

        <div className="election-status-card">

          <div className="status-icon">
            📊
          </div>

          <div>
            <small>
              Election Status
            </small>

            <strong>
              {electionStatus}
            </strong>
          </div>

        </div>

      </section>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="results-error">

          <span>
            {error}
          </span>

          <button
            onClick={() => setError("")}
          >
            ×
          </button>

        </div>
      )}

      {/* ================= STATS ================= */}

      <section className="results-stats">

        <div className="result-stat-card">

          <div className="result-stat-icon">
            🗳️
          </div>

          <div>
            <span>
              Total Votes
            </span>

            <strong>
              {totalVotes}
            </strong>
          </div>

        </div>

        <div className="result-stat-card candidate-stat">

          <div className="result-stat-icon">
            🏆
          </div>

          <div>
            <span>
              Candidates
            </span>

            <strong>
              {candidates.length}
            </strong>
          </div>

        </div>

      </section>

      {/* ================= TITLE ================= */}

      <section className="candidate-results-section">

        <div className="results-heading">

          <div>
            <h2>
              Candidate Results
            </h2>

            <p>
              Candidates ranked by votes.
            </p>
          </div>

          <div className="results-actions">

            <button
              className="pdf-btn"
              onClick={handleDownloadPDF}
            >
              📄 Download Result PDF
            </button>

            <button
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={loading}
            >
              🔄{" "}
              {loading
                ? "Loading..."
                : "Refresh"}
            </button>

          </div>

        </div>

        {/* ================= RESULTS TABLE ================= */}

        <div className="results-container">

          {loading ? (
            <div className="results-loading">

              <div className="loading-spinner">
                ⏳
              </div>

              <h3>
                Loading Results...
              </h3>

              <p>
                Please wait while we fetch
                the latest election results.
              </p>

            </div>
          ) : candidates.length === 0 ? (
            <div className="no-results">

              <div className="no-results-icon">
                🗳️
              </div>

              <h3>
                No Results Available
              </h3>

              <p>
                Results will appear when
                approved candidates are available.
              </p>

              <button
                className="retry-btn"
                onClick={handleRefresh}
              >
                🔄 Try Again
              </button>

            </div>
          ) : (
            <div className="results-list">

              {candidates.map(
                (candidate, index) => {

                  const votes =
                    Number(
                      candidate.votes || 0
                    );

                  const percentage =
                    totalVotes > 0
                      ? (
                          (votes /
                            totalVotes) *
                          100
                        ).toFixed(1)
                      : "0.0";

                  return (
                    <div
                      className="result-row"
                      key={
                        candidate._id ||
                        index
                      }
                    >

                      {/* RANK */}

                      <div className="candidate-rank">

                        {index === 0
                          ? "🥇"
                          : index === 1
                          ? "🥈"
                          : index === 2
                          ? "🥉"
                          : `#${index + 1}`}

                      </div>

                      {/* CANDIDATE */}

                      <div className="result-candidate">

                        <div className="result-avatar">

                          {candidate.photo ? (
                            <img
                              src={
                                candidate.photo
                              }
                              alt={
                                candidate.name
                              }
                              onError={(
                                e
                              ) => {
                                e.currentTarget.style.display =
                                  "none";

                                e.currentTarget.parentElement.innerHTML =
                                  `<span>${getInitial(
                                    candidate.name
                                  )}</span>`;
                              }}
                            />
                          ) : (
                            <span>
                              {getInitial(
                                candidate.name
                              )}
                            </span>
                          )}

                        </div>

                        <div className="candidate-details">

                          <strong>
                            {candidate.name ||
                              "Unknown Candidate"}
                          </strong>

                          <small>
                            {candidate.party ||
                              "Independent"}
                          </small>

                        </div>

                      </div>

                      {/* VOTES */}

                      <div className="vote-count">

                        <strong>
                          {votes}
                        </strong>

                        <span>
                          votes
                        </span>

                      </div>

                      {/* PERCENTAGE */}

                      <div className="vote-progress">

                        <div className="percentage-text">
                          {percentage}%
                        </div>

                        <div className="progress-bar">

                          <div
                            className="progress-fill"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                      </div>

                      {/* STATUS */}

                      <div className="result-status">
                        ✓ Approved
                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

      </section>

    </div>
  );
}

export default Results;