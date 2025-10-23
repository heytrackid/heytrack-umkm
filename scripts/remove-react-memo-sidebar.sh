#!/bin/bash

# Remove React.memo from sidebar components
# Turbopack has issues with React.memo causing HMR errors

echo "🔧 Removing React.memo from sidebar components..."

# Find all sidebar component files
find src/components/layout/sidebar -name "*.tsx" | while read file; do
  if grep -q "React.memo" "$file"; then
    echo "  📝 Fixing: $file"
    
    # Get the component name from the file
    component_name=$(basename "$file" .tsx)
    
    # Remove displayName line
    sed -i.bak "/${component_name}.displayName/d" "$file"
    
    # Replace "export default React.memo(ComponentName)" with "export default ComponentName"
    sed -i.bak "s/export default React\.memo(${component_name})/export default ${component_name}/" "$file"
    
    # Clean up backup
    rm -f "${file}.bak"
  fi
done

echo ""
echo "✅ React.memo removed from sidebar components!"
echo ""
echo "🔄 Restart your dev server to apply changes"
