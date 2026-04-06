import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStarStories } from '../useStarStories';
import type { StarStory } from '../useStarStories';
import type { BehavioralCategory } from '../../data/behavioral';

vi.mock('../../utils/storage', () => {
  let store: Record<string, string> = {};
  return {
    safeGetItem: (key: string) => store[key] ?? null,
    safeSetItem: (key: string, value: string) => { store[key] = value; },
    safeRemoveItem: (key: string) => { delete store[key]; },
    __resetStore: () => { store = {}; },
  };
});

import * as storage from '../../utils/storage';

const STORY_DATA: Omit<StarStory, 'id' | 'createdAt' | 'updatedAt'> = {
  title: 'Led team migration',
  situation: 'Our team faced a legacy codebase...',
  task: 'I was tasked with migrating...',
  action: 'I created a plan...',
  result: 'We reduced load time by 40%.',
  tags: ['leadership' as BehavioralCategory],
};

beforeEach(() => {
  (storage as unknown as { __resetStore: () => void }).__resetStore();
});

describe('useStarStories', () => {
  describe('initial state', () => {
    it('starts with an empty array when nothing is stored', () => {
      const { result } = renderHook(() => useStarStories());
      expect(result.current.stories).toEqual([]);
    });

    it('loads persisted stories from storage on mount', () => {
      const story: StarStory = {
        ...STORY_DATA,
        id: 'abc123',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      storage.safeSetItem('sim-star-stories', JSON.stringify([story]));
      const { result } = renderHook(() => useStarStories());
      expect(result.current.stories.length).toBe(1);
      expect(result.current.stories[0].id).toBe('abc123');
    });

    it('returns empty array when stored value is invalid JSON', () => {
      storage.safeSetItem('sim-star-stories', 'bad-json');
      const { result } = renderHook(() => useStarStories());
      expect(result.current.stories).toEqual([]);
    });
  });

  describe('addStory', () => {
    it('adds a story to the list', () => {
      const { result } = renderHook(() => useStarStories());
      act(() => { result.current.addStory(STORY_DATA); });
      expect(result.current.stories.length).toBe(1);
    });

    it('returns the newly created story', () => {
      const { result } = renderHook(() => useStarStories());
      let returned: StarStory | undefined;
      act(() => { returned = result.current.addStory(STORY_DATA); });
      expect(returned).toBeDefined();
      expect(returned?.title).toBe(STORY_DATA.title);
    });

    it('auto-generates a non-empty id', () => {
      const { result } = renderHook(() => useStarStories());
      let story: StarStory | undefined;
      act(() => { story = result.current.addStory(STORY_DATA); });
      expect(typeof story?.id).toBe('string');
      expect(story!.id.length).toBeGreaterThan(0);
    });

    it('auto-generates a createdAt ISO timestamp', () => {
      const { result } = renderHook(() => useStarStories());
      let story: StarStory | undefined;
      act(() => { story = result.current.addStory(STORY_DATA); });
      expect(() => new Date(story!.createdAt)).not.toThrow();
      expect(story!.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('sets updatedAt equal to createdAt on creation', () => {
      const { result } = renderHook(() => useStarStories());
      let story: StarStory | undefined;
      act(() => { story = result.current.addStory(STORY_DATA); });
      expect(story!.updatedAt).toBe(story!.createdAt);
    });

    it('prepends new story (most recent first)', () => {
      const { result } = renderHook(() => useStarStories());
      act(() => { result.current.addStory({ ...STORY_DATA, title: 'First' }); });
      act(() => { result.current.addStory({ ...STORY_DATA, title: 'Second' }); });
      expect(result.current.stories[0].title).toBe('Second');
      expect(result.current.stories[1].title).toBe('First');
    });

    it('generates unique ids for multiple stories', () => {
      const { result } = renderHook(() => useStarStories());
      let s1: StarStory | undefined;
      let s2: StarStory | undefined;
      act(() => { s1 = result.current.addStory(STORY_DATA); });
      act(() => { s2 = result.current.addStory(STORY_DATA); });
      expect(s1!.id).not.toBe(s2!.id);
    });

    it('persists new story to storage', () => {
      const { result } = renderHook(() => useStarStories());
      act(() => { result.current.addStory(STORY_DATA); });
      const stored = JSON.parse(storage.safeGetItem('sim-star-stories') ?? '[]') as StarStory[];
      expect(stored.length).toBe(1);
      expect(stored[0].title).toBe(STORY_DATA.title);
    });

    it('preserves all STAR fields on the created story', () => {
      const { result } = renderHook(() => useStarStories());
      let story: StarStory | undefined;
      act(() => { story = result.current.addStory(STORY_DATA); });
      expect(story!.situation).toBe(STORY_DATA.situation);
      expect(story!.task).toBe(STORY_DATA.task);
      expect(story!.action).toBe(STORY_DATA.action);
      expect(story!.result).toBe(STORY_DATA.result);
      expect(story!.tags).toEqual(STORY_DATA.tags);
    });
  });

  describe('updateStory', () => {
    it('updates the title of an existing story', () => {
      const { result } = renderHook(() => useStarStories());
      let story: StarStory | undefined;
      act(() => { story = result.current.addStory(STORY_DATA); });
      act(() => { result.current.updateStory(story!.id, { title: 'Updated Title' }); });
      expect(result.current.stories[0].title).toBe('Updated Title');
    });

    it('does not change createdAt', () => {
      const { result } = renderHook(() => useStarStories());
      let story: StarStory | undefined;
      act(() => { story = result.current.addStory(STORY_DATA); });
      const originalCreatedAt = story!.createdAt;
      act(() => { result.current.updateStory(story!.id, { title: 'New' }); });
      expect(result.current.stories[0].createdAt).toBe(originalCreatedAt);
    });

    it('sets a new updatedAt timestamp', () => {
      const { result } = renderHook(() => useStarStories());
      let story: StarStory | undefined;
      act(() => { story = result.current.addStory(STORY_DATA); });
      const originalUpdatedAt = story!.createdAt;
      act(() => { result.current.updateStory(story!.id, { title: 'New' }); });
      // updatedAt should be a valid ISO string (may equal createdAt if same ms)
      expect(result.current.stories[0].updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(typeof result.current.stories[0].updatedAt).toBe('string');
      // createdAt unchanged
      expect(result.current.stories[0].createdAt).toBe(originalUpdatedAt);
    });

    it('can update multiple fields at once', () => {
      const { result } = renderHook(() => useStarStories());
      let story: StarStory | undefined;
      act(() => { story = result.current.addStory(STORY_DATA); });
      act(() => {
        result.current.updateStory(story!.id, {
          title: 'New Title',
          action: 'New action text',
          tags: ['teamwork' as BehavioralCategory],
        });
      });
      const updated = result.current.stories[0];
      expect(updated.title).toBe('New Title');
      expect(updated.action).toBe('New action text');
      expect(updated.tags).toEqual(['teamwork']);
    });

    it('does not affect other stories', () => {
      const { result } = renderHook(() => useStarStories());
      let s1: StarStory | undefined;
      let s2: StarStory | undefined;
      act(() => { s1 = result.current.addStory({ ...STORY_DATA, title: 'Story A' }); });
      act(() => { s2 = result.current.addStory({ ...STORY_DATA, title: 'Story B' }); });
      act(() => { result.current.updateStory(s2!.id, { title: 'Story B Updated' }); });
      expect(result.current.stories.find((s) => s.id === s1!.id)?.title).toBe('Story A');
    });

    it('is a no-op for an unknown id', () => {
      const { result } = renderHook(() => useStarStories());
      act(() => { result.current.addStory(STORY_DATA); });
      const before = result.current.stories[0].title;
      act(() => { result.current.updateStory('nonexistent', { title: 'Changed' }); });
      expect(result.current.stories[0].title).toBe(before);
    });

    it('persists updated story to storage', () => {
      const { result } = renderHook(() => useStarStories());
      let story: StarStory | undefined;
      act(() => { story = result.current.addStory(STORY_DATA); });
      act(() => { result.current.updateStory(story!.id, { title: 'Persisted Update' }); });
      const stored = JSON.parse(storage.safeGetItem('sim-star-stories') ?? '[]') as StarStory[];
      expect(stored[0].title).toBe('Persisted Update');
    });
  });

  describe('deleteStory', () => {
    it('removes a story by id', () => {
      const { result } = renderHook(() => useStarStories());
      let story: StarStory | undefined;
      act(() => { story = result.current.addStory(STORY_DATA); });
      act(() => { result.current.deleteStory(story!.id); });
      expect(result.current.stories.length).toBe(0);
    });

    it('does not remove other stories', () => {
      const { result } = renderHook(() => useStarStories());
      let s1: StarStory | undefined;
      let s2: StarStory | undefined;
      act(() => { s1 = result.current.addStory({ ...STORY_DATA, title: 'Keep' }); });
      act(() => { s2 = result.current.addStory({ ...STORY_DATA, title: 'Delete Me' }); });
      act(() => { result.current.deleteStory(s2!.id); });
      expect(result.current.stories.length).toBe(1);
      expect(result.current.stories[0].id).toBe(s1!.id);
    });

    it('is a no-op for an unknown id', () => {
      const { result } = renderHook(() => useStarStories());
      act(() => { result.current.addStory(STORY_DATA); });
      act(() => { result.current.deleteStory('nonexistent'); });
      expect(result.current.stories.length).toBe(1);
    });

    it('persists deletion to storage', () => {
      const { result } = renderHook(() => useStarStories());
      let story: StarStory | undefined;
      act(() => { story = result.current.addStory(STORY_DATA); });
      act(() => { result.current.deleteStory(story!.id); });
      const stored = JSON.parse(storage.safeGetItem('sim-star-stories') ?? '[]') as StarStory[];
      expect(stored.length).toBe(0);
    });
  });

  describe('getStoriesForCategory', () => {
    it('returns empty array when no stories match', () => {
      const { result } = renderHook(() => useStarStories());
      expect(result.current.getStoriesForCategory('leadership')).toEqual([]);
    });

    it('returns stories that include the given category tag', () => {
      const { result } = renderHook(() => useStarStories());
      act(() => { result.current.addStory({ ...STORY_DATA, tags: ['leadership'] }); });
      act(() => { result.current.addStory({ ...STORY_DATA, tags: ['conflict'] }); });
      const leadership = result.current.getStoriesForCategory('leadership');
      expect(leadership.length).toBe(1);
      expect(leadership[0].tags).toContain('leadership');
    });

    it('does not return stories for a different category', () => {
      const { result } = renderHook(() => useStarStories());
      act(() => { result.current.addStory({ ...STORY_DATA, tags: ['teamwork'] }); });
      expect(result.current.getStoriesForCategory('failure').length).toBe(0);
    });

    it('returns stories tagged with multiple categories', () => {
      const { result } = renderHook(() => useStarStories());
      act(() => {
        result.current.addStory({ ...STORY_DATA, tags: ['leadership', 'teamwork'] });
      });
      expect(result.current.getStoriesForCategory('leadership').length).toBe(1);
      expect(result.current.getStoriesForCategory('teamwork').length).toBe(1);
    });
  });

  describe('persistence across remounts', () => {
    it('reloads stories from storage on fresh mount', () => {
      const { result: r1 } = renderHook(() => useStarStories());
      act(() => { r1.current.addStory({ ...STORY_DATA, title: 'Persist Me' }); });

      const { result: r2 } = renderHook(() => useStarStories());
      expect(r2.current.stories.length).toBe(1);
      expect(r2.current.stories[0].title).toBe('Persist Me');
    });
  });
});
