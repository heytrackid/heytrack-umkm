#!/bin/bash

# Fix HMR issues on macOS
# This script increases file watching limits

echo "🔧 Fixing HMR issues..."

# Check if running on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "📱 Detected macOS"
  
  # Increase file watching limits
  echo "⚙️  Increasing file watching limits..."
  
  # Check current limits
  echo "Current limits:"
  sysctl kern.maxfiles
  sysctl kern.maxfilesperproc
  
  # Increase limits (requires sudo)
  echo ""
  echo "Increasing limits (may require password)..."
  sudo sysctl -w kern.maxfiles=65536
  sudo sysctl -w kern.maxfilesperproc=65536
  
  echo ""
  echo "New limits:"
  sysctl kern.maxfiles
  sysctl kern.maxfilesperproc
  
  echo ""
  echo "✅ File watching limits increased!"
  echo ""
  echo "💡 Tips to improve HMR:"
  echo "  1. Close unused browser tabs"
  echo "  2. Clear .next folder: rm -rf .next"
  echo "  3. Restart dev server"
  echo "  4. Use Chrome DevTools > Network > Disable cache"
  echo ""
else
  echo "⚠️  This script is for macOS only"
  echo "For Linux, increase fs.inotify.max_user_watches"
fi
