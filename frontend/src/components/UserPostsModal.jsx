import { useEffect, useState } from 'react';
import Modal from './Modal';
import { api } from '../lib/api';

export default function UserPostsModal() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null); // { id, username, email }
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  // open via: window.dispatchEvent(new CustomEvent('open-user-posts',{ detail:user }))
  useEffect(() => {
    function onOpen(e) {
      const u = e.detail;
      if (!u?.id) return;
      setUser(u);
      setOpen(true);
      fetchPosts(u.id);
    }
    window.addEventListener('open-user-posts', onOpen);
    return () => window.removeEventListener('open-user-posts', onOpen);
  }, []);

  async function fetchPosts(userId) {
    try {
      setError(''); setLoading(true);
      const data = await api.listUserPosts(userId);
      setPosts(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleAddPost(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    try {
      setError('');
      const p = await api.addPost(user.id, { title: title.trim(), content: content.trim() });
      setPosts(prev => [p, ...prev]);
      setTitle(''); setContent('');
      window.dispatchEvent(new Event('refresh-users')); // refresh counts in Users table
    } catch (e) { setError(e.message); }
  }

  async function handleDeletePost(id) {
    try {
      await api.deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      window.dispatchEvent(new Event('refresh-users'));
    } catch (e) { setError(e.message); }
  }

  function handleClose() {
    setOpen(false);
    window.dispatchEvent(new Event('refresh-users'));
  }

  return (
    <Modal open={open} onClose={handleClose} title={user ? `Posts of ${user.username} (id ${user.id})` : 'User Posts'}>
      {error && <div style={{color:'#ef4444', marginBottom:8}}>{error}</div>}

      {user && (
        <form onSubmit={handleAddPost} style={{display:'grid', gap:8, marginBottom:12}}>
          <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Post title"
                 style={field}/>
          <textarea value={content} onChange={(e)=>setContent(e.target.value)} placeholder="Post content"
                    rows={3} style={{...field, resize:'vertical'}}/>
          <div style={{display:'flex', gap:8}}>
            <button type="submit" style={btnPrimary}>Add Post</button>
            <button type="button" style={btnGhost} onClick={()=>{setTitle(''); setContent('')}}>Clear</button>
          </div>
        </form>
      )}

      {loading ? <div>Loading…</div> : (
        posts.length ? (
          <div style={{display:'grid', gap:10}}>
            {posts.map(p=>(
              <div key={p.id} style={postCard}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div style={{fontWeight:600}}>{p.title}</div>
                  <button style={btnDanger} onClick={()=>handleDeletePost(p.id)}>Delete</button>
                </div>
                <div style={{marginTop:6, color:'#cbd5e1'}}>{p.content}</div>
              </div>
            ))}
          </div>
        ) : <div>No posts for this user yet.</div>
      )}
    </Modal>
  );
}

const field = { padding:'10px 12px', borderRadius:10, border:'1px solid #334155', background:'#0b1220', color:'#e5e7eb' };
const btnPrimary = { padding:'8px 12px', borderRadius:10, border:'1px solid #334155', background:'#0ea5e9', color:'#fff', cursor:'pointer' };
const btnGhost = { padding:'8px 12px', borderRadius:10, border:'1px solid #334155', background:'transparent', color:'#e5e7eb', cursor:'pointer' };
const btnDanger = { padding:'6px 10px', borderRadius:10, border:'1px solid #334155', background:'#ef4444', color:'#fff', cursor:'pointer' };
const postCard = { border:'1px solid #334155', borderRadius:12, padding:12, background:'#0b1220' };
