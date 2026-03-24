import { TxState } from '../types';
import styles from './MintButton.module.css';

interface Props {
  disabled: boolean;
  txState: TxState;
  onMint: () => void;
}

export function MintButton({ disabled, txState, onMint }: Props) {
  const isBusy = txState.status !== 'idle' && txState.status !== 'success' && txState.status !== 'failed';

  let label = 'Mint NFT';
  switch (txState.status) {
    case 'building': label = 'Building transaction...'; break;
    case 'awaiting_signature': label = 'Sign in Freighter...'; break;
    case 'submitting': label = 'Submitting...'; break;
    case 'polling': label = 'Confirming on-chain...'; break;
    case 'success': label = '✅ Minted!'; break;
    case 'failed': label = '❌ Failed — Retry'; break;
  }

  return (
    <div className={styles.container}>
      <button 
        className={`${styles.btn} ${isBusy ? styles.btnBusy : ''}`}
        onClick={onMint}
        disabled={disabled || isBusy}
      >
        {label}
      </button>

      {txState.status === 'success' && txState.txHash && (
        <div className={styles.successStrip}>
          🎉 NFT minted! Tx:{' '}
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txState.txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            {txState.txHash.slice(0, 8)}...
          </a>
        </div>
      )}

      {txState.status === 'failed' && txState.error && (
        <div className={styles.errorStrip}>
          {txState.error}
        </div>
      )}
    </div>
  );
}
