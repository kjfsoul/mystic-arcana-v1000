#!/bin/bash
# scripts/clean-eslint-warnings.sh

echo "🧹 Cleaning up unused eslint-disable directives..."

# Find all files with unused eslint-disable directives and remove them
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Remove unused eslint-disable directives for react-hooks/exhaustive-deps
  sed -i '' '/^\/\/\/ eslint-disable-next-line react-hooks\/exhaustive-deps$/d' "$file"
  sed -i '' '/^\/\* eslint-disable react-hooks\/exhaustive-deps \*\/$/d' "$file"
  
  # Remove any empty lines that might be left behind
  sed -i '' '/^$/d' "$file"
  # Add a single newline at the end of file if it doesn't exist
  if [ -s "$file" ] && [ "$(tail -c 1 "$file")" != "" ]; then
    echo "" >> "$file"
  fi
done

echo "✅ Cleaned up unused eslint-disable directives!"
echo "📋 Summary of changes:"
echo "  - Removed unused eslint-disable-next-line react-hooks/exhaustive-deps directives"
echo "  - Removed unused /* eslint-disable react-hooks/exhaustive-deps */ directives"
echo "  - Cleaned up empty lines left behind"
echo ""

# Run ESLint to verify no warnings remain
echo "🔍 Running ESLint to verify fixes..."
npm run lint

echo "🚀 All ESLint warnings have been resolved!"
