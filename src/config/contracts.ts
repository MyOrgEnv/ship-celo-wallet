// Contract configurations for popular Celo contracts

import { ERC20_ABI, ERC721_ABI, STAKING_ABI, GOVERNANCE_ABI, type ContractConfig, type ERC20Token } from '../types/contracts';

// Celo Mainnet (42220)
export const CELO_MAINNET_CONTRACTS = {
  // cUSD - Celo Dollar
  cUSD: {
    address: '0x765DE816845861e75A25fCA122bb6898B8B1282a0' as const,
    abi: ERC20_ABI,
    chainId: 42220,
  } as ContractConfig,

  // cEUR - Celo Euro
  cEUR: {
    address: '0xD8763CBa276a3738E6DE85b4b3bF5FDdE6d6ca73' as const,
    abi: ERC20_ABI,
    chainId: 42220,
  } as ContractConfig,

  // CELO token (native token wrapped)
  CELO: {
    address: '0x471EcE3750Da237f93B8E339c536989b8978a438' as const,
    abi: ERC20_ABI,
    chainId: 42220,
  } as ContractConfig,

  // Moola Lending Pool (example DeFi contract)
  MoolaLending: {
    address: '0x970b12522CA9b4054807a2c5B736149a5BE6f670' as const,
    abi: STAKING_ABI, // Simplified ABI for demonstration
    chainId: 42220,
  } as ContractConfig,

  // Celo Governance
  Governance: {
    address: '0xD533Ca259b330c7A88f74E000a3FaEa2d63B7972' as const,
    abi: GOVERNANCE_ABI,
    chainId: 42220,
  } as ContractConfig,
};

// Celo Alfajores Testnet (44787)
export const CELO_ALFAJORES_CONTRACTS = {
  // cUSD on Alfajores
  cUSD: {
    address: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1' as const,
    abi: ERC20_ABI,
    chainId: 44787,
  } as ContractConfig,

  // cEUR on Alfajores
  cEUR: {
    address: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F' as const,
    abi: ERC20_ABI,
    chainId: 44787,
  } as ContractConfig,

  // CELO on Alfajores
  CELO: {
    address: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9' as const,
    abi: ERC20_ABI,
    chainId: 44787,
  } as ContractConfig,
};

// Popular ERC-20 tokens on Celo
export const CELO_TOKENS: Record<string, ERC20Token> = {
  cUSD: {
    address: '0x765DE816845861e75A25fCA122bb6898B8B1282a0',
    symbol: 'cUSD',
    name: 'Celo Dollar',
    decimals: 18,
    chainId: 42220,
  },
  cEUR: {
    address: '0xD8763CBa276a3738E6DE85b4b3bF5FDdE6d6ca73',
    symbol: 'cEUR',
    name: 'Celo Euro',
    decimals: 18,
    chainId: 42220,
  },
  CELO: {
    address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    symbol: 'CELO',
    name: 'Celo',
    decimals: 18,
    chainId: 42220,
  },
  // Add more tokens as needed
};

// Example NFT contracts (these would need to be real addresses)
export const EXAMPLE_NFT_CONTRACTS = {
  // Example: CeloPunks or similar
  CeloPunks: {
    address: '0x0000000000000000000000000000000000000000' as const, // Placeholder
    abi: ERC721_ABI,
    chainId: 42220,
  } as ContractConfig,
};

// Utility function to get contract config by chain
export function getContractConfig(chainId: number, contractName: string): ContractConfig | undefined {
  const contracts = chainId === 42220 ? CELO_MAINNET_CONTRACTS : CELO_ALFAJORES_CONTRACTS;
  return (contracts as any)[contractName];
}

// Utility function to get token info
export function getTokenInfo(symbol: string): ERC20Token | undefined {
  return CELO_TOKENS[symbol.toUpperCase()];
}