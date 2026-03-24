import { NFT } from '../types';
import styles from './NFTCard.module.css';

export function NFTCard({ nft }: { nft: NFT }) {
  const shortenedOwner = `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`;
  const bgColor = `hsl(${(nft.id * 47) % 360}, 70%, 90%)`;

  return (
    <div className={styles.card} style={{ backgroundColor: bgColor }}>
      <div className={styles.header}>
        <span className={styles.badge}>Stellar Testnet</span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>NFT #{nft.id}</h3>
      </div>
      <div className={styles.footer}>
        <span className={styles.label}>Owner:</span>
        <span className={styles.owner}>{shortenedOwner}</span>
      </div>
    </div>
  );
}
