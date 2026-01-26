import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useErrorRecovery } from '../useErrorRecovery';
import {
  recoverFromError,
  generateUserMessage,
  requestUserConsent,
  logRecoveryAttempt,
  classifyError,
  switchRpcEndpoint
} from '../../utils/errorRecovery';
import type { RPCEndpoint } from '../../types/network';

// Mock the error recovery utils
vi.mock('../../utils/errorRecovery', () => ({
  recoverFromError: vi.fn(),
  generateUserMessage: vi.fn(),
  requestUserConsent: vi.fn(),
  logRecoveryAttempt: vi.fn(),
  classifyError: vi.fn(),
  switchRpcEndpoint: vi.fn()
}));

// Mock window.open for actions that open URLs
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', { value: mockWindowOpen, writable: true });

describe('useErrorRecovery', () => {
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

    mockEndpoints = [mockEndpoint];

    // Default mock implementations
    vi.mocked(classifyError).mockReturnValue('network');
    vi.mocked(generateUserMessage).mockReturnValue({
      title: 'Test Error',
      message: 'Test error message',
      severity: 'error',
      actions: [
        { type: 'retry', description: 'Retry', automatic: true, requiresConsent: false },
        { type: 'switch_rpc', description: 'Switch RPC', automatic: false, requiresConsent: false }
      ]
    });
    vi.mocked(recoverFromError).mockResolvedValue({
      recovered: false,
      message: {
        title: 'Test Error',
        message: 'Test error message',
        severity: 'error',
        actions: []
      },
      attempts: []
    });
    vi.mocked(requestUserConsent).mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return null message when no error provided', () => {
      const { result } = renderHook(() => useErrorRecovery({ error: null }));

      expect(result.current.error).toBeNull();
      expect(result.current.message).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.success).toBe(false);
      expect(result.current.attempts).toEqual([]);
    });

    it('should initialize with error and generate message', () => {
      const testError = new Error('Test error');

      const { result } = renderHook(() => useErrorRecovery({ error: testError, autoRecover: false }));

      expect(result.current.error).toBe(testError);
      expect(result.current.message).not.toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.success).toBe(false);
      expect(result.current.attempts).toEqual([]);
    });

    it('should attempt automatic recovery when autoRecover is true', async () => {
      const testError = new Error('Test error');
      vi.mocked(recoverFromError).mockResolvedValue({
        recovered: true,
        message: {
          title: 'Recovered',
          message: 'Recovery successful',
          severity: 'info',
          actions: []
        },
        attempts: [{
          timestamp: new Date(),
          error: testError,
          category: 'network',
          action: { type: 'retry', description: 'Retry', automatic: true, requiresConsent: false },
          success: true
        }]
      });

      const mockOnRecovered = vi.fn();

      const { result } = renderHook(() =>
        useErrorRecovery({
          error: testError,
          autoRecover: true,
          onRecovered: mockOnRecovered
        })
      );

      // Wait for automatic recovery to complete
      await waitFor(() => {
        expect(result.current.success).toBe(true);
      });

      expect(mockOnRecovered).toHaveBeenCalled();
      expect(recoverFromError).toHaveBeenCalledWith(testError, undefined, []);
    });

    it('should not attempt automatic recovery when autoRecover is false', () => {
      const testError = new Error('Test error');

      renderHook(() =>
        useErrorRecovery({
          error: testError,
          autoRecover: false
        })
      );

      expect(recoverFromError).not.toHaveBeenCalled();
    });
  });

  describe('error changes', () => {
    it('should reset state when error changes', () => {
      const { result, rerender } = renderHook(
        ({ error }) => useErrorRecovery({ error, autoRecover: false }),
        { initialProps: { error: new Error('First error') } }
      );

      // Simulate success state
      act(() => {
        result.current.reset();
      });

      // Change error
      rerender({ error: new Error('Second error') });

      expect(result.current.error?.message).toBe('Second error');
      expect(result.current.message).not.toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.success).toBe(false);
      expect(result.current.attempts).toEqual([]);
    });

    it('should reset state when error becomes null', () => {
      const { result, rerender } = renderHook(
        ({ error }) => useErrorRecovery({ error }),
        { initialProps: { error: new Error('Test error') as Error | null } }
      );

      rerender({ error: null });

      expect(result.current.error).toBeNull();
      expect(result.current.message).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.success).toBe(false);
      expect(result.current.attempts).toEqual([]);
    });
  });

  describe('triggerAction', () => {
    it('should execute retry action', async () => {
      const testError = new Error('Test error');
      const mockOnRetry = vi.fn();

      const { result } = renderHook(() =>
        useErrorRecovery({
          error: testError,
          autoRecover: false,
          onRetry: mockOnRetry
        })
      );

      const retryAction = result.current.message!.actions.find(a => a.type === 'retry')!;

      await act(async () => {
        await result.current.triggerAction(retryAction);
      });

      expect(mockOnRetry).toHaveBeenCalled();
      expect(result.current.success).toBe(true);
      expect(result.current.attempts).toHaveLength(1);
      expect(result.current.attempts[0].success).toBe(true);
    });

    it('should execute switch RPC action', async () => {
      const testError = new Error('Test error');
      const mockOnSwitchRpc = vi.fn();
      const newEndpoint = { ...mockEndpoint, url: 'https://new.rpc' };

      vi.mocked(switchRpcEndpoint).mockReturnValue(newEndpoint);

      const { result } = renderHook(() =>
        useErrorRecovery({
          error: testError,
          availableEndpoints: mockEndpoints,
          onSwitchRpc: mockOnSwitchRpc
        })
      );

      const switchAction = result.current.message!.actions.find(a => a.type === 'switch_rpc')!;

      await act(async () => {
        await result.current.triggerAction(switchAction);
      });

      expect(switchRpcEndpoint).toHaveBeenCalledWith(mockEndpoint, mockEndpoints);
      expect(mockOnSwitchRpc).toHaveBeenCalledWith(newEndpoint);
      expect(result.current.success).toBe(true);
    });

    it('should handle switch RPC when no alternative endpoint available', async () => {
      const testError = new Error('Test error');

      vi.mocked(switchRpcEndpoint).mockReturnValue(null);

      const { result } = renderHook(() =>
        useErrorRecovery({
          error: testError,
          autoRecover: false,
          availableEndpoints: [mockEndpoint]
        })
      );

      const switchAction = result.current.message!.actions.find(a => a.type === 'switch_rpc')!;

      await act(async () => {
        await result.current.triggerAction(switchAction);
      });

      expect(result.current.attempts).toHaveLength(1);
      expect(result.current.attempts[0].details).toBe('No alternative endpoint available');
      expect(result.current.success).toBe(false);
    });

    it('should execute install wallet action', async () => {
      const testError = new Error('Wallet error');

      vi.mocked(classifyError).mockReturnValue('wallet');
      vi.mocked(generateUserMessage).mockReturnValue({
        title: 'Wallet Error',
        message: 'Wallet issue',
        severity: 'error',
        actions: [{
          type: 'install_wallet',
          description: 'Install wallet',
          automatic: false,
          requiresConsent: false,
          actionUrl: 'https://metamask.io'
        }]
      });

      const { result } = renderHook(() => useErrorRecovery({ error: testError }));

      const installAction = result.current.message!.actions[0];

      await act(async () => {
        await result.current.triggerAction(installAction);
      });

      expect(mockWindowOpen).toHaveBeenCalledWith('https://metamask.io', '_blank');
      expect(result.current.success).toBe(true);
      expect(result.current.attempts[0].details).toBe('Opened wallet installation page');
    });

    it('should execute update browser action', async () => {
      const testError = new Error('Browser error');

      vi.mocked(classifyError).mockReturnValue('browser');
      vi.mocked(generateUserMessage).mockReturnValue({
        title: 'Browser Error',
        message: 'Browser issue',
        severity: 'error',
        actions: [{
          type: 'update_browser',
          description: 'Update browser',
          automatic: false,
          requiresConsent: false,
          actionUrl: 'https://chrome.com'
        }]
      });

      const { result } = renderHook(() => useErrorRecovery({ error: testError }));

      const updateAction = result.current.message!.actions[0];

      await act(async () => {
        await result.current.triggerAction(updateAction);
      });

      expect(mockWindowOpen).toHaveBeenCalledWith('https://chrome.com', '_blank');
      expect(result.current.success).toBe(true);
      expect(result.current.attempts[0].details).toBe('Opened browser update page');
    });

    it('should execute manual action', async () => {
      const testError = new Error('Manual error');

      vi.mocked(generateUserMessage).mockReturnValue({
        title: 'Manual Error',
        message: 'Manual issue',
        severity: 'error',
        actions: [{
          type: 'manual_action',
          description: 'Manual action',
          automatic: false,
          requiresConsent: false
        }]
      });

      const { result } = renderHook(() => useErrorRecovery({ error: testError }));

      const manualAction = result.current.message!.actions[0];

      await act(async () => {
        await result.current.triggerAction(manualAction);
      });

      expect(result.current.success).toBe(true);
      expect(result.current.attempts[0].details).toBe('User guidance provided');
    });

    it('should request consent for actions that require it', async () => {
      const testError = new Error('Consent error');

      vi.mocked(generateUserMessage).mockReturnValue({
        title: 'Consent Error',
        message: 'Consent issue',
        severity: 'error',
        actions: [{
          type: 'retry',
          description: 'Retry with consent',
          automatic: false,
          requiresConsent: true
        }]
      });

      const { result } = renderHook(() => useErrorRecovery({ error: testError }));

      const consentAction = result.current.message!.actions[0];

      await act(async () => {
        await result.current.triggerAction(consentAction);
      });

      expect(requestUserConsent).toHaveBeenCalledWith({
        action: consentAction,
        reason: `Attempting to recover from error: Consent Error`,
        timeout: 5000
      });
    });

    it('should not execute action if consent is denied', async () => {
      const testError = new Error('Consent error');
      const mockOnRetry = vi.fn();

      vi.mocked(requestUserConsent).mockResolvedValue(false);
      vi.mocked(generateUserMessage).mockReturnValue({
        title: 'Consent Error',
        message: 'Consent issue',
        severity: 'error',
        actions: [{
          type: 'retry',
          description: 'Retry with consent',
          automatic: false,
          requiresConsent: true
        }]
      });

      const { result } = renderHook(() =>
        useErrorRecovery({
          error: testError,
          autoRecover: false,
          onRetry: mockOnRetry
        })
      );

      const consentAction = result.current.message!.actions[0];

      await act(async () => {
        await result.current.triggerAction(consentAction);
      });

      expect(mockOnRetry).not.toHaveBeenCalled();
      expect(result.current.attempts).toHaveLength(0);
    });

    it('should handle action errors gracefully', async () => {
      const testError = new Error('Test error');
      const mockOnRetry = vi.fn().mockImplementation(() => {
        throw new Error('Action failed');
      });

      const { result } = renderHook(() =>
        useErrorRecovery({
          error: testError,
          onRetry: mockOnRetry
        })
      );

      const retryAction = result.current.message!.actions.find(a => a.type === 'retry')!;

      await act(async () => {
        await result.current.triggerAction(retryAction);
      });

      expect(result.current.attempts[0].details).toBe('Action failed: Action failed');
      expect(result.current.success).toBe(false);
    });
  });

  describe('convenience methods', () => {
    it('should retry using convenience method', async () => {
      const testError = new Error('Test error');
      const mockOnRetry = vi.fn();

      const { result } = renderHook(() =>
        useErrorRecovery({
          error: testError,
          onRetry: mockOnRetry
        })
      );

      await act(async () => {
        await result.current.retry();
      });

      expect(mockOnRetry).toHaveBeenCalled();
    });

    it('should switch RPC using convenience method', async () => {
      const testError = new Error('Test error');
      const mockOnSwitchRpc = vi.fn();
      const newEndpoint = { ...mockEndpoint, url: 'https://new.rpc' };

      vi.mocked(switchRpcEndpoint).mockReturnValue(newEndpoint);

      const { result } = renderHook(() =>
        useErrorRecovery({
          error: testError,
          availableEndpoints: mockEndpoints,
          onSwitchRpc: mockOnSwitchRpc
        })
      );

      await act(async () => {
        await result.current.switchRpc();
      });

      expect(mockOnSwitchRpc).toHaveBeenCalledWith(newEndpoint);
    });

    it('should do nothing when retry action not available', async () => {
      const testError = new Error('Test error');

      vi.mocked(generateUserMessage).mockReturnValue({
        title: 'No Retry',
        message: 'No retry available',
        severity: 'error',
        actions: []
      });

      const { result } = renderHook(() => useErrorRecovery({ error: testError }));

      await act(async () => {
        await result.current.retry();
      });

      // Should not crash
      expect(result.current.attempts).toHaveLength(0);
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      const { result } = renderHook(() => useErrorRecovery({ error: new Error('Test') }));

      // Simulate some state changes
      act(() => {
        // Manually set state for testing
        result.current.reset();
      });

      expect(result.current.message).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.success).toBe(false);
      expect(result.current.attempts).toEqual([]);
    });
  });

  describe('loading states', () => {
    it('should set loading during automatic recovery', async () => {
      const testError = new Error('Test error');

      vi.mocked(recoverFromError).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          recovered: true,
          message: {
            title: 'Recovered',
            message: 'Success',
            severity: 'info',
            actions: []
          },
          attempts: []
        }), 100))
      );

      const { result } = renderHook(() =>
        useErrorRecovery({
          error: testError,
          autoRecover: true
        })
      );

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set loading during manual action execution', async () => {
      const testError = new Error('Test error');

      const { result } = renderHook(() => useErrorRecovery({ error: testError }));

      const retryAction = result.current.message!.actions.find(a => a.type === 'retry')!;

      act(() => {
        result.current.triggerAction(retryAction);
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
});