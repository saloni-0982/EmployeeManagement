import { useEffect, useState } from "react";
import { apiFetch } from "../api";

const empty = {
  emp_code: "", name: "", email: "", phone: "",
  department: "", designation: "", joining_date: "", status: "active",
};

export default function Employees() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(null);   // null = modal closed
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (q) => {
    const { data } = await apiFetch(`employees.php?search=${encodeURIComponent(q)}`);
    setList(data.employees || []);
    setLoading(false);
  };

  // reload 300ms after the user stops typing
  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => { setForm(empty); setEditId(null); setError(""); };
  const openEdit = (emp) => {
    setForm({ ...emp, joining_date: emp.joining_date || "" });
    setEditId(emp.id);
    setError("");
  };
  const closeForm = () => setForm(null);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setError("");
    const body = editId ? { ...form, id: editId } : form;
    const { ok, data } = await apiFetch("employees.php", {
      method: editId ? "PUT" : "POST",
      body: JSON.stringify(body),
    });
    if (!ok) { setError(data.message || "Could not save"); return; }
    closeForm();
    load(search);
  };

  const remove = async (emp) => {
    if (!window.confirm(`Delete ${emp.name}? Their attendance and leave records will also be deleted.`)) return;
    const { ok, data } = await apiFetch(`employees.php?id=${emp.id}`, { method: "DELETE" });
    if (!ok) { alert(data.message || "Could not delete"); return; }
    load(search);
  };

  return (
    <>
      <div className="page-head">
        <h1>Employee Management</h1>
        <button className="btn-primary" onClick={openAdd}>+ Add Employee</button>
      </div>

      <input
        className="search-box"
        placeholder="Search by name, employee ID or department..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Emp ID</th><th>Name</th><th>Department</th><th>Designation</th>
              <th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="8" className="empty">Loading...</td></tr>}
            {!loading && list.length === 0 && (
              <tr><td colSpan="8" className="empty">No employees found.</td></tr>
            )}
            {list.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.emp_code}</td>
                <td>{emp.name}</td>
                <td>{emp.department}</td>
                <td>{emp.designation}</td>
                <td>{emp.phone}</td>
                <td>{emp.joining_date}</td>
                <td><span className={`badge ${emp.status}`}>{emp.status}</span></td>
                <td>
                  <button className="btn-sm edit" onClick={() => openEdit(emp)}>Edit</button>
                  <button className="btn-sm del" onClick={() => remove(emp)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="modal-bg" onClick={closeForm}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h3>{editId ? "Edit Employee" : "Add Employee"}</h3>
            {error && <div className="form-error">{error}</div>}

            <div className="form-grid">
              <label>Employee ID *
                <input name="emp_code" value={form.emp_code} onChange={change} required />
              </label>
              <label>Name *
                <input name="name" value={form.name} onChange={change} required />
              </label>
              <label>Email
                <input type="email" name="email" value={form.email || ""} onChange={change} />
              </label>
              <label>Phone
                <input name="phone" value={form.phone || ""} onChange={change} />
              </label>
              <label>Department
                <input name="department" value={form.department || ""} onChange={change} />
              </label>
              <label>Designation
                <input name="designation" value={form.designation || ""} onChange={change} />
              </label>
              <label>Joining Date
                <input type="date" name="joining_date" value={form.joining_date} onChange={change} />
              </label>
              <label>Status
                <select name="status" value={form.status} onChange={change}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={closeForm}>Cancel</button>
              <button type="submit" className="btn-primary">{editId ? "Update" : "Save"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}