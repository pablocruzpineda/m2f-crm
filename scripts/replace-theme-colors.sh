#!/bin/bash

# Script to replace hardcoded indigo colors with theme-aware primary colors
# Only replaces interactive elements, keeps text colors as neutral gray

echo "🎨 Replacing hardcoded theme colors..."

# Find all .tsx and .ts files in src directory (excluding node_modules)
FILES=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*")

# Batch 1: Background colors
echo "📦 Batch 1: Background colors (bg-indigo-*)"
echo "$FILES" | xargs sed -i '' 's/bg-indigo-600/bg-primary/g'
echo "$FILES" | xargs sed -i '' 's/bg-indigo-100/bg-primary\/10/g'
echo "$FILES" | xargs sed -i '' 's/bg-indigo-50/bg-primary\/5/g'

# Batch 2: Text colors
echo "📦 Batch 2: Text colors (text-indigo-*)"
echo "$FILES" | xargs sed -i '' 's/text-indigo-600/text-primary/g'
echo "$FILES" | xargs sed -i '' 's/text-indigo-700/text-primary/g'
echo "$FILES" | xargs sed -i '' 's/text-indigo-500/text-primary/g'

# Batch 3: Hover states for indigo
echo "📦 Batch 3: Hover states (hover:bg-indigo-*, hover:text-indigo-*)"
echo "$FILES" | xargs sed -i '' 's/hover:bg-indigo-500/hover:bg-primary\/90/g'
echo "$FILES" | xargs sed -i '' 's/hover:text-indigo-500/hover:text-primary\/80/g'

# Batch 4: Border colors
echo "📦 Batch 4: Border colors (border-indigo-*)"
echo "$FILES" | xargs sed -i '' 's/border-indigo-500/border-primary/g'
echo "$FILES" | xargs sed -i '' 's/border-indigo-600/border-primary/g'

# Batch 5: Focus ring colors
echo "📦 Batch 5: Focus states (focus:ring-indigo-*, focus:border-indigo-*)"
echo "$FILES" | xargs sed -i '' 's/focus:ring-indigo-600/focus:ring-primary/g'
echo "$FILES" | xargs sed -i '' 's/focus:ring-indigo-500/focus:ring-primary/g'
echo "$FILES" | xargs sed -i '' 's/focus:border-indigo-500/focus:border-primary/g'
echo "$FILES" | xargs sed -i '' 's/focus:border-indigo-600/focus:border-primary/g'

# Batch 6: Focus visible outline
echo "📦 Batch 6: Focus visible (focus-visible:outline-indigo-*)"
echo "$FILES" | xargs sed -i '' 's/focus-visible:outline-indigo-600/focus-visible:outline-primary/g'

# Batch 7: Hover states for gray backgrounds (neutral hover effects)
echo "📦 Batch 7: Neutral hover states (hover:bg-gray-*)"
echo "$FILES" | xargs sed -i '' 's/hover:bg-gray-100/hover:bg-muted/g'
echo "$FILES" | xargs sed -i '' 's/hover:bg-gray-50/hover:bg-muted/g'

echo "✅ All replacements complete!"
echo ""
echo "📊 Summary of changes:"
echo "   - bg-indigo-* → bg-primary"
echo "   - text-indigo-* → text-primary"
echo "   - hover/focus indigo states → primary"
echo "   - hover:bg-gray-* → hover:bg-muted"
echo ""
echo "🔍 Review changes with: git diff"
echo "🏗️  Build with: npm run build"
