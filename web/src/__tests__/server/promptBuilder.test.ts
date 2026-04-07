import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../server/services/systemPrompt.js', () => ({
  buildSessionContext: vi.fn((ctx) => ctx ? `[session:${ctx.mode}]` : ''),
}));

import { buildChatPrompt } from '../../../server/utils/promptBuilder';
import type { ChatMessagePayload } from '../../../server/types';

function msg(role: 'user' | 'assistant', content: string): ChatMessagePayload {
  return { role, content };
}

describe('buildChatPrompt', () => {
  describe('core identity', () => {
    it('includes Senior Mentor identity in every prompt', () => {
      const result = buildChatPrompt([msg('user', 'Hello')]);
      expect(result).toContain('You are Senior Mentor');
    });

    it('instructs model not to use tools', () => {
      const result = buildChatPrompt([msg('user', 'Hello')]);
      expect(result).toContain('NO tools available');
    });

    it('instructs model not to output tool_call syntax', () => {
      const result = buildChatPrompt([msg('user', 'Hello')]);
      expect(result).toContain('<tool_call>');
    });
  });

  describe('single message (no history)', () => {
    it('includes the user message content', () => {
      const result = buildChatPrompt([msg('user', 'What is two sum?')]);
      expect(result).toContain('What is two sum?');
    });

    it('does not include "Conversation so far" for single message', () => {
      const result = buildChatPrompt([msg('user', 'Hello')]);
      expect(result).not.toContain('Conversation so far');
    });
  });

  describe('conversation history', () => {
    it('includes "Conversation so far" when there are multiple messages', () => {
      const result = buildChatPrompt([
        msg('user', 'What is two sum?'),
        msg('assistant', 'It is a hash map problem.'),
        msg('user', 'Can you explain more?'),
      ]);
      expect(result).toContain('Conversation so far');
    });

    it('excludes the last message from history section', () => {
      const result = buildChatPrompt([
        msg('user', 'First message'),
        msg('assistant', 'First response'),
        msg('user', 'Second message'),
      ]);
      // "Second message" should appear as last message, not in history
      const historyIdx = result.indexOf('Conversation so far');
      const lastIdx = result.lastIndexOf('Second message');
      const historyEnd = result.indexOf('---', historyIdx);
      // Last message appears after the history section separator
      expect(lastIdx).toBeGreaterThan(historyEnd);
    });

    it('formats user messages as "User: content"', () => {
      const result = buildChatPrompt([
        msg('user', 'My question'),
        msg('assistant', 'My answer'),
        msg('user', 'Follow up'),
      ]);
      expect(result).toContain('User: My question');
    });

    it('formats assistant messages as "Mentor: content"', () => {
      const result = buildChatPrompt([
        msg('user', 'My question'),
        msg('assistant', 'My answer'),
        msg('user', 'Follow up'),
      ]);
      expect(result).toContain('Mentor: My answer');
    });
  });

  describe('message trimming', () => {
    it('trims to the last 40 messages', () => {
      // Create 45 messages
      const messages: ChatMessagePayload[] = [];
      for (let i = 0; i < 45; i++) {
        messages.push(msg(i % 2 === 0 ? 'user' : 'assistant', `Message ${i}`));
      }
      const result = buildChatPrompt(messages);
      // Message 0 (oldest) should NOT appear (trimmed)
      expect(result).not.toContain('Message 0');
      // Message 44 (newest) should appear as the last message
      expect(result).toContain('Message 44');
      // Message 5 (40 from the end = index 5) should appear
      expect(result).toContain('Message 5');
    });

    it('does not trim when <= 40 messages', () => {
      const messages: ChatMessagePayload[] = [];
      for (let i = 0; i < 40; i++) {
        messages.push(msg(i % 2 === 0 ? 'user' : 'assistant', `Msg ${i}`));
      }
      const result = buildChatPrompt(messages);
      expect(result).toContain('Msg 0');
    });
  });

  describe('session context', () => {
    it('includes session context when context is provided', () => {
      const result = buildChatPrompt(
        [msg('user', 'Hello')],
        { mode: 'TEACHER', hintsUsed: 0, commitmentGateCompleted: 0 },
      );
      expect(result).toContain('[session:TEACHER]');
    });

    it('does not include session context section when no context', () => {
      const result = buildChatPrompt([msg('user', 'Hello')]);
      // Should not have the [session:...] marker from the mock
      expect(result).not.toContain('[session:');
    });
  });

  describe('output format', () => {
    it('joins sections with double newlines', () => {
      const result = buildChatPrompt([msg('user', 'Hello')]);
      expect(result).toContain('\n\n');
    });

    it('includes separator lines (---)', () => {
      const result = buildChatPrompt([msg('user', 'Hello')]);
      expect(result).toContain('---');
    });
  });
});
