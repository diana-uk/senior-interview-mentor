import { useState, useCallback } from 'react';
import { safeGetItem, safeSetItem } from '../utils/storage.js';

const STORAGE_KEY = 'sim-bookmarks';

function loadBookmarks(): Set<string> {
  const raw = safeGetItem(STORAGE_KEY);
  if (!raw) return new Set();
  try {
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveBookmarks(bookmarks: Set<string>): void {
  safeSetItem(STORAGE_KEY, JSON.stringify([...bookmarks]));
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<string>>(loadBookmarks);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveBookmarks(next);
      return next;
    });
  }, []);

  return { bookmarks, toggleBookmark };
}
