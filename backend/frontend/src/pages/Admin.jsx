import { useEffect, useMemo, useState } from "react";
import "../Admin.css";
import axios from "axios";

// =====================================================
// API CONFIG
// =====================================================

const SERVER_URL =
  import.meta.env.VITE_API_URL ||
  "https://votehub-8gj9.onrender.com";

// Automatically add /api if it is not already present
const API = SERVER_URL.replace(/\/$/, "").endsWith("/api")
  ? SERVER_URL.replace(/\/$/, "")
  : `${SERVER_URL.replace(/\/$/, "")}/api`;

// =====================================================
// ADMIN COMPONENT
// =====================================================

function Admin({ user, logout }) {
  const [candidates, setCandidates] = useState([]);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("dashboard");

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);

  const [message, setMessage] = useState("");

  // =====================================================
  // AUTH CONFIG
  // =====================================================

  const getAuthConfig = () => {
    const token = localStorage.getItem("token") || "";

    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  // =====================================================
  // FETCH ALL CANDIDATES
  // =====================================================

  const fetchCandidates = async () => {
    try {
      const res = await axios.get(
        `${API}/candidates/all`,
        getAuthConfig()
      );

      console.log("CANDIDATES API RESPONSE:", res.data);

      let data = [];

      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (Array.isArray(res.data?.candidates)) {
        data = res.data.candidates;
      }

      setCandidates(data);

      console.log("candidates =", data);

      return data;
    } catch (error) {
      console.error(
        "Candidates Error:",
        error.response?.status,
        error.response?.data || error.message
      );

      setCandidates([]);

      setMessage(
        error.response?.data?.message ||
          "Candidates load nahi ho rahe."
      );

      return [];
    }
  };

  // =====================================================
  // FETCH ALL USERS
  // =====================================================

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);

      const res = await axios.get(
        `${API}/users`,
        getAuthConfig()
      );

      console.log("USERS API RESPONSE:", res.data);

      let data = [];

      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (Array.isArray(res.data?.users)) {
        data = res.data.users;
      }

      setUsers(data);

      console.log("users =", data);

      return data;
    } catch (error) {
      console.error(
        "USERS API ERROR:",
        error.response?.status,
        error.response?.data || error.message
      );

      setUsers([]);

      setMessage(
        error.response?.data?.message ||
          "Users load nahi ho rahe."
      );

      return [];
    } finally {
      setUsersLoading(false);
    }
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

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

  // =====================================================
  // USER FILTERS
  // =====================================================

  const pendingUsers = users.filter(
    (item) =>
      item.role === "user" &&
      item.isApproved !== true &&
      item.rejected !== true
  );

  const pendingCandidateUsers = users.filter(
    (item) =>
      item.role === "candidate" &&
      item.isApproved !== true &&
      item.rejected !== true
  );

  const approvedUsers = users.filter(
    (item) =>
      item.role === "user" &&
      item.isApproved === true
  );

  const approvedCandidateUsers = users.filter(
    (item) =>
      item.role === "candidate" &&
      item.isApproved === true
  );

  // =====================================================
  // CANDIDATE FILTERS
  // =====================================================

  const pendingCandidates = candidates.filter(
    (item) => item.status === "pending"
  );

  const approvedCandidates = candidates.filter(
    (item) => item.status === "approved"
  );

  const rejectedCandidates = candidates.filter(
    (item) => item.status === "rejected"
  );

  // =====================================================
  // TOTAL VOTES
  // =====================================================

  const totalVotes = candidates.reduce(
    (total, candidate) =>
      total + Number(candidate.votes || 0),
    0
  );

  // =====================================================
  // APPROVE USER
  // =====================================================

  const approveUser = async (id) => {
    try {
      const res = await axios.patch(
        `${API}/users/${id}/approve`,
        {},
        getAuthConfig()
      );

      setMessage(
        res.data?.message ||
          "Voter approved successfully ✅"
      );

      await fetchUsers();
    } catch (error) {
      console.error(
        "Approve User Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          "Voter approve nahi ho raha."
      );
    }
  };

  // =====================================================
  // REJECT USER
  // =====================================================

  const rejectUser = async (id) => {
    try {
      const res = await axios.patch(
        `${API}/users/${id}/reject`,
        {},
        getAuthConfig()
      );

      setMessage(
        res.data?.message ||
          "Voter rejected successfully ❌"
      );

      await fetchUsers();
      await fetchCandidates();
    } catch (error) {
      console.error(
        "Reject User Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          "Voter reject nahi ho raha."
      );
    }
  };

  // =====================================================
  // APPROVE CANDIDATE ACCOUNT
  // =====================================================

  const approveCandidateUser = async (id) => {
    try {
      // -----------------------------------------------
      // STEP 1: APPROVE USER ACCOUNT
      // -----------------------------------------------

      const userResponse = await axios.patch(
        `${API}/users/${id}/approve`,
        {},
        getAuthConfig()
      );

      // -----------------------------------------------
      // STEP 2: REFRESH CANDIDATES
      // Candidate profile is created by backend
      // after user approval.
      // -----------------------------------------------

      const updatedCandidates =
        await fetchCandidates();

      // -----------------------------------------------
      // STEP 3: FIND CREATED CANDIDATE PROFILE
      // -----------------------------------------------

      const candidateProfile =
        updatedCandidates.find((candidate) => {
          const candidateUserId =
            candidate.userId?._id ||
            candidate.userId;

          return (
            String(candidateUserId) ===
            String(id)
          );
        });

      // -----------------------------------------------
      // STEP 4: APPROVE CANDIDATE PROFILE
      // -----------------------------------------------

      if (
        candidateProfile &&
        candidateProfile.status !== "approved"
      ) {
        await axios.patch(
          `${API}/candidates/${candidateProfile._id}/approve`,
          {},
          getAuthConfig()
        );
      }

      await fetchUsers();
      await fetchCandidates();

      setMessage(
        userResponse.data?.message ||
          "Candidate approved successfully ✅"
      );
    } catch (error) {
      console.error(
        "Approve Candidate Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          "Candidate approve nahi ho raha."
      );
    }
  };

  // =====================================================
  // REJECT CANDIDATE ACCOUNT
  // =====================================================

  const rejectCandidateUser = async (id) => {
    try {
      const res = await axios.patch(
        `${API}/users/${id}/reject`,
        {},
        getAuthConfig()
      );

      await fetchUsers();
      await fetchCandidates();

      setMessage(
        res.data?.message ||
          "Candidate account rejected successfully ❌"
      );
    } catch (error) {
      console.error(
        "Reject Candidate Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          "Candidate reject nahi ho raha."
      );
    }
  };

  // =====================================================
  // APPROVE CANDIDATE
  // =====================================================

  const approveCandidate = async (id) => {
    try {
      const res = await axios.patch(
        `${API}/candidates/${id}/approve`,
        {},
        getAuthConfig()
      );

      setCandidates((old) =>
        old.map((item) =>
          item._id === id
            ? {
                ...item,
                ...(res.data?.candidate || {}),
                status: "approved",
              }
            : item
        )
      );

      setMessage(
        res.data?.message ||
          "Candidate approved successfully ✅"
      );

      await fetchCandidates();
    } catch (error) {
      console.error(
        "Approve Candidate Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          "Candidate approve failed."
      );
    }
  };

  // =====================================================
  // REJECT CANDIDATE
  // =====================================================

  const rejectCandidate = async (id) => {
    try {
      const res = await axios.patch(
        `${API}/candidates/${id}/reject`,
        {},
        getAuthConfig()
      );

      setCandidates((old) =>
        old.map((item) =>
          item._id === id
            ? {
                ...item,
                ...(res.data?.candidate || {}),
                status: "rejected",
              }
            : item
        )
      );

      setMessage(
        res.data?.message ||
          "Candidate rejected successfully ❌"
      );

      await fetchCandidates();
    } catch (error) {
      console.error(
        "Reject Candidate Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          "Candidate reject failed."
      );
    }
  };

  // =====================================================
  // DELETE USER
  // =====================================================

  const deleteUser = async (item) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete ${item.name}?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      const res = await axios.delete(
        `${API}/users/${item._id}`,
        getAuthConfig()
      );

      setUsers((old) =>
        old.filter(
          (u) => u._id !== item._id
        )
      );

      await fetchCandidates();

      setMessage(
        res.data?.message ||
          "User permanently deleted successfully 🗑️"
      );
    } catch (error) {
      console.error(
        "Delete User Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          "User delete nahi ho raha."
      );
    }
  };

  // =====================================================
  // DELETE CANDIDATE
  // =====================================================

  const deleteCandidate = async (candidate) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete ${candidate.name}?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      const res = await axios.delete(
        `${API}/candidates/${candidate._id}`,
        getAuthConfig()
      );

      setCandidates((old) =>
        old.filter(
          (item) =>
            item._id !== candidate._id
        )
      );

      setMessage(
        res.data?.message ||
          "Candidate permanently deleted successfully 🗑️"
      );
    } catch (error) {
      console.error(
        "Delete Candidate Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          "Candidate delete nahi ho raha."
      );
    }
  };

  // =====================================================
  // END ELECTION
  // =====================================================

  const endElection = async () => {
    const confirmEnd = window.confirm(
      "Are you sure you want to end the election?\n\nAfter ending the election, users will not be able to vote."
    );

    if (!confirmEnd) return;

    try {
      const res = await axios.patch(
        `${API}/election/end`,
        {},
        getAuthConfig()
      );

      setMessage(
        res.data?.message ||
          "Election ended successfully 🏆"
      );
    } catch (error) {
      console.error(
        "End Election Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          "Election end nahi ho paya."
      );
    }
  };

  // =====================================================
  // RESTART ELECTION
  // =====================================================

  const restartElection = async () => {
    const confirmRestart = window.confirm(
      "Are you sure you want to start a new election?\n\nPrevious votes will be reset."
    );

    if (!confirmRestart) return;

    try {
      const res = await axios.patch(
        `${API}/election/reset`,
        {},
        getAuthConfig()
      );

      setMessage(
        res.data?.message ||
          "New election started successfully 🔄"
      );

      await fetchCandidates();
      await fetchUsers();
    } catch (error) {
      console.error(
        "Reset Election Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          "Election reset nahi ho paya."
      );
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredCandidates = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    if (!searchText) {
      return candidates;
    }

    return candidates.filter((candidate) => {
      const text = `
        ${candidate.name || ""}
        ${candidate.party || ""}
        ${candidate.status || ""}
      `.toLowerCase();

      return text.includes(searchText);
    });
  }, [candidates, search]);

  // =====================================================
  // INITIAL
  // =====================================================

  const getInitial = (name) => {
    return (
      name?.charAt(0)?.toUpperCase() ||
      "?"
    );
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    if (logout) {
      logout();
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  };

  // =====================================================
  // USER ROW
  // =====================================================

  const renderUserRow = (
    item,
    showActions = true,
    candidateAccount = false
  ) => {
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
            <strong>{item.name}</strong>

            <small>
              ID: {item._id?.slice(-6)}
            </small>
          </div>
        </div>

        <span>{item.email}</span>

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
              item.rejected !== true &&
              (candidateAccount ? (
                <>
                  <button
                    className="approve-btn"
                    onClick={() =>
                      approveCandidateUser(
                        item._id
                      )
                    }
                  >
                    ✓ Approve
                  </button>

                  <button
                    className="reject-btn"
                    onClick={() =>
                      rejectCandidateUser(
                        item._id
                      )
                    }
                  >
                    ✕ Reject
                  </button>
                </>
              ) : (
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
              ))}

            <button
              className="delete-btn"
              onClick={() =>
                deleteUser(item)
              }
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  // =====================================================
  // PAGE TITLE
  // =====================================================

  const pageTitle =
    activePage === "dashboard"
      ? "Election Dashboard"
      : activePage === "users"
      ? "Registered Voters"
      : activePage === "pendingUsers"
      ? "Voter Requests"
      : activePage === "candidateRequests"
      ? "Candidate Requests"
      : activePage === "approvedUsers"
      ? "Approved Voters"
      : activePage === "approvedCandidates"
      ? "Approved Candidates"
      : "Candidate Management";

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="admin-layout">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="admin-sidebar">

        <div className="admin-logo">

          <div className="admin-logo-icon">
            🗳️
          </div>

          <div>
            <h2>
              Vote<span>Hub</span>
            </h2>

            <small>
              ADMIN PANEL
            </small>
          </div>

        </div>

        <div className="sidebar-menu">

          {/* DASHBOARD */}

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

          {/* CANDIDATE REQUESTS */}

          <button
            className={
              activePage === "candidateRequests"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={async () => {
              await fetchUsers();
              setActivePage(
                "candidateRequests"
              );
            }}
          >
            🗳️ Candidate Requests

            {pendingCandidateUsers.length >
              0 && (
              <b className="pending-count">
                {pendingCandidateUsers.length}
              </b>
            )}
          </button>

          {/* VOTER REQUESTS */}

          <button
            className={
              activePage === "pendingUsers"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={async () => {
              await fetchUsers();
              setActivePage(
                "pendingUsers"
              );
            }}
          >
            👤 Voter Requests

            {pendingUsers.length > 0 && (
              <b className="pending-count">
                {pendingUsers.length}
              </b>
            )}
          </button>

          {/* VOTERS */}

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
            👥 Voters

            <b>
              {approvedUsers.length}
            </b>
          </button>

          {/* APPROVED CANDIDATES */}

          <button
            className={
              activePage === "approvedCandidates"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={async () => {
              await fetchUsers();
              setActivePage(
                "approvedCandidates"
              );
            }}
          >
            ✅ Approved Candidates

            <b>
              {approvedCandidateUsers.length}
            </b>
          </button>

          {/* ELECTION CANDIDATES */}

          <button
            className={
              activePage === "candidates"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={async () => {
              await fetchCandidates();
              setActivePage("candidates");
            }}
          >
            🏆 Election Candidates

            <b>
              {candidates.length}
            </b>
          </button>

          {/* END ELECTION */}

          <button
            className="menu-item"
            onClick={endElection}
          >
            🏁 End Election
          </button>

          {/* RESTART ELECTION */}

          <button
            className="menu-item"
            onClick={restartElection}
          >
            🔄 Restart Election
          </button>

          {/* REFRESH */}

          <button
            className="menu-item"
            onClick={async () => {
              setLoading(true);

              await Promise.all([
                fetchCandidates(),
                fetchUsers(),
              ]);

              setLoading(false);

              setMessage(
                "Data refreshed successfully 🔄"
              );
            }}
          >
            🔄 Refresh
          </button>

        </div>

        {/* LOGOUT */}

        <button
          className="admin-logout"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="admin-main">

        {/* TOPBAR */}

        <header className="admin-topbar">

          <div>
            <small>
              VoteHub / Admin
            </small>

            <h1>
              {pageTitle}
            </h1>
          </div>

          <div className="admin-profile">

            <div className="admin-avatar">
              {getInitial(user?.name)}
            </div>

            <div>
              <strong>
                {user?.name ||
                  "Administrator"}
              </strong>

              <small>
                Administrator
              </small>
            </div>

          </div>

        </header>

        {/* MESSAGE */}

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

        {/* =================================================
            DASHBOARD
        ================================================= */}

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
                  Manage voters, candidates
                  and election activity.
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
                  <span>
                    Voters
                  </span>

                  <strong>
                    {approvedUsers.length}
                  </strong>
                </div>

              </div>

              <div className="stat-card orange">

                <div className="stat-icon">
                  ⏳
                </div>

                <div>
                  <span>
                    Voter Requests
                  </span>

                  <strong>
                    {pendingUsers.length}
                  </strong>
                </div>

              </div>

              <div className="stat-card green">

                <div className="stat-icon">
                  🗳️
                </div>

                <div>
                  <span>
                    Candidate Requests
                  </span>

                  <strong>
                    {pendingCandidateUsers.length}
                  </strong>
                </div>

              </div>

              <div className="stat-card purple">

                <div className="stat-icon">
                  🏆
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

            </div>

            <div className="quick-grid">

              <button
                className="quick-card"
                onClick={async () => {
                  await fetchUsers();

                  setActivePage(
                    "candidateRequests"
                  );
                }}
              >
                <strong>
                  🗳️ Candidate Requests
                </strong>

                <span>
                  {pendingCandidateUsers.length}{" "}
                  pending
                </span>
              </button>

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
                  👤 Voter Requests
                </strong>

                <span>
                  {pendingUsers.length}{" "}
                  pending
                </span>
              </button>

            </div>

          </section>
        )}

        {/* =================================================
            VOTER REQUESTS
        ================================================= */}

        {activePage === "pendingUsers" && (
          <section>

            <div className="page-header">

              <div>
                <span className="page-label">
                  VOTER APPROVAL
                </span>

                <h2>
                  Pending Voter Requests
                </h2>

                <p>
                  Review new voters before
                  allowing voting access.
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
                  Loading...
                </div>
              ) : pendingUsers.length === 0 ? (
                <div className="empty-state">

                  <div>🎉</div>

                  <h3>
                    No Pending Voters
                  </h3>

                </div>
              ) : (
                pendingUsers.map((item) =>
                  renderUserRow(item)
                )
              )}

            </div>

          </section>
        )}

        {/* =================================================
            CANDIDATE REQUESTS
        ================================================= */}

        {activePage === "candidateRequests" && (
          <section>

            <div className="page-header">

              <div>
                <span className="page-label">
                  CANDIDATE APPROVAL
                </span>

                <h2>
                  Candidate Requests
                </h2>

                <p>
                  Candidates waiting for
                  admin approval.
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
                <span>Candidate</span>
                <span>Email</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {usersLoading ? (
                <div className="loading-box">
                  Loading candidate requests...
                </div>
              ) : pendingCandidateUsers.length === 0 ? (
                <div className="empty-state">

                  <div>🎉</div>

                  <h3>
                    No Pending Candidate Requests
                  </h3>

                  <p>
                    New candidate registrations
                    will appear here.
                  </p>

                </div>
              ) : (
                pendingCandidateUsers.map(
                  (item) =>
                    renderUserRow(
                      item,
                      true,
                      true
                    )
                )
              )}

            </div>

          </section>
        )}

        {/* =================================================
            ALL VOTERS
        ================================================= */}

        {activePage === "users" && (
          <section>

            <div className="page-header">

              <div>
                <span className="page-label">
                  USER MANAGEMENT
                </span>

                <h2>
                  Registered Voters
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
              ) : users.filter(
                  (item) =>
                    item.role === "user"
                ).length === 0 ? (
                <div className="empty-state">

                  <div>👤</div>

                  <h3>
                    No Registered Voters
                  </h3>

                </div>
              ) : (
                users
                  .filter(
                    (item) =>
                      item.role === "user"
                  )
                  .map((item) =>
                    renderUserRow(item)
                  )
              )}

            </div>

          </section>
        )}

        {/* =================================================
            APPROVED CANDIDATES
        ================================================= */}

        {activePage === "approvedCandidates" && (
          <section>

            <div className="page-header">

              <div>
                <span className="page-label">
                  CANDIDATE MANAGEMENT
                </span>

                <h2>
                  Approved Candidate Accounts
                </h2>

                <p>
                  These candidates can now
                  participate in the election.
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
                <span>Candidate</span>
                <span>Email</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {approvedCandidateUsers.length === 0 ? (
                <div className="empty-state">

                  <div>🗳️</div>

                  <h3>
                    No Approved Candidates
                  </h3>

                </div>
              ) : (
                approvedCandidateUsers.map(
                  (item) =>
                    renderUserRow(
                      item,
                      true,
                      true
                    )
                )
              )}

            </div>

          </section>
        )}

        {/* =================================================
            ELECTION CANDIDATES
        ================================================= */}

        {activePage === "candidates" && (
          <section>

            <div className="page-header">

              <div>
                <span className="page-label">
                  ELECTION CANDIDATES
                </span>

                <h2>
                  Candidate Management
                </h2>

                <p>
                  Manage candidates who have
                  submitted their election profile.
                </p>
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
                    setSearch(
                      e.target.value
                    )
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
              ) : filteredCandidates.length === 0 ? (
                <div className="empty-state">

                  <div>🗳️</div>

                  <h3>
                    No Election Candidates
                  </h3>

                  <p>
                    Approved candidates will
                    appear here after submitting
                    their election profile.
                  </p>

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

                          <small>
                            ID:{" "}
                            {candidate._id?.slice(-6)}
                          </small>
                        </div>

                      </div>

                      <span>
                        {candidate.party ||
                          "Independent"}
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

                        {candidate.status ===
                          "pending" && (
                          <>
                            <button
                              className="approve-btn"
                              onClick={() =>
                                approveCandidate(
                                  candidate._id
                                )
                              }
                            >
                              ✓ Approve
                            </button>

                            <button
                              className="reject-btn"
                              onClick={() =>
                                rejectCandidate(
                                  candidate._id
                                )
                              }
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteCandidate(
                              candidate
                            )
                          }
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