import { spawn } from 'child_process';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// System prompt for the Senior Interview Mentor
const SYSTEM_PROMPT = `You are "Senior Mentor" - an elite coding interview coach specializing in LeetCode-style problems and senior full-stack interviews.

## Your Modes
You operate in exactly ONE mode at a time based on context:
- **TEACHER** (default): Socratic guidance, hint ladder, pattern recognition
- **INTERVIEWER**: Real interview simulation, time pressure, minimal hints
- **REVIEWER**: Rubric scoring (0-4), code review, improvement plans

## Output Format (Always Use This)
Mode: TEACHER | INTERVIEWER | REVIEWER
Goal: (1 sentence)
Process: (3-7 bullets)
Interaction: (questions/tasks for user)
Next action: (exactly what user should do)

## Commitment Gate (Critical)
Before providing ANY full solution, require:
1. Constraints recap (1-3 bullets)
2. Chosen pattern (e.g., HashMap, sliding window)
3. Approach plan (4-8 bullets)
4. Complexity estimate (time + space)
5. Edge cases (3-6 items)

If missing, ask for missing pieces. Provide only hints until gate is satisfied.

## Hint Ladder
- Hint 1: Small nudge (pattern name, key invariant)
- Hint 2: Structure (data structure + steps)
- Hint 3: Pseudocode outline (still not full code)

Only advance hint levels when user is stuck after attempting.

## Key Principles
1. User must learn to solve problems independently
2. Use Socratic teaching - questions over answers
3. Enforce senior habits: clarify, reason, tradeoffs, complexity, tests
4. Never be vague - give crisp next steps
5. No fluff or motivational speeches - warm but direct
6. Prefer TypeScript unless user asks otherwise`;

interface ChatMessage {
  role: 'mentor' | 'user';
  content: string;
}

interface ChatContext {
  mode?: string;
  problem?: {
    title: string;
    difficulty: string;
    pattern?: string;
  } | null;
  hintsUsed?: number;
  commitmentGateCompleted?: number;
  interviewStage?: string | null;
  technicalQuestionCategory?: string;
}

app.post('/api/chat', async (req, res) => {
  const { messages, context } = req.body as {
    messages: ChatMessage[];
    context?: ChatContext;
  };

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: 'Messages array is required' });
    return;
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Build context string
    let contextStr = '';
    if (context) {
      const parts: string[] = [];
      if (context.mode) parts.push(`Current mode: ${context.mode}`);
      if (context.problem) {
        parts.push(`Problem: ${context.problem.title} (${context.problem.difficulty})`);
        if (context.problem.pattern) parts.push(`Pattern: ${context.problem.pattern}`);
      }
      if (context.hintsUsed !== undefined) parts.push(`Hints used: ${context.hintsUsed}/3`);
      if (context.commitmentGateCompleted !== undefined) {
        parts.push(`Commitment gate: ${context.commitmentGateCompleted}/5 items completed`);
      }
      if (context.interviewStage) parts.push(`Interview stage: ${context.interviewStage}`);
      if (context.technicalQuestionCategory) {
        parts.push(`Question category: ${context.technicalQuestionCategory}`);
      }
      if (parts.length > 0) {
        contextStr = `\n\n[Session Context]\n${parts.join('\n')}`;
      }
    }

    // Build the full prompt with conversation history
    const conversationHistory = messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Mentor'}: ${m.content}`)
      .join('\n\n');

    const fullPrompt = `${SYSTEM_PROMPT}${contextStr}\n\n---\nConversation:\n${conversationHistory}\n\nMentor:`;

    console.log('Spawning Claude CLI...');
    console.log('Prompt length:', fullPrompt.length);

    // Write prompt to a temp file to avoid command line length limits
    const fs = await import('fs');
    const os = await import('os');
    const path = await import('path');

    const tempFile = path.join(os.tmpdir(), `claude-prompt-${Date.now()}.txt`);
    // Convert Windows path to Unix-style for git-bash
    const tempFileUnix = tempFile.replace(/\\/g, '/');
    fs.writeFileSync(tempFile, fullPrompt);

    // Find git-bash path
    const gitBashPaths = [
      process.env.CLAUDE_CODE_GIT_BASH_PATH,
      'C:\\Program Files\\Git\\bin\\bash.exe',
      'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
    ].filter(Boolean) as string[];

    let bashPath = 'bash';
    for (const p of gitBashPaths) {
      if (fs.existsSync(p)) {
        bashPath = p;
        break;
      }
    }

    console.log('Using bash:', bashPath);

    // Use git-bash to run claude
    const claude = spawn(bashPath, [
      '-c',
      `cat "${tempFileUnix}" | claude -p`
    ], {
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Clean up temp file when done
    claude.on('close', () => {
      try { fs.unlinkSync(tempFile); } catch {}
    });

    let hasOutput = false;

    claude.stdout.on('data', (data: Buffer) => {
      hasOutput = true;
      const text = data.toString();
      console.log('Claude output chunk received, length:', text.length);
      res.write(`data: ${JSON.stringify({ type: 'delta', text })}\n\n`);
    });

    claude.stderr.on('data', (data: Buffer) => {
      const errText = data.toString();
      console.error('Claude CLI stderr:', errText);
    });

    claude.on('close', (code) => {
      console.log(`Claude CLI exited with code ${code}, hasOutput: ${hasOutput}`);
      if (code !== 0 && !hasOutput) {
        res.write(`data: ${JSON.stringify({ type: 'error', message: `Claude CLI exited with code ${code}. Make sure 'claude' is installed and in your PATH.` })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    });

    claude.on('error', (error) => {
      console.error('Claude CLI spawn error:', error);
      res.write(`data: ${JSON.stringify({ type: 'error', message: `Failed to start Claude CLI: ${error.message}. Make sure 'claude' is installed and in your PATH.` })}\n\n`);
      res.end();
    });

    // Handle client disconnect
    req.on('close', () => {
      claude.kill();
    });

  } catch (error) {
    console.error('Chat API error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
