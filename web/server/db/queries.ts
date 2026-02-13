import { getSupabaseAdmin } from './client.js';
import type {
  ProfileUpdate,
  ProblemProgressInsert,
  ProblemProgressUpdate,
  SessionInsert,
  MistakeInsert,
  MistakeUpdate,
  ReviewInsert,
  StreakRow,
  StreakUpdate,
} from './types.js';

// ═══════════════════════════════════════
// PROFILES
// ═══════════════════════════════════════

export async function getProfile(userId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: ProfileUpdate) {
  const { data, error } = await getSupabaseAdmin()
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ═══════════════════════════════════════
// PROBLEM PROGRESS
// ═══════════════════════════════════════

export async function getProgressForUser(userId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('problem_progress')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}

export async function upsertProgress(insert: ProblemProgressInsert) {
  const { data, error } = await getSupabaseAdmin()
    .from('problem_progress')
    .upsert(insert, { onConflict: 'user_id,problem_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProgress(userId: string, problemId: string, updates: ProblemProgressUpdate) {
  const { data, error } = await getSupabaseAdmin()
    .from('problem_progress')
    .update(updates)
    .eq('user_id', userId)
    .eq('problem_id', problemId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ═══════════════════════════════════════
// SESSIONS
// ═══════════════════════════════════════

export async function createSession(insert: SessionInsert) {
  const { data, error } = await getSupabaseAdmin()
    .from('sessions')
    .insert(insert)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getSessionsForUser(userId: string, limit = 50) {
  const { data, error } = await getSupabaseAdmin()
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// ═══════════════════════════════════════
// MISTAKES
// ═══════════════════════════════════════

export async function getMistakesForUser(userId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('mistakes')
    .select('*')
    .eq('user_id', userId)
    .order('next_review', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getDueMistakes(userId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('mistakes')
    .select('*')
    .eq('user_id', userId)
    .lte('next_review', new Date().toISOString())
    .order('next_review', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createMistake(insert: MistakeInsert) {
  const { data, error } = await getSupabaseAdmin()
    .from('mistakes')
    .insert(insert)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMistake(mistakeId: string, userId: string, updates: MistakeUpdate) {
  const { data, error } = await getSupabaseAdmin()
    .from('mistakes')
    .update(updates)
    .eq('id', mistakeId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMistake(mistakeId: string, userId: string) {
  const { error } = await getSupabaseAdmin()
    .from('mistakes')
    .delete()
    .eq('id', mistakeId)
    .eq('user_id', userId);
  if (error) throw error;
}

// ═══════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════

export async function createReview(insert: ReviewInsert) {
  const { data, error } = await getSupabaseAdmin()
    .from('reviews')
    .insert(insert)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getReviewsForUser(userId: string, limit = 50) {
  const { data, error } = await getSupabaseAdmin()
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// ═══════════════════════════════════════
// STREAKS
// ═══════════════════════════════════════

export async function getStreak(userId: string): Promise<StreakRow | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data as StreakRow | null;
}

export async function upsertStreak(userId: string, updates: StreakUpdate) {
  const { data, error } = await getSupabaseAdmin()
    .from('streaks')
    .upsert({ user_id: userId, ...updates }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update streak based on today's activity.
 * Call this after each problem attempt or session.
 */
export async function recordActivity(userId: string) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const existing = await getStreak(userId);

  if (!existing) {
    return upsertStreak(userId, {
      current_streak: 1,
      longest_streak: 1,
      last_active_date: today,
    });
  }

  // Already active today
  if (existing.last_active_date === today) return existing;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const isConsecutive = existing.last_active_date === yesterdayStr;
  const newStreak = isConsecutive ? existing.current_streak + 1 : 1;
  const longest = Math.max(existing.longest_streak, newStreak);

  return upsertStreak(userId, {
    current_streak: newStreak,
    longest_streak: longest,
    last_active_date: today,
  });
}

// ═══════════════════════════════════════
// BULK SYNC (localStorage → DB)
// ═══════════════════════════════════════

export interface SyncPayload {
  progress: Record<string, {
    status: string;
    attempts: number;
    bestScore: number | null;
    bestTime: number | null;
    hintsUsed: number;
    code: string;
    lastAttempted: string;
  }>;
  mistakes: Array<{
    pattern: string;
    problemId: string | null;
    problemTitle: string;
    description: string;
    nextReview: string;
    interval: number;
    easeFactor: number;
    repetitions: number;
    streak: number;
    createdAt: string;
  }>;
  sessions: Array<{
    mode: string;
    problemId: string | null;
    problemTitle: string;
    duration: number;
    hintsUsed: number;
    score: number | null;
    patterns: string[];
    date: string;
  }>;
  reviews: Array<{
    problemId: string | null;
    problemTitle: string;
    dimensions: Record<string, number>;
    overallScore: number;
    feedback: string;
    improvementPlan: string[];
    createdAt: string;
  }>;
}

/**
 * Sync all localStorage data to the database (one-time migration).
 * Upserts progress, inserts sessions/mistakes/reviews.
 */
export async function syncFromLocalStorage(userId: string, payload: SyncPayload) {
  const db = getSupabaseAdmin();

  // 1. Upsert problem progress
  if (Object.keys(payload.progress).length > 0) {
    const rows = Object.entries(payload.progress).map(([problemId, p]) => ({
      user_id: userId,
      problem_id: problemId,
      status: p.status as 'unseen' | 'attempted' | 'solved',
      attempts: p.attempts,
      best_score: p.bestScore,
      best_time: p.bestTime,
      hints_used: p.hintsUsed,
      last_code: p.code || null,
      last_attempted_at: p.lastAttempted,
    }));
    const { error } = await db.from('problem_progress').upsert(rows, { onConflict: 'user_id,problem_id' });
    if (error) throw error;
  }

  // 2. Insert mistakes
  if (payload.mistakes.length > 0) {
    const rows = payload.mistakes.map((m) => ({
      user_id: userId,
      pattern: m.pattern,
      problem_id: m.problemId,
      problem_title: m.problemTitle,
      description: m.description,
      next_review: m.nextReview,
      interval_days: m.interval,
      ease_factor: m.easeFactor,
      repetitions: m.repetitions,
      streak: m.streak,
      created_at: m.createdAt,
    }));
    const { error } = await db.from('mistakes').insert(rows);
    if (error) throw error;
  }

  // 3. Insert sessions
  if (payload.sessions.length > 0) {
    const rows = payload.sessions.map((s) => ({
      user_id: userId,
      mode: s.mode as 'TEACHER' | 'INTERVIEWER' | 'REVIEWER',
      problem_id: s.problemId,
      problem_title: s.problemTitle,
      duration: s.duration,
      hints_used: s.hintsUsed,
      score: s.score,
      patterns: s.patterns,
      created_at: s.date,
    }));
    const { error } = await db.from('sessions').insert(rows);
    if (error) throw error;
  }

  // 4. Insert reviews
  if (payload.reviews.length > 0) {
    const rows = payload.reviews.map((r) => ({
      user_id: userId,
      problem_id: r.problemId,
      problem_title: r.problemTitle,
      correctness: r.dimensions['correctness'] ?? null,
      time_complexity: r.dimensions['time-complexity'] ?? null,
      space_complexity: r.dimensions['space-complexity'] ?? null,
      code_quality: r.dimensions['code-quality'] ?? null,
      edge_cases: r.dimensions['edge-cases'] ?? null,
      communication: r.dimensions['communication'] ?? null,
      overall_score: r.overallScore,
      feedback: r.feedback,
      improvement_plan: r.improvementPlan,
      created_at: r.createdAt,
    }));
    const { error } = await db.from('reviews').insert(rows);
    if (error) throw error;
  }

  // 5. Record streak activity
  await recordActivity(userId);

  return { synced: true };
}
