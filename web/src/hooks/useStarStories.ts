import { useState, useCallback } from 'react';
import type { BehavioralCategory } from '../data/behavioral';
import { safeGetItem, safeSetItem } from '../utils/storage.js';
import { generateId } from '../utils/statsUtils.js';

const STORAGE_KEY = 'sim-star-stories';

export interface StarStory {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  tags: BehavioralCategory[];
  createdAt: string;
  updatedAt: string;
}

function load(): StarStory[] {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StarStory[]) : [];
  } catch {
    return [];
  }
}

export function useStarStories() {
  const [stories, setStories] = useState<StarStory[]>(load);

  function persist(next: StarStory[]) {
    safeSetItem(STORAGE_KEY, JSON.stringify(next));
    setStories(next);
  }

  const addStory = useCallback(
    (data: Omit<StarStory, 'id' | 'createdAt' | 'updatedAt'>): StarStory => {
      const now = new Date().toISOString();
      const entry: StarStory = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      persist([entry, ...stories]);
      return entry;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stories],
  );

  const updateStory = useCallback(
    (id: string, updates: Partial<Omit<StarStory, 'id' | 'createdAt'>>) => {
      const next = stories.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s,
      );
      persist(next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stories],
  );

  const deleteStory = useCallback(
    (id: string) => {
      persist(stories.filter((s) => s.id !== id));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stories],
  );

  const getStoriesForCategory = useCallback(
    (category: BehavioralCategory): StarStory[] => {
      return stories.filter((s) => s.tags.includes(category));
    },
    [stories],
  );

  return { stories, addStory, updateStory, deleteStory, getStoriesForCategory };
}
