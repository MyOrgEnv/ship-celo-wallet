# Web3 Wallet Connect + Celo React Starter Kit

A starter kit for building Celo dApps with:

- React + Vite
- TypeScript
- Wagmi + WalletConnect
- Celo mainnet + Alfajores configuration
- Example wallet connect UI
- Basic network status & switching

This project is designed to be forked and extended, especially for the Proof-of-Ship program.

## System Requirements

Before you begin, ensure your development environment meets these requirements:

- **Node.js**: Version 18.x or 20.x (check with `node --version`)
- **npm**: Version 8 or higher (check with `npm --version`)
- **Git**: For cloning the repository
- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

> **💡 Tip**: We recommend using Node.js 20.x for the best compatibility and performance.

### Checking Your Environment

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# If you need to install or update Node.js, visit https://nodejs.org/
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
# Copy the example environment file (if available)
cp .env.example .env

# Or create a new .env file
touch .env
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

## Testing

This project uses **Vitest** for testing with **Testing Library** for React component testing.

### Running Tests

```bash
# Run tests in watch mode (recommended for development)
npm test

# Run tests with interactive UI
npm run test:ui

# Run tests once and exit (useful for CI/CD)
npm run test:run

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

The project follows this testing structure:

```
src/
├── components/tests/          # Component tests
│   ├── WalletConnectUI.test.tsx
│   ├── WalletStatus.test.tsx
│   └── CeloBalance.test.tsx
├── test/
│   └── setup.ts              # Test configuration and mocks
├── App.test.tsx (if added)
└── ...
root.test.ts                  # Root configuration tests
```

### Writing Tests

- **Component Tests**: Located in `src/components/tests/` directory
- **Test Setup**: Configuration in `src/test/setup.ts`
- **Test Utilities**: Includes Jest DOM matchers and Wagmi mocks

Example test structure:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { YourComponent } from './YourComponent'

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Test Configuration

The project includes:
- **Jest DOM matchers** for React testing
- **Wagmi hooks mocking** for wallet functionality testing
- **Celo chains mocking** for network testing
- **jsdom** for browser-like testing environment

## Troubleshooting

Here are solutions to common issues you might encounter:

### Node.js Version Issues

**Problem**: `npm install` fails with version compatibility errors

**Solution**:
```bash
# Check your Node.js version
node --version

# If you're not using Node.js 18.x or 20.x, update Node.js
# Download from: https://nodejs.org/

# Or use a version manager:
# nvm (recommended): https://github.com/nvm-sh/nvm
nvm install 20
nvm use 20

# Or n (another version manager):
npm install -g n
sudo n 20
```

### Dependency Installation Failures

**Problem**: `npm install` fails with permission errors or network issues

**Solutions**:

1. **Clear npm cache and reinstall**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use a different registry** (if behind corporate firewall):
   ```bash
   npm install --registry https://registry.npmjs.org/
   ```

3. **Install with legacy peer deps**:
   ```bash
   npm install --legacy-peer-deps
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
