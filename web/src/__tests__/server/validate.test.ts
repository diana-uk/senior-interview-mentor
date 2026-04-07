import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { validate } from '../../../server/middleware/validate';

function makeReq(body: unknown): Request {
  return { body } as Request;
}

function makeRes() {
  const mock = {
    statusCode: null as number | null,
    body: null as unknown,
    status(code: number) { mock.statusCode = code; return mock; },
    json(b: unknown) { mock.body = b; return mock; },
  };
  return mock as unknown as Response & typeof mock;
}

describe('validate middleware', () => {
  const schema = z.object({
    message: z.string().min(1),
    count:   z.number().int().positive(),
  });

  describe('valid body', () => {
    it('calls next with valid body', () => {
      const next = vi.fn() as unknown as NextFunction;
      const req = makeReq({ message: 'hello', count: 3 });
      validate(schema)(req, makeRes(), next);
      expect(next).toHaveBeenCalledOnce();
    });

    it('replaces req.body with parsed (coerced) data', () => {
      const req = makeReq({ message: 'hello', count: 3 });
      validate(schema)(req, makeRes(), vi.fn());
      expect(req.body).toEqual({ message: 'hello', count: 3 });
    });

    it('does not return 400 for valid body', () => {
      const res = makeRes();
      validate(schema)(makeReq({ message: 'hi', count: 1 }), res, vi.fn());
      expect(res.statusCode).toBeNull();
    });
  });

  describe('invalid body', () => {
    it('returns 400 for invalid body', () => {
      const res = makeRes();
      validate(schema)(makeReq({ message: '', count: 0 }), res, vi.fn());
      expect(res.statusCode).toBe(400);
    });

    it('does not call next for invalid body', () => {
      const next = vi.fn() as unknown as NextFunction;
      validate(schema)(makeReq({}), makeRes(), next);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns error details array', () => {
      const res = makeRes();
      validate(schema)(makeReq({}), res, vi.fn());
      const body = res.body as Record<string, unknown>;
      expect(body.error).toBe('Invalid request');
      expect(Array.isArray(body.details)).toBe(true);
    });

    it('includes path and message for each invalid field', () => {
      const res = makeRes();
      validate(schema)(makeReq({}), res, vi.fn());
      const details = (res.body as Record<string, unknown>).details as Array<{ path: string; message: string }>;
      expect(details.some(d => d.path === 'message')).toBe(true);
      expect(details.some(d => d.path === 'count')).toBe(true);
    });

    it('detail message is non-empty string', () => {
      const res = makeRes();
      validate(schema)(makeReq({}), res, vi.fn());
      const details = (res.body as Record<string, unknown>).details as Array<{ path: string; message: string }>;
      details.forEach(d => expect(d.message.length).toBeGreaterThan(0));
    });

    it('handles nested path as dot-separated string', () => {
      const nestedSchema = z.object({ user: z.object({ name: z.string() }) });
      const res = makeRes();
      validate(nestedSchema)(makeReq({ user: { name: 123 } }), res, vi.fn());
      const details = (res.body as Record<string, unknown>).details as Array<{ path: string }>;
      expect(details.some(d => d.path === 'user.name')).toBe(true);
    });
  });

  describe('missing body', () => {
    it('returns 400 when body is null', () => {
      const res = makeRes();
      validate(schema)(makeReq(null), res, vi.fn());
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 when body is empty object', () => {
      const res = makeRes();
      validate(schema)(makeReq({}), res, vi.fn());
      expect(res.statusCode).toBe(400);
    });
  });
});
