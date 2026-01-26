import { useState, useEffect, useCallback } from 'react';
import {
  recoverFromError,
  generateUserMessage,
  requestUserConsent,
  logRecoveryAttempt,
  classifyError,
  switchRpcEndpoint,
  type UserMessage,
  type RecoveryAction,
  type RecoveryAttempt,
  type ErrorCategory
} from '../utils/errorRecovery';
import type { RPCEndpoint } from '../types/network';

interface UseErrorRecoveryOptions {
  /** The error that occurred */
  error: Error | null;
  /** Optional context about where the error occurred */
  context?: string;
  /** Available RPC endpoints for switching */
  availableEndpoints?: RPCEndpoint[];
  /** Callback when user initiates a retry */
  onRetry?: () => void;
  /** Callback when RPC endpoint is switched */
  onSwitchRpc?: (endpoint: RPCEndpoint) => void;
  /** Callback when recovery is successful */
  onRecovered?: () => void;
  /** Whether to attempt automatic recovery */
  autoRecover?: boolean;
}

interface UseErrorRecoveryReturn {
  /** Current error state */
  error: Error | null;
  /** User-friendly message with recovery options */
  message: UserMessage | null;
  /** Whether recovery is in progress */
  loading: boolean;
  /** Whether recovery was successful */
  success: boolean;
  /** List of recovery attempts */
  attempts: RecoveryAttempt[];
  /** Function to manually trigger a recovery action */
  triggerAction: (action: RecoveryAction) => Promise<void>;
  /** Function to retry the operation */
  retry: () => Promise<void>;
  /** Function to switch RPC endpoint */
  switchRpc: () => Promise<void>;
  /** Function to reset the recovery state */
  reset: () => void;
}

/**
 * Custom hook for managing error recovery state and actions.
 *
 * Provides functions to trigger recovery actions, manages loading states and recovery progress,
 * integrates with errorRecovery utils, and handles user consent for automatic recoveries.
 *
 * @param options - Configuration options for error recovery
 * @returns Object containing error state, recovery options, and action handlers
 *
 * @example
 * ```tsx
 * const {
 *   error,
 *   message,
 *   loading,
 *   success,
 *   attempts,
 *   triggerAction,
 *   retry,
 *   switchRpc,
 *   reset
 * } = useErrorRecovery({
 *   error: someError,
 *   availableEndpoints: endpoints,
 *   onRetry: () => refetch(),
 *   onSwitchRpc: (endpoint) => setCurrentEndpoint(endpoint),
 *   onRecovered: () => setError(null)
 * });
 * ```
 */
export function useErrorRecovery(options: UseErrorRecoveryOptions): UseErrorRecoveryReturn {
  const {
    error,
    context,
    availableEndpoints = [],
    onRetry,
    onSwitchRpc,
    onRecovered,
    autoRecover = true
  } = options;

  const [message, setMessage] = useState<UserMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [attempts, setAttempts] = useState<RecoveryAttempt[]>([]);

  // Reset state when error changes
  useEffect(() => {
    if (!error) {
      reset();
      return;
    }

    setMessage(null);
    setLoading(false);
    setSuccess(false);
    setAttempts([]);

    // Generate user message
    const category = classifyError(error, context);
    const userMessage = generateUserMessage(error, category);
    setMessage(userMessage);

    // Attempt automatic recovery if enabled
    if (autoRecover && userMessage.actions.some(action => action.automatic)) {
      handleAutomaticRecovery(userMessage);
    }
  }, [error, context, autoRecover]);

  const handleAutomaticRecovery = useCallback(async (userMessage: UserMessage) => {
    setLoading(true);
    try {
      const result = await recoverFromError(error!, context, availableEndpoints);
      setAttempts(result.attempts);
      if (result.recovered) {
        setSuccess(true);
        onRecovered?.();
      }
    } catch (recoveryError) {
      console.error('Automatic recovery failed:', recoveryError);
    } finally {
      setLoading(false);
    }
  }, [error, context, availableEndpoints, onRecovered]);

  const triggerAction = useCallback(async (action: RecoveryAction) => {
    if (!error || !message) return;

    // Request consent if required
    if (action.requiresConsent) {
      const consent = await requestUserConsent({
        action,
        reason: `Attempting to recover from error: ${message.title}`,
        timeout: 5000
      });
      if (!consent) return;
    }

    setLoading(true);
    const category = classifyError(error, context);
    const attempt: RecoveryAttempt = {
      timestamp: new Date(),
      error,
      category,
      action,
      success: false
    };

    try {
      switch (action.type) {
        case 'retry':
          onRetry?.();
          attempt.success = true;
          break;
        case 'switch_rpc':
          if (availableEndpoints.length > 0) {
            const newEndpoint = switchRpcEndpoint(availableEndpoints[0], availableEndpoints);
            if (newEndpoint) {
              onSwitchRpc?.(newEndpoint);
              attempt.success = true;
              attempt.details = `Switched to ${newEndpoint.url}`;
            } else {
              attempt.details = 'No alternative endpoint available';
            }
          }
          break;
        case 'install_wallet':
          if (action.actionUrl) {
            window.open(action.actionUrl, '_blank');
          }
          attempt.success = true;
          attempt.details = 'Opened wallet installation page';
          break;
        case 'update_browser':
          if (action.actionUrl) {
            window.open(action.actionUrl, '_blank');
          }
          attempt.success = true;
          attempt.details = 'Opened browser update page';
          break;
        case 'manual_action':
          attempt.success = true;
          attempt.details = 'User guidance provided';
          break;
      }

      if (attempt.success) {
        setSuccess(true);
        onRecovered?.();
      }
    } catch (actionError) {
      attempt.details = `Action failed: ${(actionError as Error).message}`;
    } finally {
      setAttempts(prev => [...prev, attempt]);
      logRecoveryAttempt(attempt);
      setLoading(false);
    }
  }, [error, message, context, availableEndpoints, onRetry, onSwitchRpc, onRecovered]);

  const retry = useCallback(async () => {
    if (!message) return;
    const retryAction = message.actions.find(action => action.type === 'retry');
    if (retryAction) {
      await triggerAction(retryAction);
    }
  }, [message, triggerAction]);

  const switchRpc = useCallback(async () => {
    if (!message) return;
    const switchAction = message.actions.find(action => action.type === 'switch_rpc');
    if (switchAction) {
      await triggerAction(switchAction);
    }
  }, [message, triggerAction]);

  const reset = useCallback(() => {
    setMessage(null);
    setLoading(false);
    setSuccess(false);
    setAttempts([]);
  }, []);

  return {
    error,
    message,
    loading,
    success,
    attempts,
    triggerAction,
    retry,
    switchRpc,
    reset
  };
}