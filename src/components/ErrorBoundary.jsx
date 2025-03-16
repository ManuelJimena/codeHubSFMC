import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    this.resetError = this.resetError.bind(this);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier UI alternativa
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900 text-red-900 dark:text-red-50 rounded-lg my-4 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-2">Algo salió mal</h2>
          <p className="mb-2">Se ha producido un error en la aplicación:</p>
          <pre className="bg-white dark:bg-gray-800 p-2 rounded overflow-auto text-sm">
            {this.state.error && this.state.error.toString()}
          </pre>
          {this.state.errorInfo && (
            <div className="mt-4">
              <p className="font-bold">Detalles del error:</p>
              <pre className="bg-white dark:bg-gray-800 p-2 rounded overflow-auto text-sm">
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => {
              this.resetError();
              window.location.reload();
            }}
          >
            Reiniciar aplicación
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;