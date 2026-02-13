/**
 * Database types matching Supabase's expected interface structure.
 * Row/Insert/Update types are defined inline as plain object types
 * (required for Supabase generic inference to work).
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          target_level: 'new-grad' | 'mid' | 'senior' | 'staff' | null;
          preferred_language: 'typescript' | 'javascript' | 'python';
          plan: 'free' | 'premium' | 'pro';
          settings: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          target_level?: 'new-grad' | 'mid' | 'senior' | 'staff' | null;
          preferred_language?: 'typescript' | 'javascript' | 'python';
          plan?: 'free' | 'premium' | 'pro';
          settings?: Record<string, unknown>;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          target_level?: 'new-grad' | 'mid' | 'senior' | 'staff' | null;
          preferred_language?: 'typescript' | 'javascript' | 'python';
          plan?: 'free' | 'premium' | 'pro';
          settings?: Record<string, unknown>;
          updated_at?: string;
        };
        Relationships: [];
      };
      problem_progress: {
        Row: {
          id: string;
          user_id: string;
          problem_id: string;
          status: 'unseen' | 'attempted' | 'solved';
          attempts: number;
          best_score: number | null;
          best_time: number | null;
          hints_used: number;
          last_code: string | null;
          last_attempted_at: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          problem_id: string;
          status?: 'unseen' | 'attempted' | 'solved';
          attempts?: number;
          best_score?: number | null;
          best_time?: number | null;
          hints_used?: number;
          last_code?: string | null;
          last_attempted_at?: string;
        };
        Update: {
          status?: 'unseen' | 'attempted' | 'solved';
          attempts?: number;
          best_score?: number | null;
          best_time?: number | null;
          hints_used?: number;
          last_code?: string | null;
          last_attempted_at?: string;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          mode: 'TEACHER' | 'INTERVIEWER' | 'REVIEWER';
          problem_id: string | null;
          problem_title: string | null;
          duration: number;
          hints_used: number;
          score: number | null;
          patterns: string[];
          created_at: string;
        };
        Insert: {
          user_id: string;
          mode: 'TEACHER' | 'INTERVIEWER' | 'REVIEWER';
          problem_id?: string | null;
          problem_title?: string | null;
          duration?: number;
          hints_used?: number;
          score?: number | null;
          patterns?: string[];
          created_at?: string;
        };
        Update: {
          problem_id?: string | null;
          problem_title?: string | null;
          duration?: number;
          hints_used?: number;
          score?: number | null;
          patterns?: string[];
        };
        Relationships: [];
      };
      mistakes: {
        Row: {
          id: string;
          user_id: string;
          pattern: string;
          problem_id: string | null;
          problem_title: string;
          description: string;
          next_review: string;
          interval_days: number;
          ease_factor: number;
          repetitions: number;
          streak: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          pattern: string;
          problem_title: string;
          description: string;
          problem_id?: string | null;
          next_review?: string;
          interval_days?: number;
          ease_factor?: number;
          repetitions?: number;
          streak?: number;
          created_at?: string;
        };
        Update: {
          next_review?: string;
          interval_days?: number;
          ease_factor?: number;
          repetitions?: number;
          streak?: number;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          problem_id: string | null;
          problem_title: string;
          correctness: number | null;
          time_complexity: number | null;
          space_complexity: number | null;
          code_quality: number | null;
          edge_cases: number | null;
          communication: number | null;
          overall_score: number | null;
          feedback: string | null;
          improvement_plan: string[];
          created_at: string;
        };
        Insert: {
          user_id: string;
          problem_title: string;
          problem_id?: string | null;
          correctness?: number | null;
          time_complexity?: number | null;
          space_complexity?: number | null;
          code_quality?: number | null;
          edge_cases?: number | null;
          communication?: number | null;
          overall_score?: number | null;
          feedback?: string | null;
          improvement_plan?: string[];
          created_at?: string;
        };
        Update: {
          problem_id?: string | null;
          problem_title?: string;
          correctness?: number | null;
          time_complexity?: number | null;
          space_complexity?: number | null;
          code_quality?: number | null;
          edge_cases?: number | null;
          communication?: number | null;
          overall_score?: number | null;
          feedback?: string | null;
          improvement_plan?: string[];
        };
        Relationships: [];
      };
      streaks: {
        Row: {
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_active_date: string;
        };
        Insert: {
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string;
        };
        Update: {
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: 'free' | 'premium' | 'pro';
          status: 'active' | 'canceled' | 'past_due' | 'trialing';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          plan?: 'free' | 'premium' | 'pro';
          status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
        };
        Update: {
          plan?: 'free' | 'premium' | 'pro';
          status?: 'active' | 'canceled' | 'past_due' | 'trialing';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ── Convenience type aliases (derived from Database) ──

type Tables = Database['public']['Tables'];

export type ProfileRow = Tables['profiles']['Row'];
export type ProfileInsert = Tables['profiles']['Insert'];
export type ProfileUpdate = Tables['profiles']['Update'];

export type ProblemProgressRow = Tables['problem_progress']['Row'];
export type ProblemProgressInsert = Tables['problem_progress']['Insert'];
export type ProblemProgressUpdate = Tables['problem_progress']['Update'];

export type SessionRow = Tables['sessions']['Row'];
export type SessionInsert = Tables['sessions']['Insert'];

export type MistakeRow = Tables['mistakes']['Row'];
export type MistakeInsert = Tables['mistakes']['Insert'];
export type MistakeUpdate = Tables['mistakes']['Update'];

export type ReviewRow = Tables['reviews']['Row'];
export type ReviewInsert = Tables['reviews']['Insert'];

export type StreakRow = Tables['streaks']['Row'];
export type StreakInsert = Tables['streaks']['Insert'];
export type StreakUpdate = Tables['streaks']['Update'];

export type SubscriptionRow = Tables['subscriptions']['Row'];
export type SubscriptionInsert = Tables['subscriptions']['Insert'];
export type SubscriptionUpdate = Tables['subscriptions']['Update'];
