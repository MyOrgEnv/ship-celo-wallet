import type { Meta, StoryObj } from '@storybook/react';
import { GasEstimator } from '../components/GasEstimator';
import { WagmiProvider } from '../providers/WagmiProvider';

const meta: Meta<typeof GasEstimator> = {
  title: 'Components/GasEstimator',
  component: GasEstimator,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <WagmiProvider>
        <Story />
      </WagmiProvider>
    ),
  ],
  argTypes: {
    transactionType: {
      control: { type: 'select' },
      options: ['native', 'erc20', 'contract', 'networkSwitch'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NativeTransfer: Story = {
  args: {
    transactionType: 'native',
    to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    value: 1000000000000000000n, // 1 CELO
  },
};

export const ERC20Transfer: Story = {
  args: {
    transactionType: 'erc20',
    to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    value: 1000000000000000000n, // 1 token (assuming 18 decimals)
  },
};

export const ContractInteraction: Story = {
  args: {
    transactionType: 'contract',
    to: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    data: '0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b844bc454e4438f44e0000000000000000000000000000000000000000000000000de0b6b3a7640000', // transfer function call
  },
};