// src/components/UserPostsPage.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

// Use absolute base so we definitely hit Express (adjust port if needed)
const API_BASE = "http://localhost:5000";

export default function UserPostsPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr("");

      try {
        // 1) Load this user's posts from your real backend route
        const rp = await fetch(`${API_BASE}/api/posts/user/${encodeURIComponent(id)}`);
        if (!rp.ok) throw new Error(`HTTP ${rp.status} on /api/posts/user/${id}`);
        const postsJson = await rp.json();
        if (!cancelled) setPosts(Array.isArray(postsJson) ? postsJson : []);

        // 2) (Optional) Load user header info
        try {
          const ru = await fetch(`${API_BASE}/api/users/${encodeURIComponent(id)}`);
          if (ru.ok) {
            const userJson = await ru.json();
            if (!cancelled) setUser(userJson);
          }
        } catch {}
      } catch (e) {
        if (!cancelled) setErr(e.message || "Request failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div style={sx.page}>Loading…</div>;

  if (err) {
    return (
      <div style={sx.page}>
        <div style={sx.errBox}>
          <div style={{fontWeight:700, marginBottom:6}}>Error</div>
          <div>{String(err)}</div>
          <div style={{marginTop:8, fontSize:12, opacity:.8}}>
            Verify this exists and returns JSON:
            <code style={sx.code}> GET {API_BASE}/api/posts/user/{id}</code>
          </div>
        </div>
        <Link to="/" style={sx.link}>← Back</Link>
      </div>
    );
  }

  return (
    <div style={sx.page}>
      <div style={sx.header}>
        <h1 style={{margin:0}}>
          {user?.username ? `${user.username} (id ${id})` : `User ${id}`} — Posts
        </h1>
        <Link to="/" style={sx.link}>← Back</Link>
      </div>

      {posts.length === 0 ? (
        <div style={{opacity:.8}}>No posts for this user.</div>
      ) : (
        <div style={sx.posts}>
          {posts.map(p => (
            <div key={p.id} style={sx.card}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{fontWeight:600}}>{p.title ?? '(Untitled)'}</div>
                <div style={{fontSize:12, opacity:.7}}>Post ID: {p.id}</div>
              </div>
              <div style={{marginTop:8}}>{p.content ?? ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const sx = {
  page: { minHeight:'100vh', padding:'24px', color:'#e5e7eb', background:'#0b1220' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  posts: { display:'grid', gap:12 },
  card: { border:'1px solid #334155', borderRadius:12, padding:12, background:'#0f172a' },
  errBox: { border:'1px solid #7f1d1d', background:'#1f2937', borderRadius:12, padding:12, color:'#fecaca' },
  link: { color:'#60a5fa', textDecoration:'none' },
  code: { marginLeft:6, marginRight:6, padding:'2px 6px', background:'#111827', borderRadius:6 }
};
