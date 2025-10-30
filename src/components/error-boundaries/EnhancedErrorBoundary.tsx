/**
 * Enhanced Error Boundary Component
 * Provides better error handling and user feedback for UI errors
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { apiLogger } from '@/lib/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error | null; errorId?: string; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class EnhancedErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = this.state.errorId;

    // Log the error with additional context
    apiLogger.error({
      error: error.message,
      stack: error.stack,
      errorInfo,
      errorId,
      componentStack: errorInfo.componentStack,
    }, 'UI Error Boundary Captured');

    // Call the optional onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;

      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error || null}
            errorId={this.state.errorId}
            resetError={this.resetError}
          />
        );
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold text-red-800 mb-4">Something went wrong</h2>
            {this.state.error && (
              <p className="text-red-600 mb-4">{this.state.error.message}</p>
            )}
            {this.state.errorId && (
              <p className="text-sm text-red-500 mb-4">Error ID: {this.state.errorId}</p>
            )}
            <Button 
              onClick={this.resetError}
              variant="destructive"
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;