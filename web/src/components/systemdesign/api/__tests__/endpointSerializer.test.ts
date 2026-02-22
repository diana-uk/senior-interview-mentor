import { describe, it, expect } from 'vitest';
import { serializeEndpointsToText } from '../endpointSerializer';
import type { Endpoint } from '../../../../types';

// ── Helpers ──

function makeEndpoint(overrides?: Partial<Endpoint>): Endpoint {
  return {
    id: 'ep1',
    method: 'GET',
    path: '/api/v1/users',
    description: 'List all users',
    requestBody: '',
    responseBody: '{ "users": [] }',
    ...overrides,
  };
}

// ── Tests ──

describe('serializeEndpointsToText', () => {
  // ── Empty state ──

  describe('empty state', () => {
    it('returns placeholder text for empty array', () => {
      expect(serializeEndpointsToText([])).toBe('No endpoints defined yet.');
    });
  });

  // ── Header and count ──

  describe('header and count', () => {
    it('shows count of 1 for a single endpoint', () => {
      const result = serializeEndpointsToText([makeEndpoint()]);
      expect(result).toMatch(/^API Endpoints \(1\):/);
    });

    it('shows correct count for multiple endpoints', () => {
      const eps = [
        makeEndpoint({ id: 'a' }),
        makeEndpoint({ id: 'b' }),
        makeEndpoint({ id: 'c' }),
      ];
      const result = serializeEndpointsToText(eps);
      expect(result).toMatch(/^API Endpoints \(3\):/);
    });
  });

  // ── Numbering ──

  describe('numbering', () => {
    it('numbers endpoints sequentially', () => {
      const eps = [
        makeEndpoint({ id: 'a', path: '/a' }),
        makeEndpoint({ id: 'b', path: '/b' }),
      ];
      const result = serializeEndpointsToText(eps);
      expect(result).toContain('1. GET /a');
      expect(result).toContain('2. GET /b');
    });
  });

  // ── HTTP methods ──

  describe('HTTP methods', () => {
    it.each(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const)(
      'renders %s method',
      (method) => {
        const result = serializeEndpointsToText([makeEndpoint({ method })]);
        expect(result).toContain(`1. ${method} /api/v1/users`);
      },
    );
  });

  // ── Path edge cases ──

  describe('path handling', () => {
    it('renders the path as-is', () => {
      const result = serializeEndpointsToText([
        makeEndpoint({ path: '/api/v1/orders/:id/items' }),
      ]);
      expect(result).toContain('1. GET /api/v1/orders/:id/items');
    });

    it('shows "(no path)" when path is empty string', () => {
      const result = serializeEndpointsToText([makeEndpoint({ path: '' })]);
      expect(result).toContain('1. GET (no path)');
    });
  });

  // ── Description ──

  describe('description handling', () => {
    it('renders the description', () => {
      const result = serializeEndpointsToText([
        makeEndpoint({ description: 'Create a new user' }),
      ]);
      expect(result).toContain('Description: Create a new user');
    });

    it('shows "(none)" when description is empty', () => {
      const result = serializeEndpointsToText([makeEndpoint({ description: '' })]);
      expect(result).toContain('Description: (none)');
    });

    it('shows "(none)" when description is only whitespace', () => {
      const result = serializeEndpointsToText([makeEndpoint({ description: '   ' })]);
      expect(result).toContain('Description: (none)');
    });
  });

  // ── Request body ──

  describe('request body handling', () => {
    it('shows "(none)" for empty string body', () => {
      const result = serializeEndpointsToText([makeEndpoint({ requestBody: '' })]);
      const lines = result.split('\n');
      const reqIdx = lines.findIndex((l) => l.includes('Request Body:'));
      expect(lines[reqIdx + 1].trim()).toBe('(none)');
    });

    it('shows "(none)" for skeleton body "{}"', () => {
      const result = serializeEndpointsToText([makeEndpoint({ requestBody: '{}' })]);
      const lines = result.split('\n');
      const reqIdx = lines.findIndex((l) => l.includes('Request Body:'));
      expect(lines[reqIdx + 1].trim()).toBe('(none)');
    });

    it('shows "(none)" for skeleton body with whitespace', () => {
      const result = serializeEndpointsToText([
        makeEndpoint({ requestBody: '{\n  \n}' }),
      ]);
      const lines = result.split('\n');
      const reqIdx = lines.findIndex((l) => l.includes('Request Body:'));
      expect(lines[reqIdx + 1].trim()).toBe('(none)');
    });

    it('renders real body content indented', () => {
      const body = '{ "email": "user@example.com" }';
      const result = serializeEndpointsToText([makeEndpoint({ requestBody: body })]);
      expect(result).toContain(`   ${body}`);
    });

    it('renders multi-line body with each line indented', () => {
      const body = '{\n  "email": "a@b.com",\n  "name": "Alice"\n}';
      const result = serializeEndpointsToText([makeEndpoint({ requestBody: body })]);
      expect(result).toContain('   {');
      expect(result).toContain('     "email": "a@b.com",');
    });
  });

  // ── Response body ──

  describe('response body handling', () => {
    it('shows "(none)" for empty response body', () => {
      const result = serializeEndpointsToText([makeEndpoint({ responseBody: '' })]);
      const lines = result.split('\n');
      const resIdx = lines.findIndex((l) => l.includes('Response Body:'));
      expect(lines[resIdx + 1].trim()).toBe('(none)');
    });

    it('shows "(none)" for skeleton response body', () => {
      const result = serializeEndpointsToText([
        makeEndpoint({ responseBody: '{ }' }),
      ]);
      const lines = result.split('\n');
      const resIdx = lines.findIndex((l) => l.includes('Response Body:'));
      expect(lines[resIdx + 1].trim()).toBe('(none)');
    });

    it('renders real response body content', () => {
      const body = '{ "id": "123", "email": "user@example.com" }';
      const result = serializeEndpointsToText([makeEndpoint({ responseBody: body })]);
      expect(result).toContain(`   ${body}`);
    });
  });

  // ── Full integration ──

  describe('full integration', () => {
    it('serializes multiple endpoints with all fields', () => {
      const endpoints: Endpoint[] = [
        {
          id: '1',
          method: 'POST',
          path: '/api/v1/users',
          description: 'Create a new user',
          requestBody: '{ "email": "user@example.com" }',
          responseBody: '{ "id": "123", "email": "user@example.com" }',
        },
        {
          id: '2',
          method: 'GET',
          path: '/api/v1/users/:id',
          description: 'Get user by ID',
          requestBody: '',
          responseBody: '{ "id": "123" }',
        },
        {
          id: '3',
          method: 'DELETE',
          path: '/api/v1/users/:id',
          description: 'Delete a user',
          requestBody: '',
          responseBody: '',
        },
      ];

      const result = serializeEndpointsToText(endpoints);

      expect(result).toMatch(/^API Endpoints \(3\):/);
      expect(result).toContain('1. POST /api/v1/users');
      expect(result).toContain('Description: Create a new user');
      expect(result).toContain('2. GET /api/v1/users/:id');
      expect(result).toContain('Description: Get user by ID');
      expect(result).toContain('3. DELETE /api/v1/users/:id');
      expect(result).toContain('Description: Delete a user');
    });

    it('handles a mix of filled and empty bodies', () => {
      const endpoints: Endpoint[] = [
        makeEndpoint({
          id: '1',
          method: 'POST',
          requestBody: '{ "name": "Alice" }',
          responseBody: '{ "id": "1" }',
        }),
        makeEndpoint({
          id: '2',
          method: 'GET',
          requestBody: '',
          responseBody: '{ "items": [] }',
        }),
      ];

      const result = serializeEndpointsToText(endpoints);
      const lines = result.split('\n');

      // First endpoint has real request body
      const req1Idx = lines.findIndex((l) => l.includes('Request Body:'));
      expect(lines[req1Idx + 1]).toContain('{ "name": "Alice" }');

      // Second endpoint has empty request body
      const req2Idx = lines.findIndex((l, i) => i > req1Idx + 1 && l.includes('Request Body:'));
      expect(lines[req2Idx + 1].trim()).toBe('(none)');
    });
  });
});
