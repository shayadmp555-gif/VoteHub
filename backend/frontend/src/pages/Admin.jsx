import { useEffect, useMemo, useState } from "react";
import "../Admin.css";
import axios from "axios";

const API = "http://localhost:5000/api";

function Admin({ user, logout }) {
  const [candidates, setCandidates] = useState([]);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("dashboard");

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token") || "";

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ================= FETCH CANDIDATES =================

  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`${API}/candidates`);

      setCandidates(
        res.data.candidates || res.data || []
      );
    } catch (error) {
      console.log(error);

      setMessage(
        error.response?.data?.message ||
          "Candidates load nahi ho rahe."
      );
    }
  };

  // ================= FETCH USERS =================

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);

      const res = await axios.get(
        `${API}/users`,
        authConfig
      );

      console.log("USERS:", res.data);

      setUsers(
        res.data.users || res.data || []
      );
    } catch (error) {
      console.log("Users Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Users load nahi ho rahe."
      );
    } finally {
      setUsersLoading(false);
    }
  };

  // ================= LOAD DATA =================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchCandidates(),
        fetchUsers(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // ================= USER STATUS =================

  // IMPORTANT:
  // Every non-admin user which is NOT approved
  // and NOT rejected will appear in pending list.

  const pendingUsers = users.filter(
    (item) =>
      item.role !== "admin" &&
      item.isApproved !== true &&
      item.rejected !== true
  );

  const approvedUsers = users.filter(
    (item) =>
      item.role !== "admin" &&
      item.isApproved === true
  );

  const rejectedUsers = users.filter(
    (item) =>
      item.role !== "admin" &&
      item.rejected === true
  );

  // ================= CANDIDATE STATUS =================

  const pendingCandidates = candidates.filter(
    (item) => item.status === "pending"
  );

  const approvedCandidates = candidates.filter(
    (item) => item.status === "approved"
  );

  // ================= TOTAL VOTES =================

  const totalVotes = candidates.reduce(
    (total, candidate) =>
      total + Number(candidate.votes || 0),
    0
  );

  // ================= APPROVE USER =================

  const approveUser = async (id) => {
    try {
      await axios.patch(
        `${API}/users/${id}/approve`,
        {},
        authConfig
      );

      setUsers((oldUsers) =>
        oldUsers.map((item) =>
          item._id === id
            ? {
                ...item,
                isApproved: true,
                rejected: false,
              }
            : item
        )
      );

      setMessage(
        "User approved successfully ✅"
      );

      await fetchUsers();
    } catch (error) {
      console.log("Approve User Error:", error);

      setMessage(
        error.response?.data?.message ||
          "User approve nahi ho raha."
      );
    }
  };

  // ================= REJECT USER =================

  const rejectUser = async (id) => {
    try {
      await axios.patch(
        `${API}/users/${id}/reject`,
        {},
        authConfig
      );

      setUsers((oldUsers) =>
        oldUsers.map((item) =>
          item._id === id
            ? {
                ...item,
                isApproved: false,
                rejected: true,
              }
            : item
        )
      );

      setMessage(
        "User rejected successfully ❌"
      );

      await fetchUsers();
    } catch (error) {
      console.log("Reject User Error:", error);

      setMessage(
        error.response?.data?.message ||
          "User reject nahi ho raha."
      );
    }
  };

  // ================= APPROVE CANDIDATE =================

  const approveCandidate = async (id) => {
    try {
      const res = await axios.patch(
        `${API}/candidates/${id}/approve`,
        {},
        authConfig
      );

      const updated = res.data.candidate;

      setCandidates((oldCandidates) =>
        oldCandidates.map((item) =>
          item._id === id
            ? {
                ...item,
                ...(updated || {}),
                status: "approved",
              }
            : item
        )
      );

      setMessage(
        "Candidate approved successfully ✅"
      );

      await fetchCandidates();
    } catch (error) {
      console.log(error);

      setMessage(
        error.response?.data?.message ||
          "Candidate approve failed."
      );
    }
  };

  // ================= REJECT CANDIDATE =================

  const rejectCandidate = async (id) => {
    try {
      const res = await axios.patch(
        `${API}/candidates/${id}/reject`,
        {},
        authConfig
      );

      const updated = res.data.candidate;

      setCandidates((oldCandidates) =>
        oldCandidates.map((item) =>
          item._id === id
            ? {
                ...item,
                ...(updated || {}),
                status: "rejected",
              }
            : item
        )
      );

      setMessage(
        "Candidate rejected successfully ❌"
      );

      await fetchCandidates();
    } catch (error) {
      console.log(error);

      setMessage(
        error.response?.data?.message ||
          "Candidate reject failed."
      );
    }
  };
// ================= END ELECTION =================

  const endElection = async () => {
    const confirmEnd = window.confirm(
      "Are you sure you want to end the election?\n\nAfter ending the election, users will not be able to vote."
    );

    if (!confirmEnd) {
      return;
    }

    try {
      const res = await axios.patch(
        `${API}/election/end`,
        {},
        authConfig
      );

      setMessage(
        res.data.message ||
          "Election ended successfully 🏆"
      );

    } catch (error) {
      console.log(
        "End Election Error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Election end nahi ho paya."
      );
    }
  };
  // ================= RESTART ELECTION =================
// ================= RESET / NEW ELECTION =================

const restartElection = async () => {
  const confirmRestart = window.confirm(
    "Are you sure you want to start a new election?\n\nPrevious votes will be reset. User and candidate approvals will remain unchanged."
  );

  if (!confirmRestart) {
    return;
  }

  try {
    const res = await axios.patch(
      `${API}/election/reset`,
      {},
      authConfig
    );

    setMessage(
      res.data.message ||
        "New election started successfully 🔄"
    );

    // Refresh data
    await fetchCandidates();
    await fetchUsers();

  } catch (error) {
    console.log(
      "Reset Election Error:",
      error
    );

    setMessage(
      error.response?.data?.message ||
        "Election reset nahi ho paya."
    );
  }
};

  // ================= SEARCH =================

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const text =
        `${candidate.name || ""} ${
          candidate.party || ""
        }`.toLowerCase();

      return text.includes(
        search.toLowerCase()
      );
    });
  }, [candidates, search]);

  // ================= PAGE TITLE =================

  const pageTitle =
    activePage === "dashboard"
      ? "Election Dashboard"
      : activePage === "users"
      ? "Registered Users"
      : activePage === "pendingUsers"
      ? "Pending User Requests"
      : activePage === "approvedUsers"
      ? "Approved Users"
      : "Candidate Management";

  // ================= LOGOUT =================

  const handleLogout = () => {
    if (logout) {
      logout();
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  };

  const getInitial = (name) => {
    return (
      name?.charAt(0)?.toUpperCase() || "?"
    );
  };

  // ================= USER ROW =================

// ================= USER ROW =================

const renderUserRow = (
  item,
  showActions = true
) => {

  const deleteUser = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete ${item.name}?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(
        `${API}/users/${item._id}`,
        authConfig
      );

      setUsers((oldUsers) =>
        oldUsers.filter(
          (user) => user._id !== item._id
        )
      );

      setMessage(
        "User permanently deleted successfully 🗑️"
      );

      await fetchUsers();

    } catch (error) {
      console.log(
        "Delete User Error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "User delete nahi ho raha."
      );
    }
  };

  return (
    <div
      className="modern-table-row"
      key={item._id}
    >

      <div className="candidate-info">

        <div className="candidate-avatar large">
          {getInitial(item.name)}
        </div>

        <div>
          <strong>
            {item.name}
          </strong>

          <small>
            ID: {item._id?.slice(-6)}
          </small>
        </div>

      </div>

      <span>
        {item.email}
      </span>

      {item.isApproved === true ? (
        <span className="status approved">
          ✓ Approved
        </span>
      ) : item.rejected === true ? (
        <span className="status rejected">
          ✕ Rejected
        </span>
      ) : (
        <span className="status pending">
          • Pending
        </span>
      )}

      {showActions && (
        <div className="action-buttons">

          {item.isApproved !== true &&
            item.rejected !== true && (
              <>
                <button
                  className="approve-btn"
                  onClick={() =>
                    approveUser(item._id)
                  }
                >
                  ✓ Approve
                </button>

                <button
                  className="reject-btn"
                  onClick={() =>
                    rejectUser(item._id)
                  }
                >
                  ✕ Reject
                </button>
              </>
            )}

          <button
            className="delete-btn"
            onClick={deleteUser}
          >
            🗑️ Delete
          </button>

        </div>
      )}

    </div>
  );
};

  return (
    <div className="admin-layout">

      {/* ================= SIDEBAR ================= */}

      <aside className="admin-sidebar">

        <div className="admin-logo">

          <div className="admin-logo-icon">
            🗳️
          </div>

          <div>
            <h2>
              Vote<span>Hub</span>
            </h2>

            <small>ADMIN PANEL</small>
          </div>

        </div>

        <div className="sidebar-menu">

          <button
            className={
              activePage === "dashboard"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            📊 Dashboard
          </button>

          <button
            className={
              activePage === "candidates"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() =>
              setActivePage("candidates")
            }
          >
            👥 Candidates
            <b>{candidates.length}</b>
          </button>

          <button
            className={
              activePage === "pendingUsers"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={async () => {
              await fetchUsers();
              setActivePage("pendingUsers");
            }}
          >
            ⏳ Requests

            {pendingUsers.length > 0 && (
              <b className="pending-count">
                {pendingUsers.length}
              </b>
            )}
          </button>

          <button
            className={
              activePage === "users"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={async () => {
              await fetchUsers();
              setActivePage("users");
            }}
          >
            👤 Users
            <b>{users.filter(
              (item) => item.role !== "admin"
            ).length}</b>
          </button>

          <button
            className={
              activePage === "approvedUsers"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={async () => {
              await fetchUsers();
              setActivePage("approvedUsers");
            }}
          >
            ✅ Approved
            <b>{approvedUsers.length}</b>
          </button>
<button
  className="menu-item"
  onClick={endElection}
>
  <span>🏁</span>
  End Election
</button>
<button
  className="menu-item"
  onClick={restartElection}
>
  <span>🔄</span>
  Restart Election
</button>
          <button
            className="menu-item"
            onClick={async () => {
              await fetchCandidates();
              await fetchUsers();

              setMessage(
                "Data refreshed successfully 🔄"
              );
            }}

          >
            🔄 Refresh
          </button>

        </div>

        <button
          className="admin-logout"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="admin-main">

        {/* ================= TOPBAR ================= */}

        <header className="admin-topbar">

          <div>
            <small>
              VoteHub / Admin
            </small>

            <h1>{pageTitle}</h1>
          </div>

          <div className="admin-profile">

            <div className="admin-avatar">
              {getInitial(user?.name)}
            </div>

            <div>
              <strong>
                {user?.name || "Administrator"}
              </strong>

              <small>
                Administrator
              </small>
            </div>

          </div>

        </header>

        {/* ================= MESSAGE ================= */}

        {message && (
          <div className="admin-message">
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

        {/* ================= DASHBOARD ================= */}

        {activePage === "dashboard" && (
          <section>

            <div className="welcome-banner">

              <div>
                <span className="welcome-label">
                  ELECTION CONTROL CENTER
                </span>

                <h2>
                  Welcome back,{" "}
                  {user?.name || "Admin"} 👋
                </h2>

                <p>
                  Manage users, candidates and
                  election activity.
                </p>
              </div>

              <div className="banner-icon">
                🗳️
              </div>

            </div>

            <div className="stats-grid">

              <div className="stat-card blue">
                <div className="stat-icon">
                  👤
                </div>

                <div>
                  <span>Total Users</span>

                  <strong>
                    {users.filter(
                      (item) =>
                        item.role !== "admin"
                    ).length}
                  </strong>
                </div>
              </div>

              <div className="stat-card orange">
                <div className="stat-icon">
                  ⏳
                </div>

                <div>
                  <span>Pending</span>

                  <strong>
                    {pendingUsers.length}
                  </strong>
                </div>
              </div>

              <div className="stat-card green">
                <div className="stat-icon">
                  👥
                </div>

                <div>
                  <span>Candidates</span>

                  <strong>
                    {candidates.length}
                  </strong>
                </div>
              </div>

              <div className="stat-card purple">
                <div className="stat-icon">
                  🗳️
                </div>

                <div>
                  <span>Total Votes</span>

                  <strong>
                    {totalVotes}
                  </strong>
                </div>
              </div>

            </div>

            <div className="quick-grid">

              <button
                className="quick-card"
                onClick={async () => {
                  await fetchUsers();
                  setActivePage(
                    "pendingUsers"
                  );
                }}
              >
                <strong>
                  ⏳ Review Requests
                </strong>

                <span>
                  {pendingUsers.length} pending
                </span>
              </button>

              <button
                className="quick-card"
                onClick={() =>
                  setActivePage("users")
                }
              >
                <strong>
                  👤 View Users
                </strong>

                <span>
                  {users.length} registered
                </span>
              </button>

            </div>

            <div className="admin-section">

              <div className="section-heading">
                <div>
                  <h2>
                    Pending User Requests
                  </h2>

                  <p>
                    Users waiting for admin
                    approval.
                  </p>
                </div>

                <button
                  className="refresh-btn"
                  onClick={async () => {
                    await fetchUsers();

                    setActivePage(
                      "pendingUsers"
                    );
                  }}
                >
                  View All →
                </button>
              </div>

              {pendingUsers.length === 0 ? (
                <div className="empty-state">
                  <h3>
                    No Pending Users
                  </h3>
                </div>
              ) : (
                <div className="modern-table">

                  <div className="modern-table-head">
                    <span>User</span>
                    <span>Email</span>
                    <span>Status</span>
                    <span>Action</span>
                  </div>

                  {pendingUsers
                    .slice(0, 5)
                    .map((item) =>
                      renderUserRow(item)
                    )}

                </div>
              )}

            </div>

          </section>
        )}

        {/* ================= ALL USERS ================= */}

        {activePage === "users" && (
          <section>

            <div className="page-header">

              <div>
                <span className="page-label">
                  USER MANAGEMENT
                </span>

                <h2>
                  Registered Users
                </h2>
              </div>

              <button
                className="refresh-btn"
                onClick={fetchUsers}
              >
                🔄 Refresh
              </button>

            </div>

            <div className="modern-table">

              <div className="modern-table-head">
                <span>User</span>
                <span>Email</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {usersLoading ? (
                <div className="loading-box">
                  Loading users...
                </div>
              ) : (
                users
                  .filter(
                    (item) =>
                      item.role !== "admin"
                  )
                  .map((item) =>
                    renderUserRow(item)
                  )
              )}

            </div>

          </section>
        )}

        {/* ================= PENDING USERS ================= */}

        {activePage === "pendingUsers" && (
          <section>

            <div className="page-header">

              <div>
                <span className="page-label">
                  USER APPROVAL
                </span>

                <h2>
                  Pending User Requests
                </h2>

                <p>
                  Review new users before
                  allowing access.
                </p>
              </div>

              <button
                className="refresh-btn"
                onClick={fetchUsers}
              >
                🔄 Refresh
              </button>

            </div>

            <div className="modern-table">

              <div className="modern-table-head">
                <span>User</span>
                <span>Email</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {usersLoading ? (
                <div className="loading-box">
                  Loading users...
                </div>
              ) : pendingUsers.length === 0 ? (
                <div className="empty-state">

                  <div>🎉</div>

                  <h3>
                    No Pending Requests
                  </h3>

                  <p>
                    All user requests have been
                    reviewed.
                  </p>

                </div>
              ) : (
                pendingUsers.map((item) =>
                  renderUserRow(item)
                )
              )}

            </div>

          </section>
        )}

        {/* ================= APPROVED USERS ================= */}

        {activePage === "approvedUsers" && (
          <section>

            <div className="page-header">

              <div>
                <span className="page-label">
                  USER MANAGEMENT
                </span>

                <h2>
                  Approved Users
                </h2>
              </div>

              <button
                className="refresh-btn"
                onClick={fetchUsers}
              >
                🔄 Refresh
              </button>

            </div>

            <div className="modern-table">

              <div className="modern-table-head">
                <span>User</span>
                <span>Email</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {approvedUsers.length === 0 ? (
                <div className="empty-state">
                  <h3>
                    No Approved Users
                  </h3>
                </div>
              ) : (
                approvedUsers.map((item) =>
                  renderUserRow(item, false)
                )
              )}

            </div>

          </section>
        )}

        {/* ================= CANDIDATES ================= */}

        {activePage === "candidates" && (
          <section>

            <div className="page-header">

              <div>
                <span className="page-label">
                  CANDIDATE MANAGEMENT
                </span>

                <h2>
                  All Candidates
                </h2>
              </div>

              <button
                className="refresh-btn"
                onClick={fetchCandidates}
              >
                🔄 Refresh
              </button>

            </div>

            <div className="candidate-toolbar">

              <div className="search-box">
                🔍

                <input
                  type="text"
                  placeholder="Search candidate..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />
              </div>

            </div>

            <div className="modern-table">

              <div className="modern-table-head">
                <span>Candidate</span>
                <span>Party</span>
                <span>Votes</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {loading ? (
                <div className="loading-box">
                  Loading candidates...
                </div>
              ) : (
                filteredCandidates.map(
                  (candidate) => (
                    <div
                      className="modern-table-row"
                      key={candidate._id}
                    >

                      <div className="candidate-info">

                        <div className="candidate-avatar large">
                          {getInitial(
                            candidate.name
                          )}
                        </div>

                        <div>
                          <strong>
                            {candidate.name}
                          </strong>
                        </div>

                      </div>

                      <span>
                        {candidate.party}
                      </span>

                      <strong>
                        {candidate.votes || 0}
                      </strong>

                      <span
                        className={`status ${
                          candidate.status ||
                          "pending"
                        }`}
                      >
                        {candidate.status ===
                        "approved"
                          ? "✓ Approved"
                          : candidate.status ===
                            "rejected"
                          ? "✕ Rejected"
                          : "• Pending"}
                      </span>

                      <div className="action-buttons">

  {candidate.status === "pending" && (
    <>
      <button
        className="approve-btn"
        onClick={() =>
          approveCandidate(candidate._id)
        }
      >
        ✓ Approve
      </button>

      <button
        className="reject-btn"
        onClick={() =>
          rejectCandidate(candidate._id)
        }
      >
        ✕ Reject
      </button>
    </>
  )}

  <button
    className="delete-btn"
    onClick={async () => {

      const confirmDelete = window.confirm(
        `Are you sure you want to permanently delete ${candidate.name}?\n\nThis action cannot be undone.`
      );

      if (!confirmDelete) {
        return;
      }

      try {
        await axios.delete(
          `${API}/candidates/${candidate._id}`,
          authConfig
        );

        setCandidates((oldCandidates) =>
          oldCandidates.filter(
            (item) =>
              item._id !== candidate._id
          )
        );

        setMessage(
          "Candidate permanently deleted successfully 🗑️"
        );

        await fetchCandidates();

      } catch (error) {
        console.log(
          "Delete Candidate Error:",
          error
        );

        setMessage(
          error.response?.data?.message ||
            "Candidate delete nahi ho raha."
        );
      }
    }}
  >
    🗑️ Delete
  </button>

</div>

                    </div>
                  )
                )
              )}

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default Admin;