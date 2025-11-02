
'use client'

export const TypingIndicator = () => (
    <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
      <div className="flex gap-1">
        <div 
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
          style={{ animationDelay: '0ms', animationDuration: '1s' }} 
        />
        <div 
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
          style={{ animationDelay: '150ms', animationDuration: '1s' }} 
        />
        <div 
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
          style={{ animationDelay: '300ms', animationDuration: '1s' }} 
        />
      </div>
      <span className="text-sm text-muted-foreground">AI sedang mengetik...</span>
    </div>
  )
