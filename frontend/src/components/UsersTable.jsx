import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  async function fetchUsers() {
    try {
      setErr('');
      setLoading(true);
      const data = await api.listUsers(); // GET /api/users/with-counts
      setUsers(data);
    } catch (e) {
      setErr(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  // initial load + listen for global refresh (fired by the posts modal)
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
            <th>Username (click to view posts)</th>
            <th>Email</th>
            <th># Posts</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>
                {/* Use a button + programmatic navigate to avoid any global <a>-click handlers */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/users/${u.id}`);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#60a5fa',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {u.username}
                </button>
              </td>
              <td>{u.email}</td>
              <td>{u.postCount}</td>
              <td style={{ display: 'flex', gap: 8 }}>
                <button
                  style={styles.btn}
                  onClick={() =>
                    window.dispatchEvent(new CustomEvent('open-user-posts', { detail: u }))
                  }
                >
                  Add Post
                </button>
                <button
                  style={{ ...styles.btn, ...styles.danger }}
                  onClick={async () => {
                    if (!confirm(`Delete user ${u.username}? Their posts will be removed too.`)) return;
                    await api.deleteUser(u.id);
                    setUsers(prev => prev.filter(x => x.id !== u.id));
                    // counts will naturally update since the user row is removed
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
