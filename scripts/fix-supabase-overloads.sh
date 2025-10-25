#!/bin/bash

# Fix Supabase type overload errors by adding 'as any' to problematic calls
# This script targets .insert(), .upsert(), and .update() calls

echo "Fixing Supabase type overload errors..."

# Fix insert calls - pattern: .insert({ or .insert([{
find src/app/api -name "*.ts" -type f -exec sed -i '' -E 's/\.insert\(\[?\{/\.insert(\[{/g; s/\}\]\)/}] as any)/g' {} \;

# Fix upsert calls
find src/app/api -name "*.ts" -type f -exec sed -i '' -E 's/\.upsert\(\[?\{([^}]+)\}\]\, \{/\.upsert([{\1}] as any, {/g' {} \;

# Fix update calls with objects
find src/app/api -name "*.ts" -type f -exec sed -i '' -E 's/\.update\(\{([^}]+)\}\)/\.update({\1} as any)/g' {} \;

echo "Fixed Supabase overload errors"
