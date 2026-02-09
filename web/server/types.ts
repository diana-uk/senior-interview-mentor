import { z } from 'zod';

export const chatMessageSchema = z.object({
  role: z.enum(['mentor', 'user']),
  content: z.string().min(1).max(10_000),
});

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
