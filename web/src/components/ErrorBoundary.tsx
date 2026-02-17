import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.name ? `: ${this.props.name}` : ''}]`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: 12,
            padding: 24,
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--neon-red, #ef4444)' }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 400 }}>
            {this.state.error.message}
          </div>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            style={{
              padding: '6px 16px',
              fontSize: 12,
              background: 'var(--surface-2, #2a2a2a)',
              color: 'var(--text-bright, #fff)',
              border: '1px solid var(--border, #333)',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
