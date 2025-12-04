import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WagmiProvider } from '../../providers/WagmiProvider';
import { TransactionHistory } from '../TransactionHistory';

// Mock the useAccount hook
const mockUseAccount = vi.fn();

// Mock the useTransactionHistory hook
const mockFetchTransactions = vi.fn();
const mockError = null;

vi.mock('../../hooks/useTransactionHistory', () => ({
  useTransactionHistory: () => ({
    fetchTransactions: mockFetchTransactions,
    refreshTransactions: vi.fn(),
    transactionSummary: {
      totalSent: 0,
      totalReceived: 0,
      totalTransactions: 0,
      lastTransaction: null
    },
    error: mockError,
    address: '0x1234567890123456789012345678901234567890',
    chainId: 42220,
    isConnected: true
  })
}));

vi.mock('wagmi', () => ({
  useAccount: mockUseAccount
}));

const mockTransactions = [
  {
    hash: '0x1234567890abcdef',
    blockNumber: '12345678',
    timestamp: 1609459200,
    from: '0x1234567890123456789012345678901234567890',
    to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
    value: '1000000000000000000',
    gasUsed: '21000',
    gasPrice: '20000000000',
    status: 'success' as const,
    type: 'sent' as const,
    confirmations: 12,
    chainId: 42220
  },
  {
    hash: '0xabcdef1234567890',
    blockNumber: '12345679',
    timestamp: 1609545600,
    from: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
    to: '0x1234567890123456789012345678901234567890',
    value: '500000000000000000',
    gasUsed: '21000',
    gasPrice: '20000000000',
    status: 'success' as const,
    type: 'received' as const,
    confirmations: 12,
    chainId: 42220
  }
];

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <WagmiProvider>
    {children}
  </WagmiProvider>
);

describe('TransactionHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchTransactions.mockResolvedValue({
      transactions: mockTransactions,
      total: 2,
      hasMore: false,
      nextCursor: undefined
    });
  });

  it('renders the transaction history component', () => {
    render(
      <TestWrapper>
        <TransactionHistory />
      </TestWrapper>
    );

    expect(screen.getByText('Transaction History')).toBeInTheDocument();
  });

  it('shows loading state when fetching transactions', async () => {
    mockFetchTransactions.mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    );

    render(
      <TestWrapper>
        <TransactionHistory />
      </TestWrapper>
    );

    expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
  });

  it('displays transactions when data is loaded', async () => {
    render(
      <TestWrapper>
        <TransactionHistory />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('sent')).toBeInTheDocument();
      expect(screen.getByText('received')).toBeInTheDocument();
      expect(screen.getByText('1.0 CELO')).toBeInTheDocument();
      expect(screen.getByText('0.5 CELO')).toBeInTheDocument();
    });
  });

  it('shows connect wallet message when not connected', () => {
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false
    });

    render(
      <TestWrapper>
        <TransactionHistory />
      </TestWrapper>
    );

    expect(screen.getByText('Connect your wallet to view transaction history')).toBeInTheDocument();
  });

  it('filters transactions by type', async () => {
    render(
      <TestWrapper>
        <TransactionHistory />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('sent')).toBeInTheDocument();
    });

    const typeFilter = screen.getByDisplayValue('all');
    fireEvent.change(typeFilter, { target: { value: 'sent' } });

    await waitFor(() => {
      expect(screen.getByText('sent')).toBeInTheDocument();
      expect(screen.queryByText('received')).not.toBeInTheDocument();
    });
  });

  it('filters transactions by status', async () => {
    render(
      <TestWrapper>
        <TransactionHistory />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('success')).toBeInTheDocument();
    });

    const statusFilter = screen.getByDisplayValue('all');
    fireEvent.change(statusFilter, { target: { value: 'success' } });

    expect(screen.getByText('success')).toBeInTheDocument();
  });

  it('searches transactions by hash, from, or to address', async () => {
    render(
      <TestWrapper>
        <TransactionHistory />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('sent')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search transactions...');
    fireEvent.change(searchInput, { target: { value: '1234567890' } });

    await waitFor(() => {
      expect(screen.getByText('sent')).toBeInTheDocument();
      expect(screen.getByText('received')).toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: '0x1234567890abcdef' } });

    await waitFor(() => {
      expect(screen.getByText('sent')).toBeInTheDocument();
      expect(screen.queryByText('received')).not.toBeInTheDocument();
    });
  });

  it('refreshes transactions when refresh button is clicked', async () => {
    render(
      <TestWrapper>
        <TransactionHistory />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('sent')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button');
    fireEvent.click(refreshButton);

    expect(mockFetchTransactions).toHaveBeenCalledTimes(2); // Once on mount, once on refresh
  });

  it('creates external links to transaction explorer', async () => {
    render(
      <TestWrapper>
        <TransactionHistory />
      </TestWrapper>
    );

    await waitFor(() => {
      const link = screen.getByText('0x1234...90ef');
      expect(link).toHaveAttribute('href', 'https://explorer.celo.org/tx/0x1234567890abcdef');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('handles pagination when there are many transactions', async () => {
    const manyTransactions = Array.from({ length: 25 }, (_, i) => ({
      ...mockTransactions[0],
      hash: `0x${i.toString().padStart(16, '0')}`,
      timestamp: 1609459200 + i * 86400
    }));

    mockFetchTransactions.mockResolvedValue({
      transactions: manyTransactions,
      total: 25,
      hasMore: true,
      nextCursor: 'cursor123'
    });

    render(
      <TestWrapper>
        <TransactionHistory />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(screen.getByText('Page 2')).toBeInTheDocument();
  });
});