import { useAccount } from 'wagmi';
import { useContractRead } from './useContractRead';
import { useContractWrite } from './useContractWrite';
import { type ContractConfig, type NFTToken, type ContractCallResult } from '../types/contracts';

/**
 * Hook for reading ERC-721 NFT balance
 * @param nftConfig - NFT contract configuration
 * @param address - Address to check balance for (defaults to connected account)
 * @returns Number of NFTs owned by the address
 */
export function useERC721Balance(
  nftConfig: ContractConfig | undefined,
  address?: `0x${string}`
): ContractCallResult<bigint> {
  const { address: accountAddress } = useAccount();
  const targetAddress = address || accountAddress;

  return useContractRead<bigint>(
    nftConfig,
    'balanceOf',
    targetAddress ? [targetAddress] : undefined,
    { enabled: !!targetAddress }
  );
}

/**
 * Hook for getting NFT owner
 * @param nftConfig - NFT contract configuration
 * @param tokenId - Token ID to check
 * @returns Owner address of the NFT
 */
export function useERC721Owner(
  nftConfig: ContractConfig | undefined,
  tokenId: bigint | undefined
): ContractCallResult<`0x${string}`> {
  return useContractRead<`0x${string}`>(
    nftConfig,
    'ownerOf',
    tokenId !== undefined ? [tokenId] : undefined,
    { enabled: tokenId !== undefined }
  );
}

/**
 * Hook for getting NFT token URI
 * @param nftConfig - NFT contract configuration
 * @param tokenId - Token ID to get URI for
 * @returns Token URI string
 */
export function useERC721TokenURI(
  nftConfig: ContractConfig | undefined,
  tokenId: bigint | undefined
): ContractCallResult<string> {
  return useContractRead<string>(
    nftConfig,
    'tokenURI',
    tokenId !== undefined ? [tokenId] : undefined,
    { enabled: tokenId !== undefined }
  );
}

/**
 * Hook for transferring ERC-721 NFTs
 * @param nftConfig - NFT contract configuration
 * @returns Transfer function and transaction state
 */
export function useERC721Transfer(nftConfig: ContractConfig | undefined) {
  const { write, hash, isLoading, error, reset } = useContractWrite(nftConfig);

  const transfer = (from: `0x${string}`, to: `0x${string}`, tokenId: bigint) => {
    write('safeTransferFrom', [from, to, tokenId]);
  };

  return {
    transfer,
    hash,
    isLoading,
    error,
    reset,
  };
}

/**
 * Hook for getting token ID by owner index
 * @param nftConfig - NFT contract configuration
 * @param owner - Owner address
 * @param index - Index in owner's token list
 * @returns Token ID at the given index for the owner
 */
export function useERC721TokenOfOwnerByIndex(
  nftConfig: ContractConfig | undefined,
  owner: `0x${string}` | undefined,
  index: bigint | undefined
): ContractCallResult<bigint> {
  return useContractRead<bigint>(
    nftConfig,
    'tokenOfOwnerByIndex',
    owner && index !== undefined ? [owner, index] : undefined,
    { enabled: !!(owner && index !== undefined) }
  );
}