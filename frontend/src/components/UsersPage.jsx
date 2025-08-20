import { Link } from "react-router-dom";
import { useState } from "react";
import UsersTable from "../components/UsersTable";

const API_BASE = "http://localhost:5000/api"; // adjust if different

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg,#0b1220)",
    padding: 24,
  },
  wrap: {
    width: "min(100%, 980px)",
    display: "grid",
    gap: 16,
  },
  card: {
    background: "#fff",
    color: "#111",
    borderRadius: 16,
    boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
    padding: 24,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { margin: 0, fontSize: 22 },
  actions: { display: "flex", gap: 10 },
  btnLink: {
    padding: "8px 14px",
    borderRadius: 10,
    background: "#3B82F6",
    color: "#fff",
    fontWeight: 600,
    textDecoration: "none",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: 12,
  },
  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    outline: "none",
  },
  submit: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    background: "#10B981",
    color: "#fff",
    fontWeight: 700,
  },
  error: { color: "tomato", marginTop: 8 },
  success: { color: "#059669", marginTop: 8 },
};

export default function UsersPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // used to remount UsersTable

  async function handleAddUser(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!username.trim() || !email.trim()) {
      setErr("Username and email are required.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }), // adjust fields if your API expects different keys
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status} ${t}`);
      }
      // Clear form + show success
      setUsername("");
      setEmail("");
      setOk("User created successfully.");
      // Remount UsersTable to refetch
      setRefreshKey((k) => k + 1);
    } catch (e) {
      setErr(e.message || "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        {/* Header / Nav (like popup action bar) */}
        <div style={{ ...styles.card, paddingBottom: 16 }}>
          <div style={styles.header}>
            <h2 style={styles.title}>Users</h2>
            <div style={styles.actions}>
              <Link to="/" style={styles.btnLink}>Home</Link>
              <Link to="/posts" style={styles.btnLink}>All Posts</Link>
            </div>
          </div>
        </div>

        {/* Add User card */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Add User</h3>
          <form onSubmit={handleAddUser} style={styles.formRow}>
            <input
              style={styles.input}
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              style={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button style={styles.submit} disabled={submitting}>
              {submitting ? "Adding..." : "Add"}
            </button>
          </form>
          {err && <div style={styles.error}>{err}</div>}
          {ok && <div style={styles.success}>{ok}</div>}
        </div>

        {/* Users table card (same style as your popup contents) */}
        <div style={styles.card}>
          <UsersTable key={refreshKey} />
        </div>
      </div>
    </div>
  );
}
