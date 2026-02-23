import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// ── Helper: component that throws on demand ──

function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error');
  return <div>OK</div>;
}

function ThrowCustom({ message }: { message: string }) {
  throw new Error(message);
  return null; // unreachable but satisfies TS
}

// ── Suppress React / jsdom error noise from error boundaries ──

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

// ── Tests ──

describe('ErrorBoundary', () => {
  // ── Happy path ──

  describe('when no error occurs', () => {
    it('renders children normally', () => {
      render(
        <ErrorBoundary>
          <p>Hello World</p>
        </ErrorBoundary>,
      );
      expect(screen.getByText('Hello World')).toBeDefined();
    });

    it('does not render fallback UI', () => {
      render(
        <ErrorBoundary>
          <p>Content</p>
        </ErrorBoundary>,
      );
      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.queryByText('Something went wrong')).toBeNull();
    });
  });

  // ── Error catching ──

  describe('when a child throws an error', () => {
    it('catches the error and shows fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );
      expect(screen.getByText('Something went wrong')).toBeDefined();
    });

    it('displays the error message in the fallback', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );
      expect(screen.getByText('Test error')).toBeDefined();
    });

    it('renders a role="alert" container for accessibility', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );
      const alertEl = screen.getByRole('alert');
      expect(alertEl).toBeDefined();
    });

    it('renders a "Try again" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );
      expect(screen.getByText('Try again')).toBeDefined();
    });

    it('displays a custom error message from the thrown error', () => {
      render(
        <ErrorBoundary>
          <ThrowCustom message="Something specific broke" />
        </ErrorBoundary>,
      );
      expect(screen.getByText('Something specific broke')).toBeDefined();
    });
  });

  // ── Custom fallback prop ──

  describe('custom fallback prop', () => {
    it('renders the custom fallback instead of default UI when provided', () => {
      render(
        <ErrorBoundary fallback={<div>Custom fallback content</div>}>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );
      expect(screen.getByText('Custom fallback content')).toBeDefined();
      expect(screen.queryByText('Something went wrong')).toBeNull();
    });

    it('does not render role="alert" when custom fallback is used', () => {
      render(
        <ErrorBoundary fallback={<span>Oops</span>}>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });

  // ── Try again / reset ──

  describe('"Try again" button resets error state', () => {
    it('re-renders children after clicking "Try again"', () => {
      let shouldThrow = true;

      function Conditional() {
        if (shouldThrow) throw new Error('Boom');
        return <div>Recovered</div>;
      }

      const { rerender } = render(
        <ErrorBoundary>
          <Conditional />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Something went wrong')).toBeDefined();

      // Fix the component before retrying
      shouldThrow = false;

      fireEvent.click(screen.getByText('Try again'));

      // Force re-render so React picks up the new closure
      rerender(
        <ErrorBoundary>
          <Conditional />
        </ErrorBoundary>,
      );

      expect(screen.getByText('Recovered')).toBeDefined();
      expect(screen.queryByText('Something went wrong')).toBeNull();
    });
  });

  // ── componentDidCatch logging ──

  describe('componentDidCatch logging', () => {
    it('logs error to console.error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      // React itself also calls console.error, so we check our specific call
      const calls = consoleErrorSpy.mock.calls;
      const boundaryCall = calls.find(
        (args) => typeof args[0] === 'string' && args[0].includes('[ErrorBoundary]'),
      );
      expect(boundaryCall).toBeDefined();
      // The second argument should be the Error instance
      expect(boundaryCall![1]).toBeInstanceOf(Error);
      expect(boundaryCall![1].message).toBe('Test error');
    });

    it('includes componentName in log when name prop is provided', () => {
      render(
        <ErrorBoundary name="EditorPanel">
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      const calls = consoleErrorSpy.mock.calls;
      const boundaryCall = calls.find(
        (args) =>
          typeof args[0] === 'string' && args[0].includes('[ErrorBoundary: EditorPanel]'),
      );
      expect(boundaryCall).toBeDefined();
    });

    it('omits componentName from log when name prop is not provided', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>,
      );

      const calls = consoleErrorSpy.mock.calls;
      const boundaryCall = calls.find(
        (args) => typeof args[0] === 'string' && args[0] === '[ErrorBoundary]',
      );
      expect(boundaryCall).toBeDefined();
    });
  });

  // ── Multiple sequential errors ──

  describe('multiple sequential errors (error -> reset -> error)', () => {
    it('handles error, reset, then second error correctly', () => {
      let shouldThrow = true;
      let errorMsg = 'First failure';

      function FlakyComponent() {
        if (shouldThrow) throw new Error(errorMsg);
        return <div>Working fine</div>;
      }

      const { rerender } = render(
        <ErrorBoundary>
          <FlakyComponent />
        </ErrorBoundary>,
      );

      // First error
      expect(screen.getByText('First failure')).toBeDefined();
      expect(screen.getByText('Something went wrong')).toBeDefined();

      // Fix the component and reset
      shouldThrow = false;
      fireEvent.click(screen.getByText('Try again'));
      rerender(
        <ErrorBoundary>
          <FlakyComponent />
        </ErrorBoundary>,
      );
      expect(screen.getByText('Working fine')).toBeDefined();

      // Break it again with a different message
      shouldThrow = true;
      errorMsg = 'Second failure';
      rerender(
        <ErrorBoundary>
          <FlakyComponent />
        </ErrorBoundary>,
      );
      expect(screen.getByText('Second failure')).toBeDefined();
    });

    it('can recover and fail again in sequence', () => {
      let shouldThrow = true;

      function Toggler() {
        if (shouldThrow) throw new Error('Fail');
        return <div>Success</div>;
      }

      const { rerender } = render(
        <ErrorBoundary>
          <Toggler />
        </ErrorBoundary>,
      );

      // First error
      expect(screen.getByText('Something went wrong')).toBeDefined();

      // Fix and reset
      shouldThrow = false;
      fireEvent.click(screen.getByText('Try again'));
      rerender(
        <ErrorBoundary>
          <Toggler />
        </ErrorBoundary>,
      );
      expect(screen.getByText('Success')).toBeDefined();

      // Break again
      shouldThrow = true;
      rerender(
        <ErrorBoundary>
          <Toggler />
        </ErrorBoundary>,
      );
      expect(screen.getByText('Something went wrong')).toBeDefined();
      expect(screen.getByText('Fail')).toBeDefined();
    });
  });

  // ── Nested component tree ──

  describe('nested component tree', () => {
    it('catches errors thrown by deeply nested children', () => {
      function DeepChild() {
        throw new Error('Deep error');
        return null;
      }

      function MiddleChild() {
        return (
          <div>
            <DeepChild />
          </div>
        );
      }

      render(
        <ErrorBoundary>
          <div>
            <MiddleChild />
          </div>
        </ErrorBoundary>,
      );

      expect(screen.getByText('Something went wrong')).toBeDefined();
      expect(screen.getByText('Deep error')).toBeDefined();
    });

    it('only the nearest ErrorBoundary catches the error', () => {
      function BrokenChild() {
        throw new Error('Inner error');
        return null;
      }

      render(
        <ErrorBoundary name="Outer">
          <div>
            <p>Outer content</p>
            <ErrorBoundary name="Inner">
              <BrokenChild />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>,
      );

      // Inner boundary should catch, outer content should remain
      expect(screen.getByText('Outer content')).toBeDefined();
      expect(screen.getByText('Inner error')).toBeDefined();
    });
  });

  // ── getDerivedStateFromError ──

  describe('getDerivedStateFromError', () => {
    it('sets error state from the thrown Error object', () => {
      const state = ErrorBoundary.getDerivedStateFromError(new Error('derived'));
      expect(state).toEqual({ error: new Error('derived') });
    });

    it('preserves the original Error instance', () => {
      const original = new Error('original');
      const state = ErrorBoundary.getDerivedStateFromError(original);
      expect(state.error).toBe(original);
    });
  });
});
