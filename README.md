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
