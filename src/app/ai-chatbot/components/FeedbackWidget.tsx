'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, MessageSquare, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface FeedbackWidgetProps {
  messageId: string
  onFeedbackSubmit: (messageId: string, rating: number, comment?: string) => void
  className?: string
}

export const FeedbackWidget = ({
  messageId,
  onFeedbackSubmit,
  className
}: FeedbackWidgetProps): JSX.Element => {
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleRating = (newRating: number) => {
    setRating(newRating)
    setShowCommentInput(true)
  }

  const handleSubmit = () => {
    if (rating !== null) {
      onFeedbackSubmit(messageId, rating, comment.trim() || undefined)
      setIsSubmitted(true)
      setShowCommentInput(false)
    }
  }

  const handleCancel = () => {
    setRating(null)
    setComment('')
    setShowCommentInput(false)
  }

  if (isSubmitted) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
        <div className="flex items-center gap-1">
          {rating === 1 ? (
            <ThumbsDown className="h-3 w-3 text-red-500" />
          ) : (
            <ThumbsUp className="h-3 w-3 text-green-500" />
          )}
          <span>Terima kasih atas feedback Anda!</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {!showCommentInput ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Bagaimana respons ini?</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-700"
              onClick={() => handleRating(1)}
              title="Suka"
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-700"
              onClick={() => handleRating(-1)}
              title="Tidak suka"
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {rating === 1 ? (
                <ThumbsUp className="h-3 w-3 text-green-500" />
              ) : (
                <ThumbsDown className="h-3 w-3 text-red-500" />
              )}
              <span className="text-xs font-medium">
                {rating === 1 ? 'Anda menyukai respons ini' : 'Anda tidak menyukai respons ini'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Berikan komentar (opsional)..."
              value={comment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
              className="min-h-[60px] text-xs resize-none"
              maxLength={200}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {comment.length}/200 karakter
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={handleCancel}
                >
                  <X className="h-3 w-3 mr-1" />
                  Batal
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={handleSubmit}
                  disabled={!rating}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Kirim
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}