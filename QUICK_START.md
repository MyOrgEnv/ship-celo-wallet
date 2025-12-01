# Quick Start Guide

## Prerequisites

- Node.js 18.x or 20.x
- npm 8+
- Git
- Modern web browser

Verify your setup:
```bash
node --version
npm --version
git --version
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ship-celo-wallet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Get WalletConnect Project ID**
   - Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Sign up for free account
   - Create new project (select "Web3App")
   - Copy the Project ID

4. **Create environment file**
   ```bash
   echo "VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here" > .env
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open application**
   - Navigate to `http://localhost:5173/`
   - Click "Connect Wallet" to test

## Testing

```bash
# Run tests
npm test

# Run tests once
npm run test:run

# Type checking
npm run type-check

# Linting
npm run lint
```

## Common Issues

### Port already in use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### npm permission errors
```bash
# Fix permissions
sudo chown -R $(whoami) ~/.npm

# Or use version manager
nvm install 20
nvm use 20
```

### WalletConnect errors
- Verify `.env` file exists
- Check Project ID is correct (32 characters)
- Restart development server

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run type-check` | TypeScript checking |
| `npm run lint:fix` | Fix linting issues |

## Next Steps

1. Explore the project structure
2. Make changes to see hot reloading
3. Run the test suite
4. Build your own Celo dApp features

For detailed documentation, see [README.md](README.md).