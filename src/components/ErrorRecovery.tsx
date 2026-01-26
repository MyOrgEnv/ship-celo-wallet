import { useState, useEffect } from 'react';
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

interface ErrorRecoveryProps {
  /** The error that occurred */
  error: Error;
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

/**
 * ErrorRecovery component provides a user interface for error recovery.
 *
 * Displays user-friendly error messages with actionable recovery options.
 * Handles automatic recovery attempts and user-initiated actions.
 *
 * @param props - Component props
 * @returns JSX element for error recovery UI
 */
export function ErrorRecovery({
  error,
  context,
  availableEndpoints = [],
  onRetry,
  onSwitchRpc,
  onRecovered,
  autoRecover = true
}: ErrorRecoveryProps) {
  const [message, setMessage] = useState<UserMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [attempts, setAttempts] = useState<RecoveryAttempt[]>([]);

  useEffect(() => {
    // Reset state when error changes
    setMessage(null);
    setLoading(false);
    setSuccess(false);
    setAttempts([]);

    // Generate user message
    const userMessage = generateUserMessage(error, classifyError(error, context));
    setMessage(userMessage);

    // Attempt automatic recovery
    if (autoRecover && userMessage?.actions?.some(action => action.automatic)) {
      handleAutomaticRecovery(userMessage);
    }
  }, [error, context]);

  const handleAutomaticRecovery = async (userMessage: UserMessage) => {
    setLoading(true);
    try {
      const result = await recoverFromError(error, context, availableEndpoints);
      setAttempts(result.attempts);
      if (result.recovered) {
        setSuccess(true);
        onRecovered?.();
      }
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = async (action: RecoveryAction) => {
    if (action.requiresConsent) {
      const consent = await requestUserConsent({
        action,
        reason: `Attempting to recover from error: ${message?.title}`,
        timeout: 5000
      });
      if (!consent) return;
    }

    setLoading(true);
    const attempt: RecoveryAttempt = {
      timestamp: new Date(),
      error,
      category: classifyError(error, context),
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
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  if (!message) {
    return null;
  }

  return (
    <div className="wallet-card">
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h3 style={{ color: getSeverityColor(message.severity), marginBottom: '0.5rem' }}>
          {message.title}
        </h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          {message.message}
        </p>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          Attempting recovery...
        </div>
      )}

      {success && (
        <div style={{
          padding: '1rem',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '0.5rem',
          textAlign: 'center',
          color: '#22c55e',
          marginBottom: '1rem'
        }}>
          ✓ Recovery successful!
        </div>
      )}

      {!loading && !success && message.actions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {message.actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              {action.description}
            </button>
          ))}
        </div>
      )}

      {attempts.length > 0 && (
        <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
          <details>
            <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
              Recovery Attempts ({attempts.length})
            </summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {attempts.map((attempt, index) => (
                <div key={index} style={{ padding: '0.25rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.25rem' }}>
                  {attempt.timestamp.toLocaleTimeString()}: {attempt.action.description} - {attempt.success ? '✓' : '✗'}
                  {attempt.details && <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{attempt.details}</div>}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}