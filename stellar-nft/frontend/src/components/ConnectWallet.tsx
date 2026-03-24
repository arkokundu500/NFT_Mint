import { useWallet } from '../hooks/useWallet';
import styles from './ConnectWallet.module.css';

export function ConnectWallet({ wallet }: { wallet: ReturnType<typeof useWallet> }) {
  if (!wallet.isConnected || !wallet.publicKey) {
    return (
      <button className={styles.btn} onClick={wallet.connect}>
        Connect Freighter
      </button>
    );
  }

  const shortenedKey = `${wallet.publicKey.slice(0, 6)}...${wallet.publicKey.slice(-4)}`;

  return (
    <div className={styles.container}>
      {!wallet.isCorrectNetwork && (
        <div className={styles.warning}>
          ⚠️ Please switch to Stellar Testnet in Freighter
        </div>
      )}
      <div className={styles.walletBox}>
        <span className={styles.pubkey}>{shortenedKey}</span>
        <button className={styles.btnSecondary} onClick={wallet.disconnect}>
          Disconnect
        </button>
      </div>
    </div>
  );
}
