#!/bin/bash

# TypeScript Error Fix Guide - Run commands to identify patterns

echo "=== TypeScript Error Categories ==="
echo ""

echo "1. UNUSED VARIABLES (TS6133) - 436 errors"
echo "   Fix: Prefix with underscore (_variable)"
npm run type-check 2>&1 | grep "TS6133" | wc -l
echo ""

echo "2. IMPLICIT ANY PARAMS (TS7006) - 111 errors"  
echo "   Fix: Add type annotations to parameters"
npm run type-check 2>&1 | grep "TS7006" | wc -l
echo ""

echo "3. UNKNOWN TYPE (TS18046/TS18048) - 469 errors"
echo "   Fix: Use type guards or cast safely"
npm run type-check 2>&1 | grep "TS18046\|TS18048" | wc -l
echo ""

echo "4. MISSING PROPERTIES (TS2339) - 323 errors"
echo "   Fix: Define proper types"
npm run type-check 2>&1 | grep "TS2339" | wc -l
echo ""

echo "5. MISSING IMPORTS (TS2304) - 210 errors"
echo "   Fix: Add missing imports or exports"
npm run type-check 2>&1 | grep "TS2304" | wc -l
echo ""

echo "=== Total Remaining Errors ==="
npm run type-check 2>&1 | grep "error TS" | wc -l
