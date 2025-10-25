#!/bin/bash

# Fix double any casts in TypeScript files
find src/app/api -name "*.ts" -type f -exec sed -i '' 's/as any as any/as any/g' {} \;

echo "Fixed all double any casts"
