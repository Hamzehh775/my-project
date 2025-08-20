import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom'; // ✅ use Link for client-side navigation

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  async function fetchUsers() {
    try {
      setErr('');
      setLoading(true);
      const data = await api.listUsers(); // GET /api/users/with-counts (or /api/users)
      setUsers(data);
    } catch (e) {
      setErr(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
    const onRefresh = () => fetchUsers();
    window.addEventListener('refresh-users', onRefresh);
    return () => window.removeEventListener('refresh-users', onRefresh);
  }, []);

  if (loading) return <div>Loading users…</div>;
  if (err) return <div style={{ color: '#ef4444' }}>{err}</div>;

  return (
    <div style={{ overflowX: 'auto' }}>
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
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>

              {/* 👉 Username is now a real link to /users/:id/posts */}
              <td>
                <Link
                  to={`/users/${u.id}/posts`}       // absolute path
                  style={styles.usernameLink}
                >
                  {u.username}
                </Link>
              </td>

              <td>{u.email}</td>
              <td>{u.postCount}</td>

              <td style={{ display: 'flex', gap: 8 }}>
                {/* Keep your existing modal trigger if you still use it */}
                <button
                  style={styles.btn}
                  onClick={() =>
                    window.dispatchEvent(new CustomEvent('open-user-posts', { detail: u }))
                  }
                >
                  Add Post
                </button>

                {/* Optional: quick "View Posts" button that does the same as clicking the username */}
                <Link to={`/users/${u.id}/posts`} style={{ ...styles.btn, textDecoration: 'none' }}>
                  View Posts
                </Link>

                <button
                  style={{ ...styles.btn, ...styles.danger }}
                  onClick={async () => {
                    if (!confirm(`Delete user ${u.username}? Their posts will be removed too.`)) return;
                    await api.deleteUser(u.id);
                    setUsers(prev => prev.filter(x => x.id !== u.id));
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: 12 }}>
                No users yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  table: { width: '100%', borderCollapse: 'collapse' },
  usernameLink: {
    color: '#60a5fa',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  btn: {
    padding: '6px 10px',
    borderRadius: 10,
    border: '1px solid #334155',
    background: '#0ea5e9',
    color: '#fff',
    cursor: 'pointer'
  },
  danger: { background: '#ef4444' }
};
