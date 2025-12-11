import type { Meta, StoryObj } from '@storybook/react';
import { WalletStatus } from '../components/WalletStatus';

const meta: Meta<typeof WalletStatus> = {
  title: 'Wallet/WalletStatus',
  component: WalletStatus,
  parameters: {
    docs: {
      description: {
        component: 'Displays the current wallet connection status and address.'
      }
    }
  }
};
export default meta;

type Story = StoryObj<typeof WalletStatus>;

export const Default: Story = {
  args: {},
};
