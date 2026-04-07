import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

const mockCaptureException = vi.fn();
vi.mock('../../../server/lib/sentry.js', () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

import { errorHandler } from '../../../server/middleware/errorHandler';

function makeRes() {
  const mock = {
    statusCode: null as number | null,
    body: null as unknown,
    status(code: number) { mock.statusCode = code; return mock; },
    json(b: unknown) { mock.body = b; return mock; },
  };
  return mock as unknown as Response & typeof mock;
}

beforeEach(() => {
  mockCaptureException.mockClear();
});

describe('errorHandler middleware', () => {
  const req = {} as Request;
  const next = vi.fn() as unknown as NextFunction;

  describe('SyntaxError (bad JSON)', () => {
    it('returns 400 for SyntaxError with body property', () => {
      const err = Object.assign(new SyntaxError('Unexpected token'), { body: 'raw' });
      const res = makeRes();
      errorHandler(err, req, res, next);
      expect(res.statusCode).toBe(400);
    });

    it('returns invalid JSON message for SyntaxError', () => {
      const err = Object.assign(new SyntaxError('bad JSON'), { body: 'x' });
      const res = makeRes();
      errorHandler(err, req, res, next);
      expect((res.body as Record<string, unknown>).error).toContain('Invalid JSON');
    });
  });

  describe('generic Error', () => {
    it('returns 500 for generic Error', () => {
      const res = makeRes();
      errorHandler(new Error('something went wrong'), req, res, next);
      expect(res.statusCode).toBe(500);
    });

    it('includes the error message in response', () => {
      const res = makeRes();
      errorHandler(new Error('something went wrong'), req, res, next);
      expect((res.body as Record<string, unknown>).error).toBe('something went wrong');
    });
  });

  describe('unknown error (non-Error object)', () => {
    it('returns 500 for unknown error', () => {
      const res = makeRes();
      errorHandler('string error', req, res, next);
      expect(res.statusCode).toBe(500);
    });

    it('returns generic message for non-Error', () => {
      const res = makeRes();
      errorHandler({ code: 500 }, req, res, next);
      expect((res.body as Record<string, unknown>).error).toBe('An unexpected error occurred.');
    });
  });

  describe('sentry', () => {
    it('calls captureException for every error', () => {
      const res = makeRes();
      errorHandler(new Error('boom'), req, res, next);
      expect(mockCaptureException).toHaveBeenCalledOnce();
    });

    it('passes the error to captureException', () => {
      const err = new Error('test error');
      const res = makeRes();
      errorHandler(err, req, res, next);
      expect(mockCaptureException).toHaveBeenCalledWith(err);
    });
  });
});
