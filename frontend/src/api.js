export const API = "http://localhost/EmployeeManage/backend/api";

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}/${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}