import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import usersRouter from './routes/users.routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// health
app.get('/', (_req, res) => res.json({ ok: true, service: 'users' }));

// routes
app.use('/users', usersRouter);

const PORT = process.env.PORT || 4001;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🟢 Users service on http://localhost:${PORT}`));
});
