import { useWallet } from './hooks/useWallet';
import { useNFTs } from './hooks/useNFTs';
import { ConnectWallet } from './components/ConnectWallet';
import { MintButton } from './components/MintButton';
import { NFTCard } from './components/NFTCard';
import styles from './App.module.css';
import './global.css';

function App() {
  const wallet = useWallet();
  const { nfts, totalSupply, loading, txState, mint } = useNFTs(wallet.publicKey);

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.logo}>
          🌟 Stellar NFT Minter
        </div>
        <ConnectWallet wallet={wallet} />
      </header>

      <main className={styles.main}>
        <section className={styles.mintSection}>
          <div className={styles.statsRow}>
            Total Supply: <span className={styles.highlight}>{totalSupply} NFTs</span>
          </div>

          <MintButton
            disabled={!wallet.isConnected || !wallet.isCorrectNetwork}
            txState={txState}
            onMint={mint}
          />
        </section>

        <section className={styles.portfolioSection}>
          <h2 className={styles.sectionHeading}>
            Your NFTs {wallet.publicKey && `(${nfts.length})`}
          </h2>

          {!wallet.isConnected ? (
            <div className={styles.emptyState}>
              Connect Freighter to view and mint NFTs.
            </div>
          ) : loading ? (
            <div className={styles.skeletonGrid}>
              {[1, 2, 3].map(i => <div key={i} className={styles.skeletonCard} />)}
            </div>
          ) : nfts.length === 0 ? (
            <div className={styles.emptyState}>
              No NFTs yet. Mint your first one above!
            </div>
          ) : (
            <div className={styles.nftGrid}>
              {nfts.map(nft => (
                <NFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
