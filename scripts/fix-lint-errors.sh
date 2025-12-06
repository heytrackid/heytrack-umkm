#!/bin/bash

# Fix all lint errors systematically

echo "Fixing lint errors..."

# Run lint with auto-fix
pnpm lint:fix

echo "Lint fix complete!"
