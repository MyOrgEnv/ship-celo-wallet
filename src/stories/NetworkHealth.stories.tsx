import type { Meta, StoryObj } from '@storybook/react';
import { NetworkHealth } from '../components/NetworkHealth';
import type { RPCEndpoint } from '../types/network';

const meta: Meta<typeof NetworkHealth> = {
  title: 'Components/NetworkHealth',
  component: NetworkHealth,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays real-time network health monitoring for Celo blockchain endpoints.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', padding: '20px', backgroundColor: '#0f0f0f', borderRadius: '8px' }}>
        <Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockEndpoints: RPCEndpoint[] = [
  {
    url: 'https://rpc.celo.org',
    chainId: 42220,
    status: 'healthy',
    metrics: {
      responseTime: 150,
      successRate: 100,
      lastChecked: new Date(),
      errorCount: 0
    },
    isActive: true
  },
  {
    url: 'https://backup.rpc.celo.org',
    chainId: 42220,
    status: 'healthy',
    metrics: {
      responseTime: 200,
      successRate: 95,
      lastChecked: new Date(),
      errorCount: 1
    },
    isActive: true
  }
];

export const Loading: Story = {
  args: {
    endpoints: mockEndpoints
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading state while network health data is being fetched.'
      }
    }
  }
};

export const Healthy: Story = {
  args: {
    endpoints: mockEndpoints
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when the network is healthy with all endpoints working optimally.'
      }
    }
  }
};

export const Degraded: Story = {
  args: {
    endpoints: [
      ...mockEndpoints,
      {
        url: 'https://slow.rpc.celo.org',
        chainId: 42220,
        status: 'degraded',
        metrics: {
          responseTime: 3000,
          successRate: 85,
          lastChecked: new Date(),
          errorCount: 2
        },
        isActive: false
      }
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when the network is degraded with some endpoints experiencing issues.'
      }
    }
  }
};

export const Error: Story = {
  args: {
    endpoints: mockEndpoints
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when there is an error fetching network health data.'
      }
    }
  }
};

export const Down: Story = {
  args: {
    endpoints: mockEndpoints.map(endpoint => ({
      ...endpoint,
      status: 'down' as const,
      isActive: false
    }))
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when the network is completely down with all endpoints failing.'
      }
    }
  }
};