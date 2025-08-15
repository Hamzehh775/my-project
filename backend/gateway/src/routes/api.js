import { Router } from 'express';
import axios from 'axios';

const router = Router();


const USERS = process.env.USERS_SERVICE_URL || 'http://localhost:4001';
const POSTS = process.env.POSTS_SERVICE_URL || 'http://localhost:4002';


router.get('/_debug', (_req, res) => {
  res.json({ USERS, POSTS });
});

// users
router.get('/users', async (_req, res) => {
  try {
    const r = await axios.get(`${USERS}/users`);
    res.json(r.data);
  } catch (e) {
    res.status(e.response?.status || 500).json({ message: e.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const r = await axios.post(`${USERS}/users`, req.body);
    res.status(201).json(r.data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { message: e.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const r = await axios.delete(`${USERS}/users/${req.params.id}`);
    res.json(r.data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { message: e.message });
  }
});

// posts
router.get('/posts', async (_req, res) => {
  try {
    const r = await axios.get(`${POSTS}/posts`);
    res.json(r.data);
  } catch (e) {
    res.status(e.response?.status || 500).json({ message: e.message });
  }
});

router.get('/posts/user/:userId', async (req, res) => {
  try {
    const r = await axios.get(`${POSTS}/posts/user/${req.params.userId}`);
    res.json(r.data);
  } catch (e) {
    res.status(e.response?.status || 500).json({ message: e.message });
  }
});

router.post('/posts/user/:userId', async (req, res) => {
  try {
    const r = await axios.post(`${POSTS}/posts/user/${req.params.userId}`, req.body);
    res.status(201).json(r.data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { message: e.message });
  }
});

router.delete('/posts/:id', async (req, res) => {
  try {
    const r = await axios.delete(`${POSTS}/posts/${req.params.id}`);
    res.json(r.data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { message: e.message });
  }
});

export default router;

//Aggregations
//[{ id, username, email, postCount }]
router.get('/users/with-counts', async (_req, res) => {
  try {
    // fetch users + counts in parallel
    const [usersRes, countsRes] = await Promise.all([
      axios.get(`${USERS}/users`),
      axios.get(`${POSTS}/posts/counts`)
    ]);

    const users = usersRes.data || [];
    const counts = countsRes.data || [];

    // make a map userId -> count
    const countMap = new Map(counts.map(c => [Number(c.user_id), Number(c.count)]));

    const merged = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      postCount: countMap.get(Number(u.id)) || 0
    }));

    res.json(merged);
  } catch (e) {
    res.status(e.response?.status || 500).json({ message: e.message });
  }
});
// Aggregations 
// [{ id, title, content, user: { id, username, email } }]
router.get('/posts-enriched', async (_req, res) => {
  try {
    const [postsRes, usersRes] = await Promise.all([
      axios.get(`${POSTS}/posts`),
      axios.get(`${USERS}/users`)
    ]);

    const posts = postsRes.data || [];
    const users = usersRes.data || [];
    const userMap = new Map(users.map(u => [Number(u.id), { id: u.id, username: u.username, email: u.email }]));

    const enriched = posts.map(p => ({
      id: p.id,
      title: p.title,
      content: p.content,
      user: userMap.get(Number(p.user_id)) || null
    }));

    res.json(enriched);
  } catch (e) {
    res.status(e.response?.status || 500).json({ message: e.message });
  }
});

