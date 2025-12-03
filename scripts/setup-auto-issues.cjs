#!/usr/bin/env node

/**
 * Setup Script for Automatic GitHub Issue Creation
 * 
 * This script sets up automatic issue creation when pushing to GitHub
 * using a git pre-push hook instead of GitHub Actions.
 * 
 * Usage: node scripts/setup-auto-issues.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up automatic GitHub issue creation...\n');

// Check if we're in a git repository
try {
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ This directory is not a git repository.');
  console.error('   Please run this script from the root of your git repository.');
  process.exit(1);
}

// Step 1: Setup pre-push hook
console.log('📋 Setting up pre-push hook...');

const hooksDir = path.join('.git', 'hooks');
const prePushHookPath = path.join(hooksDir, 'pre-push');
const prePushHookSource = path.join('scripts', 'pre-push-hook.cjs');

if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

try {
  // Copy the pre-push hook
  fs.copyFileSync(prePushHookSource, prePushHookPath);
  
  // Make it executable (Unix/Linux/Mac)
  try {
    execSync(`chmod +x "${prePushHookPath}"`);
  } catch (chmodError) {
    // Windows doesn't support chmod, but that's okay
    console.log('ℹ️  chmod not supported on this platform (likely Windows)');
  }
  
  console.log('✅ Pre-push hook installed successfully');
} catch (error) {
  console.error('❌ Failed to install pre-push hook:', error.message);
  process.exit(1);
}

// Step 2: Check for GitHub token
console.log('\n🔑 Checking GitHub token configuration...');

const githubToken = process.env.GITHUB_TOKEN;
const githubOwner = process.env.GITHUB_OWNER;
const githubRepo = process.env.GITHUB_REPO;

if (!githubToken) {
  console.log('⚠️  GITHUB_TOKEN environment variable not set.');
  console.log('   To enable automatic issue creation, you need to:');
  console.log('');
  console.log('   1. Create a GitHub Personal Access Token:');
  console.log('      - Go to GitHub → Settings → Developer settings → Personal access tokens');
  console.log('      - Generate new token with "repo" scope');
  console.log('      - Copy the token (starts with "ghp_")');
  console.log('');
  console.log('   2. Set the environment variable:');
  console.log('      export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  console.log('      export GITHUB_OWNER=your-github-username');
  console.log('      export GITHUB_REPO=your-repository-name');
  console.log('');
  console.log('   3. Run this setup script again:');
  console.log('      node scripts/setup-auto-issues.js');
  console.log('');
  console.log('   You can also add these to your ~/.bashrc or ~/.zshrc for persistence.');
} else {
  console.log('✅ GitHub token found');
}

if (!githubOwner) {
  console.log('⚠️  GITHUB_OWNER not set. Using default: your-github-username');
} else {
  console.log('✅ GitHub owner:', githubOwner);
}

if (!githubRepo) {
  console.log('⚠️  GITHUB_REPO not set. Using default: ship-celo-wallet');
} else {
  console.log('✅ GitHub repo:', githubRepo);
}

// Step 3: Test the setup
console.log('\n🧪 Testing the setup...');

try {
  const testCommits = execSync('git log --pretty=format:"%s" -n 3', { 
    encoding: 'utf8',
    cwd: process.cwd()
  });
  
  console.log('✅ Git repository is accessible');
  console.log('📋 Recent commits:');
  testCommits.split('\n').forEach((commit, index) => {
    if (commit.trim()) {
      console.log(`   ${index + 1}. ${commit}`);
    }
  });
} catch (error) {
  console.log('⚠️  Could not read git history:', error.message);
}

// Step 4: Instructions
console.log('\n📚 Setup Complete! Here\'s how to use automatic issue creation:\n');

console.log('🔧 Usage:');
console.log('   1. Make changes to your code');
console.log('   2. Commit with special prefixes:');
console.log('      git commit -m "[BUG] Fix wallet connection issue"');
console.log('      git commit -m "[FEATURE] Add transaction history"');
console.log('      git commit -m "[DOCS] Update setup instructions"');
console.log('      git commit -m "[TODO] Refactor wallet components"');
console.log('   3. Push to GitHub:');
console.log('      git push origin main');
console.log('');
console.log('   ✅ The pre-push hook will automatically create GitHub issues!');
console.log('');

console.log('🎯 Supported Prefixes:');
Object.keys({
  'BUG': 'Bug reports',
  'FEATURE': 'Feature requests', 
  'ENHANCEMENT': 'Improvements',
  'DOCS': 'Documentation issues',
  'TODO': 'General tasks',
  'SECURITY': 'Security issues'
}).forEach(prefix => {
  console.log(`   [${prefix}] - Creates issue with "${prefix}" labels`);
});

console.log('\n📖 For more information, see: ISSUES_SETUP.md');

console.log('\n🔧 Manual Setup (if needed):');
console.log('   If the pre-push hook didn\'t install automatically:');
console.log('   1. Copy scripts/pre-push-hook.js to .git/hooks/pre-push');
console.log('   2. Make it executable: chmod +x .git/hooks/pre-push');
console.log('   3. Set GITHUB_TOKEN environment variable');
console.log('   4. Test with: git push origin main');

console.log('\n✅ Automatic issue creation setup complete!');