import type { Meta, StoryObj } from '@storybook/react';
import { TransactionHistory } from '../components/TransactionHistory';

const meta: Meta<typeof TransactionHistory> = {
  title: 'Celo/TransactionHistory',
  component: TransactionHistory,
  parameters: {
    docs: {
      description: {
        component: 'Shows recent transactions for the connected account.'
      }
    }
  },
  argTypes: {
    className: { control: 'text' }
  }
};
export default meta;

type Story = StoryObj<typeof TransactionHistory>;

export const Default: Story = {
  args: {
    className: 'mt-6'
  },
};
