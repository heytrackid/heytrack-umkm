#!/bin/bash

# Stable development server with auto-restart on crashes
# Usage: ./scripts/dev-stable.sh

echo "🚀 Starting stable development server..."
echo "   This will automatically restart if it crashes"
echo "   Press Ctrl+C twice quickly to stop completely"
echo ""

RESTART_COUNT=0
MAX_RESTART=10
RESTART_DELAY=2

while true; do
  # Increment restart counter
  if [ $RESTART_COUNT -gt 0 ]; then
    echo "⚠️  Server crashed. Restart #$RESTART_COUNT"
    
    # If too many restarts, suggest cleanup
    if [ $RESTART_COUNT -ge $MAX_RESTART ]; then
      echo "❌ Too many restarts ($RESTART_COUNT). Something is seriously wrong."
      echo "   Try running: pnpm dev:clean"
      exit 1
    fi
    
    echo "   Restarting in $RESTART_DELAY seconds..."
    sleep $RESTART_DELAY
  fi
  
  # Clear cache if this is a restart after crash
  if [ $RESTART_COUNT -eq 3 ]; then
    echo "🧹 Clearing cache after multiple crashes..."
    rm -rf .next/.turbo node_modules/.cache
  fi
  
  # Start the dev server
  NODE_OPTIONS='--max-old-space-size=4096 --trace-warnings' pnpm next dev
  
  EXIT_CODE=$?
  
  # Check if user intentionally stopped (Ctrl+C)
  if [ $EXIT_CODE -eq 130 ]; then
    echo ""
    echo "✋ Stopped by user"
    exit 0
  fi
  
  # Increment counter
  RESTART_COUNT=$((RESTART_COUNT + 1))
done
