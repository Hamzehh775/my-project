import { client } from '../db.js';

// GET /posts  -> all posts (no created_at)
export async function listAllPosts(_req, res) {
  try {
    const { rows } = await client.query(
      `SELECT id, user_id, title, content
       FROM posts
       ORDER BY id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('listAllPosts error:', err.message);
    res.status(500).json({ message: 'Internal error' });
  }
}

export async function listPostsByUser(req, res) {
  try {
    const userId = Number(req.params.userId);
    const { rows } = await client.query(
      `SELECT id, user_id, title, content
       FROM posts
       WHERE user_id = $1
       ORDER BY id DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('listPostsByUser error:', err.message);
    res.status(500).json({ message: 'Internal error' });
  }
}


export async function createPost(req, res) {
  try {
    const userId = Number(req.params.userId);
    const { title, content } = req.body || {};
    if (!title || !content) return res.status(400).json({ message: 'title and content are required' });

    const { rows } = await client.query(
      `INSERT INTO posts (user_id, title, content)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, title, content`,
      [userId, title, content]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('createPost error:', err.message);
    res.status(500).json({ message: 'Internal error' });
  }
}

// DELETE
export async function deletePost(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await client.query(`DELETE FROM posts WHERE id = $1`, [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('deletePost error:', err.message);
    res.status(500).json({ message: 'Internal error' });
  }
}


export async function countPostsPerUser(_req, res) {
  try {
    const { rows } = await client.query(
      `SELECT user_id, COUNT(*)::int AS count
       FROM posts
       GROUP BY user_id`
    );
    res.json(rows);
  } catch (err) {
    console.error('countPostsPerUser error:', err.message);
    res.status(500).json({ message: 'Internal error' });
  }
}
