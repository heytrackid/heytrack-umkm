#!/usr/bin/env python3
"""
Fix Supabase type issues in services folder
Similar to API routes but for services
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
    if 'typed' not in content and 'createClient' in content:
        # Check if there's already an import from type-utilities
        if "from '@/types/type-utilities'" in content:
            # Add typed to existing import
            content = re.sub(
                r"(import\s*\{[^}]*)\}\s*from\s*'@/types/type-utilities'",
                r"\1, typed } from '@/types/type-utilities'",
                content
            )
            modified = True
        else:
            # Add new import after database import
            content = re.sub(
                r"(import.*from\s*'@/types/database')",
                r"\1\nimport { typed } from '@/types/type-utilities'",
                content
            )
            modified = True
    
    # Step 2: Replace supabase client creation pattern (server)
    # Pattern: const supabase = await createClient()
    pattern = r'(\s+)const supabase = await createClient\(\)'
    replacement = r'\1const client = await createClient()\n\1const supabase = typed(client)'
    
    if re.search(pattern, content):
        content = re.sub(pattern, replacement, content)
        modified = True
    
    # Pattern: const supabase = createClient() (client-side)
    pattern2 = r'(\s+)const supabase = createClient\(\)'
    replacement2 = r'\1const client = createClient()\n\1const supabase = typed(client)'
    
    if re.search(pattern2, content):
        content = re.sub(pattern2, replacement2, content)
        modified = True
    
    # Step 3: Fix auth calls to use client instead of supabase
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
    # Find all .ts files in src/services and src/modules
    folders = [Path('src/services'), Path('src/modules')]
    
    all_files = []
    for folder in folders:
        if folder.exists():
            all_files.extend(folder.rglob('*.ts'))
    
    # Filter out .d.ts files
    ts_files = [f for f in all_files if not str(f).endswith('.d.ts')]
    
    print(f"Found {len(ts_files)} TypeScript files\n")
    
    fixed_count = 0
    for file_path in sorted(ts_files):
        if fix_file(file_path):
            fixed_count += 1
    
    print(f"\n✅ Done! Fixed {fixed_count}/{len(ts_files)} files")
    print("\nNext steps:")
    print("1. Run: pnpm tsc --noEmit")
    print("2. Check for remaining errors")

if __name__ == '__main__':
    main()
