import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface CrudLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'sm' | 'md' | 'lg';
  showBackButton?: boolean;
  onBack?: () => void;
}

export const CrudLayout: React.FC<CrudLayoutProps> = ({
  title,
  description,
  children,
  breadcrumbs,
  actions,
  maxWidth = 'full',
  padding = 'md',
  showBackButton = false,
  onBack,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-none',
  };

  const paddingClasses = {
    sm: 'p-4 sm:p-6',
    md: 'p-4 sm:p-6 lg:p-8',
    lg: 'p-6 sm:p-8 lg:p-12',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Sticky */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 sm:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            {showBackButton && (
              <button
                onClick={onBack}
                className="mr-3 p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-gray-600 truncate mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="ml-4 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]}`}>
        {/* Desktop Header */}
        <div className="hidden sm:block mb-6 lg:mb-8">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && (
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-gray-400 mx-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {crumb.href ? (
                      <a
                        href={crumb.href}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {crumb.label}
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Header Content */}
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center">
                {showBackButton && (
                  <button
                    onClick={onBack}
                    className="mr-4 p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {title}
                  </h1>
                  {description && (
                    <p className="mt-2 text-base lg:text-lg text-gray-600">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {actions && (
              <div className="ml-6 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 lg:space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
};

// Mobile-first page container for CRUD operations
export const CrudPageContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
};

// Responsive section wrapper
export const CrudSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  background?: 'white' | 'gray' | 'transparent';
  padding?: boolean;
  rounded?: boolean;
  shadow?: boolean;
}> = ({
  children,
  className = '',
  background = 'white',
  padding = true,
  rounded = true,
  shadow = true,
}) => {
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    transparent: 'bg-transparent',
  };

  const classes = [
    backgroundClasses[background],
    padding ? 'p-4 sm:p-6 lg:p-8' : '',
    rounded ? 'rounded-lg sm:rounded-xl' : '',
    shadow && background !== 'transparent' ? ' sm:' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

// Responsive stats grid for dashboards
export const StatsGrid: React.FC<{
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}> = ({ children, cols = 4, className = '' }) => {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colClasses[cols]} gap-4 sm:gap-6 ${className}`}>
      {children}
    </div>
  );
};