import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { apiFetch } from "../api";

const toStr = (d) => {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
};
const fmt = (s) => {                       // 2026-11-27 -> 27-11-26
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}-${m}-${y.slice(2)}`;
};
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000) + 1;

const types = ["Casual", "Sick", "Earned", "Other"];
const tabs = [["", "All"], ["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"]];
const emptyForm = { employee_id: "", leave_type: "Casual", from: new Date(), to: new Date(), reason: "" };

export default function Leaves() {
  const [list, setList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await apiFetch(`leaves.php?status=${filter}`);
    setList(data.leaves || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  useEffect(() => {
    apiFetch("employees.php").then(({ data }) =>
      setEmployees((data.employees || []).filter((e) => e.status === "active"))
    );
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const { ok, data } = await apiFetch("leaves.php", {
      method: "POST",
      body: JSON.stringify({
        employee_id: Number(form.employee_id),
        leave_type: form.leave_type,
        from_date: toStr(form.from),
        to_date: toStr(form.to),
        reason: form.reason,
      }),
    });
    if (!ok) { setError(data.message || "Could not submit"); return; }
    setForm(null);
    load();
  };

  const decide = async (leave, status) => {
    const word = status === "approved" ? "Approve" : "Reject";
    if (!window.confirm(`${word} leave for ${leave.name}?`)) return;
    const { ok, data } = await apiFetch("leaves.php", {
      method: "PUT",
      body: JSON.stringify({ id: leave.id, status }),
    });
    if (!ok) alert(data.message || "Action failed");
    load();
  };

  const remove = async (leave) => {
    if (!window.confirm("Delete this pending request?")) return;
    const { ok, data } = await apiFetch(`leaves.php?id=${leave.id}`, { method: "DELETE" });
    if (!ok) alert(data.message || "Could not delete");
    load();
  };

  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <>
      <div className="page-head">
        <h1>Leave Management</h1>
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setError(""); }}>
          + New Leave Request
        </button>
      </div>

      <div className="tabs">
        {tabs.map(([value, label]) => (
          <button key={label} className={filter === value ? "tab on" : "tab"} onClick={() => setFilter(value)}>
            {label}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Emp ID</th><th>Name</th><th>Type</th><th>From</th><th>To</th>
              <th>Days</th><th>Reason</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="9" className="empty">Loading...</td></tr>}
            {!loading && list.length === 0 && <tr><td colSpan="9" className="empty">No leave requests found.</td></tr>}
            {list.map((l) => (
              <tr key={l.id}>
                <td>{l.emp_code}</td>
                <td>{l.name}</td>
                <td>{l.leave_type}</td>
                <td>{fmt(l.from_date)}</td>
                <td>{fmt(l.to_date)}</td>
                <td>{daysBetween(l.from_date, l.to_date)}</td>
                <td>{l.reason}</td>
                <td><span className={`badge ${l.status}`}>{l.status}</span></td>
                <td>
                  {l.status === "pending" && (
                    <>
                      <button className="btn-sm ok" onClick={() => decide(l, "approved")}>Approve</button>
                      <button className="btn-sm del" onClick={() => decide(l, "rejected")}>Reject</button>
                      <button className="btn-sm gray" onClick={() => remove(l)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="modal-bg" onClick={() => setForm(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
            <h3>New Leave Request</h3>
            {error && <div className="form-error">{error}</div>}

            <div className="form-grid">
              <label>Employee *
                <select value={form.employee_id} onChange={(e) => set("employee_id", e.target.value)} required>
                  <option value="">-- Select --</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.emp_code} - {e.name}</option>
                  ))}
                </select>
              </label>
              <label>Leave Type *
                <select value={form.leave_type} onChange={(e) => set("leave_type", e.target.value)}>
                  {types.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label>From Date *
                <DatePicker
                  selected={form.from}
                  onChange={(d) => d && setForm({ ...form, from: d, to: d > form.to ? d : form.to })}
                  dateFormat="dd-MM-yy"
                />
              </label>
              <label>To Date *
                <DatePicker
                  selected={form.to}
                  onChange={(d) => d && set("to", d)}
                  minDate={form.from}
                  dateFormat="dd-MM-yy"
                />
              </label>
              <label className="span2">Reason
                <textarea rows="3" maxLength="255" value={form.reason}
                  onChange={(e) => set("reason", e.target.value)} />
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setForm(null)}>Cancel</button>
              <button type="submit" className="btn-primary">Submit</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}