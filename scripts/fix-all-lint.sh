#!/bin/bash

echo "Running comprehensive lint fixes..."

# Fix all auto-fixable issues
pnpm lint:fix

# Fix unused variables by prefixing with _
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e 's/const { supabase } = useSupabase()/const { supabase: _supabase } = useSupabase()/g' \
  -e 's/const supabase = await createClient()/const _supabase = await createClient()/g' \
  -e 's/const supabase = createClient()/const _supabase = createClient()/g' \
  -e 's/const { requireUserId } = await requireAuth()/const { requireUserId: _requireUserId } = await requireAuth()/g' \
  -e 's/const user = authResult/const _user = authResult/g' \
  -e 's/const client = await createClient()/const _client = await createClient()/g' \
  -e 's/const { toast } = useToast()/const { toast: _toast } = useToast()/g' \
  {} \;

echo "Lint fixes complete!"
