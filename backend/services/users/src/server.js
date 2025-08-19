// src/server.js
import express from 'express';
import usersRouter from './routes/users.routes.js'; 
import { connectDB } from './db.js';
await connectDB();  // top-level await is fine in Node 22 (ESM)


console.log('🟡 BOOT server.js from', import.meta.url); // prove THIS file is running

const app = express();

// log every request so we SEE what hits the server
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.json());

// health
app.get('/', (_req, res) => res.send('OK: users service'));

// MOUNT users router at /users  -> final paths: /users, /users/:id
app.use('/users', usersRouter);

// TEMP: direct route to prove /users prefix is alive (doesn't touch the router)
app.get('/users/__ping', (_req, res) => res.send('OK: /users mount is alive'));

// Print registered routes (robust; shows errors if any)
function printRoutes(app) {
  try {
    const lines = [];
    app._router?.stack?.forEach((layer) => {
      if (layer.route?.path) {
        const methods = Object.keys(layer.route.methods).map(x => x.toUpperCase()).join(',');
        lines.push(`${methods} ${layer.route.path}`);
      } else if (layer.name === 'router' && layer.handle?.stack) {
        // mounted router (/users)
        layer.handle.stack.forEach((h) => {
          if (h.route?.path) {
            const methods = Object.keys(h.route.methods).map(x => x.toUpperCase()).join(',');
            // we KNOW we mounted at /users
            lines.push(`${methods} /users${h.route.path}`.replace('//','/'));
          }
        });
      }
    });
    console.log('--- Registered routes ---\n' + (lines.join('\n') || '(none)') + '\n-------------------------');
    return lines;
  } catch (e) {
    console.error('printRoutes error:', e);
    return [];
  }
}

// JSON endpoint so you can curl the routes
app.get('/__routes', (_req, res) => {
  const lines = printRoutes(app);
  res.json(lines);
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`🟢 Users service on http://localhost:${PORT}`);
  printRoutes(app);
});
