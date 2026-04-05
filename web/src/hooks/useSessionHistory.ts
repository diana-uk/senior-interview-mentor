import { useState, useCallback } from 'react';
import type { SessionRecord } from '../types';
import { safeGetItem, safeSetItem } from '../utils/storage.js';

const STORAGE_KEY = 'sim-session-history';
const MAX_SESSIONS = 50;

function loadHistory(): SessionRecord[] {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SessionRecord[];
  } catch {
    return [];
  }
}

export function useSessionHistory() {
  const [sessions, setSessions] = useState<SessionRecord[]>(loadHistory);

  const saveSession = useCallback((record: SessionRecord) => {
    setSessions((prev) => {
      const next = [record, ...prev].slice(0, MAX_SESSIONS);
      safeSetItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const getRecentSessions = useCallback((n: number): SessionRecord[] => {
    return sessions.slice(0, n);
  }, [sessions]);

  return { sessions, saveSession, getRecentSessions };
}
