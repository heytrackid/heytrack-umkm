/**
 * Error Boundary Provider Component
 * Wraps the application to catch and handle UI errors gracefully
 */

import React, { ReactNode } from 'react';
import EnhancedErrorBoundary from '@/components/error-boundaries/EnhancedErrorBoundary';

interface ErrorBoundaryProviderProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error | null; errorId?: string; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

const ErrorBoundaryProvider: React.FC<ErrorBoundaryProviderProps> = ({
  children,
  fallback,
  onError
}) => {
  return (
    <EnhancedErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </EnhancedErrorBoundary>
  );
};

export default ErrorBoundaryProvider;