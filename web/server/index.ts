import { config } from './config.js';

import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import healthRouter from './routes/health.js';
import chatRouter from './routes/chat.js';
import progressRouter from './routes/progress.js';
import authRouter from './routes/auth.js';
import { isSupabaseConfigured } from './db/client.js';

const app = express();

app.use(
  cors({
    origin:
      config.nodeEnv === 'development'
        ? ['http://localhost:5173', 'http://127.0.0.1:5173']
        : false,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.use('/api', healthRouter);
app.use('/api', chatRouter);
app.use('/api', progressRouter);
app.use('/api/auth', authRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[server] Running on http://localhost:${config.port}`);
  console.log(`[server] Using Claude CLI for chat streaming`);
  console.log(`[server] Supabase: ${isSupabaseConfigured() ? 'configured' : 'not configured (using localStorage fallback)'}`);
});
