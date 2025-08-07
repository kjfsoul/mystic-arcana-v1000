#!/bin/bash

echo "🔄 Mystic Arcana: Node/Canvas Test Environment Full Reset"
echo "--------------------------------------------------------"

# Show current Node version
echo "Current Node version:"
node -v

# Step 1: Remove all old modules and lockfiles
echo "🧹 Removing node_modules and lock files..."
rm -rf node_modules
rm -f package-lock.json yarn.lock

# Step 2: Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Step 3: (Optional) Clear Jest/Next build cache
echo "🧹 Clearing .next and Jest caches..."
rm -rf .next
rm -rf coverage
rm -rf tmp
rm -rf .cache

# Step 4: Reinstall all dependencies
echo "📦 Re-installing all dependencies..."
npm install

# Step 5: Rebuild all native modules
echo "🔧 Rebuilding native modules (including canvas)..."
npm rebuild
npx node-gyp rebuild || true

# Step 6: If you use Homebrew/macOS and canvas, ensure these are installed:
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍏 Checking Homebrew native dependencies for canvas..."
    brew install pkg-config cairo pango libpng jpeg giflib librsvg || true
    npm rebuild canvas || true
fi

# Step 7: (Optional) For yarn users, force install
if [ -f yarn.lock ]; then
    echo "🧶 Detected yarn.lock, running yarn install --force"
    yarn install --force
fi

# Step 8: Confirm Node version again
echo "🔄 Re-confirming Node version:"
node -v

# Step 9: Run a build and all tests
echo "🏗️  Running build and tests..."
npm run build
npm test

echo "✅ Reset script completed. Check for any remaining errors above."
