// import { useEffect, useState } from "react";
// import { NavLink, Outlet, useNavigate } from "react-router-dom";
// import { apiFetch } from "../api";
// import "./Layout.css";

// const links = [
//   ["/dashboard", "Dashboard", "🏠"],
//   ["/employees", "Employee Management", "👥"],
//   ["/attendance", "Attendance", "🗓️"],
//   ["/leaves", "Leave Management", "📝"],
//   ["/reports", "Reports", "📊"],
// ];

// export default function Layout() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     apiFetch("check_session.php").then(({ data }) => setUser(data.user));
//   }, []);

//   const logout = async () => {
//     await apiFetch("logout.php", { method: "POST" });
//     navigate("/", { replace: true });
//   };

//   return (
//     <div className="app-shell">
//       <aside className="sidebar">
//         <div className="sidebar-logo">
//           <div className="logo-box">EMS</div>
//           <span>Employee Management</span>
//         </div>

//         <nav>
//           {links.map(([to, label, icon]) => (
//             <NavLink
//               key={to}
//               to={to}
//               className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
//             >
//               <span className="nav-icon">{icon}</span>
//               {label}
//             </NavLink>
//           ))}
//         </nav>

//         <div className="sidebar-footer">© 2026 EMS</div>
//       </aside>

//       <div className="main-area">
//         <header className="topbar">
//           <h3>Employee and Attendance Management System</h3>
//           <div className="topbar-right">
//             <span className="user-chip">
//               {user ? `${user.userId} (${user.role})` : "..."}
//             </span>
//             <button className="logout-btn" onClick={logout}>Logout</button>
//           </div>
//         </header>

//         <main className="content"><Outlet /></main>
//       </div>
//     </div>
//   );
// }



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
    await apiFetch("logout.php", { method: "POST" });
    navigate("/", { replace: true });
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