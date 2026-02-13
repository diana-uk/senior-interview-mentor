import { z } from 'zod';

export const chatMessageSchema = z.object({
  role: z.enum(['mentor', 'user']),
  content: z.string().min(1).max(10_000),
});

const memorySchema = z.object({
  hintStyle: z.enum(['analogies', 'pseudocode', 'visual', 'direct']),
  detailLevel: z.enum(['brief', 'balanced', 'detailed']),
  solvedProblems: z.array(z.object({
    title: z.string(),
    pattern: z.string(),
    difficulty: z.string(),
  })).max(10),
  weakPatterns: z.array(z.object({
    pattern: z.string(),
    mistakeCount: z.number(),
    avgScore: z.number(),
  })).max(5),
  strongPatterns: z.array(z.object({
    pattern: z.string(),
    solveCount: z.number(),
    avgScore: z.number(),
  })).max(5),
  recentMistakes: z.array(z.object({
    problem: z.string(),
    description: z.string(),
  })).max(5),
  totalSolved: z.number(),
  currentStreak: z.number(),
}).optional();

export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1)
    .max(100),
  context: z
    .object({
      mode: z.enum(['TEACHER', 'INTERVIEWER', 'REVIEWER']),
      currentProblem: z
        .object({
          title: z.string(),
          difficulty: z.string(),
          pattern: z.string(),
          description: z.string(),
          constraints: z.array(z.string()),
        })
        .nullable(),
      hintsUsed: z.number().min(0).max(3),
      commitmentGateCompleted: z.number().min(0).max(5),
      interviewStage: z.string().nullable(),
      technicalQuestionCategory: z.string().optional(),
      memory: memorySchema,
    })
    .optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatMessagePayload = z.infer<typeof chatMessageSchema>;

export interface SSEDelta {
  type: 'delta';
  text: string;
}

export interface SSEDone {
  type: 'done';
}

export interface SSEError {
  type: 'error';
  message: string;
}

export type SSEEvent = SSEDelta | SSEDone | SSEError;
