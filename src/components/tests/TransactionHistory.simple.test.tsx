import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionHistory } from '../TransactionHistory';

describe('TransactionHistory', () => {
  it('renders without crashing', () => {
    render(<TransactionHistory />);
    expect(screen.getByText('Transaction History')).toBeInTheDocument();
  });

  it('shows connect wallet message when not connected', () => {
    render(<TransactionHistory />);
    expect(screen.getByText('Connect your wallet to view transaction history')).toBeInTheDocument();
  });
});