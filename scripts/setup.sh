#!/bin/bash

# =====================================================
# M2F CRM - Quick Setup Script
# =====================================================
# This script helps you set up your environment quickly

set -e  # Exit on error

echo "🚀 M2F CRM - Quick Setup"
echo "======================="
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✅ .env file already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env file"
    else
        cp .env.example .env
        echo "✅ Created .env from template"
    fi
else
    cp .env.example .env
    echo "✅ Created .env from template"
fi

echo ""
echo "📝 Next steps:"
echo ""
echo "1. Edit .env file and add your Supabase credentials:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo ""
echo "2. Run the database migration:"
echo "   See docs/PHASE_1_SETUP.md for instructions"
echo ""
echo "3. Start the dev server:"
echo "   npm run dev"
echo ""
echo "Need help? Check docs/PHASE_1_SETUP.md"
echo ""
