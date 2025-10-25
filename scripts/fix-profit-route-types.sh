#!/bin/bash

FILE="src/app/api/reports/profit/route.ts"

# Fix property access on unknown types
sed -i '' 's/(p as any)\.name/(p as any).name/g' "$FILE"
sed -i '' 's/p\.name/(p as any).name/g' "$FILE"
sed -i '' 's/p\.total_revenue/(p as any).total_revenue/g' "$FILE"
sed -i '' 's/p\.total_cogs/(p as any).total_cogs/g' "$FILE"
sed -i '' 's/p\.total_quantity/(p as any).total_quantity/g' "$FILE"
sed -i '' 's/p\.order_date/(p as any).order_date/g' "$FILE"
sed -i '' 's/p\.revenue/(p as any).revenue/g' "$FILE"
sed -i '' 's/p\.cogs/(p as any).cogs/g' "$FILE"
sed -i '' 's/p\.gross_profit/(p as any).gross_profit/g' "$FILE"
sed -i '' 's/p\.gross_margin/(p as any).gross_margin/g' "$FILE"
sed -i '' 's/p\.orders_count/(p as any).orders_count/g' "$FILE"
sed -i '' 's/item\.total/(item as any).total/g' "$FILE"
sed -i '' 's/item\.count/(item as any).count/g' "$FILE"
sed -i '' 's/c\.total_cost/(c as any).total_cost/g' "$FILE"
sed -i '' 's/c\.total_quantity/(c as any).total_quantity/g' "$FILE"

# Fix parseFloat and Number on unknown types
sed -i '' 's/parseFloat(\([^)]*\)\.revenue)/parseFloat((\1 as any).revenue)/g' "$FILE"
sed -i '' 's/parseFloat(\([^)]*\)\.cogs)/parseFloat((\1 as any).cogs)/g' "$FILE"
sed -i '' 's/Number(\([^)]*\)\.revenue)/Number((\1 as any).revenue)/g' "$FILE"
sed -i '' 's/Number(\([^)]*\)\.cogs)/Number((\1 as any).cogs)/g' "$FILE"

echo "Fixed profit route type errors"
