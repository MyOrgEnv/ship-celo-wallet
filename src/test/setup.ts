import '@testing-library/jest-dom'
import { expect, vi } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

// extends Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useConnect: vi.fn(),
  useDisconnect: vi.fn(),
  useChainId: vi.fn(),
  useSwitchChain: vi.fn(),
}))

// Mock the celo chains config
vi.mock('../config/celoChains', () => ({
  celo: {
    id: 42220,
    name: 'Celo Mainnet',
    network: 'celo',
    nativeCurrency: { name: 'CELO', decimals: 18, symbol: 'CELO' },
    rpcUrls: { default: { http: ['https://forno.celo.org'] } },
  },
  celoAlfajores: {
    id: 44787,
    name: 'Celo Alfajores',
    network: 'alfajores',
    nativeCurrency: { name: 'CELO', decimals: 18, symbol: 'CELO' },
    rpcUrls: { default: { http: ['https://alfajores-forno.celo.org'] } },
  },
}))