import React from 'react'

import { SUGGESTIONS } from '@/app/ai-chatbot/types'
import { Button } from '@/components/ui/button'

interface SuggestionChipsProps {
  onSuggestionClick: (suggestion: string) => void
  disabled?: boolean
}

export const SuggestionChips = ({ onSuggestionClick, disabled }: SuggestionChipsProps): React.JSX.Element => (
    <div className="mb-3 flex flex-wrap gap-2 max-w-4xl mx-auto">
      {SUGGESTIONS.slice(0, 4).map((suggestion) => (
        <Button
          key={suggestion.text}
          variant="ghost"
          size="sm"
          className="text-xs h-9 px-3 text-muted-foreground hover:text-foreground touch-target focus-mobile text-left justify-start"
          onClick={() => onSuggestionClick(suggestion.text)}
          disabled={disabled}
        >
          {suggestion.text}
        </Button>
      ))}
    </div>
  )
