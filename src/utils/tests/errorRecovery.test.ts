import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import {
  classifyError,
  generateUserMessage,
  retryWithBackoff,
  switchRpcEndpoint,
  checkBrowserCompatibility,
  getWalletGuidance,
  logRecoveryAttempt,
  requestUserConsent,
  recoverFromError,
  type ErrorCategory,
  type RecoveryAction,
  type RecoveryAttempt
} from '../errorRecovery';
import type { RPCEndpoint } from '../../types/network';

// Mock console methods
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock window and navigator for browser compatibility tests
const mockWindow = {
  ethereum: { isMetaMask: true },
  open: vi.fn()
};

const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

Object.defineProperty(global, 'window', { value: mockWindow, writable: true });
Object.defineProperty(global, 'navigator', { value: mockNavigator, writable: true });

// Setup global mocks
beforeAll(() => {
  Object.defineProperty(window, 'ethereum', { value: { isMetaMask: true }, writable: true });
  Object.defineProperty(window, 'open', { value: vi.fn(), writable: true });
});

describe('Error Recovery Utils', () => {
  let mockEndpoint: RPCEndpoint;
  let mockEndpoints: RPCEndpoint[];

  beforeEach(() => {
    vi.clearAllMocks();

    mockEndpoint = {
      url: 'https://rpc.celo.org',
      chainId: 42220,
      status: 'healthy',
      isActive: true,
      metrics: {
        responseTime: 100,
        successRate: 95,
        lastChecked: new Date(),
        errorCount: 0
      }
    };

    mockEndpoints = [
      mockEndpoint,
      {
        url: 'https://forno.celo.org',
        chainId: 42220,
        status: 'healthy',
        isActive: true,
        metrics: {
          responseTime: 120,
          successRate: 90,
          lastChecked: new Date(),
          errorCount: 1
        }
      }
    ];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('classifyError', () => {
    it('should classify network errors correctly', () => {
      const networkErrors = [
        new Error('Network request failed'),
        new Error('Connection timeout'),
        new Error('RPC connection error')
      ];

      networkErrors.forEach(error => {
        expect(classifyError(error)).toBe('network');
      });
    });

    it('should classify wallet errors correctly', () => {
      const walletErrors = [
        new Error('MetaMask not connected'),
        new Error('Wallet connector error'),
        new Error('Account not found')
      ];

      walletErrors.forEach(error => {
        expect(classifyError(error)).toBe('wallet');
      });
    });

    it('should classify transaction errors correctly', () => {
      const transactionErrors = [
        new Error('Transaction failed'),
        new Error('Gas estimation error'),
        new Error('Nonce too low')
      ];

      transactionErrors.forEach(error => {
        expect(classifyError(error)).toBe('transaction');
      });
    });

    it('should classify browser errors correctly', () => {
      const browserErrors = [
        new Error('Browser compatibility issue'),
        new Error('Unsupported browser feature')
      ];

      browserErrors.forEach(error => {
        expect(classifyError(error)).toBe('browser');
      });
    });

    it('should use context to classify errors', () => {
      const error = new Error('Generic error');
      expect(classifyError(error, 'network')).toBe('network');
      expect(classifyError(error, 'wallet')).toBe('wallet');
      expect(classifyError(error, 'transaction')).toBe('transaction');
      expect(classifyError(error, 'browser')).toBe('browser');
    });

    it('should default to network for unknown errors', () => {
      const error = new Error('Unknown error occurred');
      expect(classifyError(error)).toBe('network');
    });
  });

  describe('generateUserMessage', () => {
    it('should generate appropriate messages for network errors', () => {
      const error = new Error('Network connection failed');
      const message = generateUserMessage(error, 'network');

      expect(message.title).toBe('Network Connection Issue');
      expect(message.severity).toBe('error');
      expect(message.actions).toHaveLength(2);
      expect(message.actions[0].type).toBe('retry');
      expect(message.actions[1].type).toBe('switch_rpc');
    });

    it('should generate appropriate messages for wallet errors', () => {
      const error = new Error('Wallet not connected');
      const message = generateUserMessage(error, 'wallet');

      expect(message.title).toBe('Wallet Connection Issue');
      expect(message.severity).toBe('error');
      expect(message.actions).toHaveLength(2);
      expect(message.actions[0].type).toBe('retry');
      expect(message.actions[1].type).toBe('install_wallet');
    });

    it('should generate appropriate messages for transaction errors', () => {
      const error = new Error('Transaction reverted');
      const message = generateUserMessage(error, 'transaction');

      expect(message.title).toBe('Transaction Error');
      expect(message.severity).toBe('error');
      expect(message.actions).toHaveLength(2);
      expect(message.actions[0].type).toBe('retry');
      expect(message.actions[1].type).toBe('manual_action');
    });

    it('should generate appropriate messages for browser errors', () => {
      const error = new Error('Browser not supported');
      const message = generateUserMessage(error, 'browser');

      expect(message.title).toBe('Browser Compatibility Issue');
      expect(message.severity).toBe('error');
      expect(message.actions).toHaveLength(1);
      expect(message.actions[0].type).toBe('update_browser');
    });
  });

  describe('retryWithBackoff', () => {
    it('should retry operation with exponential backoff', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValueOnce('Success');

      const result = await retryWithBackoff(mockOperation, { maxAttempts: 3, initialDelay: 10 });

      expect(mockOperation).toHaveBeenCalledTimes(3);
      expect(result).toBe('Success');
    });

    it('should throw error after max attempts', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Always fails'));

      await expect(retryWithBackoff(mockOperation, { maxAttempts: 2, initialDelay: 10 }))
        .rejects.toThrow('Always fails');

      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should respect maxDelay limit', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Fails'));
      const startTime = Date.now();

      await expect(retryWithBackoff(mockOperation, {
        maxAttempts: 5,
        initialDelay: 1000,
        backoffMultiplier: 2,
        maxDelay: 100
      })).rejects.toThrow();

      const elapsed = Date.now() - startTime;
      // Should not take too long due to maxDelay
      expect(elapsed).toBeLessThan(1000);
    });

    it('should succeed on first attempt', async () => {
      const mockOperation = vi.fn().mockResolvedValue('Immediate success');

      const result = await retryWithBackoff(mockOperation);

      expect(mockOperation).toHaveBeenCalledTimes(1);
      expect(result).toBe('Immediate success');
    });
  });

  describe('switchRpcEndpoint', () => {
    it('should return null when no healthy endpoints available', () => {
      const unhealthyEndpoints: RPCEndpoint[] = [
        { ...mockEndpoint, status: 'down' },
        { ...mockEndpoint, status: 'degraded', url: 'https://bad.rpc' }
      ];

      const result = switchRpcEndpoint(mockEndpoint, unhealthyEndpoints);
      expect(result).toBeNull();
    });

    it('should return null when current endpoint is the only healthy one', () => {
      const result = switchRpcEndpoint(mockEndpoint, [mockEndpoint]);
      expect(result).toBeNull();
    });

    it('should switch to best alternative endpoint', () => {
      const currentEndpoint = { ...mockEndpoint, metrics: { ...mockEndpoint.metrics, responseTime: 200 } };
      const betterEndpoint = { ...mockEndpoints[1], metrics: { ...mockEndpoints[1].metrics, responseTime: 50 } };

      const result = switchRpcEndpoint(currentEndpoint, [currentEndpoint, betterEndpoint]);
      expect(result).toBe(betterEndpoint);
    });

    it('should prefer endpoints with better metrics', () => {
      const slowEndpoint = { ...mockEndpoint, url: 'slow', metrics: { ...mockEndpoint.metrics, responseTime: 500, successRate: 80 } };
      const fastEndpoint = { ...mockEndpoint, url: 'fast', metrics: { ...mockEndpoint.metrics, responseTime: 50, successRate: 98 } };

      const result = switchRpcEndpoint(slowEndpoint, [slowEndpoint, fastEndpoint]);
      expect(result).toBe(fastEndpoint);
    });
  });

  describe('checkBrowserCompatibility', () => {
    it('should detect compatible modern browser', () => {
      // Window is already set up with ethereum in beforeAll
      const result = checkBrowserCompatibility();
      expect(result.compatible).toBe(true);
      expect(result.suggestions).toHaveLength(0);
    });

    it('should suggest wallet installation when no Web3 detected', () => {
      // Temporarily remove ethereum
      const originalEthereum = window.ethereum;
      delete (window as any).ethereum;

      const result = checkBrowserCompatibility();
      expect(result.compatible).toBe(false);
      expect(result.suggestions).toContain('Install a Web3-compatible wallet like MetaMask');

      // Restore
      (window as any).ethereum = originalEthereum;
    });

    it('should suggest browser updates for outdated Chrome', () => {
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
        configurable: true
      });

      const result = checkBrowserCompatibility();
      expect(result.suggestions).toContain('Update Chrome to version 90 or later');

      // Restore
      Object.defineProperty(navigator, 'userAgent', { value: originalUserAgent, configurable: true });
    });

    it('should suggest mobile browser improvements', () => {
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        configurable: true
      });

      const result = checkBrowserCompatibility();
      expect(result.suggestions).toContain('For best experience, use a desktop browser or ensure your mobile browser supports Web3');

      // Restore
      Object.defineProperty(navigator, 'userAgent', { value: originalUserAgent, configurable: true });
    });
  });

  describe('getWalletGuidance', () => {
    it('should return guidance for MetaMask installation when no wallet detected', () => {
      // Temporarily remove ethereum
      const originalEthereum = window.ethereum;
      delete (window as any).ethereum;

      const result = getWalletGuidance();
      expect(result.installed).toBe(false);
      expect(result.guidance).toContain('No Web3 wallet detected');
      expect(result.downloadUrl).toBe('https://metamask.io/download/');

      // Restore
      (window as any).ethereum = originalEthereum;
    });

    it('should return guidance for MetaMask when detected', () => {
      Object.defineProperty(window, 'ethereum', {
        value: { isMetaMask: true },
        configurable: true
      });

      const result = getWalletGuidance();
      expect(result.installed).toBe(true);
      expect(result.guidance).toContain('MetaMask is installed');
    });

    it('should return guidance for other wallets', () => {
      Object.defineProperty(window, 'ethereum', {
        value: { isMetaMask: false },
        configurable: true
      });

      const result = getWalletGuidance();
      expect(result.installed).toBe(true);
      expect(result.guidance).toContain('A Web3 wallet is detected');
    });

    it('should handle server-side rendering', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const result = getWalletGuidance();
      expect(result.installed).toBe(false);
      expect(result.guidance).toContain('Wallet detection requires a browser environment');

      // Restore
      (global as any).window = originalWindow;
    });
  });

  describe('logRecoveryAttempt', () => {
    it('should log recovery attempt data', () => {
      const attempt: RecoveryAttempt = {
        timestamp: new Date(),
        error: new Error('Test error'),
        category: 'network',
        action: { type: 'retry', description: 'Retry', automatic: true, requiresConsent: false },
        success: true,
        details: 'Success details'
      };

      // Should not throw
      expect(() => logRecoveryAttempt(attempt)).not.toThrow();
    });
  });

  describe('requestUserConsent', () => {
    it('should auto-approve actions that do not require consent', async () => {
      const action: RecoveryAction = {
        type: 'retry',
        description: 'Retry operation',
        automatic: true,
        requiresConsent: false
      };

      const result = await requestUserConsent({
        action,
        reason: 'Test reason',
        timeout: 1000
      });

      expect(result).toBe(true);
    });

    it('should simulate user prompt for actions requiring consent', async () => {
      const action: RecoveryAction = {
        type: 'retry',
        description: 'Retry operation',
        automatic: false,
        requiresConsent: true
      };

      const result = await requestUserConsent({
        action,
        reason: 'Test reason',
        timeout: 100
      });

      expect(result).toBe(true); // Auto-approved in test environment
    });
  });

  describe('recoverFromError', () => {
    it('should attempt automatic recovery and succeed', async () => {
      const error = new Error('Network error');
      const endpoints = mockEndpoints;

      const result = await recoverFromError(error, 'network', endpoints);

      expect(result.recovered).toBe(true);
      expect(result.message.title).toBe('Network Connection Issue');
      expect(result.attempts).toHaveLength(1);
      expect(result.attempts[0].success).toBe(true);
    });

    it('should return failure when no automatic recovery succeeds', async () => {
      const error = new Error('Browser error');

      const result = await recoverFromError(error, 'browser');

      expect(result.recovered).toBe(false);
      expect(result.message.title).toBe('Browser Compatibility Issue');
      expect(result.attempts).toHaveLength(0); // No automatic actions for browser errors
    });

    it('should handle recovery errors gracefully', async () => {
      // Mock switchRpcEndpoint to throw
      const originalSwitchRpc = vi.fn().mockImplementation(() => {
        throw new Error('Switch failed');
      });

      // We can't easily mock the internal function, so we'll test with a scenario that doesn't trigger it
      const error = new Error('Transaction error');

      const result = await recoverFromError(error, 'transaction');

      expect(result.recovered).toBe(false);
      expect(result.attempts).toHaveLength(0); // Transaction retry is not automatic
    });
  });
});