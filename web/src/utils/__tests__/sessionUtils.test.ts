import { describe, it, expect } from 'vitest';
import { serializeMessages, deserializeMessages } from '../sessionUtils';
import type { PersistedMessage } from '../sessionUtils';
import type { ChatMessage } from '../../types';

function makeMsg(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'm1',
    role: 'mentor',
    content: 'Hello',
    timestamp: new Date('2026-01-10T12:00:00.000Z'),
    ...overrides,
  };
}

// ─── serializeMessages ────────────────────────────────────────────────────────

describe('serializeMessages', () => {
  it('returns empty array for empty input', () => {
    expect(serializeMessages([])).toEqual([]);
  });

  it('maps a basic message to PersistedMessage shape', () => {
    const msg = makeMsg({ id: 'abc', role: 'user', content: 'Hi' });
    const result = serializeMessages([msg]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('abc');
    expect(result[0].role).toBe('user');
    expect(result[0].content).toBe('Hi');
  });

  it('converts timestamp to ISO string', () => {
    const msg = makeMsg({ timestamp: new Date('2026-01-10T12:00:00.000Z') });
    const result = serializeMessages([msg]);
    expect(result[0].timestamp).toBe('2026-01-10T12:00:00.000Z');
  });

  it('filters out streaming messages', () => {
    const streaming = makeMsg({ id: 's1', isStreaming: true });
    const normal = makeMsg({ id: 'n1', isStreaming: false });
    const result = serializeMessages([streaming, normal]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('n1');
  });

  it('includes isError: true when set', () => {
    const msg = makeMsg({ isError: true });
    const result = serializeMessages([msg]);
    expect(result[0].isError).toBe(true);
  });

  it('omits isError key when not set', () => {
    const msg = makeMsg();
    const result = serializeMessages([msg]);
    expect('isError' in result[0]).toBe(false);
  });

  it('serializes multiple messages preserving order', () => {
    const m1 = makeMsg({ id: 'm1', content: 'first' });
    const m2 = makeMsg({ id: 'm2', content: 'second' });
    const result = serializeMessages([m1, m2]);
    expect(result[0].id).toBe('m1');
    expect(result[1].id).toBe('m2');
  });
});

// ─── deserializeMessages ──────────────────────────────────────────────────────

describe('deserializeMessages', () => {
  it('returns empty array for empty input', () => {
    expect(deserializeMessages([])).toEqual([]);
  });

  it('converts timestamp ISO string to Date object', () => {
    const persisted: PersistedMessage[] = [{
      id: 'm1',
      role: 'mentor',
      content: 'Hello',
      timestamp: '2026-01-10T12:00:00.000Z',
    }];
    const result = deserializeMessages(persisted);
    expect(result[0].timestamp).toBeInstanceOf(Date);
    expect(result[0].timestamp.toISOString()).toBe('2026-01-10T12:00:00.000Z');
  });

  it('maps id, role, content correctly', () => {
    const persisted: PersistedMessage[] = [{
      id: 'x99',
      role: 'user',
      content: 'Test message',
      timestamp: '2026-01-01T00:00:00.000Z',
    }];
    const result = deserializeMessages(persisted);
    expect(result[0].id).toBe('x99');
    expect(result[0].role).toBe('user');
    expect(result[0].content).toBe('Test message');
  });

  it('preserves isError: true', () => {
    const persisted: PersistedMessage[] = [{
      id: 'm1',
      role: 'mentor',
      content: 'error',
      timestamp: '2026-01-01T00:00:00.000Z',
      isError: true,
    }];
    const result = deserializeMessages(persisted);
    expect(result[0].isError).toBe(true);
  });

  it('omits isError key when not set in persisted', () => {
    const persisted: PersistedMessage[] = [{
      id: 'm1',
      role: 'mentor',
      content: 'ok',
      timestamp: '2026-01-01T00:00:00.000Z',
    }];
    const result = deserializeMessages(persisted);
    expect('isError' in result[0]).toBe(false);
  });
});

// ─── round-trip ───────────────────────────────────────────────────────────────

describe('serializeMessages → deserializeMessages round-trip', () => {
  it('preserves message data across serialize → deserialize', () => {
    const original: ChatMessage[] = [
      makeMsg({ id: 'a', role: 'user', content: 'Question', timestamp: new Date('2026-03-01T08:00:00.000Z') }),
      makeMsg({ id: 'b', role: 'mentor', content: 'Answer', timestamp: new Date('2026-03-01T08:01:00.000Z'), isError: false }),
      makeMsg({ id: 'c', role: 'mentor', content: 'Err', timestamp: new Date('2026-03-01T08:02:00.000Z'), isError: true }),
    ];

    const serialized = serializeMessages(original);
    const restored = deserializeMessages(serialized);

    expect(restored).toHaveLength(3);
    for (let i = 0; i < original.length; i++) {
      expect(restored[i].id).toBe(original[i].id);
      expect(restored[i].role).toBe(original[i].role);
      expect(restored[i].content).toBe(original[i].content);
      expect(restored[i].timestamp.toISOString()).toBe(original[i].timestamp.toISOString());
    }
    expect(restored[2].isError).toBe(true);
  });

  it('streaming messages are dropped in round-trip', () => {
    const messages: ChatMessage[] = [
      makeMsg({ id: 's', isStreaming: true }),
      makeMsg({ id: 'n', isStreaming: false }),
    ];
    const restored = deserializeMessages(serializeMessages(messages));
    expect(restored).toHaveLength(1);
    expect(restored[0].id).toBe('n');
  });
});
