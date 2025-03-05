# Frontend Application

This is the frontend application for the AI Workspace project. It's built with React, TypeScript, and Material-UI.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

## Quick Start

### For Unix-like Systems (Linux/macOS)

```bash
# Make setup script executable
chmod +x make-executable.sh
./make-executable.sh

# Run setup script
./setup.sh
```

### For Windows

```batch
# Run setup script
setup.bat
```

## Development

```bash
# Start development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── assets/        # Static assets (images, fonts, etc.)
├── components/    # Reusable UI components
├── contexts/      # React contexts
├── hooks/         # Custom React hooks
├── locales/       # Internationalization files
├── pages/         # Application pages/routes
├── providers/     # Context providers
├── services/      # API and other services
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Key Features

- 🎨 Material-UI components
- 🌍 Internationalization support
- 🎭 Theme switching (light/dark)
- 📱 Responsive design
- 🔒 Type safety with TypeScript
- 🧹 Code quality tools (ESLint, Prettier)
- 🔄 Git hooks for code quality
- 📦 Code splitting and lazy loading
- 🚀 Optimized production build

## Code Quality

- ESLint for code linting
- Prettier for code formatting
- TypeScript for type checking
- Husky for Git hooks
- lint-staged for pre-commit checks

## Environment Variables

Create `.env.development` and `.env.production` files based on `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
VITE_APP_TITLE=AI Workspace
```

## VSCode Setup

Recommended extensions are listed in `.vscode/extensions.json`. Install them for the best development experience:

1. Open VSCode
2. Press `Ctrl/Cmd + Shift + X`
3. Type `@recommended`
4. Install workspace recommended extensions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Scripts

- `dev`: Start development server
- `build`: Build for production
- `preview`: Preview production build
- `lint`: Run ESLint
- `lint:fix`: Fix ESLint issues
- `format`: Format code with Prettier
- `format:check`: Check code formatting
- `typecheck`: Run TypeScript type checking
- `clean`: Clean build artifacts
- `precommit`: Run pre-commit checks

## Dependencies

### Production
- React and React DOM
- Material-UI
- React Router
- React Query
- React Hook Form

### Development
- TypeScript
- Vite
- ESLint
- Prettier
- Husky
- lint-staged

## License

This project is licensed under the MIT License - see the LICENSE file for details.
