import { config } from './config.js';

// Set git-bash path in process env BEFORE any claude imports may use it
if (config.gitBashPath && !process.env.CLAUDE_CODE_GIT_BASH_PATH) {
  process.env.CLAUDE_CODE_GIT_BASH_PATH = config.gitBashPath;
}

import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import healthRouter from './routes/health.js';
import chatRouter from './routes/chat.js';

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

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[server] Running on http://localhost:${config.port}`);
  console.log(`[server] Using Claude CLI (claude -p) for responses`);
});
