import { EnhancedErrorBoundary } from '@/components/error-boundaries/EnhancedErrorBoundary'

import type { ReactNode } from 'react';

/**
 * Error Boundary Provider Component
 * Wraps the application to catch and handle UI errors gracefully
 */


interface ErrorBoundaryProviderProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error | null; errorId?: string; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const ErrorBoundaryProvider: React.FC<ErrorBoundaryProviderProps> = ({
  children,
  fallback,
  onError
}) => (
    <EnhancedErrorBoundary
      fallback={fallback ?? (() => null as null)}
      {...(onError && { onError })}
    >
      {children}
    </EnhancedErrorBoundary>
  );
