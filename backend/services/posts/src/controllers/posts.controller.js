import { client } from '../db.js';

export async function createPost(req, res) {
  try {
    // user id from the route param
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    // read body; image fields are OPTIONAL
    const {
      title,
      content,
      imageKey = null,
      imageMime = null,
      imageSize = null,
    } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title required" });
    }

    const q = `
      INSERT INTO posts (user_id, title, content, image_key, image_mime, image_size)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, title, content, image_key, image_mime, image_size, created_at
    `;
    const params = [
      userId,
      title.trim(),
      content ?? "",
      imageKey,     // stays NULL if not provided
      imageMime,    // stays NULL if not provided
      imageSize,    // stays NULL if not provided
    ];

    const { rows } = await client.query(q, params);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("createPost error:", err);
    return res.status(500).json({ message: "Internal error" });
  }
}

// GET /posts  -> all posts (no created_at)
export async function listAllPosts(_req, res) {
  try {
    const { rows } = await client.query(
      `
  SELECT id, user_id, title, content,
         image_key, image_mime, image_size,
         created_at
  FROM posts
  ORDER BY id DESC
`
    );
    res.json(rows);
  } catch (err) {
    console.error('listAllPosts error:', err.message);
    res.status(500).json({ message: 'Internal error' });
  }
}

export async function listPostsByUser(req, res) {
  try {
    // ✅ CHANGED: validate userId same as createPost
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    // ✅ CHANGED: return image fields & created_at just like listAllPosts
    const { rows } = await client.query(
      `SELECT id, user_id, title, content,
              image_key, image_mime, image_size,
              created_at
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
