import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// ── Helpers for building mock data ──

function makeUser(overrides?: Record<string, unknown>) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeSession(overrides?: Record<string, unknown>) {
  const user = makeUser();
  return {
    access_token: 'token-abc',
    refresh_token: 'refresh-xyz',
    expires_in: 3600,
    token_type: 'bearer',
    user,
    ...overrides,
  };
}

// ── vi.hoisted creates values available inside hoisted vi.mock factories ──

const {
  _unsubscribe,
  _getSession,
  _onAuthStateChange,
  _signUp,
  _signInWithPassword,
  _signInWithOAuth,
  _signOut,
  mockSupabase,
  holder,
} = vi.hoisted(() => {
  const _unsubscribe = vi.fn();
  const _getSession = vi.fn().mockResolvedValue({ data: { session: null } });
  const _onAuthStateChange = vi.fn((cb: any) => {
    (globalThis as any).__authCb = cb;
    return { data: { subscription: { unsubscribe: _unsubscribe } } };
  });
  const _signUp = vi.fn().mockResolvedValue({ error: null });
  const _signInWithPassword = vi.fn().mockResolvedValue({ error: null });
  const _signInWithOAuth = vi.fn().mockResolvedValue({ error: null });
  const _signOut = vi.fn().mockResolvedValue({ error: null });

  const mockSupabase = {
    auth: {
      getSession: _getSession,
      onAuthStateChange: _onAuthStateChange,
      signUp: _signUp,
      signInWithPassword: _signInWithPassword,
      signInWithOAuth: _signInWithOAuth,
      signOut: _signOut,
    },
  };

  // Mutable holder — the mock module returns holder.supabase so tests can set
  // it to null without require().
  const holder: { supabase: any } = { supabase: mockSupabase };

  return {
    _unsubscribe,
    _getSession,
    _onAuthStateChange,
    _signUp,
    _signInWithPassword,
    _signInWithOAuth,
    _signOut,
    mockSupabase,
    holder,
  };
});

vi.mock('../../lib/supabase.ts', () => ({
  get supabase() {
    return holder.supabase;
  },
}));

import { useAuth } from '../useAuth';

// Helper to fire auth state change
function fireAuthChange(event: string, session: any) {
  const cb = (globalThis as any).__authCb;
  if (cb) cb(event, session);
}

// ── Tests ──

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure supabase points to the real mock
    holder.supabase = mockSupabase;
    // Reset mock implementations to defaults
    _getSession.mockResolvedValue({ data: { session: null } });
    _onAuthStateChange.mockImplementation((cb: any) => {
      (globalThis as any).__authCb = cb;
      return { data: { subscription: { unsubscribe: _unsubscribe } } };
    });
    _signUp.mockResolvedValue({ error: null });
    _signInWithPassword.mockResolvedValue({ error: null });
    _signInWithOAuth.mockResolvedValue({ error: null });
    _signOut.mockResolvedValue({ error: null });
  });

  // ────────────────────────────────────────
  // Initialization
  // ────────────────────────────────────────

  describe('initialization', () => {
    it('calls getSession on mount', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(_getSession).toHaveBeenCalledTimes(1);
    });

    it('sets loading=false after getSession resolves with no session', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('sets user and session to null when getSession returns no session', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('populates user and session when getSession returns a session', async () => {
      const session = makeSession();
      _getSession.mockResolvedValue({ data: { session } });

      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.user).toEqual(session.user);
      expect(result.current.session).toEqual(session);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('subscribes to auth state changes on mount', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(_onAuthStateChange).toHaveBeenCalledTimes(1);
    });
  });

  // ────────────────────────────────────────
  // Auth state change subscription
  // ────────────────────────────────────────

  describe('auth state change subscription', () => {
    it('updates user and session when auth state changes to signed in', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const session = makeSession();
      act(() => {
        fireAuthChange('SIGNED_IN', session);
      });

      expect(result.current.session).toEqual(session);
      expect(result.current.user).toEqual(session.user);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('clears user and session when auth state changes to signed out', async () => {
      const session = makeSession();
      _getSession.mockResolvedValue({ data: { session } });

      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      act(() => {
        fireAuthChange('SIGNED_OUT', null);
      });

      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('sets loading=false on auth state change', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const session = makeSession();
      act(() => {
        fireAuthChange('TOKEN_REFRESHED', session);
      });

      expect(result.current.loading).toBe(false);
    });

    it('sets user to null when auth state change session is null', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        fireAuthChange('SIGNED_OUT', null);
      });

      expect(result.current.user).toBeNull();
    });
  });

  // ────────────────────────────────────────
  // Cleanup
  // ────────────────────────────────────────

  describe('cleanup on unmount', () => {
    it('unsubscribes from auth state changes on unmount', async () => {
      const { result, unmount } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      unmount();
      expect(_unsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  // ────────────────────────────────────────
  // signUp
  // ────────────────────────────────────────

  describe('signUp', () => {
    it('calls supabase.auth.signUp with email and password', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signUp('user@example.com', 'password123');
      });

      expect(_signUp).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    it('returns empty object on success', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let response: { error?: string } = {};
      await act(async () => {
        response = await result.current.signUp('user@example.com', 'pass');
      });

      expect(response).toEqual({});
      expect(response.error).toBeUndefined();
    });

    it('returns error message on failure', async () => {
      _signUp.mockResolvedValue({
        error: { message: 'Email already registered' },
      });

      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let response: { error?: string } = {};
      await act(async () => {
        response = await result.current.signUp('dup@example.com', 'pass');
      });

      expect(response).toEqual({ error: 'Email already registered' });
    });

    it('returns error message for invalid password', async () => {
      _signUp.mockResolvedValue({
        error: { message: 'Password should be at least 6 characters' },
      });

      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let response: { error?: string } = {};
      await act(async () => {
        response = await result.current.signUp('user@test.com', 'ab');
      });

      expect(response.error).toBe('Password should be at least 6 characters');
    });
  });

  // ────────────────────────────────────────
  // signIn
  // ────────────────────────────────────────

  describe('signIn', () => {
    it('calls supabase.auth.signInWithPassword with email and password', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signIn('user@example.com', 'password123');
      });

      expect(_signInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    it('returns empty object on success', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let response: { error?: string } = {};
      await act(async () => {
        response = await result.current.signIn('user@example.com', 'pass');
      });

      expect(response).toEqual({});
      expect(response.error).toBeUndefined();
    });

    it('returns error message on invalid credentials', async () => {
      _signInWithPassword.mockResolvedValue({
        error: { message: 'Invalid login credentials' },
      });

      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let response: { error?: string } = {};
      await act(async () => {
        response = await result.current.signIn('wrong@example.com', 'wrong');
      });

      expect(response).toEqual({ error: 'Invalid login credentials' });
    });

    it('returns error message for unconfirmed email', async () => {
      _signInWithPassword.mockResolvedValue({
        error: { message: 'Email not confirmed' },
      });

      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let response: { error?: string } = {};
      await act(async () => {
        response = await result.current.signIn('user@test.com', 'pass');
      });

      expect(response.error).toBe('Email not confirmed');
    });
  });

  // ────────────────────────────────────────
  // signInWithOAuth
  // ────────────────────────────────────────

  describe('signInWithOAuth', () => {
    it('calls supabase.auth.signInWithOAuth with google provider', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signInWithOAuth('google');
      });

      expect(_signInWithOAuth).toHaveBeenCalledWith({ provider: 'google' });
    });

    it('calls supabase.auth.signInWithOAuth with github provider', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signInWithOAuth('github');
      });

      expect(_signInWithOAuth).toHaveBeenCalledWith({ provider: 'github' });
    });

    it('does not throw on success', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.signInWithOAuth('google');
        }),
      ).resolves.not.toThrow();
    });
  });

  // ────────────────────────────────────────
  // signOut
  // ────────────────────────────────────────

  describe('signOut', () => {
    it('calls supabase.auth.signOut', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(_signOut).toHaveBeenCalledTimes(1);
    });

    it('does not throw on success', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.signOut();
        }),
      ).resolves.not.toThrow();
    });
  });

  // ────────────────────────────────────────
  // isAuthenticated
  // ────────────────────────────────────────

  describe('isAuthenticated', () => {
    it('is false when session is null', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('is true when session is present', async () => {
      const session = makeSession();
      _getSession.mockResolvedValue({ data: { session } });

      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('transitions from false to true when session appears via auth change', async () => {
      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);

      const session = makeSession();
      act(() => {
        fireAuthChange('SIGNED_IN', session);
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('transitions from true to false when session is cleared via auth change', async () => {
      const session = makeSession();
      _getSession.mockResolvedValue({ data: { session } });

      const { result } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      act(() => {
        fireAuthChange('SIGNED_OUT', null);
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // ────────────────────────────────────────
  // Function reference stability (useCallback)
  // ────────────────────────────────────────

  describe('function reference stability', () => {
    it('signUp has stable reference across re-renders', async () => {
      const { result, rerender } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const firstRef = result.current.signUp;
      rerender();
      expect(result.current.signUp).toBe(firstRef);
    });

    it('signIn has stable reference across re-renders', async () => {
      const { result, rerender } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const firstRef = result.current.signIn;
      rerender();
      expect(result.current.signIn).toBe(firstRef);
    });

    it('signOut has stable reference across re-renders', async () => {
      const { result, rerender } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const firstRef = result.current.signOut;
      rerender();
      expect(result.current.signOut).toBe(firstRef);
    });

    it('signInWithOAuth has stable reference across re-renders', async () => {
      const { result, rerender } = renderHook(() => useAuth());
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const firstRef = result.current.signInWithOAuth;
      rerender();
      expect(result.current.signInWithOAuth).toBe(firstRef);
    });
  });
});

// ────────────────────────────────────────
// Separate describe: supabase is null
// ────────────────────────────────────────

describe('useAuth (supabase is null)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set supabase to null via the mutable holder
    holder.supabase = null;
  });

  afterEach(() => {
    // Restore mock supabase
    holder.supabase = mockSupabase;
  });

  it('starts with loading=false when supabase is null', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(false);
  });

  it('signUp returns "Auth not configured" error when supabase is null', async () => {
    const { result } = renderHook(() => useAuth());

    let response: { error?: string } = {};
    await act(async () => {
      response = await result.current.signUp('user@test.com', 'pass');
    });

    expect(response).toEqual({ error: 'Auth not configured' });
  });

  it('signIn returns "Auth not configured" error when supabase is null', async () => {
    const { result } = renderHook(() => useAuth());

    let response: { error?: string } = {};
    await act(async () => {
      response = await result.current.signIn('user@test.com', 'pass');
    });

    expect(response).toEqual({ error: 'Auth not configured' });
  });

  it('signInWithOAuth does nothing when supabase is null', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithOAuth('google');
    });

    expect(_signInWithOAuth).not.toHaveBeenCalled();
  });

  it('signOut does nothing when supabase is null', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(_signOut).not.toHaveBeenCalled();
  });

  it('does not call getSession when supabase is null', () => {
    renderHook(() => useAuth());
    expect(_getSession).not.toHaveBeenCalled();
  });

  it('does not subscribe to auth state changes when supabase is null', () => {
    renderHook(() => useAuth());
    expect(_onAuthStateChange).not.toHaveBeenCalled();
  });
});
