#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files and their unused variables to fix
const fixes = [
  { file: 'src/app/ai-chatbot/hooks/useAIService.ts', pattern: /const { supabase } = useSupabase\(\)/g, replacement: 'const { supabase: _supabase } = useSupabase()' },
  { file: 'src/app/api/ai/suggestions/route.ts', pattern: /const supabase = await createClient\(\)/g, replacement: 'const _supabase = await createClient()' },
  { file: 'src/app/api/dashboard/hpp-summary/route.ts', pattern: /const { requireUserId } = await requireAuth\(\)/g, replacement: 'const { requireUserId: _requireUserId } = await requireAuth()' },
  { file: 'src/app/api/dashboard/production-schedule/route.ts', pattern: /const { requireUserId } = await requireAuth\(\)/g, replacement: 'const { requireUserId: _requireUserId } = await requireAuth()' },
  { file: 'src/app/api/dashboard/stats/route.ts', pattern: /const { requireUserId } = await requireAuth\(\)/g, replacement: 'const { requireUserId: _requireUserId } = await requireAuth()' },
  { file: 'src/app/api/diagnostics/route.ts', pattern: /import { requireAuth, isErrorResponse } from '@\/lib\/auth-helpers'/g, replacement: "import { requireAuth as _requireAuth, isErrorResponse as _isErrorResponse } from '@/lib/auth-helpers'" },
  { file: 'src/app/api/hpp/pricing-assistant/route.ts', pattern: /const supabase = await createClient\(\)/g, replacement: 'const _supabase = await createClient()' },
  { file: 'src/app/api/hpp/overview/route.ts', pattern: /type AlertWithRecipe =/g, replacement: 'type _AlertWithRecipe =' },
  { file: 'src/app/api/hpp/calculate/route.ts', pattern: /const user = authResult/g, replacement: 'const _user = authResult' },
  { file: 'src/app/api/orders/calculate-price/route.ts', pattern: /const client = await createClient\(\)/g, replacement: 'const _client = await createClient()' },
  { file: 'src/app/api/orders/calculate-price/route.ts', pattern: /import { APIError/g, replacement: 'import { APIError as _APIError' },
];

console.log('Fixing unused variables...');

fixes.forEach(({ file, pattern, replacement }) => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed ${file}`);
    }
  }
});

console.log('Done!');
