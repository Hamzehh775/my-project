import { client } from '../db.js';

export async function listUsers(req, res) {
  try {
    const { rows } = await client.query(
      `SELECT id, username, email, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('listUsers error:', err.message);
    res.status(500).json({ message: 'Internal error' });
  }
}

export async function createUser(req, res) {
  try {
    const { username, email } = req.body || {};
    if (!username || !email) return res.status(400).json({ message: 'username and email are required' });

    const { rows } = await client.query(
      `INSERT INTO users (username, email)
       VALUES ($1, $2)
       RETURNING id, username, email, created_at`,
      [username, email]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('createUser error:', err.message);
    if (err.code === '23505') return res.status(409).json({ message: 'email already exists' });
    res.status(500).json({ message: 'Internal error' });
  }
}

export async function deleteUser(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await client.query(`DELETE FROM users WHERE id = $1`, [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User (and posts) deleted' }); // posts will cascade in DB
  } catch (err) {
    console.error('deleteUser error:', err.message);
    res.status(500).json({ message: 'Internal error' });
  }
}
