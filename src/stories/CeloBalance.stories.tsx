import type { Meta, StoryObj } from '@storybook/react';
import { CeloBalance } from '../components/CeloBalance';

const meta: Meta<typeof CeloBalance> = {
  title: 'Celo/CeloBalance',
  component: CeloBalance,
  parameters: {
    docs: {
      description: {
        component: 'Displays the connected account CELO balance.'
      }
    }
  }
};
export default meta;

type Story = StoryObj<typeof CeloBalance>;

export const Default: Story = {
  args: {},
};
