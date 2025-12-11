import type { Meta, StoryObj } from '@storybook/react';
import { WalletConnectUI } from '../components/WalletConnectUI';

const meta: Meta<typeof WalletConnectUI> = {
  title: 'Wallet/WalletConnectUI',
  component: WalletConnectUI,
  parameters: {
    docs: {
      description: {
        component: 'WalletConnect modal trigger and session management preconfigured for Celo.'
      }
    }
  },
  argTypes: {}
};
export default meta;

type Story = StoryObj<typeof WalletConnectUI>;

export const Default: Story = {
  args: {},
};
