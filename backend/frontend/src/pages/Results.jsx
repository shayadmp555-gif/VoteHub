import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

function Results({ user, logout, goDashboard }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token") || "";

  const fetchResults = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API}/votes/results`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Results load failed"
        );
        return;
      }

      setResults(data);
    } catch (error) {
      console.log(error);
      setMessage(
        "Server se connection nahi ho raha."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // ================= WINNER =================

  const winner =
    results.length > 0 ? results[0] : null;

  return (
    <div className="dashboard">

      <nav className="navbar">

        <div className="nav-brand">
          🗳️ Vote<span>Hub</span>
        </div>

        <div className="nav-right">

          <button onClick={goDashboard}>
            🏠 Home
          </button>

          <button onClick={fetchResults}>
            📊 Results
          </button>

          <div className="user-info">
            <div className="avatar">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase()}
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
      </nav>

      <main className="dashboard-content">

        <div className="results-header">
          <p className="small-title">
            FINAL RESULTS
          </p>

          <h1>
            Election Results 🏆
          </h1>

          <p>
            Final results of the election.
          </p>
        </div>{message && (
          <div className="message">
            {message}
          </div>
        )}

        {loading ? (
          <div className="empty">
            Loading final results...
          </div>
        ) : (
          <>
            {/* ================= WINNER ================= */}

            {winner && (
              <div className="winner-card">

                <div className="winner-icon">
                  🏆
                </div>

                <p className="small-title">
                  ELECTION WINNER
                </p>

                <h2>
                  {winner.name}
                </h2>

                <p>
                  {winner.party}
                </p>

                <div className="winner-votes">
                  <strong>
                    {winner.votes || 0}
                  </strong>

                  <span>
                    Votes
                  </span>
                </div>

                <div className="winner-badge">
                  🥇 Winner
                </div>

              </div>
            )}

            {/* ================= ALL RESULTS ================= */}

            <section>

              <div className="section-title">
                <div>
                  <h2>
                    Final Vote Count
                  </h2>

                  <p>
                    Candidates ranked by total votes.
                  </p>
                </div>

                <span className="candidate-count">
                  {results.length} Candidates
                </span>
              </div>

              <div className="results-list">

                {results.map(
                  (candidate, index) => (
                    <div
                      className="result-card"
                      key={candidate._id}
                    >

                      <div className="rank">
                        #{index + 1}
                      </div>

                      <div className="result-avatar">
                        {candidate.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      <div className="result-info">

                        <h3>
                          {candidate.name}
                        </h3>

                        <p>
                          {candidate.party}
                        </p>

                      </div>

                      <div className="result-votes">

                        <strong>
                          {candidate.votes || 0}
                        </strong>

                        <span>
                          votes
                        </span>

                      </div>

                    </div>
                  )
                )}

              </div>

            </section>
          </>
        )}

        {!loading &&
          results.length === 0 && (
            <div className="empty">

              <div>📊</div>

              <h3>
                No results available
              </h3>

              <p>
                There are no approved candidates yet.
              </p>

            </div>
          )}</main>

      <footer>
        © 2026 VoteHub • Secure Digital Voting
      </footer>

    </div>
  );
}

export default Results;