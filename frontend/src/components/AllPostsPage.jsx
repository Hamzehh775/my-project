import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000/api"; // adjust if different

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg,#0b1220)",
    padding: 24,
  },
  card: {
    width: "min(100%, 980px)",
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
    marginBottom: 16,
  },
  title: { margin: 0, fontSize: 24 },
  actions: { display: "flex", gap: 10 },
  btnLink: {
    padding: "8px 14px",
    borderRadius: 10,
    background: "#3B82F6",
    color: "#fff",
    fontWeight: 600,
    textDecoration: "none",
  },
  list: { display: "grid", gap: 12, marginTop: 8 },
  postItem: {
    background: "#fff",
    border: "1px solid #eef1f6",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  },
  postTitle: { margin: "0 0 6px", fontSize: 18 },
  meta: { fontSize: 12, color: "#666" },
  error: { color: "tomato", marginTop: 8 },
};

export default function AllPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const res = await fetch(`${API_BASE}/posts`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e.message || "Failed to load posts");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>All Posts</h2>
          <div style={styles.actions}>
            <Link to="/" style={styles.btnLink}>Home</Link>
            <Link to="/users" style={styles.btnLink}>Users</Link>
          </div>
        </div>

        {loading && <p>Loading posts…</p>}
        {err && <p style={styles.error}>{err}</p>}

        {!loading && !err && (
          <ul style={styles.list}>
            {posts.map((p) => (
              <li key={p.id} style={styles.postItem}>
                <h3 style={styles.postTitle}>{p.title}</h3>
                <div>{p.content}</div>
                <div style={styles.meta}>Post #{p.id} • by user {p.user_id}</div>
              </li>
            ))}
            {posts.length === 0 && <p>No posts found.</p>}
          </ul>
        )}
      </div>
    </div>
  );
}
