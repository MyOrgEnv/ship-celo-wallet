import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CeloBalance } from '../CeloBalance'
import { useAccount, useBalance } from 'wagmi'

// Mock the wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useBalance: vi.fn(),
}))

// Mock the useCeloNetwork hook
vi.mock('../../hooks/useCeloNetwork', () => ({
  useCeloNetwork: vi.fn(),
}))

import { useCeloNetwork } from '../../hooks/useCeloNetwork'

describe('CeloBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set up basic mock implementations
    vi.mocked(useAccount).mockReturnValue({
      address: undefined,
      isConnected: false,
    } as any)
    
    vi.mocked(useCeloNetwork).mockReturnValue({
      activeChainId: 42220,
      activeChain: { id: 42220, name: 'Celo Mainnet' },
      isSupported: true,
      celoMainnet: { id: 42220, name: 'Celo Mainnet' },
      alfajores: { id: 44787, name: 'Celo Alfajores' },
      switchToCelo: vi.fn(),
      switchToAlfajores: vi.fn(),
      isSwitching: false,
      status: 'idle',
      error: null,
    } as any)

    vi.mocked(useBalance).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any)
  })

  it('shows "Connect your wallet" message when no wallet is connected', () => {
    render(<CeloBalance />)

    expect(screen.getByText('Connect your wallet to see your CELO balance.')).toBeInTheDocument()
  })

  it('shows "Loading balance..." when wallet is connected but balance is loading', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    vi.mocked(useBalance).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    render(<CeloBalance />)

    expect(screen.getByText('Loading balance...')).toBeInTheDocument()
  })

  it('shows error message when balance fetching fails', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    vi.mocked(useBalance).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch balance'),
    } as any)

    render(<CeloBalance />)

    expect(screen.getByText(/Error loading balance/)).toBeInTheDocument()
    expect(screen.getByText(/Failed to fetch balance/)).toBeInTheDocument()
  })

  it('shows formatted balance when wallet is connected and balance is loaded', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    // Mock a balance of 12.345678 CELO (12.345678 * 10^18 wei)
    const mockBalance = BigInt('12345678000000000000000')
    
    vi.mocked(useBalance).mockReturnValue({
      data: {
        value: mockBalance,
        decimals: 18,
        symbol: 'CELO',
        formatted: '12.345678',
      },
      isLoading: false,
      error: null,
    } as any)

    render(<CeloBalance />)

    expect(screen.getByText('Balance: 12.345678 CELO on Celo Mainnet')).toBeInTheDocument()
  })

  it('shows trimmed balance without trailing zeros', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    // Mock a balance of 10.0 CELO that should be displayed as "10" without trailing zeros
    const mockBalance = BigInt('10000000000000000000000')
    
    vi.mocked(useBalance).mockReturnValue({
      data: {
        value: mockBalance,
        decimals: 18,
        symbol: 'CELO',
        formatted: '10.000000',
      },
      isLoading: false,
      error: null,
    } as any)

    render(<CeloBalance />)

    expect(screen.getByText('Balance: 10 CELO on Celo Mainnet')).toBeInTheDocument()
  })

  it('handles very small balances with more precision', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    // Mock a very small balance of 0.00000012 CELO
    const mockBalance = BigInt('120000000000000')
    
    vi.mocked(useBalance).mockReturnValue({
      data: {
        value: mockBalance,
        decimals: 18,
        symbol: 'CELO',
        formatted: '0.00000012',
      },
      isLoading: false,
      error: null,
    } as any)

    render(<CeloBalance />)

    expect(screen.getByText('Balance: 0.00000012 CELO on Celo Mainnet')).toBeInTheDocument()
  })

  it('shows zero balance when balance value is null', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    vi.mocked(useBalance).mockReturnValue({
      data: {
        value: null,
        decimals: 18,
        symbol: 'CELO',
        formatted: '0',
      },
      isLoading: false,
      error: null,
    } as any)

    render(<CeloBalance />)

    expect(screen.getByText('Balance: 0.000000 CELO on Celo Mainnet')).toBeInTheDocument()
  })

  it('shows "Unknown Network" when active chain is null', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    vi.mocked(useCeloNetwork).mockReturnValue({
      activeChainId: 1, // Unsupported chain
      activeChain: null,
      isSupported: false,
      celoMainnet: { id: 42220, name: 'Celo Mainnet' },
      alfajores: { id: 44787, name: 'Celo Alfajores' },
      switchToCelo: vi.fn(),
      switchToAlfajores: vi.fn(),
      isSwitching: false,
      status: 'idle',
      error: null,
    } as any)

    vi.mocked(useBalance).mockReturnValue({
      data: {
        value: BigInt('1000000000000000000000'), // 1 CELO
        decimals: 18,
        symbol: 'CELO',
        formatted: '1',
      },
      isLoading: false,
      error: null,
    } as any)

    render(<CeloBalance />)

    expect(screen.getByText('Balance: 1 CELO on Unknown Network')).toBeInTheDocument()
  })
})