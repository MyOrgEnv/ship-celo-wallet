import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useTransactionHistory } from '../hooks/useTransactionHistory';
import type { TransactionFilters } from '../types/transaction';
import { ErrorRecovery } from './ErrorRecovery';
import {
  getTransactionUrl,
  getAddressUrl,
  formatTransactionHash,
  formatRelativeTime,
  formatValue
} from '../utils/celoExplorer';

interface TransactionHistoryProps {
  maxHeight?: string;
  className?: string;
}

interface FilterState extends TransactionFilters {
  search: string;
}

export function TransactionHistory({ className = '' }: TransactionHistoryProps) {
  const { address, isConnected } = useAccount();
  const { fetchTransactions } = useTransactionHistory();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    status: 'all',
    search: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<Error | null>(null);
  const itemsPerPage = 10;

  // Fetch transactions on mount and when filters change
  useEffect(() => {
    if (isConnected && address) {
      loadTransactions();
    }
  }, [isConnected, address, filters]);

  const loadTransactions = async () => {
    if (!isConnected || !address) {
      return;
    }

    setLoading(true);
    try {
      const result = await fetchTransactions({
        limit: itemsPerPage * currentPage,
        filters: {
          type: filters.type,
          status: filters.status
        }
      });
      setTransactions(result.transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setError(new Error((error as any).message));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadTransactions();
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') {
      return <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">⏱</div>;
    }
    if (status === 'failure') {
      return <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">✕</div>;
    }

    switch (type) {
    case 'sent':
      return <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">↑</div>;
    case 'received':
      return <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">↓</div>;
    case 'contract':
      return <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">⚡</div>;
    default:
      return <div className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center">↑</div>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case 'success':
      return 'text-green-600 bg-green-100';
    case 'failure':
      return 'text-red-600 bg-red-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        tx.hash.toLowerCase().includes(searchLower) ||
        tx.from.toLowerCase().includes(searchLower) ||
        tx.to.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (!isConnected) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Connect your wallet to view transaction history</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Transaction History</h3>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <div className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}>
              🔄
            </div>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative">
            <div className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filters.type || 'all'}
            onChange={(e) => handleFilterChange({ type: e.target.value as any })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="sent">Sent</option>
            <option value="received">Received</option>
            <option value="contract">Contract</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange({ status: e.target.value as any })}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failure">Failed</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">
            <div className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2">🔄</div>
            <p className="text-gray-500">Loading transactions...</p>
          </div>
        ) : error ? (
          <ErrorRecovery
            error={error}
            context="transaction history"
            onRetry={loadTransactions}
            onRecovered={() => setError(null)}
          />
        ) : filteredTransactions.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTransactions.map((tx) => (
              <div key={tx.hash} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(tx.type, tx.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium capitalize">{tx.type}</span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            tx.status
                          )}`}
                        >
                          {tx.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 space-x-2">
                        <span>{formatRelativeTime(tx.timestamp)}</span>
                        <span>•</span>
                        <span>{formatValue(tx.value)} CELO</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono">
                      <a
                        href={getTransactionUrl(tx.hash, tx.chainId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {formatTransactionHash(tx.hash)}
                      </a>
                    </div>
                    <div className="text-xs text-gray-500">
                      <a
                        href={getAddressUrl(tx.from, tx.chainId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-700"
                      >
                        {formatTransactionHash(tx.from)}
                      </a>
                      {' → '}
                      <a
                        href={getAddressUrl(tx.to, tx.chainId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-700"
                      >
                        {formatTransactionHash(tx.to)}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredTransactions.length > itemsPerPage && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={filteredTransactions.length < itemsPerPage}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}