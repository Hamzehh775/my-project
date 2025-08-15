import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import postsRouter from './routes/posts.routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// health
app.get('/', (_req, res) => res.json({ ok: true, service: 'posts' }));

// routes
app.use('/posts', postsRouter);

const PORT = process.env.PORT || 4002;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🟢 Posts service on http://localhost:${PORT}`));
});
