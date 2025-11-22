# Web3 Wallet Connect + Celo React Starter Kit

A starter kit for building Celo dApps with:

- React + Vite
- TypeScript
- Wagmi + WalletConnect
- Celo mainnet + Alfajores configuration
- Example wallet connect UI
- Basic network status & switching

This project is designed to be forked and extended, especially for the Proof-of-Ship program.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

> Do not commit `.env` to version control.

### 3. Run the dev server

```bash
npm run dev
```

Open the URL printed in the terminal (e.g. `http://localhost:5173`).

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
