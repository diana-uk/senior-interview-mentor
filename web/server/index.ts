import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { initSentry } from './lib/sentry.js';

// Initialize Sentry before anything else
initSentry();

import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import healthRouter from './routes/health.js';
import chatRouter from './routes/chat.js';
import progressRouter from './routes/progress.js';
import authRouter from './routes/auth.js';
import { isSupabaseConfigured } from './db/client.js';
import { getAIBackend } from './services/ai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(requestLogger);
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

// Serve frontend static files in production
if (config.nodeEnv === 'production') {
  const distPath = path.resolve(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[server] Running on http://localhost:${config.port}`);
  console.log(`[server] AI backend: ${getAIBackend()}`);
  console.log(`[server] Supabase: ${isSupabaseConfigured() ? 'configured' : 'not configured (using localStorage fallback)'}`);
});
