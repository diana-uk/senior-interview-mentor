import 'dotenv/config';
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
import billingRouter from './routes/billing.js';
import sitemapRouter from './routes/sitemap.js';
import { isSupabaseConfigured } from './db/client.js';
import { getAIBackend } from './services/ai.js';
import { isStripeConfigured } from './services/stripe.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(requestLogger);
app.use(
  cors({
    origin:
      config.nodeEnv === 'development'
        ? ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174']
        : false,
  }),
);
// Stripe webhook needs raw body — mount BEFORE express.json()
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));

app.use('/api', healthRouter);
app.use('/api', chatRouter);
app.use('/api', progressRouter);
app.use('/api/auth', authRouter);
app.use('/api/billing', billingRouter);
app.use(sitemapRouter);

// Serve frontend static files in production
if (config.nodeEnv === 'production') {
  const distPath = path.resolve(__dirname, '..', 'dist');
  app.use(express.static(distPath));

  // Problem-specific meta injection for SEO
  const PROBLEM_META: Record<string, { title: string; description: string }> = {};
  // Populated lazily on first request to avoid import issues

  app.get('/problems/:id', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    const id = req.params.id;

    // Read the HTML template
    import('node:fs').then(({ readFileSync }) => {
      let html = readFileSync(indexPath, 'utf-8');

      // If we have problem-specific meta, inject it
      const meta = PROBLEM_META[id];
      if (meta) {
        html = html
          .replace(/<title>[^<]*<\/title>/, `<title>${meta.title} | Senior Mentor</title>`)
          .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${meta.description}"`);
      }

      res.set('Content-Type', 'text/html');
      res.send(html);
    }).catch(() => {
      res.sendFile(indexPath);
    });
  });

  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[server] Running on http://localhost:${config.port}`);
  console.log(`[server] AI backend: ${getAIBackend()}`);
  console.log(`[server] Supabase: ${isSupabaseConfigured() ? 'configured' : 'not configured (using localStorage fallback)'}`);
  console.log(`[server] Stripe: ${isStripeConfigured() ? 'configured' : 'not configured (billing disabled)'}`);
});
