#!/bin/bash

# Quick fix for "worker has exited" errors
# Run this when you get repeated crashes

echo "🔧 Fixing 'worker has exited' errors..."
echo ""

# 1. Kill any stuck processes
echo "1️⃣  Killing stuck Node/Next processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
sleep 1

# 2. Clear all caches
echo "2️⃣  Clearing build caches..."
rm -rf .next
rm -rf .turbo  
rm -rf node_modules/.cache
rm -rf .swc

# 3. Clear system tmp files
echo "3️⃣  Clearing temp files..."
rm -rf /tmp/next-*
rm -rf /tmp/webpack-*

# 4. Optional: Reinstall dependencies if issues persist
read -p "4️⃣  Reinstall node_modules? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   Reinstalling dependencies..."
    rm -rf node_modules
    pnpm install
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Restart your dev server: pnpm dev"
echo "   2. Or use stable mode: ./scripts/dev-stable.sh"
echo "   3. Or use webpack (slower but stable): pnpm dev:webpack"
echo ""
echo "💡 Tips:"
echo "   - If crashes continue, try: pnpm dev:webpack"
echo "   - Close other memory-heavy apps"
echo "   - Check your .env.local file is correct"
echo ""
