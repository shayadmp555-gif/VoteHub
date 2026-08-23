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
      const res = await axios.get(
        `${API}/candidates`
      );

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

  const pendingUsers = users.filter(
    (item) =>
      item.role !== "admin" &&
      item.isApproved === false
  );

  const approvedUsers = users.filter(
    (item) =>
      item.role !== "admin" &&
      item.isApproved === true
  );

  const rejectedUsers = users.filter(
    (item) =>
      item.role !== "admin" &&
      item.isApproved === false &&
      item.rejected === true
  );

  // ================= CANDIDATE STATUS =================

  const pendingCandidates = candidates.filter(
    (item) =>
      item.status === "pending"
  );

  const approvedCandidates = candidates.filter(
    (item) =>
      item.status === "approved"
  );

  const rejectedCandidates = candidates.filter(
    (item) =>
      item.status === "rejected"
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

      const updated =
        res.data.candidate;

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

      const updated =
        res.data.candidate;

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
    } catch (error) {
      console.log(error);

      setMessage(
        error.response?.data?.message ||
          "Candidate reject failed."
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
      ? "User Management"
      : activePage === "pendingUsers"
      ? "Pending User Requests"
      : activePage === "approvedUsers"
      ? "Approved Users"
      : activePage === "candidates"
      ? "Candidate Management"
      : activePage === "pending"
      ? "Pending Candidates"
      : activePage === "approved"
      ? "Approved Candidates"
      : "Election Dashboard";

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
      name?.charAt(0)?.toUpperCase() ||
      "?"
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

            <small>
              ADMIN PANEL
            </small>
          </div>

        </div>

        <div className="sidebar-menu">

          <p className="menu-title">
            MAIN MENU
          </p>

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
            <span>📊</span>
            Dashboard
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
            <span>👥</span>
            Candidates
            <b>{candidates.length}</b>
          </button>

          <button
            className={
              activePage === "users"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() =>
              setActivePage("users")
            }
          >
            <span>👤</span>
            Users

            {pendingUsers.length > 0 && (
              <b className="pending-count">
                {pendingUsers.length}
              </b>
            )}
          </button>

          <button
            className={
              activePage === "pendingUsers"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() =>
              setActivePage("pendingUsers")
            }
          >
            <span>⏳</span>
            Pending Users

            {pendingUsers.length > 0 && (
              <b className="pending-count">
                {pendingUsers.length}
              </b>
            )}
          </button>

          <button
            className={
              activePage === "approvedUsers"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() =>
              setActivePage("approvedUsers")
            }
          >
            <span>✅</span>
            Approved Users
            <b>{approvedUsers.length}</b>
          </button>

          <p className="menu-title second">
            SYSTEM
          </p>

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
            <span>🔄</span>
            Refresh Data
          </button>

          <button
            className="menu-item logout-menu"
            onClick={handleLogout}
          >
            <span>🚪</span>
            Logout
          </button>

        </div>

        <div className="sidebar-bottom">

          <div className="security-box">

            <span>🔐</span>

            <div>

              <strong>
                System Secure
              </strong>

              <small>
                Admin access enabled
              </small>

            </div>

          </div>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="admin-main">

        <header className="admin-topbar">

          <div>

            <p className="breadcrumb">
              VoteHub / Admin
            </p>

            <h1>
              {pageTitle}
            </h1>

          </div>

          <div className="admin-profile">

            <div className="notification">
              🔔

              {pendingUsers.length +
                pendingCandidates.length >
                0 && (
                <span>
                  {pendingUsers.length +
                    pendingCandidates.length}
                </span>
              )}

            </div>

            <div className="profile-avatar">
              {getInitial(user?.name)}
            </div>

            <div className="profile-text">

              <strong>
                {user?.name || "Administrator"}
              </strong>

              <small>
                Administrator
              </small>

            </div>

          </div>

        </header>

        {message && (
          <div className="admin-message">

            <span>ℹ️</span>

            {message}

            <button
              onClick={() =>
                setMessage("")
              }
            >
              ×
            </button>

          </div>
        )}{/* ================= DASHBOARD ================= */}

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
                  Manage users, candidates,
                  approval requests and
                  election activity.
                </p>

              </div>

              <div className="banner-icon">
                🗳️
              </div>

            </div>

            {/* ================= STATS ================= */}

            <div className="stats-grid">

              <div className="stat-card blue">

                <div className="stat-icon">
                  👥
                </div>

                <div>
                  <span>Total Users</span>

                  <strong>
                    {users.length}
                  </strong>

                  <small>
                    Registered users
                  </small>
                </div>

              </div>


              <div className="stat-card orange">

                <div className="stat-icon">
                  ⏳
                </div>

                <div>
                  <span>Pending Users</span>

                  <strong>
                    {pendingUsers.length}
                  </strong>

                  <small>
                    Need admin approval
                  </small>
                </div>

              </div>


              <div className="stat-card green">

                <div className="stat-icon">
                  ✓
                </div>

                <div>
                  <span>Approved Users</span>

                  <strong>
                    {approvedUsers.length}
                  </strong>

                  <small>
                    Allowed to vote
                  </small>
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

                  <small>
                    Votes recorded
                  </small>
                </div>

              </div>

            </div>


            {/* ================= QUICK ACTIONS ================= */}

            <div className="section-heading">

              <div>

                <h2>
                  Quick Actions
                </h2>

                <p>
                  Manage users and candidates
                  easily.
                </p>

              </div>

            </div>


            <div className="quick-grid">

              <button
                className="quick-card"
                onClick={() =>
                  setActivePage("pendingUsers")
                }
              >

                <div className="quick-icon orange-bg">
                  ⏳
                </div>

                <div>

                  <strong>
                    Pending User Requests
                  </strong>

                  <span>
                    {pendingUsers.length} users
                    waiting for approval
                  </span>

                </div>

                <b>
                  →
                </b>

              </button>


              <button
                className="quick-card"
                onClick={() =>
                  setActivePage("candidates")
                }
              >

                <div className="quick-icon blue-bg">
                  👥
                </div>

                <div>

                  <strong>
                    Candidate Management
                  </strong>

                  <span>
                    {candidates.length}
                    {" "}candidates
                  </span>

                </div>

                <b>
                  →
                </b>

              </button>

            </div>


            {/* ================= PENDING USER PREVIEW ================= */}

            <div className="admin-section">

              <div className="section-heading">

                <div>

                  <h2>
                    Pending User Requests
                  </h2>

                  <p>
                    New users waiting for
                    admin approval.
                  </p>

                </div>

                <button
                  className="refresh-btn"
                  onClick={() =>
                    setActivePage(
                      "pendingUsers"
                    )
                  }
                >
                  View All →
                </button>

              </div>


              {pendingUsers.length === 0 ? (

                <div className="empty-state">

                  <div>
                    ✅
                  </div>

                  <h3>
                    No Pending Users
                  </h3>

                  <p>
                    All users have been
                    reviewed.
                  </p>

                </div>

              ) : (

                <div className="modern-table">

                  <div className="modern-table-head">

                    <span>
                      User
                    </span>

                    <span>
                      Email
                    </span>

                    <span>
                      Status
                    </span>

                    <span>
                      Action
                    </span>

                  </div>


                  {pendingUsers
                    .slice(0, 5)
                    .map((item) => (

                      <div
                        className="modern-table-row"
                        key={item._id}
                      >

                        <div className="candidate-info">

                          <div className="candidate-avatar large">
                            {getInitial(
                              item.name
                            )}
                          </div>

                          <div>

                            <strong>
                              {item.name}
                            </strong>

                            <small>
                              ID:{" "}
                              {item._id?.slice(-6)}
                            </small>

                          </div>

                        </div>


                        <span>
                          {item.email}
                        </span>


                        <span className="status pending">
                          • Pending
                        </span>


                        <div className="action-buttons">

                          <button
                            className="approve-btn"
                            onClick={() =>
                              approveUser(
                                item._id
                              )
                            }
                          >
                            ✓ Approve
                          </button>


                          <button
                            className="reject-btn"
                            onClick={() =>
                              rejectUser(
                                item._id
                              )
                            }
                          >
                            ✕ Reject
                          </button>

                        </div>

                      </div>

                    ))}

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

                <p>
                  Manage registered users and
                  their approval status.
                </p>

              </div>


              <button
                className="refresh-btn"
                onClick={fetchUsers}
              >
                🔄 Refresh
              </button>

            </div>


            {/* ================= USER COUNTS ================= */}

            <div className="stats-grid">

              <div className="stat-card blue">

                <div className="stat-icon">
                  👥
                </div>

                <div>

                  <span>
                    Total Users
                  </span>

                  <strong>
                    {users.length}
                  </strong>

                </div>

              </div>


              <div className="stat-card orange">

                <div className="stat-icon">
                  ⏳
                </div>

                <div>

                  <span>
                    Pending
                  </span>

                  <strong>
                    {pendingUsers.length}
                  </strong>

                </div>

              </div>


              <div className="stat-card green">

                <div className="stat-icon">
                  ✅
                </div>

                <div>

                  <span>
                    Approved
                  </span>

                  <strong>
                    {approvedUsers.length}
                  </strong>

                </div>

              </div>

            </div>


            {/* ================= USER TABLE ================= */}

            <div className="modern-table">

              <div className="modern-table-head">

                <span>
                  User
                </span>

                <span>
                  Email
                </span>

                <span>
                  Role
                </span>

                <span>
                  Status
                </span>

                <span>
                  Action
                </span>

              </div>


              {usersLoading ? (

                <div className="loading-box">
                  Loading users...
                </div>

              ) : users.length === 0 ? (

                <div className="empty-state">

                  <div>
                    👤
                  </div>

                  <h3>
                    No Users Found
                  </h3>

                  <p>
                    No registered users available.
                  </p>

                </div>

              ) : (

                users
                  .filter(
                    (item) =>
                      item.role !== "admin"
                  )
                  .map((item) => (

                    <div
                      className="modern-table-row"
                      key={item._id}
                    >

                      {/* USER */}

                      <div className="candidate-info">

                        <div className="candidate-avatar large">
                          {getInitial(
                            item.name
                          )}
                        </div>

                        <div>

                          <strong>
                            {item.name}
                          </strong>

                          <small>
                            ID:{" "}
                            {item._id?.slice(-6)}
                          </small>

                        </div>

                      </div>


                      {/* EMAIL */}

                      <span>
                        {item.email}
                      </span>


                      {/* ROLE */}

                      <span className="party-pill">
                        {item.role || "user"}
                      </span>


                      {/* STATUS */}

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


                      {/* ACTION */}

                      <div className="action-buttons">

                        {item.isApproved !== true && (

                          <button
                            className="approve-btn"
                            onClick={() =>
                              approveUser(
                                item._id
                              )
                            }
                          >
                            ✓ Approve
                          </button>

                        )}


                        {item.isApproved !== true && (

                          <button
                            className="reject-btn"
                            onClick={() =>
                              rejectUser(
                                item._id
                              )
                            }
                          >
                            ✕ Reject
                          </button>

                        )}

                      </div>

                    </div>

                  ))

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
                  allowing them to vote.
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

                <span>
                  User
                </span>

                <span>
                  Email
                </span>

                <span>
                  Status
                </span>

                <span>
                  Action
                </span>

              </div>


              {usersLoading ? (

                <div className="loading-box">
                  Loading users...
                </div>

              ) : pendingUsers.length === 0 ? (

                <div className="empty-state">

                  <div>
                    🎉
                  </div>

                  <h3>
                    No Pending Requests
                  </h3>

                  <p>
                    All user requests have
                    been reviewed.
                  </p>

                </div>

              ) : (

                pendingUsers.map((item) => (

                  <div
                    className="modern-table-row"
                    key={item._id}
                  >

                    <div className="candidate-info">

                      <div className="candidate-avatar large">
                        {getInitial(
                          item.name
                        )}
                      </div>

                      <div>

                        <strong>
                          {item.name}
                        </strong>

                        <small>
                          ID:{" "}
                          {item._id?.slice(-6)}
                        </small>

                      </div>

                    </div>


                    <span>
                      {item.email}
                    </span>


                    <span className="status pending">
                      • Pending
                    </span>


                    <div className="action-buttons">

                      <button
                        className="approve-btn"
                        onClick={() =>
                          approveUser(
                            item._id
                          )
                        }
                      >
                        ✓ Approve
                      </button>


                      <button
                        className="reject-btn"
                        onClick={() =>
                          rejectUser(
                            item._id
                          )
                        }
                      >
                        ✕ Reject
                      </button>

                    </div>

                  </div>

                ))

              )}

            </div>

          </section>
        )}{/* ================= APPROVED USERS ================= */}

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

                <p>
                  Users who are approved and
                  allowed to vote.
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

                <span>
                  User
                </span>

                <span>
                  Email
                </span>

                <span>
                  Role
                </span>

                <span>
                  Status
                </span>

                <span>
                  Action
                </span>

              </div>


              {approvedUsers.length === 0 ? (

                <div className="empty-state">

                  <div>
                    👤
                  </div>

                  <h3>
                    No Approved Users
                  </h3>

                  <p>
                    No user has been approved yet.
                  </p>

                </div>

              ) : (

                approvedUsers.map((item) => (

                  <div
                    className="modern-table-row"
                    key={item._id}
                  >

                    <div className="candidate-info">

                      <div className="candidate-avatar large">
                        {getInitial(
                          item.name
                        )}
                      </div>

                      <div>

                        <strong>
                          {item.name}
                        </strong>

                        <small>
                          ID:{" "}
                          {item._id?.slice(-6)}
                        </small>

                      </div>

                    </div>


                    <span>
                      {item.email}
                    </span>


                    <span className="party-pill">
                      {item.role || "user"}
                    </span>


                    <span className="status approved">
                      ✓ Approved
                    </span>


                    <div className="action-buttons">

                      <button
                        className="reject-btn"
                        onClick={() =>
                          rejectUser(
                            item._id
                          )
                        }
                      >
                        ✕ Reject
                      </button>

                    </div>

                  </div>

                ))

              )}

            </div>

          </section>
        )}


        {/* ================= CANDIDATES ================= */}

        {(activePage === "candidates" ||
          activePage === "pending" ||
          activePage === "approved") && (

          <section>

            <div className="page-header">

              <div>

                <span className="page-label">
                  CANDIDATE MANAGEMENT
                </span>

                <h2>
                  {activePage === "pending"
                    ? "Pending Requests"
                    : activePage === "approved"
                    ? "Approved Candidates"
                    : "All Candidates"}
                </h2>

                <p>
                  Review and manage election
                  candidates.
                </p>

              </div>


              <button
                className="refresh-btn"
                onClick={async () => {
                  await fetchCandidates();
                  await fetchUsers();
                }}
              >
                🔄 Refresh
              </button>

            </div>


            <div className="candidate-toolbar">

              <div className="search-box">

                🔍

                <input
                  type="text"
                  placeholder="Search candidate or party..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

              </div>


              <div className="toolbar-count">

                {filteredCandidates.filter(
                  (candidate) => {

                    if (
                      activePage === "pending"
                    ) {
                      return (
                        candidate.status ===
                        "pending"
                      );
                    }

                    if (
                      activePage === "approved"
                    ) {
                      return (
                        candidate.status ===
                        "approved"
                      );
                    }

                    return true;
                  }
                ).length}

                {" "}Candidates

              </div>

            </div>


            <div className="modern-table">

              <div className="modern-table-head">

                <span>
                  Candidate
                </span>

                <span>
                  Party
                </span>

                <span>
                  Votes
                </span>

                <span>
                  Status
                </span>

                <span>
                  Action
                </span>

              </div>


              {loading ? (

                <div className="loading-box">
                  Loading candidates...
                </div>

              ) : (

                filteredCandidates
                  .filter((candidate) => {

                    if (
                      activePage === "pending"
                    ) {
                      return (
                        candidate.status ===
                        "pending"
                      );
                    }

                    if (
                      activePage === "approved"
                    ) {
                      return (
                        candidate.status ===
                        "approved"
                      );
                    }

                    return true;
                  })
                  .map((candidate) => (

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


                      <span className="party-pill">
                        {candidate.party}
                      </span>


                      <strong>
                        {candidate.votes || 0}
                      </strong>


                      {candidate.status ===
                      "approved" ? (

                        <span className="status approved">
                          ✓ Approved
                        </span>

                      ) : candidate.status ===
                        "rejected" ? (

                        <span className="status rejected">
                          ✕ Rejected
                        </span>

                      ) : (

                        <span className="status pending">
                          • Pending
                        </span>

                      )}


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

                      </div>

                    </div>

                  ))

              )}


              {!loading &&
                filteredCandidates.filter(
                  (candidate) => {

                    if (
                      activePage === "pending"
                    ) {
                      return (
                        candidate.status ===
                        "pending"
                      );
                    }

                    if (
                      activePage === "approved"
                    ) {
                      return (
                        candidate.status ===
                        "approved"
                      );
                    }

                    return true;
                  }
                ).length === 0 && (

                  <div className="empty-state">

                    <div>
                      🗳️
                    </div>

                    <h3>
                      No candidates found
                    </h3>

                    <p>
                      There are no candidates
                      in this section.
                    </p>

                  </div>

                )}

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default Admin;