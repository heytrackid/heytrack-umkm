'use client';

import React, { useState, lazy, Suspense } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Lazy load ChatbotInterface for better performance
const ChatbotInterface = lazy(() => import('./ChatbotInterface'));

interface ChatbotFABProps {
  userId: string;
  className?: string;
}

const ChatbotFAB: React.FC<ChatbotFABProps> = ({ userId, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
    }
  };

  // Simulate new message notification (could be triggered by server events)
  React.useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setHasNewMessage(true);
      }, 10000); // Show notification after 10 seconds if chatbot is closed

      return () => clearTimeout;
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
          <Button
            onClick={toggleChatbot}
            size="lg"
            className="h-14 w-14 rounded-full  bg-gray-700 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 border-2 border-white dark:border-gray-300 relative overflow-hidden group"
          >
            
            {/* Icon */}
            <div className="relative z-10 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>

            {/* Notification badge */}
            {hasNewMessage && (
              <Badge 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs font-bold animate-bounce"
                variant="destructive"
              >
                !
              </Badge>
            )}
          </Button>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Chat dengan Asisten AI
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
          </div>
        </div>
      )}

      {/* Chatbot Interface */}
      {isOpen && (
        <>
          {/* Overlay for mobile */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={toggleChatbot}
          />
          
          {/* Chat Interface */}
          <div className="z-50 relative">
            <Suspense fallback={
              <div className="md:fixed md:bottom-4 md:right-4 fixed inset-4 md:inset-auto md:w-96 md:h-[600px] w-auto h-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
              </div>
            }>
              <ChatbotInterface
                userId={userId}
                isMinimized={false}
                onToggleMinimize={toggleChatbot}
                className="md:fixed md:bottom-4 md:right-4 fixed inset-4 md:inset-auto md:w-96 md:h-[600px] w-auto h-auto"
              />
            </Suspense>
          </div>

          {/* Close button for mobile */}
          <Button
            onClick={toggleChatbot}
            variant="outline"
            size="sm"
            className="fixed top-4 right-4 z-[60] md:hidden bg-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
    </>
  );
};

export default ChatbotFAB;