import { Button } from '@/components/ui/button'
import { SUGGESTIONS } from '../types'

interface SuggestionChipsProps {
  onSuggestionClick: (suggestion: string) => void
  disabled?: boolean
}

export function SuggestionChips({ onSuggestionClick, disabled }: SuggestionChipsProps) {
  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {SUGGESTIONS.slice(0, 4).map((suggestion, index) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          className="text-xs h-8 text-muted-foreground hover:text-foreground"
          onClick={() => onSuggestionClick(suggestion.text)}
          disabled={disabled}
        >
          {suggestion.text}
        </Button>
      ))}
    </div>
  )
}
