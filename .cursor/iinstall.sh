#!/bin/bash
set -e

echo "Setting up Mystic Arcana spiritual technology development environment..."

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm ci

# Install Python dependencies for astronomical calculations
echo "Installing Python astronomical calculation dependencies..."
pip3 install --user -r requirements-astro.txt

# Set up Supabase CLI if not present
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    npm install -g supabase
fi

# Initialize or update astronomical data cache
echo "Updating astronomical data cache..."
mkdir -p data/ephemeris
cd data/ephemeris && wget -N ftp://ftp.astro.com/pub/swisseph/ephe/* || true
cd ../..

# Validate spiritual content reference files
echo "Validating spiritual reference materials..."
node scripts/validate_spiritual_references.js

# Set up local database schema if needed
if [ -f "supabase/config.toml" ]; then
    echo "Initializing local Supabase environment..."
    npx supabase db reset --local || echo "Database already initialized"
fi

# Run linting to ensure code quality
echo "Running code quality checks..."
npm run lint || echo "Linting completed with warnings"

# Validate astronomical calculation accuracy
echo "Validating astronomical calculation accuracy..."
python3 scripts/validate_ephemeris.py

echo "Mystic Arcana development environment setup complete!"