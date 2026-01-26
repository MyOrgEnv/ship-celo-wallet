import { useCallback, useMemo } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';
import { celo, celoAlfajores } from '../config/celoChains';

const AVAILABLE_CHAINS = [celoAlfajores, celo] as const;

export function useCeloNetwork() {
  const currentChainId = useChainId();
  const { chains, switchChain, isPending, status, error } = useSwitchChain();

  const isSupportedChain = useMemo(
    () => AVAILABLE_CHAINS.some((chain) => chain.id === currentChainId),
    [currentChainId]
  );

  const currentChain = useMemo(
    () => AVAILABLE_CHAINS.find((chain) => chain.id === currentChainId) ?? null,
    [currentChainId]
  );

  const switchTo = useCallback(
    (targetChainId: number) => {
      const target = chains.find((chain) => chain.id === targetChainId);
      if (target && switchChain) {
        switchChain({ chainId: target.id });
      }
    },
    [chains, switchChain]
  );

  const switchToCelo = useCallback(() => switchTo(celo.id), [switchTo]);
  const switchToAlfajores = useCallback(() => switchTo(celoAlfajores.id), [switchTo]);

  return {
    currentChainId,
    currentChain,
    isSupportedChain,
    celoMainnet: celo,
    alfajores: celoAlfajores,
    switchToCelo,
    switchToAlfajores,
    isSwitching: isPending,
    status,
    error
  };
}
