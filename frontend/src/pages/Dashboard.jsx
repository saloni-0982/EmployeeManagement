import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";

const modules = [
  ["/employees", "👥", "Employee Management", "Add, edit and view employees"],
  ["/attendance", "🗓️", "Attendance", "Mark daily attendance"],
  ["/leaves", "📝", "Leave Management", "Approve or reject leave requests"],
  ["/reports", "📊", "Reports", "Date-wise attendance reports"],
];

export default function Dashboard() {
  const [s, setS] = useState(null);

  useEffect(() => {
    apiFetch("dashboard_stats.php").then(({ data }) => setS(data));
  }, []);

  if (!s || !s.today) return <p>Loading...</p>;

  const cards = [
    ["Total Employees", s.totalEmployees],
    ["Present Today", s.today.present],
    ["Absent Today", s.today.absent],
    ["On Leave Today", s.today.leave],
    ["Pending Leave Requests", s.pendingLeaves],
  ];

  return (
    <>
      <h1>Dashboard</h1>
      <p style={{ color: "#64748b" }}>Here is today's overview.</p>

      <div className="stat-grid">
        {cards.map(([label, value]) => (
          <div className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <h3 className="quick-title">Quick Access</h3>
      <div className="quick-grid">
        {modules.map(([to, icon, title, desc]) => (
          <Link className="quick-card" to={to} key={to}>
            <div className="q-icon">{icon}</div>
            <h4>{title}</h4>
            <p>{desc}</p>
          </Link>
        ))}
      </div>
    </>
  );
}