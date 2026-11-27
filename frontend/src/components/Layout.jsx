


import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import "./Layout.css";

const links = [
  ["/dashboard", "Dashboard", "🏠"],
  ["/employees", "Employees", "👥"],
  ["/attendance", "Attendance", "🗓️"],
  ["/leaves", "Leave Management", "📝"],
  ["/reports", "Reports", "📊"],
];

export default function Layout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // useEffect(() => {
  //   apiFetch("check_session.php").then(({ data }) => setUser(data.user));
  // }, []);

const logout = async () => {
  if (!window.confirm("Are you sure you want to logout?")) return;
  try {
    // await apiFetch("logout.php", { method: "POST" });
    const { ok, data } = await apiFetch("logout.php", { method: "POST" });

    if (ok && data.success) {
      navigate("/", { replace: true });
    } else {
      alert(data.message || "Logout failed. Please try again.");
    }
  } catch (err) {
    console.error("Logout request failed:", err);
  }
  // navigate("/", { replace: true });
};

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="nav-brand">
          <div className="logo-box">EMS</div>
          <span>Employee Management</span>
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          {links.map(([to, label, icon]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              <span>{icon}</span> {label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-user">
          <span className="user-chip">
            {user ? `${user.userId} (${user.role})` : "..."}
          </span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="content">
        <Outlet />
      </main>

      <footer className="footer">© 2026 Employee Management System</footer>
    </div>
  );
}