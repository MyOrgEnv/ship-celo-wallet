import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WalletStatus } from '../WalletStatus'
import { useAccount } from 'wagmi'

// Mock the wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}))

// Mock the useCeloNetwork hook
vi.mock('../../hooks/useCeloNetwork', () => ({
  useCeloNetwork: vi.fn(),
}))

import { useCeloNetwork } from '../../hooks/useCeloNetwork'

describe('WalletStatus', () => {
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
  })

  it('renders "Not connected" when no account', () => {
    render(<WalletStatus />)

    expect(screen.getByText('Not connected')).toBeInTheDocument()
  })

  it('when mocked useAccount and useCeloNetwork return connected state, shows Connected pill', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    render(<WalletStatus />)

    expect(screen.getByText('Connected')).toBeInTheDocument()
  })

  it('shows shortened address pill when connected', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    render(<WalletStatus />)

    expect(screen.getByText('0x1234...7890')).toBeInTheDocument()
  })

  it('shows chain name pill when active chain is available', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    render(<WalletStatus />)

    expect(screen.getByText('Celo Mainnet')).toBeInTheDocument()
  })

  it('does not show chain pill when active chain is null', () => {
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

    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    render(<WalletStatus />)

    expect(screen.getByText('Connected')).toBeInTheDocument()
    expect(screen.getByText('0x1234...7890')).toBeInTheDocument()
    
    // Should not show chain pill when activeChain is null
    const chainPills = screen.queryAllByText(/Celo/)
    expect(chainPills.length).toBe(0)
  })

  it('shows unsupported network warning when not on supported network', () => {
    vi.mocked(useCeloNetwork).mockReturnValue({
      activeChainId: 1, // Unsupported chain (Ethereum mainnet)
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

    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    render(<WalletStatus />)

    expect(screen.getByText(/unsupported network/i)).toBeInTheDocument()
    expect(screen.getByText(/Please switch to Celo or Alfajores/i)).toBeInTheDocument()
  })

  it('shows switch buttons when connected', async () => {
    const user = userEvent.setup()
    
    const mockSwitchToCelo = vi.fn()
    
    vi.mocked(useCeloNetwork).mockReturnValue({
      activeChainId: 44787, // Currently on Alfajores
      activeChain: { id: 44787, name: 'Celo Alfajores' },
      isSupported: true,
      celoMainnet: { id: 42220, name: 'Celo Mainnet' },
      alfajores: { id: 44787, name: 'Celo Alfajores' },
      switchToCelo: mockSwitchToCelo,
      switchToAlfajores: vi.fn(),
      isSwitching: false,
      status: 'idle',
      error: null,
    } as any)

    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    render(<WalletStatus />)

    expect(screen.getByText('Switch to Celo Mainnet')).toBeInTheDocument()
    expect(screen.getByText('Switch to Celo Alfajores')).toBeInTheDocument()

    const switchToCeloButton = screen.getByRole('button', { name: 'Switch to Celo Mainnet' })
    await user.click(switchToCeloButton)
    expect(mockSwitchToCelo).toHaveBeenCalledTimes(1)
  })

  it('disables switch buttons when switching', () => {
    vi.mocked(useCeloNetwork).mockReturnValue({
      activeChainId: 44787,
      activeChain: { id: 44787, name: 'Celo Alfajores' },
      isSupported: true,
      celoMainnet: { id: 42220, name: 'Celo Mainnet' },
      alfajores: { id: 44787, name: 'Celo Alfajores' },
      switchToCelo: vi.fn(),
      switchToAlfajores: vi.fn(),
      isSwitching: true, // Switching in progress
      status: 'pending',
      error: null,
    } as any)

    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    render(<WalletStatus />)

    const switchButtons = screen.getAllByRole('button')
    switchButtons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })
})