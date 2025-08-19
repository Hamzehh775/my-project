import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'gateway',
    users: process.env.USERS_SERVICE_URL,
    posts: process.env.POSTS_SERVICE_URL
  });
});

// API routes
app.use('/api', apiRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🟢 API Gateway listening on http://localhost:${PORT}`);
});