#!/usr/bin/env python3
"""
Fix Supabase type issues in API routes
Replaces: const supabase = await createClient()
With: const client = await createClient(); const supabase = typed(client)
"""

import os
import re
from pathlib import Path

def fix_file(file_path):
    """Fix a single file"""
    print(f"Processing: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    modified = False
    
    # Step 1: Add typed import if missing
    if 'typed' not in content:
        # Check if there's already an import from type-utilities
        if "from '@/types/type-utilities'" in content:
            # Add typed to existing import
            content = re.sub(
                r"(import\s*\{[^}]*)\}\s*from\s*'@/types/type-utilities'",
                r"\1, typed } from '@/types/type-utilities'",
                content
            )
            modified = True
        elif "from '@/types/database'" in content:
            # Add new import after database import
            content = re.sub(
                r"(import.*from\s*'@/types/database')",
                r"\1\nimport { typed } from '@/types/type-utilities'",
                content
            )
            modified = True
        else:
            # Add new import after createClient import
            content = re.sub(
                r"(import.*createClient.*\n)",
                r"\1import { typed } from '@/types/type-utilities'\n",
                content
            )
            modified = True
    
    # Step 2: Replace supabase client creation pattern
    # Pattern: const supabase = await createClient()
    pattern = r'(\s+)const supabase = await createClient\(\)'
    replacement = r'\1const client = await createClient()\n\1const supabase = typed(client)'
    
    if re.search(pattern, content):
        content = re.sub(pattern, replacement, content)
        modified = True
    
    # Step 3: Fix auth calls
    # Replace: await supabase.auth.getUser()
    # With: await client.auth.getUser()
    auth_pattern = r'await supabase\.auth\.getUser\(\)'
    auth_replacement = r'await client.auth.getUser()'
    
    if re.search(auth_pattern, content):
        content = re.sub(auth_pattern, auth_replacement, content)
        modified = True
    
    # Write back if modified
    if modified and content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ Fixed: {file_path}")
        return True
    else:
        print(f"  ⏭️  Skipped (no changes needed)")
        return False

def main():
    """Main function"""
    # Find all route.ts files in src/app/api
    api_dir = Path('src/app/api')
    
    if not api_dir.exists():
        print(f"Error: {api_dir} not found")
        return
    
    route_files = list(api_dir.rglob('route.ts'))
    print(f"Found {len(route_files)} route files\n")
    
    fixed_count = 0
    for file_path in sorted(route_files):
        if fix_file(file_path):
            fixed_count += 1
    
    print(f"\n✅ Done! Fixed {fixed_count}/{len(route_files)} files")
    print("\nNext steps:")
    print("1. Run: pnpm tsc --noEmit")
    print("2. Check for remaining errors")
    print("3. Fix any edge cases manually")

if __name__ == '__main__':
    main()
