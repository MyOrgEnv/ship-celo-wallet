import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WalletConnectUI } from '../WalletConnectUI'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

// Mock the wagmi hooks with simpler mocks
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useConnect: vi.fn(),
  useDisconnect: vi.fn(),
}))

describe('WalletConnectUI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set up basic mock implementations
    vi.mocked(useAccount).mockReturnValue({
      address: undefined,
      isConnected: false,
    } as any)
    
    vi.mocked(useConnect).mockReturnValue({
      connectors: [
        { id: 'injected', name: 'Injected', ready: true },
        { id: 'walletconnect', name: 'WalletConnect', ready: true },
      ],
      connect: vi.fn(),
      isPending: false,
      error: null,
    } as any)
    
    vi.mocked(useDisconnect).mockReturnValue({
      disconnect: vi.fn(),
    } as any)
  })

  it('renders "Connect your wallet" and at least one connector button', () => {
    render(<WalletConnectUI />)

    expect(screen.getByText('Connect your wallet')).toBeInTheDocument()
    expect(screen.getByText('Select a connector to get started on Celo.')).toBeInTheDocument()
    
    const connectorButtons = screen.getAllByRole('button')
    expect(connectorButtons.length).toBeGreaterThan(0)
    expect(screen.getByText('Injected')).toBeInTheDocument()
    expect(screen.getByText('WalletConnect')).toBeInTheDocument()
  })

  it('shows connected state UI when mocked useAccount returns isConnected: true', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    render(<WalletConnectUI />)

    expect(screen.getByText('Connected')).toBeInTheDocument()
    expect(screen.getByText('Address: 0x1234...7890')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument()
    
    // Should not show connector buttons when connected
    expect(screen.queryByText('Connect your wallet')).not.toBeInTheDocument()
  })

  it('displays error message when connection fails', async () => {
    const user = userEvent.setup()
    
    const mockConnect = vi.fn().mockRejectedValue(new Error('Connection failed'))
    vi.mocked(useConnect).mockReturnValue({
      connectors: [
        { id: 'injected', name: 'Injected', ready: true },
      ],
      connect: mockConnect,
      isPending: false,
      error: null,
    } as any)

    render(<WalletConnectUI />)

    const connectButton = screen.getByRole('button', { name: 'Injected' })
    await user.click(connectButton)

    expect(screen.getByText('Failed to connect wallet. Please try again.')).toBeInTheDocument()
  })

  it('disables connector buttons when not ready', () => {
    vi.mocked(useConnect).mockReturnValue({
      connectors: [
        { id: 'injected', name: 'Injected', ready: false },
        { id: 'walletconnect', name: 'WalletConnect', ready: true },
      ],
      connect: vi.fn(),
      isPending: false,
      error: null,
    } as any)

    render(<WalletConnectUI />)

    const injectedButton = screen.getByRole('button', { name: 'Injected' })
    const walletConnectButton = screen.getByRole('button', { name: 'WalletConnect' })

    expect(injectedButton).toBeDisabled()
    expect(walletConnectButton).toBeEnabled()
  })
})