import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API = import.meta.env.VITE_API_URL ||
 "https://votehub-8gj9.onrender.com/api";

function Results({ user, logout, goDashboard }) {
  const [candidates, setCandidates] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);

  const [electionStatus, setElectionStatus] =
    useState("running");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token =
    localStorage.getItem("token") || "";

  // ================= FETCH RESULTS =================

  const fetchResults = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API}/votes/results`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Results load nahi ho rahe."
        );
        return;
      }

      setCandidates(
        data.candidates || []
      );

      setTotalVotes(
        Number(data.totalVotes || 0)
      );
    } catch (error) {
      console.log(
        "Results Error:",
        error
      );

      setMessage(
        "Server se connection nahi ho raha."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH ELECTION STATUS =================

  const fetchElectionStatus = async () => {
    try {
      const response = await fetch(
        `${API}/election/status`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (response.ok) {
        setElectionStatus(
          data.status || "running"
        );
      }
    } catch (error) {
      console.log(
        "Election status error:",
        error
      );
    }
  };

  // ================= INITIAL LOAD =================

  useEffect(() => {
    fetchResults();
    fetchElectionStatus();
  }, []);

  // ================= WINNER =================

  const winner =
    candidates.length > 0
      ? candidates[0]
      : null;

  // ================= PERCENTAGE =================

  const getPercentage = (votes) => {
    if (!totalVotes) return 0;

    return (
      (Number(votes || 0) /
        totalVotes) *
      100
    ).toFixed(1);
  };

  // =====================================================
  // DOWNLOAD RESULT PDF
  // =====================================================

  const downloadResultPDF = () => {
    if (!candidates || candidates.length === 0) {
      setMessage(
        "No election results available for PDF."
      );
      return;
    }

    try {
      const doc = new jsPDF();

      // =========================
      // HEADER
      // =========================

      doc.setFont("helvetica", "bold");

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

      doc.setFont("helvetica", "normal");

      doc.setFontSize(10);

      doc.text(
        "Secure Digital Voting System",
        105,
        37,
        {
          align: "center",
        }
      );

      // =========================
      // ELECTION INFORMATION
      // =========================

      doc.setFont("helvetica", "bold");

      doc.setFontSize(11);

      doc.text(
        "Election Status:",
        15,
        52
      );

      doc.setFont("helvetica", "normal");

      doc.text(
        electionStatus === "ended"
          ? "ENDED"
          : "RUNNING",
        52,
        52
      );

      doc.setFont("helvetica", "bold");

      doc.text(
        "Generated On:",
        15,
        60
      );

      doc.setFont("helvetica", "normal");

      doc.text(
        new Date().toLocaleDateString(
          "en-IN"
        ),
        52,
        60
      );

      // =========================
      // WINNER BOX
      // =========================

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
          "WINNER",
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

      // =========================
      // RESULT TABLE
      // =========================

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

        didParseCell:
          (data) => {
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

      // =========================
      // SUMMARY
      // =========================

      const finalY =
        doc.lastAutoTable
          .finalY + 15;

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(11);

      doc.text(
        `Total Votes Cast: ${totalVotes}`,
        15,
        finalY
      );

      doc.text(
        `Total Candidates: ${candidates.length}`,
        15,
        finalY + 8
      );

      // =========================
      // FOOTER
      // =========================

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

      // =========================
      // DOWNLOAD
      // =========================

      doc.save(
        "VoteHub-Final-Election-Results.pdf"
      );

      setMessage(
        "✅ Result PDF generated successfully!"
      );
    } catch (error) {
      console.log(
        "PDF generation error:",
        error
      );

      setMessage(
        "PDF generate nahi ho paayi."
      );
    }
  };

  return (
    <div className="dashboard">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <div className="nav-brand">
          🗳️ Vote<span>Hub</span>
        </div>

        <div className="nav-right">

          <button onClick={goDashboard}>
            🏠 Home
          </button>

          <button
            onClick={() => {
              fetchResults();
              fetchElectionStatus();
            }}
          >
            📊 Results
          </button>

          <div className="user-info">

            <div className="avatar">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <span>
              {user?.name}
            </span>

          </div>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </nav>

      {/* ================= MAIN ================= */}

      <main className="dashboard-content">

        <div className="welcome">

          <div>

            <p className="small-title">
              ELECTION RESULTS
            </p>

            <h1>
              Election Results 🏆
            </h1>

            <p>
              {electionStatus === "ended"
                ? "Final results of the election."
                : "Current election results."}
            </p>

          </div>

          <div className="vote-status">

            <span>
              {electionStatus === "ended"
                ? "🏁"
                : "📊"}
            </span>

            <div>

              <small>
                Election Status
              </small>

              <strong>
                {electionStatus === "ended"
                  ? "Election Ended"
                  : "Election Running"}
              </strong>

            </div>

          </div>

        </div>

        {/* ================= MESSAGE ================= */}

        {message && (

          <div className="message">

            {message}

            <button
              onClick={() =>
                setMessage("")
              }
            >
              ×
            </button>

          </div>

        )}

        {/* ================= WINNER ================= */}

        {!loading && winner && (

          <section
            className="candidate-registration"
            style={{
              marginBottom: "30px",
              padding: "25px",
              borderRadius: "15px",
              background: "#ffffff",
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
              {winner.party}
            </p>

            <strong>
              {winner.votes || 0} Votes
            </strong>

            <span
              style={{
                marginLeft: "15px",
              }}
            >
              {getPercentage(
                winner.votes
              )}%
            </span>

          </section>

        )}

        {/* ================= SUMMARY ================= */}

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

        {/* ================= RESULTS ================= */}

        <section>

          <div className="section-title">

            <div>

              <h2>
                Candidate Results
              </h2>

              <p>
                Candidates ranked by votes.
              </p>

            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >

              {/* PDF BUTTON */}

              <button
                className="download-result-btn"
                onClick={
                  downloadResultPDF
                }
                disabled={
                  loading ||
                  candidates.length === 0
                }
              >
                📄 Download Result PDF
              </button>

              {/* REFRESH BUTTON */}

              <button
                className="refresh-btn"
                onClick={() => {
                  fetchResults();
                  fetchElectionStatus();
                }}
              >
                🔄 Refresh
              </button>

            </div>

          </div>

          {loading ? (

            <div className="empty">
              Loading results...
            </div>

          ) : candidates.length === 0 ? (

            <div className="empty">

              <div>
                🗳️
              </div>

              <h3>
                No Results Available
              </h3>

              <p>
                Results will appear when
                approved candidates are
                available.
              </p>

            </div>

          ) : (

            <div className="candidate-grid">

              {candidates.map(
                (candidate, index) => (

                  <div
                    className="candidate-card"
                    key={candidate._id}
                  >

                    <div className="candidate-top">

                      <div className="candidate-avatar">

                        {candidate.name
                          ?.charAt(0)
                          ?.toUpperCase()}

                      </div>

                      <div className="candidate-number">
                        #{index + 1}
                      </div>

                    </div>

                    <h3>
                      {candidate.name}
                    </h3>

                    <p className="party">
                      {candidate.party}
                    </p>

                    <div className="card-bottom">

                      <div className="vote-count">

                        <strong>
                          {candidate.votes ||
                            0}
                        </strong>

                        <span>
                          Votes
                        </span>

                      </div>

                      <strong>
                        {getPercentage(
                          candidate.votes
                        )}%
                      </strong>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

      {/* ================= FOOTER ================= */}

      <footer>
        © 2026 VoteHub • Secure Digital Voting
      </footer>

    </div>
  );
}

export default Results;