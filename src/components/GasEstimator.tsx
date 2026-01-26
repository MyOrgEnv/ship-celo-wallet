import { useState } from 'react';
import { useGasEstimation } from '../hooks/useGasEstimation';
import type { GasPriority, TransactionType } from '../types/gas';

interface GasEstimatorProps {
  transactionType: TransactionType;
  to?: `0x${string}`;
  value?: bigint;
  data?: `0x${string}`;
}

export function GasEstimator({ transactionType, to, value, data }: GasEstimatorProps) {
  const [priority, setPriority] = useState<GasPriority>('standard');

  const { estimate, isLoading, error, refetch } = useGasEstimation({
    transactionType,
    priority,
    to,
    value,
    data,
  });

  const priorities: GasPriority[] = ['slow', 'standard', 'fast'];

  return (
    <div className="gas-estimator">
      <h3>Gas Estimation</h3>

      <div className="priority-selector">
        <label>Priority: </label>
        {priorities.map((p) => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className={priority === p ? 'active' : ''}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {isLoading && <div className="loading">Estimating gas...</div>}

      {error && (
        <div className="error">
          Error estimating gas: {error.message}
          <button onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {estimate && (
        <div className="estimate-details">
          <div>Gas Limit: {estimate.gasLimit.toString()}</div>
          {estimate.maxFeePerGas && (
            <div>Max Fee per Gas: {estimate.maxFeePerGas.toString()} wei</div>
          )}
          {estimate.maxPriorityFeePerGas && (
            <div>Max Priority Fee: {estimate.maxPriorityFeePerGas.toString()} wei</div>
          )}
          <div>Estimated Cost: {estimate.estimatedCostCelo.toFixed(6)} CELO</div>
          <div>Estimated Cost: ${estimate.estimatedCostUsd.toFixed(2)} USD</div>
        </div>
      )}
    </div>
  );
}