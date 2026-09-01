import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// =====================================================
// API CONFIG
// =====================================================

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  // If VITE_API_URL exists
  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/+$/, "");

    if (cleanUrl.endsWith("/api")) {
      return cleanUrl;
    }

    return `${cleanUrl}/api`;
  }

  // Local development
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:5000/api";
  }

  // Production - same Render server
  return `${window.location.origin}/api`;
};

const API = getApiUrl();

console.log("RESULTS API:", API);

// =====================================================
// COMPONENT
// =====================================================

function Results({ user, logout, goDashboard }) {
  const [candidates, setCandidates] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [electionStatus, setElectionStatus] =
    useState("running");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ===================================================
  // TOKEN
  // ===================================================

  const getToken = () => {
    return localStorage.getItem("token") || "";
  };

  // ===================================================
  // COMMON HEADERS
  // ===================================================

  const getHeaders = () => {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  // ===================================================
  // SAFE JSON RESPONSE
  // ===================================================

  const getResponseData = async (response) => {
    const contentType =
      response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await response.text();

      console.error(
        "Server returned non-JSON response:",
        text.substring(0, 500)
      );

      throw new Error(
        `Server returned ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  };

  // ===================================================
  // FETCH RESULTS
  // ===================================================

  const fetchResults = async () => {
    try {
      setLoading(true);
      setMessage("");

      const url = `${API}/votes/results`;

      console.log("Fetching results from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      });

      const data =
        await getResponseData(response);

      console.log("Results API response:", data);

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Results API failed: ${response.status}`
        );
      }

      // -----------------------------------------------
      // Find candidates safely
      // -----------------------------------------------

      let resultCandidates = [];

      if (Array.isArray(data)) {
        resultCandidates = data;
      } else if (
        Array.isArray(data.candidates)
      ) {
        resultCandidates = data.candidates;
      } else if (
        Array.isArray(data.results)
      ) {
        resultCandidates = data.results;
      } else if (
        Array.isArray(data.data)
      ) {
        resultCandidates = data.data;
      }

      // -----------------------------------------------
      // Sort candidates by votes
      // -----------------------------------------------

      resultCandidates.sort(
        (a, b) =>
          Number(b.votes || 0) -
          Number(a.votes || 0)
      );

      setCandidates(resultCandidates);

      // -----------------------------------------------
      // Total votes
      // -----------------------------------------------

      const calculatedVotes =
        resultCandidates.reduce(
          (total, candidate) =>
            total +
            Number(candidate.votes || 0),
          0
        );

      setTotalVotes(
        Number(data.totalVotes) ||
          calculatedVotes
      );
    } catch (error) {
      console.error(
        "Results Error:",
        error
      );

      setCandidates([]);
      setTotalVotes(0);

      setMessage(
        error.message ||
          "Server se connection nahi ho raha."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // FETCH ELECTION STATUS
  // ===================================================

  const fetchElectionStatus = async () => {
    try {
      const url = `${API}/election/status`;

      console.log(
        "Fetching election status from:",
        url
      );

      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      });

      const data =
        await getResponseData(response);

      console.log(
        "Election status response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Election status load failed."
        );
      }

      // -----------------------------------------------
      // Support different backend response formats
      // -----------------------------------------------

      const status =
        data.status ||
        data.electionStatus ||
        data.election?.status ||
        "running";

      setElectionStatus(
        String(status).toLowerCase()
      );
    } catch (error) {
      console.error(
        "Election status error:",
        error
      );

      // Don't show another error if results already
      // produced an error.
      setElectionStatus("running");
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    fetchResults();
    fetchElectionStatus();
  }, []);

  // ===================================================
  // WINNER
  // ===================================================

  const winner =
    candidates.length > 0
      ? candidates[0]
      : null;

  // ===================================================
  // PERCENTAGE
  // ===================================================

  const getPercentage = (votes) => {
    if (!totalVotes) {
      return "0.0";
    }

    return (
      (Number(votes || 0) /
        Number(totalVotes)) *
      100
    ).toFixed(1);
  };

  // ===================================================
  // REFRESH
  // ===================================================

  const handleRefresh = async () => {
    setMessage("");

    await Promise.all([
      fetchResults(),
      fetchElectionStatus(),
    ]);
  };

  // ===================================================
  // DOWNLOAD RESULT PDF
  // ===================================================

  const downloadResultPDF = () => {
    if (
      !Array.isArray(candidates) ||
      candidates.length === 0
    ) {
      setMessage(
        "No election results available for PDF."
      );
      return;
    }

    try {
      const doc = new jsPDF();

      // -----------------------------------------------
      // HEADER
      // -----------------------------------------------

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(22);

      doc.text(
        "VoteHub",
        105,
        20,
        {
          align: "center",
        }
      );

      doc.setFontSize(15);

      doc.text(
        "FINAL ELECTION RESULTS",
        105,
        30,
        {
          align: "center",
        }
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(10);

      doc.text(
        "Secure Digital Voting System",
        105,
        37,
        {
          align: "center",
        }
      );

      // -----------------------------------------------
      // ELECTION INFORMATION
      // -----------------------------------------------

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(11);

      doc.text(
        "Election Status:",
        15,
        52
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        electionStatus === "ended"
          ? "ENDED"
          : "RUNNING",
        52,
        52
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "Generated On:",
        15,
        60
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        new Date().toLocaleDateString(
          "en-IN"
        ),
        52,
        60
      );

      // -----------------------------------------------
      // WINNER BOX
      // -----------------------------------------------

      if (winner) {
        doc.setFillColor(
          240,
          245,
          255
        );

        doc.roundedRect(
          15,
          70,
          180,
          35,
          5,
          5,
          "F"
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(11);

        doc.text(
          "LEADING CANDIDATE",
          22,
          80
        );

        doc.setFontSize(16);

        doc.text(
          winner.name || "N/A",
          22,
          90
        );

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(10);

        doc.text(
          `Party: ${
            winner.party ||
            "Independent"
          }`,
          22,
          99
        );

        doc.text(
          `Votes: ${
            Number(
              winner.votes || 0
            )
          }`,
          130,
          99
        );
      }

      // -----------------------------------------------
      // TABLE DATA
      // -----------------------------------------------

      const tableData =
        candidates.map(
          (candidate, index) => [
            index + 1,

            candidate.name ||
              "N/A",

            candidate.party ||
              "Independent",

            Number(
              candidate.votes || 0
            ),

            `${getPercentage(
              candidate.votes
            )}%`,
          ]
        );

      // -----------------------------------------------
      // TABLE
      // -----------------------------------------------

      autoTable(doc, {
        startY: 115,

        head: [
          [
            "Rank",
            "Candidate",
            "Party",
            "Votes",
            "Percentage",
          ],
        ],

        body: tableData,

        theme: "grid",

        headStyles: {
          fillColor: [
            36,
            59,
            100,
          ],

          textColor: 255,

          fontStyle:
            "bold",

          halign:
            "center",
        },

        bodyStyles: {
          fontSize: 10,
        },

        styles: {
          font:
            "helvetica",

          cellPadding: 6,

          valign:
            "middle",
        },

        columnStyles: {
          0: {
            halign:
              "center",

            cellWidth: 20,
          },

          3: {
            halign:
              "center",

            cellWidth: 25,
          },

          4: {
            halign:
              "center",

            cellWidth: 30,
          },
        },

        didParseCell: (data) => {
          if (
            data.section ===
              "body" &&
            data.row.index === 0
          ) {
            data.cell.styles.fontStyle =
              "bold";
          }
        },
      });

      // -----------------------------------------------
      // SUMMARY
      // -----------------------------------------------

      const finalY =
        doc.lastAutoTable?.finalY ||
        120;

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(11);

      doc.text(
        `Total Votes Cast: ${totalVotes}`,
        15,
        finalY + 15
      );

      doc.text(
        `Total Candidates: ${candidates.length}`,
        15,
        finalY + 23
      );

      // -----------------------------------------------
      // FOOTER
      // -----------------------------------------------

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(9);

      doc.text(
        "VoteHub • Secure Digital Voting",
        105,
        282,
        {
          align: "center",
        }
      );

      doc.text(
        "Democracy • Equality • Participation",
        105,
        289,
        {
          align: "center",
        }
      );

      // -----------------------------------------------
      // DOWNLOAD
      // -----------------------------------------------

      doc.save(
        "VoteHub-Final-Election-Results.pdf"
      );

      setMessage(
        "Result PDF generated successfully! ✅"
      );
    } catch (error) {
      console.error(
        "PDF generation error:",
        error
      );

      setMessage(
        "PDF generate nahi ho paayi."
      );
    }
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {
    if (logout) {
      logout();
      return;
    }

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    window.location.href = "/";
  };

  // ===================================================
  // INITIAL
  // ===================================================

  const getInitial = (name) => {
    return (
      name
        ?.charAt(0)
        ?.toUpperCase() || "?"
    );
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="dashboard">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="navbar">

        <div className="nav-brand">
          🗳️ Vote<span>Hub</span>
        </div>

        <div className="nav-right">

          <button
            onClick={goDashboard}
          >
            🏠 Home
          </button>

          <button
            onClick={handleRefresh}
          >
            📊 Results
          </button>

          <div className="user-info">

            <div className="avatar">
              {getInitial(
                user?.name
              )}
            </div>

            <span>
              {user?.name ||
                "User"}
            </span>

          </div>

          <button
            className="logout-btn"
            onClick={
              handleLogout
            }
          >
            Logout
          </button>

        </div>

      </nav>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="dashboard-content">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="welcome">

          <div>

            <p className="small-title">
              ELECTION RESULTS
            </p>

            <h1>
              Election Results 🏆
            </h1>

            <p>
              {electionStatus ===
              "ended"
                ? "Final results of the election."
                : "Current election results."}
            </p>

          </div>

          <div className="vote-status">

            <span>
              {electionStatus ===
              "ended"
                ? "🏁"
                : "📊"}
            </span>

            <div>

              <small>
                Election Status
              </small>

              <strong>
                {electionStatus ===
                "ended"
                  ? "Election Ended"
                  : "Election Running"}
              </strong>

            </div>

          </div>

        </div>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (

          <div className="message">

            <span>
              {message}
            </span>

            <button
              onClick={() =>
                setMessage("")
              }
            >
              ×
            </button>

          </div>

        )}

        {/* =================================================
            WINNER / LEADER
        ================================================= */}

        {!loading &&
          winner && (

            <section
              className="candidate-registration"
              style={{
                marginBottom:
                  "30px",

                padding:
                  "25px",

                borderRadius:
                  "15px",

                background:
                  "#ffffff",

                boxShadow:
                  "0 5px 20px rgba(0,0,0,0.08)",
              }}
            >

              <p className="small-title">
                🏆 LEADING CANDIDATE
              </p>

              <h2>
                {winner.name}
              </h2>

              <p className="party">
                {winner.party ||
                  "Independent"}
              </p>

              <strong>
                {Number(
                  winner.votes ||
                    0
                )}{" "}
                Votes
              </strong>

              <span
                style={{
                  marginLeft:
                    "15px",
                }}
              >
                {getPercentage(
                  winner.votes
                )}
                %
              </span>

            </section>

          )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="stats-grid">

          <div className="stat-card blue">

            <div className="stat-icon">
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

          <div className="stat-card green">

            <div className="stat-icon">
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

        </div>

        {/* =================================================
            RESULTS
        ================================================= */}

        <section>

          <div className="section-title">

            <div>

              <h2>
                Candidate Results
              </h2>

              <p>
                Candidates ranked
                by votes.
              </p>

            </div>

            <div
              style={{
                display:
                  "flex",

                gap: "10px",

                flexWrap:
                  "wrap",
              }}
            >

              {/* PDF */}

              <button
                className="download-result-btn"
                onClick={
                  downloadResultPDF
                }
                disabled={
                  loading ||
                  candidates.length ===
                    0
                }
              >
                📄 Download Result PDF
              </button>

              {/* REFRESH */}

              <button
                className="refresh-btn"
                onClick={
                  handleRefresh
                }
                disabled={
                  loading
                }
              >
                🔄{" "}
                {loading
                  ? "Loading..."
                  : "Refresh"}
              </button>

            </div>

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (

            <div className="empty">

              <div>
                ⏳
              </div>

              <h3>
                Loading Results...
              </h3>

              <p>
                Please wait while
                we fetch election
                results.
              </p>

            </div>

          ) : candidates.length ===
            0 ? (

            /* =================================================
               NO RESULTS
            ================================================= */

            <div className="empty">

              <div>
                🗳️
              </div>

              <h3>
                No Results Available
              </h3>

              <p>
                No approved candidates
                are currently available.
              </p>

              <button
                className="refresh-btn"
                onClick={
                  handleRefresh
                }
                style={{
                  marginTop:
                    "15px",
                }}
              >
                🔄 Refresh Results
              </button>

            </div>

          ) : (

            /* =================================================
               CANDIDATE CARDS
            ================================================= */

            <div className="candidate-grid">

              {candidates.map(
                (
                  candidate,
                  index
                ) => (

                  <div
                    className="candidate-card"
                    key={
                      candidate._id ||
                      `${candidate.name}-${index}`
                    }
                  >

                    <div className="candidate-top">

                      <div className="candidate-avatar">

                        {getInitial(
                          candidate.name
                        )}

                      </div>

                      <div className="candidate-number">
                        #{index + 1}
                      </div>

                    </div>

                    <h3>
                      {candidate.name ||
                        "Unknown Candidate"}
                    </h3>

                    <p className="party">
                      {candidate.party ||
                        "Independent"}
                    </p>

                    <div className="card-bottom">

                      <div className="vote-count">

                        <strong>
                          {Number(
                            candidate.votes ||
                              0
                          )}
                        </strong>

                        <span>
                          Votes
                        </span>

                      </div>

                      <strong>
                        {getPercentage(
                          candidate.votes
                        )}
                        %
                      </strong>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>
        © 2026 VoteHub • Secure Digital Voting
      </footer>

    </div>
  );
}

export default Results;