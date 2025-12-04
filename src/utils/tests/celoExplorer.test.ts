import { describe, it, expect } from 'vitest';
import {
  getExplorerUrl,
  getExplorerApiUrl,
  getTransactionUrl,
  getAddressUrl,
  formatTransactionHash,
  formatRelativeTime,
  formatTimestamp,
  formatValue,
  getTransactionStatus,
  getTransactionType
} from '../celoExplorer';

describe('Celo Explorer Utils', () => {
  describe('getExplorerUrl', () => {
    it('should return correct explorer URL for Celo mainnet', () => {
      const url = getExplorerUrl(42220);
      expect(url).toBe('https://explorer.celo.org');
    });

    it('should return correct explorer URL for Alfajores testnet', () => {
      const url = getExplorerUrl(44787);
      expect(url).toBe('https://alfajores.celoscan.io');
    });

    it('should return Alfajores as fallback for unknown chain ID', () => {
      const url = getExplorerUrl(99999);
      expect(url).toBe('https://alfajores.celoscan.io');
    });
  });

  describe('getExplorerApiUrl', () => {
    it('should return correct API URL for Celo mainnet', () => {
      const url = getExplorerApiUrl(42220);
      expect(url).toBe('https://explorer.celo.org/api');
    });

    it('should return correct API URL for Alfajores testnet', () => {
      const url = getExplorerApiUrl(44787);
      expect(url).toBe('https://api-alfajores.celoscan.io/api');
    });

    it('should return Alfajores API as fallback for unknown chain ID', () => {
      const url = getExplorerApiUrl(99999);
      expect(url).toBe('https://api-alfajores.celoscan.io/api');
    });
  });

  describe('getTransactionUrl', () => {
    it('should generate correct transaction URL for Celo mainnet', () => {
      const url = getTransactionUrl('0x1234567890abcdef', 42220);
      expect(url).toBe('https://explorer.celo.org/tx/0x1234567890abcdef');
    });

    it('should generate correct transaction URL for Alfajores testnet', () => {
      const url = getTransactionUrl('0x1234567890abcdef', 44787);
      expect(url).toBe('https://alfajores.celoscan.io/tx/0x1234567890abcdef');
    });
  });

  describe('getAddressUrl', () => {
    it('should generate correct address URL for Celo mainnet', () => {
      const url = getAddressUrl('0x1234567890123456789012345678901234567890', 42220);
      expect(url).toBe('https://explorer.celo.org/address/0x1234567890123456789012345678901234567890');
    });

    it('should generate correct address URL for Alfajores testnet', () => {
      const url = getAddressUrl('0x1234567890123456789012345678901234567890', 44787);
      expect(url).toBe('https://alfajores.celoscan.io/address/0x1234567890123456789012345678901234567890');
    });
  });

  describe('formatTransactionHash', () => {
    it('should format long hash correctly', () => {
      const hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const formatted = formatTransactionHash(hash);
      expect(formatted).toBe('0x1234...cdef');
    });

    it('should handle short hash without formatting', () => {
      const hash = '0x123456';
      const formatted = formatTransactionHash(hash);
      expect(formatted).toBe('0x123456');
    });

    it('should handle empty hash', () => {
      const hash = '';
      const formatted = formatTransactionHash(hash);
      expect(formatted).toBe('');
    });

    it('should handle null/undefined hash', () => {
      const formatted = formatTransactionHash(null as any);
      expect(formatted).toBe(null);
    });
  });

  describe('formatRelativeTime', () => {
    it('should format seconds ago correctly', () => {
      const timestamp = Math.floor(Date.now() / 1000) - 30; // 30 seconds ago
      const formatted = formatRelativeTime(timestamp);
      expect(formatted).toBe('Just now');
    });

    it('should format minutes ago correctly', () => {
      const timestamp = Math.floor(Date.now() / 1000) - 300; // 5 minutes ago
      const formatted = formatRelativeTime(timestamp);
      expect(formatted).toBe('5 minutes ago');
    });

    it('should format hours ago correctly', () => {
      const timestamp = Math.floor(Date.now() / 1000) - 7200; // 2 hours ago
      const formatted = formatRelativeTime(timestamp);
      expect(formatted).toBe('2 hours ago');
    });

    it('should format days ago correctly', () => {
      const timestamp = Math.floor(Date.now() / 1000) - 172800; // 2 days ago
      const formatted = formatRelativeTime(timestamp);
      expect(formatted).toBe('2 days ago');
    });

    it('should handle singular day/hour/minute correctly', () => {
      const timestamp = Math.floor(Date.now() / 1000) - 86400; // 1 day ago
      const formatted = formatRelativeTime(timestamp);
      expect(formatted).toBe('1 day ago');
    });
  });

  describe('formatTimestamp', () => {
    it('should format timestamp to local date string', () => {
      const timestamp = 1609459200; // January 1, 2021
      const formatted = formatTimestamp(timestamp);
      expect(formatted).toContain('2021');
    });
  });

  describe('formatValue', () => {
    it('should format wei to readable format', () => {
      const value = '1000000000000000000'; // 1 ETH
      const formatted = formatValue(value);
      expect(formatted).toBe('1');
    });

    it('should handle small values correctly', () => {
      const value = '500000000000000'; // 0.0005 ETH
      const formatted = formatValue(value);
      expect(formatted).toBe('< 0.001');
    });

    it('should handle zero value', () => {
      const value = '0';
      const formatted = formatValue(value);
      expect(formatted).toBe('0');
    });

    it('should handle large values with proper formatting', () => {
      const value = '123456789012345678901234567890'; // Large number
      const formatted = formatValue(value);
      expect(typeof formatted).toBe('string');
      expect(formatted).not.toBe('0');
    });

    it('should handle invalid values gracefully', () => {
      const value = 'invalid';
      const formatted = formatValue(value);
      expect(formatted).toBe('0');
    });

    it('should use custom decimals for non-ETH tokens', () => {
      const value = '1000000'; // 1 token with 6 decimals
      const formatted = formatValue(value, 6);
      expect(formatted).toBe('1');
    });
  });

  describe('getTransactionStatus', () => {
    it('should return failure for error transactions', () => {
      const status = getTransactionStatus('1', '1');
      expect(status).toBe('failure');
    });

    it('should return failure for failed receipts', () => {
      const status = getTransactionStatus('0', '0');
      expect(status).toBe('failure');
    });

    it('should return success for successful transactions', () => {
      const status = getTransactionStatus('0', '1');
      expect(status).toBe('success');
    });

    it('should return pending for unknown status', () => {
      const status = getTransactionStatus('0', '');
      expect(status).toBe('pending');
    });
  });

  describe('getTransactionType', () => {
    const connectedAddress = '0x1234567890123456789012345678901234567890';
    const otherAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef';

    it('should identify sent transactions correctly', () => {
      const type = getTransactionType(connectedAddress, otherAddress, connectedAddress);
      expect(type).toBe('sent');
    });

    it('should identify received transactions correctly', () => {
      const type = getTransactionType(otherAddress, connectedAddress, connectedAddress);
      expect(type).toBe('received');
    });

    it('should identify contract interactions correctly', () => {
      const type = getTransactionType(
        connectedAddress,
        '0x0000000000000000000000000000000000000000',
        connectedAddress,
        '0xcontractaddress',
        '0x'
      );
      expect(type).toBe('contract');
    });

    it('should identify contract creation correctly', () => {
      const type = getTransactionType(
        connectedAddress,
        '',
        connectedAddress,
        undefined,
        '0x'
      );
      expect(type).toBe('contract');
    });

    it('should identify contract interaction with input data', () => {
      const type = getTransactionType(
        connectedAddress,
        otherAddress,
        connectedAddress,
        undefined,
        '0x1234567890abcdef'
      );
      expect(type).toBe('contract');
    });

    it('should handle case-insensitive address comparison', () => {
      const uppercaseAddress = connectedAddress.toUpperCase();
      const type = getTransactionType(uppercaseAddress, otherAddress, connectedAddress);
      expect(type).toBe('sent');
    });
  });
});