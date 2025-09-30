#!/bin/bash

echo "🌙 Fixing dark mode backgrounds..."

# Find all TypeScript/TSX files
FILES=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*")

# Batch 1: Replace bg-white with bg-card
echo "📦 Batch 1: bg-white → bg-card"
echo "$FILES" | xargs sed -i '' 's/bg-white/bg-card/g'

# Batch 2: Replace bg-gray-50 with bg-muted/50 (for subtle backgrounds)
echo "📦 Batch 2: bg-gray-50 → bg-muted\/50"
echo "$FILES" | xargs sed -i '' 's/bg-gray-50/bg-muted\/50/g'

# Batch 3: Replace border-gray-200 with border (uses CSS variable)
echo "📦 Batch 3: border-gray-200 → border"
echo "$FILES" | xargs sed -i '' 's/border-gray-200/border/g'

# Batch 4: Replace border-gray-300 with border
echo "📦 Batch 4: border-gray-300 → border"
echo "$FILES" | xargs sed -i '' 's/border-gray-300/border/g'

echo "✅ All dark mode replacements complete!"
echo ""
echo "📊 Summary of changes:"
echo "   - bg-white → bg-card (card background)"
echo "   - bg-gray-50 → bg-muted/50 (subtle background)"
echo "   - border-gray-200/300 → border (uses CSS variable)"
echo ""
echo "🔍 Review changes with: git diff"
echo "🏗️  Build with: npm run build"
