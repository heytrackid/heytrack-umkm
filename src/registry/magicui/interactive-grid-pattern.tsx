"use client"

import { cn } from"@/lib/utils"
import { useCallback, useEffect, useRef, useState } from"react"

interface InteractiveGridPatternProps {
  className?: string
  width?: number
  height?: number
  x?: number
  y?: number
  strokeDasharray?: any
  numSquares?: number
  maxOpacity?: number
  duration?: number
}

export function InteractiveGridPattern({
  className,
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  maxOpacity = 0.5,
  duration = 4,
  ...props
}: InteractiveGridPatternProps) {
  const [squares, setSquares] = useState(() => generateSquares(numSquares))
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClien""
  }, [])

  function generateSquares(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      pos: [Math.floor(Math.random() * 40), Math.floor(Math.random() * 40)],
    }))
  }

  const updateSquarePosition = useCallback((id: number) => {
    setSquares((currentSquares) =>
      currentSquares.map((sq) =>
        sq.id === id
          ? {
              ...sq,
              pos: [Math.floor(Math.random() * 40), Math.floor(Math.random() * 40)],
            }
          : sq
      )
    )
  }, [])

  if (!isClient) {
    return null
  }

  return (
    <svg
      width="100%"
      height="100%"
      className={cn(
       "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id="grid-pattern"
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            stroke="currentColor"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      <svg x={x} y={y} className="overflow-visible">
        {squares.map(({ pos, id }, index) => (
          <rect
            initial={{ opacity: 0 }}
            animate={{ opacity: maxOpacity }}
            transition={{
              duration,
              repeat: 1,
              delay: index * 0.1,
              repeatType:"reverse",
            }}
            onAnimationComplete={() => updateSquarePosition(id)}
            key={`${pos[0]}-${pos[1]}`}
            width={width - 1}
            height={height - 1}
            x={pos[0] * width + 1}
            y={pos[1] * height + 1}
            fill="currentColor"
            strokeWidth="0"
            className="animate-pulse duration-2000"
          />
        ))}
      </svg>
    </svg>
  )
}