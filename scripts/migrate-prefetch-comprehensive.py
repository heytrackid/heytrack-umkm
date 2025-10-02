#!/usr/bin/env python3
"""
Comprehensive prefetch migration script
Handles both direct Link imports and BreadcrumbLink usage
"""

import os
import re
from pathlib import Path

# Files to update
FILES = [
    "src/app/customers/page.tsx",
    "src/app/categories/page.tsx",
    "src/app/resep/page.tsx",
    "src/app/settings/page.tsx",
    "src/app/ingredients/page.tsx",
    "src/app/orders/page-new.tsx",
    "src/app/operational-costs/page.tsx",
]

def update_file(file_path):
    """Update a single file with prefetch migration"""
    if not os.path.exists(file_path):
        print(f"  ❌ File not found: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changed = False
    
    # Check if already using PrefetchLink
    if 'PrefetchLink' in content:
        print(f"  ✅ Already using PrefetchLink")
        return False
    
    # Check if BreadcrumbLink is used
    uses_breadcrumb = 'BreadcrumbLink' in content
    
    if uses_breadcrumb:
        # Add PrefetchLink import if not exists
        if 'import PrefetchLink' not in content:
            # Find the right place to add import (after other imports)
            import_pattern = r"(import .+ from '@/components/ui/breadcrumb')"
            replacement = r"\1\nimport PrefetchLink from '@/components/ui/prefetch-link'"
            content = re.sub(import_pattern, replacement, content)
            changed = True
        
        # Update BreadcrumbLink usage
        # Pattern: <BreadcrumbLink href="/something">Text</BreadcrumbLink>
        pattern = r'<BreadcrumbLink\s+href=\{([^}]+)\}>([^<]+)</BreadcrumbLink>'
        replacement = r'<BreadcrumbLink asChild>\n                      <PrefetchLink href={\1}>\2</PrefetchLink>\n                    </BreadcrumbLink>'
        
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            changed = True
        
        # Pattern with string href
        pattern2 = r'<BreadcrumbLink\s+href="([^"]+)">([^<]+)</BreadcrumbLink>'
        replacement2 = r'<BreadcrumbLink asChild>\n                      <PrefetchLink href="\1">\2</PrefetchLink>\n                    </BreadcrumbLink>'
        
        if re.search(pattern2, content):
            content = re.sub(pattern2, replacement2, content)
            changed = True
    
    if changed:
        # Create backup
        backup_path = f"{file_path}.backup"
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(original_content)
        
        # Write updated content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  ✅ Updated!")
        return True
    else:
        print(f"  ⚠️  No changes needed")
        return False

def main():
    print("🚀 Starting comprehensive prefetch migration...")
    print()
    
    updated = 0
    skipped = 0
    
    for file_path in FILES:
        print(f"📝 Processing: {file_path}")
        if update_file(file_path):
            updated += 1
        else:
            skipped += 1
    
    print()
    print("🎉 Migration complete!")
    print(f"  Updated: {updated} files")
    print(f"  Skipped: {skipped} files")
    print()

if __name__ == '__main__':
    main()
