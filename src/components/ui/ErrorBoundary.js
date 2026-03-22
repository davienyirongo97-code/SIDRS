import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg)',
            padding: 40,
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontSize: 60,
              color: 'var(--red)',
              marginBottom: 20,
              textAlign: 'center',
              width: '100%',
            }}
          >
            <FiAlertTriangle />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              color: 'var(--ink)',
              textAlign: 'center',
              width: '100%',
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              color: 'var(--muted)',
              maxWidth: 400,
              margin: '12px auto 30px',
              lineHeight: 1.6,
              textAlign: 'center',
            }}
          >
            The application encountered an unexpected rendering error.
          </p>
          <div
            style={{
              background: '#222',
              color: '#f88',
              padding: '20px',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '800px',
              overflow: 'auto',
              marginBottom: 20,
            }}
          >
            <h3 style={{ margin: '0 0 10px 0' }}>
              {this.state.error && this.state.error.toString()}
            </h3>
            <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </div>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
              style={{ padding: '12px 24px' }}
            >
              <FiRefreshCw style={{ marginRight: 8 }} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
