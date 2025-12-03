const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if we're in a git repository
try {
  execSync('git rev-parse --git-dir', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Error: This script must be run in a git repository directory.');
  console.error('Please navigate to your GitHub repository directory and run this script again.');
  process.exit(1);
}

// Check if GitHub CLI is authenticated
try {
  execSync('gh auth status', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Error: GitHub CLI is not authenticated or not installed.');
  console.error('Please run "gh auth login" to authenticate with GitHub.');
  console.error('If you don\'t have GitHub CLI installed, install it from: https://cli.github.com/');
  process.exit(1);
}

// Get current repository information
let repoInfo;
try {
  const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
  const repoMatch = remoteUrl.match(/github\.com[:\/](.+?)\/(.+?)(?:\.git)?$/);
  if (repoMatch) {
    repoInfo = {
      owner: repoMatch[1],
      repo: repoMatch[2].replace('.git', '')
    };
  }
} catch (error) {
  console.error('❌ Error: Could not determine repository information from git remote.');
  process.exit(1);
}

if (!repoInfo) {
  console.error('❌ Error: Could not parse repository URL. Please ensure your git remote points to a GitHub repository.');
  process.exit(1);
}

console.log(`🎯 Creating GitHub issues for: ${repoInfo.owner}/${repoInfo.repo}`);
console.log('📝 This will create 20 issues to encourage community contributions.\n');

// The 20 GitHub issues data
const issues = [
  {
    title: "Enhance Wallet Connection UX with Loading States",
    body: `## Description
Improve the user experience during wallet connection by adding proper loading states and animations.

## Current State
When users click "Connect", there's no visual feedback indicating the connection is in progress.

## Expected Enhancement
- Add loading spinners/animations for each connector button
- Disable buttons during connection attempts
- Show "Connecting..." text instead of connector name
- Implement a progress indicator for WalletConnect QR code flow

## Files to Modify
- \`src/components/WalletConnectUI.tsx\`
- \`src/App.css\` (for styling)

## Technical Requirements
- Use React useState for loading states
- Ensure loading states work for both injected wallets and WalletConnect
- Add proper accessibility attributes (aria-busy, aria-live)

## Good First Issue
This is a beginner-friendly enhancement that improves user experience without complex blockchain logic.`,
    labels: ["enhancement", "good-first-issue", "ux", "frontend"]
  },
  {
    title: "Add Network Detection and Automatic Switching",
    body: `## Description
Automatically detect user's current network and suggest/switch to Celo networks when connected to unsupported chains.

## Current Behavior
Users can manually switch networks using the buttons, but there's no automatic detection or switching.

## Expected Behavior
- Detect user's current network when wallet connects
- If on unsupported network, show banner with "Switch to Celo" button
- Optionally auto-switch to user's preferred network
- Save network preference in localStorage

## Files to Modify
- \`src/hooks/useCeloNetwork.ts\`
- \`src/components/WalletStatus.tsx\`
- \`src/utils/networkPreferences.ts\` (new file)

## Technical Requirements
- Use wagmi's useChainId and useSwitchChain hooks
- Implement proper error handling for network switching
- Add localStorage management for user preferences

## Difficulty
Intermediate - involves blockchain interaction and localStorage management.`,
    labels: ["enhancement", "blockchain", "ux", "intermediate"]
  },
  {
    title: "Implement Error Boundaries for Better Error Handling",
    body: `## Description
Add React Error Boundaries to gracefully handle JavaScript errors in components and provide better user feedback.

## Current Issue
JavaScript errors in components can crash the entire application.

## Expected Solution
- Create ErrorBoundary component
- Wrap main application sections in error boundaries
- Display user-friendly error messages
- Add error reporting capability
- Provide retry mechanisms

## Files to Create/Modify
- \`src/components/ErrorBoundary.tsx\` (new)
- \`src/components/ErrorFallback.tsx\` (new)
- \`src/App.tsx\`
- Update test coverage for error scenarios

## Technical Requirements
- Use React 18 Error Boundaries pattern
- Implement error logging (console + optional external service)
- Ensure accessibility of error messages
- Add loading and success states for retry actions

## Good First Issue
Great for developers learning about React error handling patterns.`,
    labels: ["enhancement", "error-handling", "frontend", "good-first-issue"]
  },
  {
    title: "Add Transaction History Component",
    body: `## Description
Create a component to display recent transactions for the connected wallet on Celo networks.

## Feature Requirements
- Show last 10 transactions for connected address
- Display transaction hash, timestamp, value, and status
- Link to Celo explorer for transaction details
- Support filtering by transaction type (sent/received)
- Show pending and confirmed transactions differently

## Files to Create
- \`src/components/TransactionHistory.tsx\`
- \`src/hooks/useTransactionHistory.ts\`
- \`src/utils/celoExplorer.ts\`
- \`src/types/transaction.ts\`

## Technical Requirements
- Use viem for reading transaction history from Celo RPC
- Implement proper loading and error states
- Add pagination for large transaction lists
- Ensure mobile-responsive design

## Dependencies
- Extend existing wagmi setup for transaction queries
- Integrate with Celo block explorers (e.g.,celoscan.org)

## Difficulty
Intermediate to Advanced - involves blockchain data fetching and complex UI patterns.`,
    labels: ["feature", "blockchain", "intermediate", "frontend"]
  },
  {
    title: "Implement Accessibility Improvements",
    body: `## Description
Enhance accessibility (WCAG 2.1 AA compliance) across all wallet components.

## Current Accessibility Gaps
- Missing ARIA labels on interactive elements
- No keyboard navigation for wallet modals
- Insufficient color contrast in some states
- Missing screen reader support for dynamic content

## Expected Improvements
- Add comprehensive ARIA labels and descriptions
- Implement keyboard navigation (Tab, Enter, Escape)
- Ensure color contrast meets WCAG standards
- Add focus management for modal dialogs
- Implement skip links and landmarks
- Test with screen readers (NVDA, JAWS, VoiceOver)

## Files to Modify
- All components in \`src/components/\`
- \`src/App.css\` (for focus styles and contrast)
- Add \`src/utils/a11y.ts\` for accessibility utilities

## Testing Requirements
- Test with keyboard-only navigation
- Verify with browser accessibility tools
- Run automated accessibility tests (axe-core)

## Good First Issue
Perfect for developers wanting to learn accessibility best practices while contributing.`,
    labels: ["accessibility", "enhancement", "good-first-issue", "frontend"]
  },
  {
    title: "Add Support for More Wallet Connectors",
    body: `## Description
Expand wallet support by adding more connectors (Coinbase Wallet, Trust Wallet, SafePal, etc.) through WalletConnect.

## Current Support
Currently supports:
- Injected wallets (MetaMask, Valora)
- WalletConnect protocol

## Missing Connectors to Add
- Coinbase Wallet
- Trust Wallet
- SafePal
- TokenPocket
- imToken
- Celo Wallet (native)

## Implementation Approach
- Configure additional WalletConnect providers
- Add specific connector configurations
- Update connector UI to show wallet logos/icons
- Test connection flow for each wallet

## Files to Modify
- \`src/providers/WagmiProvider.tsx\`
- \`src/components/WalletConnectUI.tsx\` (for wallet icons)
- Add \`src/assets/wallet-icons/\` directory

## Technical Requirements
- Follow wagmi connector patterns
- Implement proper icon loading and caching
- Add fallbacks for unsupported wallets
- Test on both mobile and desktop

## Difficulty
Intermediate - involves external API integration and testing across multiple wallet apps.`,
    labels: ["feature", "integration", "intermediate", "frontend"]
  },
  {
    title: "Create Comprehensive Test Suite for Custom Hooks",
    body: `## Description
Expand testing coverage for custom hooks, particularly \`useCeloNetwork\` and future hooks.

## Current Test Coverage
Basic component tests exist, but custom hooks lack comprehensive testing.

## Test Requirements
- Unit tests for \`useCeloNetwork\` hook
- Integration tests for hook interactions
- Mock wagmi hooks appropriately
- Test error states and edge cases
- Add property-based testing for hook return values

## Files to Create/Modify
- \`src/hooks/tests/useCeloNetwork.test.ts\`
- \`src/test/mocks/wagmi-extended.ts\`
- Update \`src/test/setup.ts\`

## Testing Patterns to Implement
- Mock wagmi hooks with proper typing
- Test async hook behavior
- Test error scenarios and recovery
- Test hook cleanup and memory leaks

## Technical Requirements
- Use @testing-library/react-hooks
- Implement proper cleanup in tests
- Add TypeScript type safety to mocks
- Run tests with coverage reporting

## Good First Issue
Excellent for developers learning React testing patterns and blockchain mock implementations.`,
    labels: ["testing", "coverage", "good-first-issue", "backend"]
  },
  {
    title: "Add Internationalization (i18n) Support",
    body: `## Description
Implement internationalization to make the wallet starter kit accessible to global users.

## Feature Scope
- Support for multiple languages (English, Spanish, French, Chinese, Arabic)
- Dynamic language switching
- RTL (Right-to-Left) support for Arabic
- Currency formatting based on locale

## Implementation Approach
- Use react-i18next for translation management
- Create translation files for each language
- Implement language selector component
- Format numbers and dates according to locale

## Files to Create/Modify
- \`src/i18n/\` directory structure
- \`src/components/LanguageSelector.tsx\`
- Update all text content to use translation keys
- \`src/utils/formatters.ts\`

## Translation Keys Needed
- UI labels (Connect, Disconnect, Network, etc.)
- Error messages
- Status messages
- Tooltips and help text

## Technical Requirements
- Implement lazy loading of translations
- Store language preference in localStorage
- Ensure accessibility of language selector
- Add language detection based on browser settings

## Difficulty
Intermediate - involves setting up i18n infrastructure and translating existing content.`,
    labels: ["feature", "internationalization", "intermediate", "frontend"]
  },
  {
    title: "Implement Mobile-First Responsive Design",
    body: `## Description
Optimize the entire application for mobile devices with responsive design patterns.

## Mobile-First Issues
- Current layout not optimized for small screens
- Wallet buttons too small for touch interaction
- Network switching buttons difficult to use on mobile
- Transaction history not mobile-friendly

## Responsive Improvements Needed
- Implement mobile-first CSS Grid/Flexbox layouts
- Increase touch target sizes (minimum 44px)
- Optimize modal dialogs for mobile viewports
- Improve keyboard interaction on mobile browsers
- Add swipe gestures for network switching

## Files to Modify
- \`src/App.css\`
- \`src/index.css\`
- All component files for responsive classes

## CSS Framework Consideration
Evaluate and potentially implement:
- Tailwind CSS for utility-first styling
- Styled-components or Emotion for component styling
- CSS Modules for scoped styling

## Testing Requirements
- Test on various mobile devices and screen sizes
- Verify touch interactions work properly
- Test wallet connection flow on mobile browsers

## Good First Issue
Great for designers and frontend developers wanting to improve mobile user experience.`,
    labels: ["responsive-design", "mobile", "ui", "good-first-issue"]
  },
  {
    title: "Add Theme System with Dark Mode Support",
    body: `## Description
Implement a comprehensive theming system with dark mode support and user preference persistence.

## Theme System Features
- Light and dark mode toggle
- System preference detection (prefers-color-scheme)
- Custom color palette support
- Theme persistence across browser sessions
- Smooth transitions between themes

## Implementation Approach
- Create theme context and provider
- Implement CSS custom properties for colors
- Add theme toggle component
- Update all components to use theme variables
- Ensure accessibility (sufficient contrast in both modes)

## Files to Create/Modify
- \`src/contexts/ThemeContext.tsx\`
- \`src/components/ThemeToggle.tsx\`
- \`src/styles/themes.css\`
- Update all component CSS to use theme variables

## Color Scheme Requirements
- Support for light/dark mode
- High contrast mode for accessibility
- Consistent color usage across components
- Brand colors that work in both modes

## Technical Requirements
- Implement with React Context API
- Use CSS custom properties (variables)
- Add smooth CSS transitions
- Test with system preference changes

## Good First Issue
Perfect for developers learning about React Context and CSS custom properties.`,
    labels: ["feature", "theming", "accessibility", "good-first-issue"]
  },
  {
    title: "Create Gas Estimation Component",
    body: `## Description
Add a component to estimate gas fees for transactions on Celo networks before users send transactions.

## Gas Estimation Features
- Display estimated gas cost in CELO and USD
- Show different priority levels (slow, standard, fast)
- Estimate gas for common transaction types
- Update estimates in real-time based on network congestion

## Transaction Types to Support
- Native CELO transfers
- ERC-20 token transfers
- Contract interactions (smart contract calls)
- Network switching (gas for switching networks)

## Files to Create
- \`src/components/GasEstimator.tsx\`
- \`src/hooks/useGasEstimation.ts\`
- \`src/utils/gasCalculations.ts\`
- \`src/types/gas.ts\`

## Technical Requirements
- Use viem's gas estimation APIs
- Implement proper error handling for failed estimates
- Add caching for gas price queries
- Show loading states during estimation

## Integration Points
- Integrate with existing transaction flow
- Connect with Celo gas price oracles
- Support for EIP-1559 gas pricing

## Difficulty
Intermediate to Advanced - involves blockchain gas estimation and real-time data fetching.`,
    labels: ["feature", "blockchain", "intermediate", "frontend"]
  },
  {
    title: "Implement Wallet Connection Persistence",
    body: `## Description
Persist wallet connection state across browser sessions to improve user experience.

## Current Behavior
Users must reconnect their wallet every time they refresh the page or reopen the browser.

## Desired Behavior
- Automatically attempt to reconnect previously connected wallets
- Remember user's preferred wallet and network
- Seamless reconnection flow with visual feedback
- Handle connection failures gracefully

## Implementation Strategy
- Store connection state in localStorage/IndexedDB
- Implement auto-reconnection logic on app load
- Handle expired sessions and wallet lock/unlock events
- Add connection recovery for mobile wallets

## Files to Modify
- \`src/hooks/useConnectionPersistence.ts\` (new)
- \`src/providers/WagmiProvider.tsx\`
- \`src/utils/storage.ts\`

## Technical Requirements
- Use wagmi's persistent connection features
- Implement proper storage management
- Handle multi-tab scenarios
- Ensure security of stored connection data

## Security Considerations
- Don't store sensitive wallet data unencrypted
- Implement proper session expiration
- Clear stored data on disconnect

## Difficulty
Intermediate - involves security considerations and complex state management.`,
    labels: ["enhancement", "user-experience", "intermediate", "security"]
  },
  {
    title: "Add Performance Monitoring and Analytics",
    body: `## Description
Implement performance monitoring and basic analytics to understand user behavior and app performance.

## Monitoring Requirements
- Track wallet connection success/failure rates
- Monitor app load times and bundle sizes
- Track most used features and network preferences
- Implement error tracking and reporting

## Analytics Features
- Connection flow funnel analysis
- Network switching frequency
- Time spent in different app sections
- Mobile vs desktop usage patterns

## Implementation Approach
- Add lightweight analytics library (e.g., PostHog, Plausible)
- Implement performance monitoring with Web Vitals
- Add custom events for wallet interactions
- Create dashboard for viewing metrics

## Files to Create/Modify
- \`src/analytics/\` directory structure
- \`src/utils/performanceMonitor.ts\`
- Update main.tsx for analytics initialization
- Add analytics to component interactions

## Privacy Considerations
- Ensure GDPR compliance
- Anonymize user data
- Provide opt-out mechanism
- Don't track sensitive wallet information

## Technical Requirements
- Use lightweight analytics SDK
- Implement proper event batching
- Add performance budget monitoring
- Create analytics events schema

## Difficulty
Intermediate - involves third-party integration and privacy considerations.`,
    labels: ["monitoring", "analytics", "performance", "intermediate"]
  },
  {
    title: "Create Contract Interaction Examples",
    body: `## Description
Add example components and utilities for interacting with popular Celo smart contracts.

## Contract Interaction Examples
- ERC-20 token balance and transfers
- cUSD (Celo Dollar) interactions
- Simple DeFi contract interactions (staking, lending)
- NFT marketplace interactions
- Governance contract participation

## Example Components to Create
- \`TokenTransfer.tsx\` - Send ERC-20 tokens
- \`ContractReader.tsx\` - Read contract data
- \`ContractWriter.tsx\` - Execute contract methods
- \`NFTGallery.tsx\` - Display NFT collections

## Technical Requirements
- Create contract ABIs and type definitions
- Implement proper error handling for contract calls
- Add loading states for contract interactions
- Create reusable contract interaction hooks

## Learning Resources
- Add documentation for each contract interaction
- Include step-by-step tutorials
- Provide troubleshooting guides

## Difficulty
Intermediate to Advanced - requires Solidity smart contract knowledge and complex blockchain interactions.`,
    labels: ["feature", "smart-contracts", "advanced", "blockchain"]
  },
  {
    title: "Implement Advanced Error Recovery System",
    body: `## Description
Create a comprehensive error recovery system that helps users resolve common blockchain and wallet issues.

## Error Recovery Scenarios
- Network connection failures
- Wallet extension not detected
- Insufficient gas fees
- Transaction failed/reverted
- RPC endpoint unavailable
- Browser compatibility issues

## Recovery Features
- Automatic retry mechanisms with exponential backoff
- User-friendly error messages with solutions
- Alternative network/RPC endpoint switching
- Browser compatibility checks and suggestions
- Wallet installation guidance

## Files to Create/Modify
- \`src/utils/errorRecovery.ts\`
- \`src/components/ErrorRecovery.tsx\`
- \`src/hooks/useErrorRecovery.ts\`
- Update error handling in existing components

## User Experience Goals
- Reduce user frustration with clear error communication
- Provide actionable solutions rather than technical error messages
- Implement graceful degradation when services are unavailable

## Technical Requirements
- Create error classification system
- Implement retry logic with proper limits
- Add user consent for automatic actions
- Log recovery attempts for debugging

## Good First Issue
Excellent for developers learning about error handling and user experience design.`,
    labels: ["error-handling", "user-experience", "enhancement", "good-first-issue"]
  },
  {
    title: "Add Network Health Monitoring",
    body: `## Description
Implement network health monitoring to ensure optimal user experience and provide network status information.

## Network Monitoring Features
- Real-time RPC endpoint health checks
- Network congestion indicators
- Block time and transaction confirmation monitoring
- Alternative RPC endpoint automatic switching
- Network status dashboard for users

## Health Check Metrics
- RPC endpoint response times
- Transaction success rates
- Block production timing
- Network gas price trends
- Connected peer counts

## Files to Create
- \`src/components/NetworkHealth.tsx\`
- \`src/hooks/useNetworkHealth.ts\`
- \`src/utils/networkMonitoring.ts\`
- \`src/types/network.ts\`

## Implementation Requirements
- Implement periodic health checks
- Create network status indicators
- Add fallback RPC endpoint support
- Display network information to users

## Technical Challenges
- Handle multiple RPC endpoints efficiently
- Implement proper caching for health status
- Create responsive UI for network changes
- Ensure monitoring doesn't impact performance

## Difficulty
Intermediate to Advanced - involves real-time monitoring and complex state management.`,
    labels: ["monitoring", "performance", "blockchain", "intermediate"]
  },
  {
    title: "Create Progressive Web App (PWA) Support",
    body: `## Description
Transform the wallet starter kit into a Progressive Web App for better mobile experience and offline capabilities.

## PWA Features to Implement
- Web app manifest for home screen installation
- Service worker for offline functionality
- Push notifications for transaction confirmations
- App-like navigation and experience
- Background sync for pending transactions

## Manifest Configuration
- Proper app icons in multiple sizes
- Theme color and display mode settings
- Orientation and start URL configuration
- Short name and description for app shortcuts

## Service Worker Features
- Cache static assets for offline use
- Background sync for failed transactions
- Push notification handling
- Network-first strategy for blockchain data

## Files to Create/Modify
- \`public/manifest.json\`
- \`src/service-worker.ts\`
- \`src/components/PWAInstallPrompt.tsx\`
- Update Vite config for PWA support

## Technical Requirements
- Implement proper caching strategies
- Add push notification infrastructure
- Ensure app works offline with core features
- Test installation on various devices

## Mobile Experience Goals
- Native app-like feel on mobile devices
- Faster loading times with caching
- Push notifications for important events
- Offline functionality for viewing data

## Difficulty
Intermediate - involves service worker implementation and PWA best practices.`,
    labels: ["pwa", "mobile", "progressive-enhancement", "intermediate"]
  },
  {
    title: "Add Comprehensive Documentation Generator",
    body: `## Description
Create an automated system to generate comprehensive documentation from code comments and component props.

## Documentation Features
- Auto-generate API documentation from TypeScript
- Component prop documentation with examples
- Hook usage examples and return types
- Integration guides for common use cases
- Troubleshooting documentation

## Documentation Structure
- Interactive component playground
- PropTables with types and default values
- Code examples with copy-paste functionality
- Searchable documentation interface
- Version-specific documentation

## Implementation Tools
- Storybook for component documentation
- TypeDoc for API documentation
- Custom documentation site generator
- Automated testing of documentation examples

## Files to Create/Modify
- \`.storybook/\` configuration
- \`src/stories/\` directory for component stories
- \`docs/\` generated documentation
- Update build process for documentation generation

## Developer Experience Goals
- Easy onboarding for new contributors
- Clear API reference for all components
- Interactive examples for quick testing
- Automated documentation updates

## Good First Issue
Perfect for technical writers and developers wanting to improve developer experience.`,
    labels: ["documentation", "developer-experience", "good-first-issue"]
  },
  {
    title: "Create Advanced Testing Framework Integration",
    body: `## Description
Implement comprehensive end-to-end testing and advanced testing patterns for blockchain interactions.

## Testing Framework Requirements
- End-to-end testing with Playwright or Cypress
- Mock blockchain interactions for reliable tests
- Visual regression testing for UI components
- Performance testing for wallet operations
- Security testing for common vulnerabilities

## E2E Testing Scenarios
- Complete wallet connection flows
- Network switching workflows
- Transaction sending and confirmation
- Error handling and recovery
- Cross-browser compatibility testing

## Testing Infrastructure
- Automated test execution on PR
- Test coverage reporting and thresholds
- Mock blockchain networks for testing
- Performance benchmarks and alerting
- Accessibility testing automation

## Files to Create/Modify
- \`e2e/\` directory for end-to-end tests
- \`cypress.config.ts\` or \`playwright.config.ts\`
- \`src/test/e2e/\` test utilities
- Update CI/CD for automated testing

## Test Data Management
- Mock wallet connections and responses
- Simulated blockchain networks
- Test accounts with known balances
- Automated test data cleanup

## Quality Gates
- Minimum coverage requirements
- Performance benchmarks
- Accessibility compliance checks
- Security vulnerability scanning

## Difficulty
Intermediate to Advanced - requires expertise in testing frameworks and blockchain testing patterns.`,
    labels: ["testing", "e2e", "quality", "advanced"]
  }
];

// Function to create a single GitHub issue
function createIssue(issue, index) {
  const labelsArg = issue.labels.length > 0 ? `--label "${issue.labels.join(',')}"` : '';
  const bodyArg = `"${issue.body.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
  
  const command = `gh issue create --title "${issue.title}" --body ${bodyArg} ${labelsArg}`;
  
  try {
    console.log(`Creating issue ${index + 1}/20: ${issue.title}`);
    execSync(command, { stdio: 'pipe' });
    console.log(`✅ Successfully created: ${issue.title}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create issue: ${issue.title}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting GitHub issue creation process...\n');
  
  let successCount = 0;
  let failureCount = 0;
  
  for (let i = 0; i < issues.length; i++) {
    const success = createIssue(issues[i], i);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Add a small delay between API calls to avoid rate limiting
    if (i < issues.length - 1) {
      console.log('⏳ Waiting 2 seconds before creating next issue...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n📊 Issue Creation Summary:');
  console.log(`✅ Successfully created: ${successCount} issues`);
  console.log(`❌ Failed to create: ${failureCount} issues`);
  
  if (successCount > 0) {
    console.log('\n🎉 Great! Your repository now has new issues for contributors to work on!');
    console.log('💡 Tips for managing your new issues:');
    console.log('- Assign issues to maintainers or community members');
    console.log('- Add more detailed specifications as needed');
    console.log('- Use project boards to organize issues by complexity or category');
    console.log('- Consider adding milestone labels for release planning');
  }
  
  if (failureCount > 0) {
    console.log('\n⚠️ Some issues failed to create. You can manually create them using:');
    console.log('- The GitHub web interface');
    console.log('- The GitHub CLI with the commands shown in the generator script');
  }
}

// Run the main function
main().catch(error => {
  console.error('❌ Script failed with error:', error.message);
  process.exit(1);
});