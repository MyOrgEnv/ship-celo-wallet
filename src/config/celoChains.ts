import { defineChain } from 'viem';

const createCeloChain = ({
  id,
  name,
  currencyName,
  rpc,
  explorerName,
  explorerUrl
}: {
  id: number
  name: string
  currencyName: string
  rpc: string
  explorerName: string
  explorerUrl: string
}) =>
  defineChain({
    id,
    name,
    nativeCurrency: {
      name: currencyName,
      symbol: 'CELO',
      decimals: 18
    },
    rpcUrls: {
      default: {
        http: [rpc]
      }
    },
    blockExplorers: {
      default: { name: explorerName, url: explorerUrl }
    }
  });

export const celo = createCeloChain({
  id: 42220,
  name: 'Celo',
  currencyName: 'Celo',
  rpc: 'https://forno.celo.org',
  explorerName: 'Celo Explorer',
  explorerUrl: 'https://celoscan.io'
});

export const celoAlfajores = createCeloChain({
  id: 44787,
  name: 'Alfajores',
  currencyName: 'Alfajores Celo',
  rpc: 'https://alfajores-forno.celo-testnet.org',
  explorerName: 'CeloScan Alfajores',
  explorerUrl: 'https://alfajores.celoscan.io'
});
