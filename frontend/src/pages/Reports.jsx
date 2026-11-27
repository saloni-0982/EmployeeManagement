import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { apiFetch } from "../api";

ChartJS.register(ArcElement, Tooltip, Legend);

const toStr = (d) => {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
};
const fmt = (s) => {                         // 2026-11-27 -> 27-11-26
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}-${m}-${y.slice(2)}`;
};
const monthStart = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); };
const pct = (p, total) => (total === 0 ? "-" : `${Math.round((p / total) * 100)}%`);

export default function Reports() {
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(new Date());
  const [empId, setEmpId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [data, setData] = useState(null);
  const [view, setView] = useState("summary");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setError("");
    setLoading(true);
    const { ok, data } = await apiFetch(
      `reports.php?from=${toStr(from)}&to=${toStr(to)}&employee_id=${empId}`
    );
    setLoading(false);
    if (!ok) { setError(data.message || "Could not generate report"); setData(null); return; }
    setData(data);
  };

  useEffect(() => {
    apiFetch("employees.php").then(({ data }) =>
      setEmployees((data.employees || []).filter((e) => e.status === "active"))
    );
    generate();
  }, []);

  const summary = data?.summary || [];
  const records = data?.records || [];
  const totals = summary.reduce(
    (t, r) => ({
      present: t.present + Number(r.present_days),
      absent: t.absent + Number(r.absent_days),
      leave: t.leave + Number(r.leave_days),
    }),
    { present: 0, absent: 0, leave: 0 }
  );
  const grand = totals.present + totals.absent + totals.leave;

  const downloadCsv = () => {
    const lines = [["Emp ID", "Name", "Department", "Present", "Absent", "Leave", "Attendance %"]];
    summary.forEach((r) => {
      const t = Number(r.present_days) + Number(r.absent_days) + Number(r.leave_days);
      lines.push([r.emp_code, r.name, r.department, r.present_days, r.absent_days, r.leave_days, pct(Number(r.present_days), t)]);
    });
    const csv = lines.map((row) => row.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${toStr(from)}_to_${toStr(to)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartData = {
    labels: ["Present", "Absent", "Leave"],
    datasets: [{
      data: [totals.present, totals.absent, totals.leave],
      backgroundColor: ["#16a34a", "#ef4444", "#f59e0b"],
    }],
  };

  return (
    <>
      <div className="page-head no-print">
        <h1>Reports</h1>
      </div>

      {/* Filters */}
      <div className="report-filters no-print">
        <label>From
          <DatePicker selected={from} onChange={(d) => d && setFrom(d)} dateFormat="dd-MM-yy"
            maxDate={new Date()} popperPlacement="bottom-start" />
        </label>
        <label>To
          <DatePicker selected={to} onChange={(d) => d && setTo(d)} dateFormat="dd-MM-yy"
            minDate={from} maxDate={new Date()} popperPlacement="bottom-start" />
        </label>
        <label>Employee
          <select value={empId} onChange={(e) => setEmpId(e.target.value)}>
            <option value="">All employees</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.emp_code} - {e.name}</option>)}
          </select>
        </label>
        <button className="btn-primary" onClick={generate}>Generate</button>
      </div>

      {error && <div className="form-error no-print">{error}</div>}
      {loading && <p>Loading...</p>}

      {data && !loading && (
        <>
          {/* Shown only when printing */}
          <div className="print-only">
            <h2>Employee Attendance Report</h2>
            <p>Period: {fmt(toStr(from))} to {fmt(toStr(to))}</p>
          </div>

          <div className="report-top">
            <div className="chart-card">
              {grand === 0 ? (
                <p className="empty">No attendance marked in this period.</p>
              ) : (
                <Doughnut data={chartData} options={{ plugins: { legend: { position: "bottom" } } }} />
              )}
            </div>
            <div className="att-summary report-totals">
              <span className="badge active">Present: {totals.present}</span>
              <span className="badge inactive">Absent: {totals.absent}</span>
              <span className="badge leave">Leave: {totals.leave}</span>
              <span className="badge pending">Overall attendance: {pct(totals.present, grand)}</span>
            </div>
          </div>

          <div className="report-bar no-print">
            <div className="tabs" style={{ marginBottom: 0 }}>
              <button className={view === "summary" ? "tab on" : "tab"} onClick={() => setView("summary")}>Summary</button>
              <button className={view === "daily" ? "tab on" : "tab"} onClick={() => setView("daily")}>Daily records</button>
            </div>
            <div>
              <button className="btn-cancel" onClick={downloadCsv}>Download CSV</button>{" "}
              <button className="btn-primary" onClick={() => window.print()}>Print</button>
            </div>
          </div>

          <div className="table-wrap">
            {view === "summary" ? (
              <table className="data-table">
                <thead>
                  <tr><th>Emp ID</th><th>Name</th><th>Department</th><th>Present</th><th>Absent</th><th>Leave</th><th>Attendance %</th></tr>
                </thead>
                <tbody>
                  {summary.length === 0 && <tr><td colSpan="7" className="empty">No employees found.</td></tr>}
                  {summary.map((r) => {
                    const t = Number(r.present_days) + Number(r.absent_days) + Number(r.leave_days);
                    return (
                      <tr key={r.id}>
                        <td>{r.emp_code}</td><td>{r.name}</td><td>{r.department}</td>
                        <td>{r.present_days}</td><td>{r.absent_days}</td><td>{r.leave_days}</td>
                        <td>{pct(Number(r.present_days), t)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Date</th><th>Emp ID</th><th>Name</th><th>Department</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {records.length === 0 && <tr><td colSpan="5" className="empty">No records in this period.</td></tr>}
                  {records.map((r, i) => (
                    <tr key={i}>
                      <td>{fmt(r.attendance_date)}</td><td>{r.emp_code}</td><td>{r.name}</td><td>{r.department}</td>
                      <td>
                        <span className={`badge ${r.status === "present" ? "active" : r.status === "absent" ? "inactive" : "leave"}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </>
  );
}