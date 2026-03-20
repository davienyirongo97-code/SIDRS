import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh', width: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: 'var(--bg)',
          padding: 20, textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: 60, color: 'var(--red)', marginBottom: 20,
            animation: 'pulse 2s infinite'
          }}>
            <FiAlertTriangle />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink)' }}>Something went wrong</h1>
          <p style={{ color: 'var(--muted)', maxWidth: 400, margin: '12px 0 30px', lineHeight: 1.6 }}>
            The application encountered an unexpected rendering error. This has been logged for our engineers.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
            style={{ padding: '12px 24px' }}
          >
            <FiRefreshCw style={{ marginRight: 8 }} /> Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
