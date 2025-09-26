import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  fullScreenOnMobile?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  fullScreenOnMobile = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      // Focus management
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-xl lg:max-w-2xl',
    xl: 'max-w-xl sm:max-w-2xl lg:max-w-4xl',
    full: 'max-w-full',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div 
        className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleBackdropClick}
      >
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          aria-hidden="true"
        />
        
        {/* Center positioning trick for desktop */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        
        {/* Modal Panel */}
        <div 
          ref={modalRef}
          tabIndex={-1}
          className={`
            relative inline-block w-full transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle
            ${fullScreenOnMobile 
              ? 'h-full sm:h-auto sm:max-h-[90vh]' 
              : 'max-h-[90vh] sm:max-h-[85vh]'
            }
            ${sizeClasses[size]}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 bg-gray-50">
            <h2 
              id="modal-title"
              className="text-base sm:text-lg font-semibold text-gray-900 pr-8 truncate"
            >
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute right-3 top-3 sm:right-4 sm:top-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full p-1 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            )}
          </div>
          
          {/* Content */}
          <div 
            className={`
              px-4 py-4 sm:px-6 sm:py-5 overflow-y-auto
              ${fullScreenOnMobile 
                ? 'flex-1 h-full' 
                : 'max-h-[calc(90vh-8rem)] sm:max-h-[calc(85vh-8rem)]'
              }
            `}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Drawer variant for mobile-first design
export const Drawer: React.FC<ModalProps & { position?: 'bottom' | 'right' }> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnBackdropClick = true,
  position = 'bottom',
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionClasses = {
    bottom: {
      container: 'items-end',
      panel: 'w-full max-h-[85vh] rounded-t-xl sm:max-w-lg sm:mx-auto sm:rounded-xl sm:max-h-[90vh]',
      animation: 'translate-y-full sm:translate-y-0 sm:opacity-0',
      animationOpen: 'translate-y-0 sm:translate-y-0 sm:opacity-100'
    },
    right: {
      container: 'items-center justify-end',
      panel: 'h-full max-w-md w-full sm:max-w-lg sm:h-auto sm:max-h-[90vh] sm:rounded-xl',
      animation: 'translate-x-full sm:translate-x-0 sm:opacity-0',
      animationOpen: 'translate-x-0 sm:translate-x-0 sm:opacity-100'
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div 
        className={`flex min-h-screen ${positionClasses[position].container} sm:items-center sm:justify-center sm:p-4`}
        onClick={handleBackdropClick}
      >
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" aria-hidden="true" />
        
        <div 
          ref={drawerRef}
          className={`
            relative bg-white shadow-xl transform transition-all
            ${positionClasses[position].panel}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
            <h2 
              id="drawer-title"
              className="text-lg font-semibold text-gray-900 truncate pr-8"
            >
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full p-1 transition-colors"
                aria-label="Close drawer"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>
          
          {/* Content */}
          <div className="px-4 py-4 sm:px-6 sm:py-5 overflow-y-auto flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
