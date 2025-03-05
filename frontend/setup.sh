#!/bin/bash

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print with color
print_color() {
  echo -e "${1}${2}${NC}"
}

# Check if node is installed
if ! command -v node &> /dev/null; then
  print_color "$RED" "Error: Node.js is not installed"
  exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  print_color "$RED" "Error: npm is not installed"
  exit 1
fi

# Check node version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
  print_color "$GREEN" "Node.js version $NODE_VERSION OK"
else
  print_color "$RED" "Error: Node.js version must be >= $REQUIRED_VERSION"
  exit 1
fi

# Create necessary directories
print_color "$GREEN" "Creating necessary directories..."
mkdir -p src/{assets,components,contexts,hooks,pages,services,types,utils}

# Install dependencies
print_color "$GREEN" "Installing dependencies..."
npm install

# Setup git hooks
print_color "$GREEN" "Setting up git hooks..."
node init-husky.js

# Create environment files if they don't exist
if [ ! -f .env.development ]; then
  print_color "$YELLOW" "Creating .env.development..."
  cp .env.example .env.development
fi

if [ ! -f .env.production ]; then
  print_color "$YELLOW" "Creating .env.production..."
  cp .env.example .env.production
fi

# Initialize TypeScript
print_color "$GREEN" "Checking TypeScript setup..."
npx tsc --noEmit

# Run linter
print_color "$GREEN" "Running linter..."
npm run lint

# Format code
print_color "$GREEN" "Formatting code..."
npm run format

print_color "$GREEN" "Setup complete! 🎉"
print_color "$YELLOW" "Next steps:"
echo "1. Review and update .env.development and .env.production"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"

exit 0
