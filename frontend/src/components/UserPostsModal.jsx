// src/components/UserPostsModal.jsx
import { useEffect, useState } from "react";

export default function UserPostsModal() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", content: "" });

  // Load posts for a user
  async function loadPosts(userId) {
    setLoading(true);
    setError("");
    try {
      const resp = await fetch(`http://localhost:5000/api/posts/user/${userId}`);
      if (!resp.ok) throw new Error("Failed to load posts");
      const data = await resp.json();
      setPosts(data);
    } catch (err) {
      setError(err.message || "Error loading posts");
    } finally {
      setLoading(false);
    }
  }

  // Add a new post
  async function addPost(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const resp = await fetch(`http://localhost:5000/api/posts/user/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          content: form.content.trim(),
        }),
      });
      if (!resp.ok) throw new Error("Failed to add post");
      setForm({ title: "", content: "" });
      await loadPosts(user.id); // Refresh posts
    } catch (err) {
      setError(err.message || "Error adding post");
    } finally {
      setSaving(false);
    }
  }

  // Listen for global "open-user-posts" event
  useEffect(() => {
    function onOpen(e) {
      const u = e.detail;
      if (!u?.id) return;
      setUser(u);
      setOpen(true);
      void loadPosts(u.id);
    }
    window.addEventListener("open-user-posts", onOpen);
    return () => window.removeEventListener("open-user-posts", onOpen);
  }, []);

  function close() {
    setOpen(false);
    setUser(null);
    setPosts([]);
    setForm({ title: "", content: "" });
    setError("");
  }

  if (!open) return null;

  return (
    <div style={sx.backdrop} onClick={close}>
      <div style={sx.modal} onClick={(e) => e.stopPropagation()}>
        <div style={sx.header}>
          <div style={{fontWeight:700}}>Posts — {user?.username ?? `User ${user?.id}`}</div>
          <button onClick={close} style={sx.closeBtn}>✕</button>
        </div>

        {error && <div style={sx.err}>{error}</div>}

        <form onSubmit={addPost} style={sx.form}>
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            style={sx.input}
          />
          <textarea
            placeholder="Content"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            style={{...sx.input, height: 90, resize: "vertical"}}
          />
          <button type="submit" disabled={saving} style={sx.btn}>
            {saving ? "Saving…" : "Add Post"}
          </button>
        </form>

        {loading ? (
          <div>Loading posts…</div>
        ) : posts.length === 0 ? (
          <div style={{opacity:.8}}>No posts yet.</div>
        ) : (
          <div style={{display:'grid', gap:10}}>
            {posts.map((p) => (
              <div key={p.id} style={sx.postCard}>
                <div style={{fontWeight:600}}>{p.title}</div>
                <div style={{marginTop:6}}>{p.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const sx = {
  backdrop: {
    position:"fixed", inset:0, background:"rgba(0,0,0,0.5)",
    display:"grid", placeItems:"center", zIndex:1000
  },
  modal: {
    width:"min(720px, 95vw)", background:"#0f172a", border:"1px solid #334155",
    borderRadius:12, padding:16, color:"#e5e7eb", boxShadow:"0 20px 60px rgba(0,0,0,.5)"
  },
  header: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 },
  closeBtn: { background:"transparent", border:"none", color:"#cbd5e1", cursor:"pointer", fontSize:18 },
  form: { display:"grid", gap:8, marginBottom:12 },
  input: { padding:"10px 12px", borderRadius:10, border:"1px solid #334155", background:"#0b1220", color:"#e5e7eb" },
  btn: { padding:"8px 12px", borderRadius:10, border:"1px solid #334155", background:"#0ea5e9", color:"#fff", cursor:"pointer" },
  postCard: { border:"1px solid #334155", borderRadius:10, padding:10, background:"#0b1220" },
  err: { marginBottom:10, color:"#fecaca" }
};