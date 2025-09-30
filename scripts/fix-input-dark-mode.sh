#!/bin/bash

echo "🌙 Fixing input dark mode styling..."

# Find all TypeScript/TSX files
FILES=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*")

# Batch 1: Replace text-gray-900 with text-foreground (for inputs)
echo "📦 Batch 1: text-gray-900 → text-foreground"
echo "$FILES" | xargs sed -i '' 's/text-gray-900/text-foreground/g'

# Batch 2: Replace ring-gray-300 with ring-input
echo "📦 Batch 2: ring-gray-300 → ring-input"
echo "$FILES" | xargs sed -i '' 's/ring-gray-300/ring-input/g'

# Batch 3: Replace text-gray-400 in placeholder context
echo "📦 Batch 3: placeholder:text-gray-400 → placeholder:text-muted-foreground"
echo "$FILES" | xargs sed -i '' 's/placeholder:text-gray-400/placeholder:text-muted-foreground/g'

echo "✅ All input dark mode fixes complete!"
echo ""
echo "📊 Summary of changes:"
echo "   - text-gray-900 → text-foreground (input text)"
echo "   - ring-gray-300 → ring-input (input border)"
echo "   - placeholder:text-gray-400 → placeholder:text-muted-foreground"
echo ""
echo "🔍 Review changes with: git diff"
echo "🏗️  Build with: npm run build"
