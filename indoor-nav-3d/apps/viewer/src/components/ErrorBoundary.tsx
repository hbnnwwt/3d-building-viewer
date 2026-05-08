import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#111827', color: 'white', gap: 16, padding: 32
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>页面加载出错</h2>
          <p style={{ fontSize: 14, color: '#9ca3af', maxWidth: 400, textAlign: 'center' }}>
            {this.state.error?.message || '发生了未知错误'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px', background: '#007bff', color: 'white',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            重新加载
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
