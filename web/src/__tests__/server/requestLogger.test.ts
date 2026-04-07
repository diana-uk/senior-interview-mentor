import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { requestLogger } from '../../../server/middleware/requestLogger';

// Minimal EventEmitter-style response mock
function makeRes(statusCode = 200): Response & { _trigger: (event: string) => void } {
  const listeners: Record<string, Array<() => void>> = {};
  const res = {
    statusCode,
    on(event: string, cb: () => void) {
      listeners[event] = listeners[event] ?? [];
      listeners[event].push(cb);
      return res;
    },
    _trigger(event: string) {
      listeners[event]?.forEach((cb) => cb());
    },
    get: vi.fn(() => 'Mozilla/5.0'),
  } as unknown as Response & { _trigger: (event: string) => void };
  return res;
}

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    method: 'GET',
    path: '/api/test',
    ip: '127.0.0.1',
    get: vi.fn((header: string) => (header === 'user-agent' ? 'TestAgent/1.0' : undefined)),
    ...overrides,
  } as unknown as Request;
}

beforeEach(() => {
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('requestLogger middleware', () => {
  describe('next()', () => {
    it('calls next immediately', () => {
      const next = vi.fn() as NextFunction;
      requestLogger(makeReq(), makeRes(), next);
      expect(next).toHaveBeenCalledOnce();
    });

    it('does not log before the finish event fires', () => {
      requestLogger(makeReq(), makeRes(), vi.fn());
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('health check skip', () => {
    it('does not log for /api/health', () => {
      const req = makeReq({ path: '/api/health' });
      const res = makeRes(200);
      requestLogger(req, res, vi.fn());
      res._trigger('finish');
      expect(console.info).not.toHaveBeenCalled();
    });

    it('logs for other paths', () => {
      const req = makeReq({ path: '/api/chat' });
      const res = makeRes(200);
      requestLogger(req, res, vi.fn());
      res._trigger('finish');
      expect(console.info).toHaveBeenCalledOnce();
    });
  });

  describe('log level routing', () => {
    it('uses console.info for 200', () => {
      const res = makeRes(200);
      requestLogger(makeReq(), res, vi.fn());
      res._trigger('finish');
      expect(console.info).toHaveBeenCalledOnce();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('uses console.info for 201', () => {
      const res = makeRes(201);
      requestLogger(makeReq(), res, vi.fn());
      res._trigger('finish');
      expect(console.info).toHaveBeenCalledOnce();
    });

    it('uses console.info for 304', () => {
      const res = makeRes(304);
      requestLogger(makeReq(), res, vi.fn());
      res._trigger('finish');
      expect(console.info).toHaveBeenCalledOnce();
    });

    it('uses console.warn for 400', () => {
      const res = makeRes(400);
      requestLogger(makeReq(), res, vi.fn());
      res._trigger('finish');
      expect(console.warn).toHaveBeenCalledOnce();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('uses console.warn for 401', () => {
      const res = makeRes(401);
      requestLogger(makeReq(), res, vi.fn());
      res._trigger('finish');
      expect(console.warn).toHaveBeenCalledOnce();
    });

    it('uses console.warn for 404', () => {
      const res = makeRes(404);
      requestLogger(makeReq(), res, vi.fn());
      res._trigger('finish');
      expect(console.warn).toHaveBeenCalledOnce();
    });

    it('uses console.error for 500', () => {
      const res = makeRes(500);
      requestLogger(makeReq(), res, vi.fn());
      res._trigger('finish');
      expect(console.error).toHaveBeenCalledOnce();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('uses console.error for 503', () => {
      const res = makeRes(503);
      requestLogger(makeReq(), res, vi.fn());
      res._trigger('finish');
      expect(console.error).toHaveBeenCalledOnce();
    });
  });

  describe('log object shape', () => {
    function getLogArg(level: 'info' | 'warn' | 'error', status: number): string {
      const res = makeRes(status);
      requestLogger(makeReq({ method: 'POST', path: '/api/chat', ip: '10.0.0.1' }), res, vi.fn());
      res._trigger('finish');
      const call = (console[level] as ReturnType<typeof vi.fn>).mock.calls[0];
      return call[0] as string;
    }

    it('log message starts with [request]', () => {
      const msg = getLogArg('info', 200);
      expect(msg).toMatch(/^\[request\]/);
    });

    it('log includes method', () => {
      const msg = getLogArg('info', 200);
      const parsed = JSON.parse(msg.replace('[request] ', ''));
      expect(parsed.method).toBe('POST');
    });

    it('log includes path', () => {
      const msg = getLogArg('info', 200);
      const parsed = JSON.parse(msg.replace('[request] ', ''));
      expect(parsed.path).toBe('/api/chat');
    });

    it('log includes status code', () => {
      const msg = getLogArg('info', 200);
      const parsed = JSON.parse(msg.replace('[request] ', ''));
      expect(parsed.status).toBe(200);
    });

    it('log includes duration string ending with ms', () => {
      const msg = getLogArg('info', 200);
      const parsed = JSON.parse(msg.replace('[request] ', ''));
      expect(parsed.duration).toMatch(/^\d+ms$/);
    });

    it('log includes ip', () => {
      const msg = getLogArg('info', 200);
      const parsed = JSON.parse(msg.replace('[request] ', ''));
      expect(parsed.ip).toBe('10.0.0.1');
    });

    it('log includes userAgent', () => {
      const res = makeRes(200);
      const req = makeReq();
      requestLogger(req, res, vi.fn());
      res._trigger('finish');
      const call = (console.info as ReturnType<typeof vi.fn>).mock.calls[0];
      const parsed = JSON.parse((call[0] as string).replace('[request] ', ''));
      expect(parsed.userAgent).toBeDefined();
    });
  });

  describe('userAgent truncation', () => {
    it('truncates userAgent to 100 characters', () => {
      const longAgent = 'A'.repeat(150);
      const req = {
        method: 'GET',
        path: '/api/test',
        ip: '127.0.0.1',
        get: (header: string) => (header === 'user-agent' ? longAgent : undefined),
      } as unknown as Request;
      const res = makeRes(200);
      requestLogger(req, res, vi.fn());
      res._trigger('finish');
      const call = (console.info as ReturnType<typeof vi.fn>).mock.calls[0];
      const parsed = JSON.parse((call[0] as string).replace('[request] ', ''));
      expect(parsed.userAgent?.length).toBeLessThanOrEqual(100);
    });

    it('keeps userAgent under 100 chars when already short', () => {
      const shortAgent = 'Mozilla/5.0';
      const req = {
        method: 'GET',
        path: '/api/test',
        ip: '127.0.0.1',
        get: (header: string) => (header === 'user-agent' ? shortAgent : undefined),
      } as unknown as Request;
      const res = makeRes(200);
      requestLogger(req, res, vi.fn());
      res._trigger('finish');
      const call = (console.info as ReturnType<typeof vi.fn>).mock.calls[0];
      const parsed = JSON.parse((call[0] as string).replace('[request] ', ''));
      expect(parsed.userAgent).toBe(shortAgent);
    });
  });
});
