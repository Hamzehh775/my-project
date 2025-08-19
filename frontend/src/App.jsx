// App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Modal from "./components/Modal";
import Dashboard from "./components/Dashboard.jsx";
import UserPostsModal from "./components/UserPostsModal.jsx";
import UserPostsPage from "./components/UserPostsPage.jsx";
import { api } from "./lib/api";

export default function App() {
  const navigate = useNavigate(); // 👈 required so navigate(...) works

  const [usersOpen, setUsersOpen] = useState(false);
  const [postsOpen, setPostsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({ username: "", email: "" });

  // when UserPostsModal tells us to refresh counts
  useEffect(() => {
    function onRefresh() {
      if (usersOpen) fetchUsers();
    }
    window.addEventListener("refresh-users", onRefresh);
    return () => window.removeEventListener("refresh-users", onRefresh);
  }, [usersOpen]);

  async function fetchUsers() {
    try {
      setLoadingUsers(true);
      const data = await api.listUsers(); // /api/users/with-counts
      setUsers(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function openUsers() {
    setError("");
    setUsersOpen(true);
    await fetchUsers();
  }

  async function openPosts() {
    try {
      setError("");
      setLoadingPosts(true);
      setPostsOpen(true);
      const data = await api.listPostsEnriched();
      setPosts(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingPosts(false);
    }
  }

  async function handleAddUser(e) {
    e.preventDefault();
    if (!newUser.username.trim() || !newUser.email.trim()) return;
    try {
      setError("");
      await api.addUser({
        username: newUser.username.trim(),
        email: newUser.email.trim(),
      });
      setNewUser({ username: "", email: "" });
      await fetchUsers();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Admin Dashboard</h1>
        <p style={styles.sub}></p>
        <div style={styles.row}>
          <button onClick={openUsers} style={styles.btn}>
            Users
          </button>
          <button onClick={openPosts} style={styles.btn}>
            All Posts
          </button>
        </div>
        {error && <div style={styles.error}>{error}</div>}
      </div>

      {/* Users popup */}
      <Modal open={usersOpen} onClose={() => setUsersOpen(false)} title="Users">
        {loadingUsers ? (
          <div>Loading…</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {/* Add User form */}
            <form
              onSubmit={handleAddUser}
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <input
                value={newUser.username}
                onChange={(e) =>
                  setNewUser((v) => ({ ...v, username: e.target.value }))
                }
                placeholder="Username"
                style={styles.input}
              />
              <input
                value={newUser.email}
                onChange={(e) =>
                  setNewUser((v) => ({ ...v, email: e.target.value }))
                }
                placeholder="Email"
                type="email"
                style={styles.input}
              />
              <button type="submit" style={styles.smallBtn}>
                Add User
              </button>
            </form>

            {/* Users table */}
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th># Posts</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>

                      {/* ✅ Single <td> for username; close modal then navigate */}
                      <td>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUsersOpen(false); // close the modal so the page is visible
                            navigate(`/users/${u.id}`);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            textDecoration: "underline",
                            cursor: "pointer",
                            color: "#60a5fa",
                          }}
                        >
                          {u.username}
                        </button>
                      </td>

                      <td>{u.email}</td>
                      <td>{u.postCount}</td>

                      <td style={{ display: "flex", gap: 8 }}>
                        {/* Keep popup behavior for "Add Post" */}
                        <button
                          style={styles.smallBtn}
                          onClick={() =>
                            window.dispatchEvent(
                              new CustomEvent("open-user-posts", { detail: u })
                            )
                          }
                        >
                          Add Post
                        </button>

                        <button
                          style={{ ...styles.smallBtn, ...styles.danger }}
                          onClick={async () => {
                            if (
                              !window.confirm(
                                `Delete user ${u.username}? This removes their posts too.`
                              )
                            )
                              return;
                            await api.deleteUser(u.id);
                            setUsers((prev) => prev.filter((x) => x.id !== u.id));
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* App routes (App is already under BrowserRouter in main.jsx) */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users/:id" element={<UserPostsPage />} />
      </Routes>

      {/* All posts popup */}
      <Modal open={postsOpen} onClose={() => setPostsOpen(false)} title="All Posts">
        {loadingPosts ? (
          <div>Loading…</div>
        ) : posts.length ? (
          <div style={{ display: "grid", gap: 12 }}>
            {posts.map((p) => (
              <div key={p.id} style={styles.postCard}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.title}</div>
                    <div style={{ fontSize: 13, color: "#94a3b8" }}>
                      by{" "}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          window.dispatchEvent(
                            new CustomEvent("open-user-posts", { detail: p.user })
                          );
                        }}
                        style={{ color: "#60a5fa" }}
                      >
                        {p.user?.username ?? "Unknown"}
                      </a>{" "}
                      (id {p.user?.id ?? "—"})
                    </div>
                  </div>
                  <button
                    style={{ ...styles.smallBtn, ...styles.danger }}
                    onClick={async () => {
                      await api.deletePost(p.id);
                      setPosts((prev) => prev.filter((x) => x.id !== p.id));
                      window.dispatchEvent(new Event("refresh-users")); // keep counts in sync
                    }}
                  >
                    Delete
                  </button>
                </div>
                <div style={{ marginTop: 8, color: "#cbd5e1" }}>{p.content}</div>
              </div>
            ))}
          </div>
        ) : (
          <div>No posts yet.</div>
        )}
      </Modal>

      {/* Global modals */}
      <UserPostsModal />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b1220",
    color: "#e5e7eb",
    display: "grid",
    placeItems: "center",
    padding: 24,
  },
  card: {
    background: "#0f172a",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: 24,
    width: "min(820px, 95vw)",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  h1: { margin: "0 0 8px 0", fontSize: 28, fontWeight: 700 },
  sub: { margin: "0 0 18px 0", color: "#94a3b8" },
  row: { display: "flex", gap: 12, justifyContent: "center" },
  btn: {
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid #334155",
    background: "#1d4ed8",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  },
  error: { marginTop: 12, color: "#ef4444" },
  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#0b1220",
    color: "#e5e7eb",
    minWidth: 180,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  postCard: {
    border: "1px solid #334155",
    borderRadius: 12,
    padding: 12,
    background: "#0b1220",
  },
  smallBtn: {
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#0ea5e9",
    color: "#fff",
    cursor: "pointer",
  },
  danger: { background: "#ef4444" },
};
