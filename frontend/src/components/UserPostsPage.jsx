// src/components/UserPostsPage.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api"; // ✅ reuse your users API helper

// Posts service base (no /api prefix)
const POSTS_API = import.meta.env.VITE_POSTS_API ?? "http://localhost:4002/posts";

export default function UserPostsPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErr("");
        setNotFound(false);

        // 1) Check if user exists using your existing helper
        let list = [];
        try {
          list = await api.listUsers(); // usually /api/users/with-counts
        } catch (e) {
          throw new Error("Failed to load users");
        }

        const u =
          Array.isArray(list) ? list.find((x) => String(x.id) === String(id)) : null;

        if (!u) {
          if (!cancelled) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        if (!cancelled) setUser(u);

        // 2) Fetch this user's posts from the posts service
        const rp = await fetch(`${POSTS_API}/user/${encodeURIComponent(id)}`);
        if (!rp.ok) {
          if (rp.status === 404) {
            // Some backends 404 when no posts — normalize to empty list
            if (!cancelled) setPosts([]);
          } else {
            throw new Error(`Posts API error: HTTP ${rp.status}`);
          }
        } else {
          const raw = await rp.json();
          const list = Array.isArray(raw)
            ? raw
            : Array.isArray(raw.posts)
            ? raw.posts
            : [];
          if (!cancelled) setPosts(list);
        }
      } catch (e) {
        if (!cancelled) setErr(e.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {user ? `${user.username}'s Posts` : `User ${id} • Posts`}
          </h2>
          <div style={styles.actions}>
            <Link to="/" style={styles.btnLink}>Home</Link>
            <Link to="/users" style={styles.btnLink}>Users</Link>
            <Link to="/posts" style={styles.btnLink}>All Posts</Link>
          </div>
        </div>

        {loading && <p>Loading…</p>}
        {err && <p style={styles.error}>{err}</p>}
        {notFound && <p style={styles.notfound}>404 — User not found</p>}

        {!loading && !err && !notFound && (
          posts.length ? (
            <ul style={styles.list}>
              {posts.map((p) => (
                <li key={p.id} style={styles.postItem}>
                  <h3 style={styles.postTitle}>{p.title}</h3>
                  <div>{p.content}</div>
                  <div style={styles.meta}>Post #{p.id} • user {p.user_id}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No posts for this user.</p>
          )
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #0b1220)", padding: 24 },
  card: { width: "min(100%, 980px)", background: "#fff", color: "#111", borderRadius: 16, boxShadow: "0 12px 30px rgba(0,0,0,0.12)", padding: 24 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  title: { margin: 0, fontSize: 24 },
  actions: { display: "flex", gap: 10 },
  btnLink: { padding: "8px 14px", borderRadius: 10, background: "#3B82F6", color: "#fff", fontWeight: 600, textDecoration: "none" },
  list: { display: "grid", gap: 12, marginTop: 8 },
  postItem: { background: "#fff", border: "1px solid #eef1f6", borderRadius: 12, padding: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" },
  postTitle: { margin: "0 0 6px", fontSize: 18 },
  meta: { fontSize: 12, color: "#666" },
  error: { color: "tomato" },
  notfound: { color: "#ef4444", fontWeight: 700 },
};
