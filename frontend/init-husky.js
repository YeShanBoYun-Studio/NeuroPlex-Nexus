import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

try {
  // Check if .git directory exists in parent directory
  const gitDir = path.join(process.cwd(), '..', '.git');
  if (!fs.existsSync(gitDir)) {
    console.log(`${colors.yellow}No .git directory found in parent directory. Skipping husky setup.${colors.reset}`);
    process.exit(0);
  }

  // Install husky with custom directory
  console.log(`${colors.bright}Installing husky...${colors.reset}`);
  execSync('npx husky install .husky --dir=..', { stdio: 'inherit' });

  // Add pre-commit hook
  console.log(`${colors.bright}Adding pre-commit hook...${colors.reset}`);
  const preCommitScript = 'cd frontend && npm run lint-staged';
  execSync(`npx husky add ../.husky/pre-commit "${preCommitScript}"`, { stdio: 'inherit' });

  // Make pre-commit hook executable
  fs.chmodSync('../.husky/pre-commit', 0o755);

  console.log(`${colors.green}Successfully initialized husky!${colors.reset}`);
  console.log(`${colors.bright}Pre-commit hook will run: ${colors.yellow}${preCommitScript}${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error initializing husky:${colors.reset}`, error);
  process.exit(1);
}
