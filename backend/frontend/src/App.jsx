import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Results from "./pages/Results";
import Admin from "./pages/Admin";

import "./App.css";

function App() {
  const [page, setPage] = useState("login");

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      return null;
    }
  });

  // ================= USER ACCESS CHECK =================

  useEffect(() => {
    // No user → Login page
    if (!user) {
      setPage("login");
      return;
    }

    // Admin → Admin panel
    if (user.role === "admin") {
      setPage("admin");
      return;
    }

    // Pending or rejected user → Logout
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

    // Approved user → Dashboard
    setPage("dashboard");

  }, [user]);

  // ================= LOGIN =================

  const handleLogin = (loggedInUser, token) => {

    // Extra frontend security check
    if (
      loggedInUser.role !== "admin" &&
      (
        loggedInUser.isApproved !== true ||
        loggedInUser.rejected === true
      )
    ) {
      return;
    }

    // Save approved user/admin
    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    );

    localStorage.setItem("token", token);

    setUser(loggedInUser);

    if (loggedInUser.role === "admin") {
      setPage("admin");
    } else {
      setPage("dashboard");
    }
  };

  // ================= REGISTER =================

  const handleRegister = () => {
    setPage("login");
  };

  // ================= LOGOUT =================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setPage("login");
  };

  // ================= LOGIN PAGE =================

  if (!user && page === "login") {
    return (
      <Login
        onLogin={handleLogin}
        goRegister={() => setPage("register")}
      />
    );
  }

  // ================= REGISTER PAGE =================

  if (!user && page === "register") {
    return (
      <Register
        goLogin={() => setPage("login")}
        onRegister={handleRegister}
      />
    );
  }

  // ================= ADMIN =================

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

  // ================= RESULTS =================

  if (
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

  // ================= USER DASHBOARD =================

  if (
    user?.isApproved === true &&
    user?.rejected !== true
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

  // Fallback
  return (
    <Login
      onLogin={handleLogin}
      goRegister={() => setPage("register")}
    />
  );
}

export default App;