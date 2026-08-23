import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

function Dashboard({ user, logout, goResults }) {
  const [candidates, setCandidates] = useState([]);
  const [electionStatus, setElectionStatus] =
    useState("running");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token") || "";

  // ================= FETCH CANDIDATES =================

  const fetchCandidates = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API}/candidates`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Candidates load failed"
        );
        return;
      }

      setCandidates(data);

    } catch (error) {
      console.log(error);

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
        `${API}/election/status`
      );

      const data = await response.json();

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
    fetchCandidates();
    fetchElectionStatus();
  }, []);


  // ================= VOTE =================

  const vote = async (candidateId) => {

    if (!token) {
      setMessage(
        "Please login first."
      );
      return;
    }


    // Election ended check
    if (electionStatus === "ended") {
      setMessage(
        "🏁 Election has ended. Voting is closed."
      );
      return;
    }


    if (user?.hasVoted) {
      setMessage(
        "You have already voted."
      );
      return;
    }


    const confirmVote =
      window.confirm(
        "Are you sure you want to vote for this candidate?"
      );


    if (!confirmVote) return;


    try {

      const response = await fetch(
        `${API}/votes`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            candidateId,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        setMessage(
          data.message ||
            "Voting failed"
        );

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
        "✅ Vote submitted successfully!"
      );


      setCandidates((old) =>
        old.map(
          (candidate) =>
            candidate._id ===
            candidateId
              ? {
                  ...candidate,

                  votes:
                    Number(
                      candidate.votes || 0
                    ) + 1,
                }
              : candidate
        )
      );


      setTimeout(() => {
        window.location.reload();
      }, 800);


    } catch (error) {

      console.log(error);

      setMessage(
        "Voting failed."
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

          <button
            onClick={() => {
              fetchCandidates();
              fetchElectionStatus();
            }}
          >
            🏠 Home
          </button>


          <button onClick={goResults}>
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
              VOTING PORTAL
            </p>


            <h1>
              Hello, {user?.name} 👋
            </h1>


            <p>

              {electionStatus === "ended"
                ? "The election has ended. You can view the final results."
                : "Choose your candidate and make your vote count."}

            </p>

          </div>


          <div className="vote-status">

            <span>
              {electionStatus === "ended"
                ? "🏁"
                : user?.hasVoted
                ? "✓"
                : "!"}
            </span>


            <div>

              <small>
                Voting Status
              </small>


              <strong>

                {electionStatus ===
                "ended"
                  ? "Election Ended"
                  : user?.hasVoted
                  ? "Vote Submitted"
                  : "Not Voted Yet"}

              </strong>

            </div>

          </div>

        </div>


        {/* ================= MESSAGE ================= */}

        {message && (

          <div className="message">
            {message}
          </div>

        )}


        {/* ================= ELECTION ENDED ================= */}

        {electionStatus ===
          "ended" && (

          <div className="message">

            🏁 <strong>
              Election has ended.
            </strong>

            {" "}
            Voting is now closed.

            <button
              onClick={goResults}
              style={{
                marginLeft: "10px",
              }}
            >
              📊 View Final Results
            </button>

          </div>

        )}


        {/* ================= CANDIDATES ================= */}

        <section>

          <div className="section-title">

            <div>

              <h2>
                Choose Your Candidate
              </h2>


              <p>

                {electionStatus ===
                "ended"
                  ? "Voting is closed."
                  : "Only approved candidates are shown."}

              </p>

            </div>


            <span className="candidate-count">

              {candidates.length}
              {" "}
              Candidates

            </span>

          </div>


          {loading ? (

            <div className="empty">
              Loading candidates...
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


                    <button
                      className="vote-btn"

                      disabled={
                        user?.hasVoted ||
                        electionStatus ===
                          "ended"
                      }

                      onClick={() =>
                        vote(
                          candidate._id
                        )
                      }
                    >

                      {electionStatus ===
                      "ended"
                        ? "Election Ended 🏁"
                        : user?.hasVoted
                        ? "Voted ✓"
                        : "Vote Now →"}

                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}


          {/* ================= EMPTY ================= */}

          {!loading &&
            candidates.length ===
              0 && (

            <div className="empty">

              <div>
                🗳️
              </div>


              <h3>
                No approved candidates
              </h3>


              <p>
                Candidates will appear here
                after admin approval.
              </p>

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

export default Dashboard;