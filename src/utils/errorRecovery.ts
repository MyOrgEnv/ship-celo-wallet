import { createPublicClient, http, type PublicClient } from 'viem';
import { celo, celoAlfajores, celoBaklava } from 'viem/chains';
import type { RPCEndpoint } from '../types/network';

export type ErrorCategory = 'network' | 'wallet' | 'transaction' | 'browser';

export interface RecoveryAction {
  type: 'retry' | 'switch_rpc' | 'install_wallet' | 'update_browser' | 'manual_action';
  description: string;
  automatic: boolean;
  requiresConsent: boolean;
  actionUrl?: string;
}

export interface UserMessage {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  actions: RecoveryAction[];
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number; // in milliseconds
  backoffMultiplier: number;
  maxDelay: number;
}

export interface RecoveryAttempt {
  timestamp: Date;
  error: Error;
  category: ErrorCategory;
  action: RecoveryAction;
  success: boolean;
  details?: string;
}

export interface ConsentRequest {
  action: RecoveryAction;
  reason: string;
  timeout: number; // in milliseconds
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 30000
};

const chainMap = {
  42220: celo,
  44787: celoAlfajores,
  62320: celoBaklava
} as const;

/**
 * Classifies an error into predefined categories based on error message and context.
 */
export function classifyError(error: Error, context?: string): ErrorCategory {
  const message = error.message.toLowerCase();
  const ctx = context?.toLowerCase() || '';

  if (message.includes('network') || message.includes('rpc') || message.includes('connection') ||
      message.includes('timeout') || ctx.includes('network')) {
    return 'network';
  }

  if (message.includes('wallet') || message.includes('metamask') || message.includes('connector') ||
      message.includes('account') || ctx.includes('wallet')) {
    return 'wallet';
  }

  if (message.includes('transaction') || message.includes('tx') || message.includes('gas') ||
      message.includes('nonce') || ctx.includes('transaction')) {
    return 'transaction';
  }

  if (message.includes('browser') || message.includes('compatibility') || message.includes('unsupported') ||
      ctx.includes('browser')) {
    return 'browser';
  }

  // Default to network for unknown errors
  return 'network';
}

/**
 * Implements exponential backoff retry logic.
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const cfg = { ...defaultRetryConfig, ...config };
  let lastError: Error;

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === cfg.maxAttempts) {
        break;
      }

      const delay = Math.min(cfg.initialDelay * Math.pow(cfg.backoffMultiplier, attempt - 1), cfg.maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Generates user-friendly error messages with actionable solutions.
 */
export function generateUserMessage(error: Error, category: ErrorCategory): UserMessage {
  const baseMessage: UserMessage = {
    title: 'An error occurred',
    message: error.message,
    severity: 'error',
    actions: []
  };

  switch (category) {
    case 'network':
      return {
        ...baseMessage,
        title: 'Network Connection Issue',
        message: 'Unable to connect to the Celo network. This might be due to network congestion or RPC endpoint issues.',
        actions: [
          {
            type: 'retry',
            description: 'Retry the operation',
            automatic: true,
            requiresConsent: false
          },
          {
            type: 'switch_rpc',
            description: 'Try a different RPC endpoint',
            automatic: true,
            requiresConsent: false
          }
        ]
      };

    case 'wallet':
      return {
        ...baseMessage,
        title: 'Wallet Connection Issue',
        message: 'There was a problem with your wallet connection.',
        actions: [
          {
            type: 'retry',
            description: 'Retry wallet connection',
            automatic: true,
            requiresConsent: false
          },
          {
            type: 'install_wallet',
            description: 'Install or connect a wallet',
            automatic: false,
            requiresConsent: false,
            actionUrl: 'https://metamask.io/download/'
          }
        ]
      };

    case 'transaction':
      return {
        ...baseMessage,
        title: 'Transaction Error',
        message: 'Your transaction could not be processed.',
        actions: [
          {
            type: 'retry',
            description: 'Retry the transaction',
            automatic: false,
            requiresConsent: true
          },
          {
            type: 'manual_action',
            description: 'Check transaction details and try again',
            automatic: false,
            requiresConsent: false
          }
        ]
      };

    case 'browser':
      return {
        ...baseMessage,
        title: 'Browser Compatibility Issue',
        message: 'Your browser may not fully support all features.',
        actions: [
          {
            type: 'update_browser',
            description: 'Update your browser or try a different one',
            automatic: false,
            requiresConsent: false,
            actionUrl: 'https://www.google.com/chrome/'
          }
        ]
      };

    default:
      return baseMessage;
  }
}

/**
 * Switches to an alternative RPC endpoint if available.
 */
export function switchRpcEndpoint(currentEndpoint: RPCEndpoint, availableEndpoints: RPCEndpoint[]): RPCEndpoint | null {
  const healthyEndpoints = availableEndpoints.filter(ep => ep.status === 'healthy' && ep.isActive && ep.url !== currentEndpoint.url);

  if (healthyEndpoints.length === 0) {
    return null;
  }

  // Prefer endpoints with better metrics
  const sorted = healthyEndpoints.sort((a, b) => {
    const aScore = a.metrics.responseTime + (100 - a.metrics.successRate);
    const bScore = b.metrics.responseTime + (100 - b.metrics.successRate);
    return aScore - bScore;
  });

  return sorted[0];
}

/**
 * Checks browser compatibility and provides suggestions.
 */
export function checkBrowserCompatibility(): { compatible: boolean; suggestions: string[] } {
  const userAgent = navigator.userAgent;
  const suggestions: string[] = [];

  // Check for basic Web3 support
  const hasEthereum = typeof window !== 'undefined' && 'ethereum' in window;
  const hasWeb3 = typeof window !== 'undefined' && 'web3' in window;

  if (!hasEthereum && !hasWeb3) {
    suggestions.push('Install a Web3-compatible wallet like MetaMask');
  }

  // Check browser type
  if (userAgent.includes('Chrome') && parseInt(userAgent.match(/Chrome\/(\d+)/)?.[1] || '0') < 90) {
    suggestions.push('Update Chrome to version 90 or later');
  } else if (userAgent.includes('Firefox') && parseInt(userAgent.match(/Firefox\/(\d+)/)?.[1] || '0') < 88) {
    suggestions.push('Update Firefox to version 88 or later');
  } else if (userAgent.includes('Safari') && parseInt(userAgent.match(/Version\/(\d+)/)?.[1] || '0') < 14) {
    suggestions.push('Update Safari to version 14 or later');
  }

  // Check for mobile browsers that might have issues
  if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    suggestions.push('For best experience, use a desktop browser or ensure your mobile browser supports Web3');
  }

  return {
    compatible: suggestions.length === 0,
    suggestions
  };
}

/**
 * Provides wallet installation and connection guidance.
 */
export function getWalletGuidance(): { installed: boolean; guidance: string; downloadUrl?: string } {
  if (typeof window === 'undefined') {
    return { installed: false, guidance: 'Wallet detection requires a browser environment' };
  }

  const hasMetaMask = 'ethereum' in window && (window as any).ethereum?.isMetaMask;
  const hasOtherWallet = 'ethereum' in window && !(window as any).ethereum?.isMetaMask;

  if (hasMetaMask) {
    return {
      installed: true,
      guidance: 'MetaMask is installed. Make sure it\'s connected and unlocked.'
    };
  }

  if (hasOtherWallet) {
    return {
      installed: true,
      guidance: 'A Web3 wallet is detected. Ensure it\'s connected and supports Celo network.'
    };
  }

  return {
    installed: false,
    guidance: 'No Web3 wallet detected. Install MetaMask or another Web3 wallet to continue.',
    downloadUrl: 'https://metamask.io/download/'
  };
}

/**
 * Logs recovery attempts for debugging and analytics.
 */
export function logRecoveryAttempt(attempt: RecoveryAttempt): void {
  const logData = {
    timestamp: attempt.timestamp.toISOString(),
    category: attempt.category,
    action: attempt.action.type,
    success: attempt.success,
    error: attempt.error.message,
    details: attempt.details
  };

  console.log('Recovery attempt:', logData);

  // In a production app, this could send to analytics service
  // analytics.track('error_recovery_attempt', logData);
}

/**
 * Requests user consent for automatic recovery actions.
 */
export async function requestUserConsent(request: ConsentRequest): Promise<boolean> {
  // In a real implementation, this would show a modal or notification
  // For now, we'll simulate with a timeout-based auto-approval for automatic actions

  if (!request.action.requiresConsent) {
    return true;
  }

  // Simulate user prompt
  return new Promise((resolve) => {
    console.log(`Requesting consent for: ${request.action.description}`);
    console.log(`Reason: ${request.reason}`);

    // Auto-approve after timeout for demo purposes
    setTimeout(() => {
      resolve(true); // In real app, this would be based on user input
    }, Math.min(request.timeout, 5000));
  });
}

/**
 * Main error recovery function that orchestrates the recovery process.
 */
export async function recoverFromError(
  error: Error,
  context?: string,
  availableEndpoints?: RPCEndpoint[]
): Promise<{ recovered: boolean; message: UserMessage; attempts: RecoveryAttempt[] }> {
  const category = classifyError(error, context);
  const message = generateUserMessage(error, category);
  const attempts: RecoveryAttempt[] = [];

  for (const action of message.actions) {
    if (action.automatic) {
      const consent = await requestUserConsent({
        action,
        reason: `Attempting to recover from ${category} error`,
        timeout: 3000
      });

      if (!consent) continue;

      const attempt: RecoveryAttempt = {
        timestamp: new Date(),
        error,
        category,
        action,
        success: false
      };

      try {
        // Perform the recovery action
        switch (action.type) {
          case 'retry':
            // Retry logic would be handled by the caller
            attempt.success = true;
            break;
          case 'switch_rpc':
            if (availableEndpoints && availableEndpoints.length > 0) {
              const newEndpoint = switchRpcEndpoint(availableEndpoints[0], availableEndpoints);
              attempt.success = !!newEndpoint;
              attempt.details = newEndpoint ? `Switched to ${newEndpoint.url}` : 'No alternative endpoint available';
            }
            break;
          case 'install_wallet':
          case 'update_browser':
          case 'manual_action':
            // These require user action, mark as attempted
            attempt.success = true;
            attempt.details = 'User guidance provided';
            break;
        }
      } catch (recoveryError) {
        attempt.details = `Recovery failed: ${(recoveryError as Error).message}`;
      }

      attempts.push(attempt);
      logRecoveryAttempt(attempt);

      if (attempt.success) {
        return { recovered: true, message, attempts };
      }
    }
  }

  return { recovered: false, message, attempts };
}