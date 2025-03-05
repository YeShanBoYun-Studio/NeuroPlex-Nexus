const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Environment file template
const envTemplate = `
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
VITE_DEFAULT_LANGUAGE=en
`;

// Create necessary directories
const directories = [
    'src/assets',
    'src/hooks',
    'src/utils',
    'src/styles',
];

function createDirectories() {
    console.log('Creating project directories...');
    directories.forEach(dir => {
        const fullPath = path.join(__dirname, dir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
            console.log(`✓ Created ${dir}`);
        }
    });
}

// Create environment files
function createEnvFiles() {
    console.log('\nCreating environment files...');
    const envFiles = ['.env', '.env.development', '.env.production'];
    
    envFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, envTemplate.trim());
            console.log(`✓ Created ${file}`);
        }
    });
}

// Install dependencies
function installDependencies() {
    console.log('\nInstalling dependencies...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✓ Dependencies installed successfully');
    } catch (error) {
        console.error('! Error installing dependencies:', error.message);
        process.exit(1);
    }
}

// Initialize Git hooks
function initGitHooks() {
    console.log('\nInitializing Git hooks...');
    try {
        execSync('npx husky install', { stdio: 'inherit' });
        execSync('npx husky add .husky/pre-commit "npm run lint"', { stdio: 'inherit' });
        console.log('✓ Git hooks initialized');
    } catch (error) {
        console.error('! Error initializing Git hooks:', error.message);
    }
}

// Run TypeScript checks
function checkTypes() {
    console.log('\nRunning TypeScript checks...');
    try {
        execSync('npx tsc --noEmit', { stdio: 'inherit' });
        console.log('✓ TypeScript checks passed');
    } catch (error) {
        console.error('! TypeScript errors found. Please fix them before continuing.');
        process.exit(1);
    }
}

// Main initialization function
function initialize() {
    console.log('Initializing NeuraCollab frontend...');
    console.log('====================================\n');

    createDirectories();
    createEnvFiles();
    installDependencies();
    initGitHooks();
    checkTypes();

    console.log('\n✨ Frontend initialization complete!');
    console.log('\nNext steps:');
    console.log('1. Review and update environment variables in .env files');
    console.log('2. Start development server: npm run dev');
    console.log('3. Build for production: npm run build\n');
}

// Run initialization
initialize();
