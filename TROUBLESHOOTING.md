# Troubleshooting Guide

Common issues and solutions for the Celo Wallet React Starter Kit.

## Quick Diagnostics

Run these commands to gather system information:

```bash
# Check versions
node --version
npm --version
git --version

# Check npm configuration
npm config get registry
npm config get prefix

# Check for permission issues
whoami
ls -la ~/.npm
```

## Node.js Issues

### Version Compatibility Errors

**Problem**: `npm install` fails with "engines" or "node version" errors

**Symptoms**:
- Error messages containing "engines" or "node version"
- npm install exits with code 1
- Package version warnings

**Solutions**:
```bash
# Check current version
node --version

# If not 18.x or 20.x, update Node.js
# Download from: https://nodejs.org/

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
```

### Permission Denied Errors

**Problem**: Cannot install global packages or get permission errors

**Solutions**:
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Configure npm to use user directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

## Installation Problems

### Network Issues

**Problem**: Connection timeouts or network errors during `npm install`

**Solutions**:
```bash
# Test npm connectivity
npm ping

# Try different registry
npm install --registry https://registry.npmjs.org/

# For corporate firewalls
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# For Chinese users
npm install --registry https://registry.npmmirror.com
```

### Peer Dependency Conflicts

**Problem**: Peer dependency warnings or conflicts

**Solutions**:
```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Install with legacy peer deps
npm install --legacy-peer-deps

# Force installation (use carefully)
npm install --force
```

### Disk Space Issues

**Problem**: "No space left on device" errors

**Solutions**:
```bash
# Check disk space
df -h  # macOS/Linux
dir /-c  # Windows

# Clear npm cache
npm cache clean --force

# Remove unused packages
npm prune

# Clean node_modules thoroughly
rm -rf node_modules
npm install
```

### Corrupted Files

**Problem**: JSON parsing errors or corrupted package-lock.json

**Solutions**:
```bash
# Backup and regenerate lock file
mv package-lock.json package-lock.json.backup
npm install
```

## Development Server Issues

### Port Already in Use

**Problem**: `Error: Port 5173 is already in use`

**Solutions**:
```bash
# Find and kill process using port 5173
# macOS/Linux:
lsof -ti:5173 | xargs kill -9

# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F

# Use different port
npm run dev -- --port 3000
```

### Module Resolution Errors

**Problem**: "Cannot resolve module" or import errors

**Solutions**:
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev

# Check TypeScript configuration
npm run type-check
```

### Build Errors

**Problem**: TypeScript or build errors

**Solutions**:
```bash
# Check for TypeScript errors
npm run type-check

# Fix linting issues
npm run lint:fix

# Clear build cache
rm -rf dist
rm -rf node_modules/.vite
npm run build
```

## WalletConnect Issues

### Invalid Project ID

**Problem**: "Invalid project ID" or wallet connection fails

**Solutions**:
1. Verify WalletConnect Project ID:
   ```bash
   cat .env
   # Should show: VITE_WALLETCONNECT_PROJECT_ID=your_32_character_id
   ```

2. Get correct Project ID:
   - Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Sign in to your account
   - Copy Project ID from dashboard

3. Restart development server:
   ```bash
   npm run dev
   ```

### Wallet Not Detected

**Problem**: No wallets appear when clicking "Connect Wallet"

**Solutions**:
1. Install MetaMask browser extension
2. Check browser console for errors (F12)
3. Verify `.env` file exists and has correct Project ID
4. Restart browser and development server
5. Clear browser cache and cookies

## Testing Issues

### Tests Fail to Run

**Problem**: Tests show errors or fail to execute

**Solutions**:
```bash
# Run tests in isolated mode
npm test -- --run

# Check test configuration
npm test -- --info

# Clear test cache
rm -rf node_modules/.cache
npm test

# Verify test setup
npm run test:ui
```

### TypeScript Test Errors

**Problem**: TypeScript errors in test files

**Solutions**:
```bash
# Check TypeScript configuration
npm run type-check

# Fix type issues in test files
# Ensure all imports and types are correct

# Run tests with type checking disabled (temporary)
npm test -- --no-throw
```

## Browser-Specific Issues

### MetaMask Connection Problems

**Problem**: Cannot connect to MetaMask

**Solutions**:
1. Ensure MetaMask is installed and unlocked
2. Check MetaMask network (should be Celo or Alfajores)
3. Clear MetaMask cache: Settings → Advanced → Reset Account
4. Refresh the webpage
5. Try incognito/private mode

### CORS Errors

**Problem**: Cross-origin resource sharing errors

**Solutions**:
1. Ensure using `http://localhost:5173` (not file://)
2. Check browser console for specific CORS errors
3. Verify RPC endpoints are accessible
4. Try different browser

## Getting Help

### Information to Include

When seeking help, provide:

1. **System information**:
   - Operating system and version
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Browser and version

2. **Error messages**:
   - Complete error output
   - Screenshots if applicable
   - Steps to reproduce

3. **Environment**:
   - Project directory path
   - Recent changes made
   - Commands that triggered the error

### Useful Commands for Debugging

```bash
# Get detailed npm logs
npm install --verbose

# Check project configuration
cat package.json
cat .env

# List installed packages
npm list

# Check for security vulnerabilities
npm audit

# Verify git status
git status
git log --oneline -5

# System information
uname -a  # macOS/Linux
systeminfo  # Windows
```

### Common Error Patterns

| Error Message | Likely Cause | Quick Fix |
|---------------|--------------|-----------|
| `EACCES: permission denied` | File permissions | `sudo chown -R $(whoami) ~/.npm` |
| `ETIMEDOUT` | Network issues | Check internet connection, try different registry |
| `Peer dep missing` | Dependency conflicts | `npm install --legacy-peer-deps` |
| `Port 5173 is already in use` | Port conflict | Kill process or use different port |
| `Invalid project ID` | WalletConnect config | Check `.env` file, verify Project ID |
| `Cannot resolve module` | Dependencies | `rm -rf node_modules && npm install` |

### Prevention Tips

1. **Keep dependencies updated**:
   ```bash
   npm outdated
   npm update
   ```

2. **Regular system maintenance**:
   ```bash
   npm cache clean --force
   npm audit fix
   ```

3. **Use version managers** for Node.js (nvm, n)
4. **Backup important configurations** before making changes
5. **Test in clean environment** periodically

For more detailed information, see the main [README.md](README.md) and [QUICK_START.md](QUICK_START.md) guides.