import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// today's date as YYYY-MM-DD in the user's local time zone
const today = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
const toStr = (d) => {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
};

const toDate = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const options = [
  ["present", "Present"],
  ["absent", "Absent"],
  ["leave", "Leave"],
];

export default function Attendance() {
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState([]);
  const [marks, setMarks] = useState({});   // { employeeId: "present" | "absent" | "leave" }
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);     // { type: "ok" | "err", text }

  useEffect(() => {
    setLoading(true);
    setMsg(null);
    apiFetch(`attendance.php?date=${date}`).then(({ data }) => {
      const list = data.records || [];
      setRows(list);
      const m = {};
      list.forEach((r) => { if (r.status) m[r.id] = r.status; });
      setMarks(m);
      setLoading(false);
    });
  }, [date]);

  const mark = (id, status) => setMarks({ ...marks, [id]: status });

  const markAll = (status) => {
    const m = {};
    rows.forEach((r) => { m[r.id] = status; });
    setMarks(m);
  };

  const save = async () => {
    const records = Object.entries(marks).map(([employee_id, status]) => ({
      employee_id: Number(employee_id),
      status,
    }));
    if (records.length === 0) {
      setMsg({ type: "err", text: "Mark at least one employee before saving." });
      return;
    }
    const { ok, data } = await apiFetch("attendance.php", {
      method: "POST",
      body: JSON.stringify({ date, records }),
    });
    setMsg(ok
      ? { type: "ok", text: `Attendance saved for ${records.length} employee(s).` }
      : { type: "err", text: data.message || "Could not save attendance" });
  };

  const count = (s) => Object.values(marks).filter((v) => v === s).length;
  const unmarked = rows.length - Object.keys(marks).length;

  const q = search.toLowerCase();
  const shown = rows.filter(
    (r) => r.name.toLowerCase().includes(q) || r.emp_code.toLowerCase().includes(q)
  );

  return (
    <>
      <div className="page-head">
        <h1>Attendance Management</h1>
        <input
          type="date"
          className="date-input"
          value={date}
          max={today()}
          onChange={(e) => e.target.value && setDate(e.target.value)}
        />

            {/* <DatePicker
            selected={toDate(date)}
            onChange={(d) => d && setDate(toStr(d))}
            dateFormat="dd-MM-yyyy"
            maxDate={new Date()}
            popperPlacement="bottom-end"
            className="date-input"
            /> */}
      </div>

      <div className="att-summary">
        <span className="badge active">Present: {count("present")}</span>
        <span className="badge inactive">Absent: {count("absent")}</span>
        <span className="badge leave">Leave: {count("leave")}</span>
        <span className="badge pending">Not marked: {unmarked}</span>
      </div>

      <div className="att-toolbar">
        <input
          className="search-box"
          style={{ marginBottom: 0 }}
          placeholder="Search by name or employee ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-cancel" onClick={() => markAll("present")}>All Present</button>
        <button className="btn-primary" onClick={save}>Save Attendance</button>
      </div>

      {msg && <div className={msg.type === "ok" ? "form-ok" : "form-error"}>{msg.text}</div>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Emp ID</th><th>Name</th><th>Department</th><th>Attendance</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="4" className="empty">Loading...</td></tr>}
            {!loading && shown.length === 0 && (
              <tr><td colSpan="4" className="empty">No active employees found.</td></tr>
            )}
            {shown.map((r) => (
              <tr key={r.id}>
                <td>{r.emp_code}</td>
                <td>{r.name}</td>
                <td>{r.department}</td>
                <td>
                  <div className="radio-group">
                    {options.map(([value, label]) => (
                      <label key={value} className={`radio-pill ${value} ${marks[r.id] === value ? "on" : ""}`}>
                        <input
                          type="radio"
                          name={`att-${r.id}`}
                          checked={marks[r.id] === value}
                          onChange={() => mark(r.id, value)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}