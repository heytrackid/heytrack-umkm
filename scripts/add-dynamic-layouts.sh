#!/bin/bash

# Script to add dynamic layout to pages that have SSG issues

LAYOUT_CONTENT='// Force dynamic rendering
import type { ReactNode } from 'react';

export const dynamic = '\''force-dynamic'\''

export default function DynamicLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
'

# List of directories that need dynamic layout
DIRS=(
  "src/app/ingredients"
  "src/app/orders"
  "src/app/recipes"
  "src/app/operational-costs"
  "src/app/reports"
  "src/app/dashboard"
)

for dir in "${DIRS[@]}"; do
  if [ -d "$dir" ] && [ ! -f "$dir/layout.tsx" ]; then
    echo "Adding layout to $dir"
    echo "$LAYOUT_CONTENT" > "$dir/layout.tsx"
  fi
done

echo "Done! Added dynamic layouts to all necessary directories."
