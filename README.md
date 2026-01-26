# Web3 Wallet Connect + Celo React Starter Kit

A starter kit for building Celo dApps with:

- React + Vite
- TypeScript
- Wagmi + WalletConnect
- Celo mainnet + Alfajores configuration
- Example wallet connect UI
- Basic network status & switching
- **Real-time network health monitoring** (NEW)

This project is designed to be forked and extended, especially for the Proof-of-Ship program.

## 📚 Documentation Guide

We now provide comprehensive documentation to help you get started quickly:

- **[Quick Start Guide](QUICK_START.md)** - Get up and running in 5 minutes
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Solutions for common issues
- **[Setup Guide](SETUP_GUIDE.md)** - Detailed step-by-step instructions for beginners
- **This README** - Complete project documentation and architecture

## System Requirements

Before you begin, ensure your development environment meets these requirements:

- **Node.js**: Version 20.x or higher (LTS recommended)
- **npm**: Version 8 or higher (comes with Node.js)
- **Git**: For cloning and version control
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **Code Editor**: VS Code (recommended) or any TypeScript-compatible editor

> **💡 Tip**: We strongly recommend using Node.js 20.x LTS for the best compatibility, performance, and long-term support.

### Platform-Specific Installation Guides

#### Windows
1. **Node.js Installation**:
   - Download from [nodejs.org](https://nodejs.org/) (choose 20.x LTS)
   - Run the installer and follow the setup wizard
   - Verify installation: Open Command Prompt and run `node --version`

2. **Git Installation**:
   - Download from [git-scm.com](https://git-scm.com/download/win)
   - Use default settings during installation
   - Verify: Open Command Prompt and run `git --version`

#### macOS
1. **Node.js Installation** (choose one):
   - **Option A**: Download from [nodejs.org](https://nodejs.org/)
   - **Option B**: Using Homebrew (recommended):
     ```bash
     # Install Homebrew if not already installed
     /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
     
     # Install Node.js 20
     brew install node@20
     ```

2. **Git Installation**:
   ```bash
   # Using Homebrew
   brew install git
   
   # Or download from git-scm.com
   ```

#### Linux (Ubuntu/Debian)
```bash
# Update package index
sudo apt update

# Install Node.js 20 and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt install git

# Verify installations
node --version
npm --version
git --version
```

### Version Manager Recommendations (Advanced Users)

For developers who work with multiple Node.js versions:

#### Using nvm (Node Version Manager) - Recommended
```bash
# Install nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.bashrc

# Install and use Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version  # Should show v20.x.x
```

#### Using n (Simple Alternative)
```bash
# Install n globally
npm install -g n

# Install Node.js 20
n 20

# Verify
node --version
```

### Checking Your Environment

Run these commands to verify your setup:

```bash
# Check Node.js version (should be 20.x or higher)
node --version

# Check npm version (should be 8 or higher)
npm --version

# Check Git version
git --version

# Check if you can access the npm registry
npm ping

# If you see version errors, see the Troubleshooting section below
```

### Development Tools Setup

#### VS Code (Recommended)
1. Download from [code.visualstudio.com](https://code.visualstudio.com/)
2. Install recommended extensions:
   - ES7+ React/Redux/React-Native snippets
   - TypeScript Importer
   - Prettier - Code formatter
   - ESLint
   - Auto Rename Tag
   -Bracket Pair Colorizer

#### Command Line Basics
Familiarize yourself with these commands:

```bash
# Navigate to a directory
cd directory-name

# List contents
ls          # macOS/Linux
dir         # Windows

# Create a directory
mkdir new-folder

# Check current directory
pwd         # macOS/Linux
cd          # Windows

# Clear terminal
clear       # macOS/Linux
cls         # Windows
```

## Getting Started

Follow these detailed steps to get the project running on your local machine.

### 1. Clone and Navigate to Project

```bash
# Clone the repository (or fork it first as mentioned in Contributing section)
git clone <repository-url>
cd ship-celo-wallet
```

### 2. Install Dependencies

```bash
# Install project dependencies
npm install

# Or if you have yarn installed
yarn install

# Or if you have pnpm installed
pnpm install
```

> **⚠️ Important**: Make sure you're using a compatible Node.js version before running `npm install`. See the [System Requirements](#system-requirements) section if you encounter issues.

### 3. Environment Variables

Create a `.env` file in the project root and add your WalletConnect project ID:

```bash
# Copy the example environment file (recommended)
cp .env.example .env

# Then edit .env and replace the placeholder with your actual Project ID
```

Add the following content to your `.env` file:

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

> **🔑 Getting a WalletConnect Project ID**:
> 1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
> 2. Sign up for a free account
> 3. Create a new project
> 4. Copy the Project ID from your dashboard
> 
> **⚠️ Security**: Do not commit `.env` to version control. The `.gitignore` file already includes `.env` to prevent accidental commits.

### 4. Run the Development Server

```bash
npm run dev
```

You should see output similar to:

```
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser and navigate to `http://localhost:5173/` to see your application running.

## Available Scripts

Here are the scripts you can run in this project:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Fix linting issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Run TypeScript type checking |
| `npm test` | Run tests in watch mode |
| `npm run test:ui` | Run tests with interactive UI |
| `npm run test:run` | Run tests once and exit |

## Network Health Monitoring

This project includes a comprehensive network health monitoring system that provides real-time insights into Celo network performance and status.

### Features

- **Real-time Monitoring**: Continuous health checks of RPC endpoints
- **Network Metrics**: Response times, block production, gas prices, and transaction success rates
- **Congestion Analysis**: Visual indicators of network congestion levels
- **Endpoint Failover**: Automatic fallback to healthy endpoints
- **Caching**: Intelligent caching to reduce API calls while maintaining freshness
- **Error Handling**: User-friendly error messages for various failure scenarios

### Usage

The `NetworkHealth` component automatically monitors the current network and displays:

- Network status (Healthy/Degraded/Down)
- Congestion level with visual progress bar
- Key metrics: RPC response time, block production time, gas price trends
- Last updated timestamp with cache information
- Individual RPC endpoint statuses

```tsx
import { NetworkHealth } from './components/NetworkHealth';

// Use with your RPC endpoints
<NetworkHealth endpoints={celoEndpoints} />
```

### Configuration

The monitoring system can be customized via the `useNetworkHealth` hook:

```tsx
const { data, loading, error } = useNetworkHealth({
  endpoints: celoEndpoints,
  interval: 30000,        // Check every 30 seconds
  cacheTimeout: 15000     // Cache data for 15 seconds
});
```

## Testing Guide

This project uses **Vitest** for fast unit testing combined with **Testing Library** for React component testing. The testing setup is optimized for blockchain/Web3 applications with Wagmi integration.

### Quick Start Testing

```bash
# Run all tests in watch mode (recommended for development)
npm test

# Run tests once and exit (for CI/CD or quick verification)
npm run test:run

# Run tests with interactive UI (visual test runner)
npm run test:ui

# Run specific test file
npm test WalletConnectUI.test.tsx

# Run tests with coverage report
npm test -- --coverage

# Run tests in CI mode (no watch, with coverage)
npm test -- --run --coverage
```

### Test Structure and Organization

The project follows a comprehensive testing structure:

```
src/
├── components/tests/          # Component unit tests
│   ├── WalletConnectUI.test.tsx    # Wallet connection UI tests
│   ├── WalletStatus.test.tsx       # Network status tests
│   └── CeloBalance.test.tsx        # Balance display tests
├── test/
│   ├── setup.ts              # Global test configuration
│   └── mocks/                # Mock implementations
│       ├── wagmi.ts          # Wagmi hooks mocking
│       └── celo-chains.ts    # Celo network mocking
├── hooks/
│   └── tests/
│       └── useCeloNetwork.test.ts  # Custom hooks testing
└── utils/
    └── tests/
        └── formatting.test.ts      # Utility functions testing

root.test.ts                  # Root configuration tests
vitest.config.ts             # Vitest configuration
```

### Writing Component Tests

#### Basic Component Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { YourComponent } from './YourComponent'

// Mock external dependencies
vi.mock('../path/to/externaldependency', () => ({
  externalFunction: vi.fn(),
}))

describe('YourComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set up common mock implementations
  })

  it('should render correctly with default props', () => {
    render(<YourComponent />)
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    const user = userEvent.setup()
    render(<YourComponent />)
    
    await user.click(screen.getByRole('button'))
    
    expect(screen.getByText('Action performed')).toBeInTheDocument()
  })

  it('should display error state when props are invalid', () => {
    render(<YourComponent error={true} />)
    
    expect(screen.getByText(/error occurred/i)).toBeInTheDocument()
  })
})
```

#### Testing with Wagmi Hooks

When testing components that use Wagmi hooks, proper mocking is essential:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { WalletConnectUI } from './WalletConnectUI'

// Mock Wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useConnect: vi.fn(),
  useDisconnect: vi.fn(),
}))

describe('WalletConnectUI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show connect button when wallet is not connected', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isDisconnected: true,
    } as any)

    vi.mocked(useConnect).mockReturnValue({
      connect: vi.fn(),
      connectors: [],
      error: null,
      isLoading: false,
      isPending: false,
    } as any)

    render(<WalletConnectUI />)
    
    expect(screen.getByText(/connect wallet/i)).toBeInTheDocument()
  })

  it('should show connected address when wallet is connected', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
      isConnecting: false,
      isDisconnected: false,
    } as any)

    render(<WalletConnectUI />)
    
    expect(screen.getByText(/0x1234...7890/)).toBeInTheDocument()
  })

  it('should call disconnect when disconnect button is clicked', async () => {
    const user = userEvent.setup()
    
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    vi.mocked(useDisconnect).mockReturnValue({
      disconnect: vi.fn(),
      isPending: false,
      error: null,
    } as any)

    render(<WalletConnectUI />)
    
    await user.click(screen.getByRole('button', { name: /disconnect/i }))
    
    expect(vi.mocked(useDisconnect).mock.results[0].value.disconnect).toHaveBeenCalled()
  })
})
```

### Testing Custom Hooks

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCeloNetwork } from '../useCeloNetwork'

// Mock Wagmi hooks used by the custom hook
vi.mock('wagmi', () => ({
  useChainId: vi.fn(),
  useSwitchChain: vi.fn(),
}))

describe('useCeloNetwork', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return current network information', () => {
    vi.mocked(useChainId).mockReturnValue(42220) // Celo Mainnet
    
    const { result } = renderHook(() => useCeloNetwork())
    
    expect(result.current.activeChainId).toBe(42220)
    expect(result.current.isSupported).toBe(true)
    expect(result.current.activeChain?.name).toBe('Celo Mainnet')
  })

  it('should switch networks correctly', async () => {
    const mockSwitchChain = vi.fn()
    vi.mocked(useChainId).mockReturnValue(42220)
    vi.mocked(useSwitchChain).mockReturnValue({
      switchChain: mockSwitchChain,
      isPending: false,
      error: null,
    } as any)

    const { result } = renderHook(() => useCeloNetwork())
    
    act(() => {
      result.current.switchToAlfajores()
    })
    
    expect(mockSwitchChain).toHaveBeenCalledWith(44787)
  })
})
```

### Testing Best Practices

#### 1. **Test Naming Conventions**
- Use descriptive test names that explain what is being tested
- Follow the pattern: `should [expected behavior] when [condition]`

#### 2. **AAA Pattern (Arrange, Act, Assert)**
```typescript
it('should handle form submission correctly', async () => {
  // Arrange
  const mockOnSubmit = vi.fn()
  render(<Form onSubmit={mockOnSubmit} />)
  
  // Act
  await user.type(screen.getByLabelText(/name/i), 'John Doe')
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  // Assert
  expect(mockOnSubmit).toHaveBeenCalledWith('John Doe')
})
```

#### 3. **Testing User Interactions**
```typescript
import userEvent from '@testing-library/user-event'

it('should update input value on change', async () => {
  const user = userEvent.setup()
  render(<Input />)
  
  const input = screen.getByRole('textbox')
  await user.type(input, 'Hello World')
  
  expect(input).toHaveValue('Hello World')
})
```

#### 4. **Async Testing**
```typescript
it('should load data asynchronously', async () => {
  render(<DataComponent />)
  
  expect(screen.getByText(/loading/i)).toBeInTheDocument()
  
  await waitFor(() => {
    expect(screen.getByText(/data loaded/i)).toBeInTheDocument()
  })
})

it('should handle async errors', async () => {
  render(<DataComponent />)
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

#### 5. **Accessibility Testing**
```typescript
it('should be accessible to screen readers', () => {
  render(<Button>Click me</Button>)
  
  expect(screen.getByRole('button')).toBeInTheDocument()
  expect(screen.getByRole('button')).toHaveAccessibleName('Click me')
})

it('should support keyboard navigation', async () => {
  const user = userEvent.setup()
  render(<Modal />)
  
  await user.tab()
  expect(screen.getByLabelText(/first input/i)).toHaveFocus()
  
  await user.tab()
  expect(screen.getByLabelText(/second input/i)).toHaveFocus()
})
```

### Mocking Strategy

#### 1. **External APIs and Services**
```typescript
vi.mock('@walletconnect/ethereum-provider', () => ({
  EthereumProvider: {
    init: vi.fn().mockResolvedValue({
      connect: vi.fn(),
      disconnect: vi.fn(),
    }),
  },
}))
```

#### 2. **Environment Variables**
```typescript
vi.mock('../config/environment', () => ({
  WALLETCONNECT_PROJECT_ID: 'test-project-id',
  RPC_URL: 'https://test-rpc.com',
}))
```

#### 3. **Date and Time**
```typescript
it('should format dates correctly', () => {
  const mockDate = new Date('2023-12-01T12:00:00Z')
  vi.setSystemTime(mockDate)
  
  const { result } = renderHook(() => useDateFormatter())
  expect(result.current.formatNow()).toBe('Dec 1, 2023')
  
  vi.useRealTimers()
})
```

### Coverage and Quality Metrics

```bash
# Generate coverage report
npm test -- --coverage

# View coverage in browser
npm run test:ui

# Set coverage thresholds in vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
})
```

### Continuous Integration Testing

The project includes GitHub Actions CI configuration that runs:

1. **Install dependencies** with npm ci
2. **Type checking** with `npm run type-check`
3. **Linting** with `npm run lint`
4. **All tests** with `npm run test:run -- --coverage`
5. **Build verification** with `npm run build`

#### Running CI Tests Locally

```bash
# Simulate CI environment
npm ci                    # Clean install like CI
npm run type-check        # Type checking
npm run lint             # Linting
npm run test:run -- --coverage  # Tests with coverage
npm run build            # Production build
```

### Debugging Tests

#### 1. **Using Browser DevTools**
```bash
# Run tests in browser mode
npm run test:ui
```

#### 2. **Adding Console Logging**
```typescript
it('should debug test execution', () => {
  console.log('Test is running')
  render(<Component />)
  console.log(screen.debug()) // Logs rendered DOM
})
```

#### 3. **Using Vitest's Debug Features**
```typescript
it('should provide detailed output', async () => {
  render(<Component />)
  
  // This will show detailed error information
  await expect(screen.findByText('Expected')).rejects.toThrow()
})
```

### Test Configuration Details

The project includes comprehensive test setup in `src/test/setup.ts`:

- **Jest DOM matchers** for enhanced assertions
- **Wagmi hooks mocking** for blockchain functionality
- **Celo networks mocking** for testing different networks
- **Global test utilities** for common testing patterns

## Troubleshooting Guide

This section provides detailed solutions to the most common issues you might encounter during setup and development.

### Quick Diagnostic Commands

Before troubleshooting specific issues, run these commands to gather information:

```bash
# System information
node --version          # Should be 18.x or 20.x
npm --version           # Should be 8 or higher
git --version           # Any recent version
npm config get registry # Should show https://registry.npmjs.org/

# Check for permission issues
whoami                  # Current user
ls -la ~/.npm          # Check npm cache permissions (macOS/Linux)
npm config get prefix  # Check npm installation path
```

### Node.js Version Issues

#### Problem: `npm install` fails with version compatibility errors

**Symptoms:**
- Error messages containing "engines" or "node version"
- `npm install` exits with code 1
- Packages fail to install with version warnings

**Step-by-Step Solutions:**

1. **Check Current Version:**
   ```bash
   node --version
   npm --version
   ```

2. **If using wrong version (not 20.x or higher):**
   
   **Option A: Reinstall Node.js**
   - Download correct version from [nodejs.org](https://nodejs.org/)
   - Uninstall current version first
   - Install Node.js 20.x LTS
   
   **Option B: Use Version Manager (Recommended)**
   ```bash
   # Install nvm (Node Version Manager)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   
   # Restart terminal or reload shell
   source ~/.bashrc  # or ~/.zshrc
   
   # Install and use Node.js 20
   nvm install 20
   nvm use 20
   nvm alias default 20
   
   # Verify
   node --version  # Should show v20.x.x
   ```

3. **Clear npm cache and reinstall:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

#### Problem: "Permission denied" when installing global packages

**Solutions:**
```bash
# Option 1: Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Option 2: Use a version manager
nvm use 20
npm install -g <package-name>

# Option 3: Configure npm to use different directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Dependency Installation Failures

#### Problem: `npm install` fails with various errors

**Common Error Types and Solutions:**

1. **Network-related errors (timeout, connection refused)**
   
   **Symptoms:**
   - `ETIMEDOUT` or `ECONNREFUSED` errors
   - Network timeout during package download
   - Proxy/firewall blocking npm registry
   
   **Solutions:**
   ```bash
   # Test npm registry connectivity
   npm ping
   
   # Try different registry
   npm install --registry https://registry.npmjs.org/
   
   # If behind corporate firewall, configure proxy
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   
   # For Chinese users, use Chinese mirror
   npm install --registry https://registry.npmmirror.com
   ```

2. **Permission errors (EACCES, permission denied)**

   **Symptoms:**
   - Errors when writing to `/usr/local/lib/node_modules`
   - Permission denied on package installation
   
   **Solutions:**
   ```bash
   # Fix npm permissions (macOS/Linux)
   sudo chown -R $(whoami) ~/.npm
   sudo chown -R $(whoami) /usr/local/lib/node_modules
   
   # Or configure npm to use user directory
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   export PATH=~/.npm-global/bin:$PATH
   
   # For global installations, use sudo carefully
   sudo npm install -g <package-name>
   ```

3. **Peer dependency conflicts**

   **Symptoms:**
   - "peer dep missing" warnings
   - Package conflicts between dependencies
   - Version incompatibility errors
   
   **Solutions:**
   ```bash
   # Clear everything and reinstall
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   
   # Install with legacy peer deps (bypasses peer dependency checks)
   npm install --legacy-peer-deps
   
   # Force installation (use with caution)
   npm install --force
   
   # Install specific packages individually if conflicts persist
   npm install <package-name> --legacy-peer-deps
   ```

4. **Disk space issues**

   **Symptoms:**
   - "No space left on device" errors
   - Installation fails mid-way
   
   **Solutions:**
   ```bash
   # Check disk space
   df -h  # macOS/Linux
   dir /-c  # Windows
   
   # Clear npm cache to free space
   npm cache clean --force
   
   # Remove unused packages
   npm prune
   
   # Clean node_modules thoroughly
   rm -rf node_modules
   npm install
   ```

5. **Corrupted package-lock.json**

   **Symptoms:**
   - Installation fails with JSON parsing errors
   - Inconsistent dependency versions
   - Lock file corruption messages
   
   **Solutions:**
   ```bash
   # Backup and regenerate lock file
   mv package-lock.json package-lock.json.backup
   npm install
   ```

#### Advanced Troubleshooting Steps

If basic solutions don't work:

1. **Verbose logging for detailed errors:**
   ```bash
   npm install --verbose
   ```

2. **Check npm configuration:**
   ```bash
   npm config list
   npm config get prefix
   npm config get registry
   ```

3. **Reset npm to default settings:**
   ```bash
   npm config delete prefix
   npm config delete registry
   npm install
   ```

4. **Create a minimal test case:**
   ```bash
   # Create new directory and test basic npm install
   mkdir test-install
   cd test-install
   npm init -y
   npm install express
   ```

5. **Check for conflicting tools:**
   ```bash
   # Check if yarn is interfering
   which yarn
   yarn --version
   
   # Check for other Node.js installations
   which node
   ls /usr/local/bin/node*
   ls ~/.nvm/versions/node/*/bin/node
   ```

### WalletConnect Issues

**Problem**: "Invalid project ID" or wallet connection fails

**Solutions**:

1. **Verify your WalletConnect Project ID**:
   - Ensure you've created a project at [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Check that the ID in your `.env` file is correct
   - Make sure there are no extra spaces or characters

2. **Restart development server**:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

3. **Check browser console** for specific error messages

### Build Errors

**Problem**: TypeScript or build errors when running `npm run build`

**Solutions**:

1. **Run type checking first**:
   ```bash
   npm run type-check
   ```

2. **Fix linting issues**:
   ```bash
   npm run lint:fix
   ```

3. **Clear Vite cache**:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### Test Failures

**Problem**: Tests fail to run or show unexpected errors

**Solutions**:

1. **Ensure proper test setup**:
   ```bash
   # Run tests in isolated mode
   npm test -- --run
   ```

2. **Check test environment**:
   ```bash
   # Verify test configuration
   npm test -- --info
   ```

3. **Clear test cache**:
   ```bash
   rm -rf node_modules/.cache
   npm test
   ```

### Development Server Issues

**Problem**: Development server won't start or shows port already in use

**Solutions**:

1. **Kill process using the port**:
   ```bash
   # On macOS/Linux:
   lsof -ti:5173 | xargs kill -9
   
   # On Windows:
   netstat -ano | findstr :5173
   # Then use taskkill /PID <PID> /F
   ```

2. **Use a different port**:
   ```bash
   npm run dev -- --port 3000
   ```

3. **Check firewall settings** - ensure localhost connections aren't blocked

### Getting Help

If you're still experiencing issues:

1. **Check the browser console** for JavaScript errors
2. **Check the terminal** for specific error messages
3. **Search existing GitHub issues** for similar problems
4. **Create a new issue** with detailed error information

When reporting issues, please include:
- Your operating system and version
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Complete error messages
- Steps to reproduce the issue

## Development Workflow

Here's a recommended workflow for developing with this starter kit:

### Daily Development Process

1. **Start your development session**:
   ```bash
   # Ensure you're on the latest main branch
   git pull origin main
   
   # Create a new feature branch
   git checkout -b feature/your-feature-name
   
   # Start the development server
   npm run dev
   ```

2. **Code Quality Checks** (run these frequently):
   ```bash
   # Type checking
   npm run type-check
   
   # Linting
   npm run lint
   
   # Format code
   npm run format
   ```

3. **Testing** (run tests before committing):
   ```bash
   # Run tests in watch mode during development
   npm test
   
   # Or run tests once before committing
   npm run test:run
   ```

### Before Committing

Always run these checks before committing your code:

```bash
# 1. Type check
npm run type-check

# 2. Lint and fix issues
npm run lint:fix

# 3. Run all tests
npm run test:run

# 4. Build to ensure no production issues
npm run build
```

### Code Style Guidelines

This project uses:
- **ESLint** for code quality and consistency
- **Prettier** for code formatting
- **TypeScript** for type safety

**Best Practices**:
- Use TypeScript types for all props and function parameters
- Follow React functional component patterns
- Use Wagmi hooks for blockchain interactions
- Write tests for new components and functionality
- Keep components focused and reusable

### Environment Management

**Development vs Production**:
- Development uses `npm run dev` with hot reloading
- Production builds use `npm run build` for optimized bundles
- Test environment uses mocked blockchain data

**Wallet Testing**:
- Test wallet connections using browser developer tools
- Use Alfajores testnet for safe testing (no real funds)
- Clear browser wallet data between tests to avoid state issues

### Git Workflow

1. **Feature Development**:
   ```bash
   git checkout -b feature/wallet-improvements
   # Make changes
   git add .
   git commit -m "feat: improve wallet connection UX"
   git push origin feature/wallet-improvements
   ```

2. **Before Pull Request**:
   - Run all quality checks (`npm run lint:fix`, `npm run type-check`, `npm run test:run`)
   - Ensure build passes (`npm run build`)
   - Update documentation if needed
   - Write clear commit messages following [conventional commits](https://www.conventionalcommits.org/)

## What you get

- **WalletConnect + Injected connectors** via Wagmi
- **Celo configuration** in `src/config/celoChains.ts`
- **WagmiProvider** with React Query in `src/providers/WagmiProvider.tsx`
- **WalletConnectUI** component for connect/disconnect
- **WalletStatus** component with Celo network switching
- **CeloBalance** component for displaying native CELO balance

## How it works

This starter kit integrates several technologies to create a seamless Celo wallet connection experience:

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         src/main.tsx                            │
│  Entry point - wraps App with WagmiProvider & React Query      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   src/providers/WagmiProvider.tsx               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Wagmi Configuration:                                     │  │
│  │  • Chains: Celo Mainnet + Alfajores (from celoChains.ts) │  │
│  │  • Transports: HTTP RPC endpoints for each chain         │  │
│  │  • Connectors:                                            │  │
│  │    - Injected (MetaMask, etc.)                            │  │
│  │    - WalletConnect (QR code modal)                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                          App.tsx                                │
│  Main application component using:                             │
│  • WalletConnectUI - Connect/disconnect interface              │
│  • WalletStatus - Network info & switching controls            │
│  • CeloBalance - Native CELO balance display                   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Flow

#### 1. **Application Entry** (`src/main.tsx`)
The app starts by wrapping the root `<App />` component with `<WagmiProvider>`, which provides wallet connection functionality throughout the application via React Context.

#### 2. **Wagmi Configuration** (`src/providers/WagmiProvider.tsx`)
The `WagmiProvider` sets up:

- **Celo Chains**: Imports chain configurations from `src/config/celoChains.ts`
  - **Celo Mainnet** (Chain ID: 42220)
  - **Alfajores Testnet** (Chain ID: 44787)

- **HTTP Transports**: Configures RPC endpoints for each chain
  - Celo: `https://forno.celo.org`
  - Alfajores: `https://alfajores-forno.celo-testnet.org`

- **Wallet Connectors**:
  - **Injected**: Detects browser extension wallets (MetaMask, Valora, etc.)
  - **WalletConnect**: Enables QR code scanning for mobile wallets

- **React Query**: Wraps everything with `QueryClientProvider` for efficient data fetching and caching

#### 3. **Chain Configuration** (`src/config/celoChains.ts`)
Defines Celo-specific chain parameters using Viem's `defineChain`:
- Chain IDs, names, and native currency details
- RPC URLs for network communication
- Block explorer URLs for transaction viewing

#### 4. **Wallet Connection UI** (`src/components/WalletConnectUI.tsx`)
Handles the wallet connection interface:
- Displays available connectors (Injected, WalletConnect)
- Shows connected wallet address (shortened format)
- Provides disconnect functionality
- Uses Wagmi hooks: `useAccount`, `useConnect`, `useDisconnect`

#### 5. **Network Status & Switching** (`src/components/WalletStatus.tsx`)
Displays current connection state and enables network switching:
- Shows connection status and current chain
- Provides buttons to switch between Celo Mainnet and Alfajores
- Warns when connected to unsupported networks
- Uses custom hook `useCeloNetwork` for chain management

#### 6. **CELO Balance Display** (`src/components/CeloBalance.tsx`)
Displays native CELO balance for the connected wallet:
- Shows message to connect wallet when not connected
- Fetches and displays native CELO balance on active chain
- Formats balance to 6 decimal places for readability
- Shows current network name alongside balance
- Uses Wagmi hooks: `useAccount`, `useBalance`
- Uses viem's `formatEther` for balance formatting

#### 7. **Network Management Hook** (`src/hooks/useCeloNetwork.ts`)
Custom React hook that:
- Tracks the active chain ID
- Validates if the current chain is supported (Celo or Alfajores)
- Provides helper functions: `switchToCelo()` and `switchToAlfajores()`
- Manages switching state and errors
- Uses Wagmi hooks: `useChainId`, `useSwitchChain`

### Data Flow Example

```
User clicks "Connect" button
         │
         ▼
WalletConnectUI calls connect() with selected connector
         │
         ▼
Wagmi initiates connection (browser wallet or WalletConnect modal)
         │
         ▼
User approves connection in wallet
         │
         ▼
Wagmi updates connection state → useAccount hook returns address
         │
         ▼
WalletConnectUI shows connected address
         │
         ▼
WalletStatus displays current chain and switching options
         │
         ▼
User clicks "Switch to Alfajores"
         │
         ▼
useCeloNetwork hook calls switchChain() with Alfajores chain ID
         │
         ▼
Wallet prompts user to approve network switch
         │
         ▼
Chain switches → UI updates to show new network
```

### Key Technologies

- **Vite**: Fast build tool and dev server
- **React**: UI library with TypeScript
- **Wagmi**: React hooks for Ethereum/Celo wallet interactions
- **WalletConnect**: Protocol for connecting mobile wallets via QR codes
- **Viem**: TypeScript library for Ethereum/Celo interactions (used by Wagmi)
- **TanStack Query**: Data fetching and caching (required by Wagmi)
- **Celo**: Layer-1 blockchain with mobile-first design

## Contributing

See `CONTRIBUTING.md` for guidelines and suggested first issues.

## License

MIT
