// src/components/UserPostsPage.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

// Posts service base (no /api prefix)
const POSTS_API = import.meta.env.VITE_POSTS_API ?? "http://localhost:4002/posts";
const UPLOADS_BASE = "http://localhost:5000";

export default function UserPostsPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState({}); // track deletes per post

  async function signKey(key) {
    if (!key) return null;

    if (typeof api?.signImage === "function") {
      const { url } = await api.signImage(key);
      return url;
    }
    if (typeof api?.getImageUrl === "function") {
      const { url } = await api.getImageUrl(key);
      return url;
    }

    const r = await fetch(`${UPLOADS_BASE}/uploads/s3-get?key=${encodeURIComponent(key)}`);
    if (!r.ok) throw new Error("Failed to get signed URL");
    const { url } = await r.json();
    return url; // fixed typo
  }

  function resolveImageUrlLocal(p) {
    return p.signed_url || p.image_url || p.image?.url || null;
  }

  async function handleDelete(p) {
    if (deleting[p.id]) return;
    const ok = confirm(`Delete post #${p.id}? This cannot be undone.`);
    if (!ok) return;

    setDeleting(prev => ({ ...prev, [p.id]: true }));
    try {
      const resp = await fetch(`${POSTS_API}/${encodeURIComponent(p.id)}`, { method: "DELETE" });
      if (!resp.ok) throw new Error(`Delete failed: HTTP ${resp.status}`);

      // Optimistically remove from UI
      setPosts(prev => prev.filter(x => x.id !== p.id));
      setImageUrls(prev => {
        const copy = { ...prev };
        delete copy[p.id];
        return copy;
      });
    } catch (e) {
      alert(e.message || "Failed to delete post");
    } finally {
      setDeleting(prev => {
        const copy = { ...prev };
        delete copy[p.id];
        return copy;
      });
    }
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErr("");
        setNotFound(false);

        // 1) verify user exists
        let list = [];
        try {
          list = await api.listUsers();
        } catch {
          throw new Error("Failed to load users");
        }

        const u = Array.isArray(list) ? list.find(x => String(x.id) === String(id)) : null;
        if (!u) {
          if (!cancelled) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }
        if (!cancelled) setUser(u);

        // 2) fetch user posts
        const rp = await fetch(`${POSTS_API}/user/${encodeURIComponent(id)}`);
        if (!rp.ok) {
          if (rp.status === 404) {
            if (!cancelled) setPosts([]);
          } else {
            throw new Error(`Posts API error: HTTP ${rp.status}`);
          }
        } else {
          const raw = await rp.json();
          const list = Array.isArray(raw) ? raw : Array.isArray(raw.posts) ? raw.posts : [];

          // Enrich image URLs (same logic as AllPostsPage)
          const entries = await Promise.all(
            list.map(async (p) => {
              const local = resolveImageUrlLocal(p);
              if (local) return [p.id, local];

              if (p.image_key) {
                try {
                  const url = await signKey(p.image_key);
                  return [p.id, url ?? null];
                } catch (e) {
                  console.warn("Signing failed for", p.image_key, e);
                  return [p.id, null];
                }
              }
              return [p.id, null];
            })
          );

          if (!cancelled) {
            setPosts(list);
            setImageUrls(Object.fromEntries(entries));
          }
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
              {posts.map((p) => {
                const imgSrc = resolveImageUrlLocal(p) ?? imageUrls[p.id] ?? null;

                return (
                  <li key={p.id} style={styles.postItem}>
                    <div style={styles.postHeader}>
                      <h3 style={styles.postTitle}>{p.title}</h3>
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={!!deleting[p.id]}
                        style={styles.deleteBtn}
                        title="Delete post"
                      >
                        {deleting[p.id] ? "Deleting…" : "Delete"}
                      </button>
                    </div>

                    {imgSrc && (
                      <div style={styles.imageWrap}>
                        <img src={imgSrc} alt={p.title} style={styles.image} />
                      </div>
                    )}

                    <div>{p.content}</div>
                    <div style={styles.meta}>Post #{p.id} • user {p.user_id}</div>
                  </li>
                );
              })}
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

  postHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  postTitle: { margin: "0 0 6px", fontSize: 18 },

  // smaller images
  imageWrap: { margin: "8px 0 10px", maxWidth: 260 }, // constrain width
  image: { width: "100%", height: "auto", objectFit: "cover", borderRadius: 10, border: "1px solid #eef1f6" },

  meta: { fontSize: 12, color: "#666" },
  error: { color: "tomato" },
  notfound: { color: "#ef4444", fontWeight: 700 },

  deleteBtn: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #fca5a5",
    background: "#fee2e2",
    color: "#b91c1c",
    cursor: "pointer",
    fontWeight: 600,
  },
};
