import { useState, useEffect, useCallback } from 'react';
import { NFT, TxState, TxStatus } from '../types';
import { getNFTsOf, getTotalSupply, mintNFT } from '../contract';

export function useNFTs(publicKey: string | null) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [txState, setTxState] = useState<TxState>({
    status: 'idle',
    txHash: null,
    error: null,
  });

  const refresh = useCallback(async () => {
    try {
      const supply = await getTotalSupply();
      setTotalSupply(supply);

      if (publicKey) {
        const userNfts = await getNFTsOf(publicKey);
        setNfts(userNfts);
      } else {
        setNfts([]);
      }
    } catch (e) {
      console.error('Failed to refresh NFTs', e);
    }
  }, [publicKey]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    refresh().then(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [refresh]);

  const mint = async () => {
    if (!publicKey) return;

    setTxState({ status: 'idle', txHash: null, error: null });

    try {
      const result = await mintNFT(publicKey, (status: TxStatus) => {
        setTxState(prev => ({ ...prev, status }));
      });
      
      setTxState({ status: 'success', txHash: result.txHash, error: null });
      await refresh();
    } catch (err: any) {
      setTxState({ status: 'failed', txHash: null, error: err.message || 'Minting failed' });
    }
  };

  return { nfts, totalSupply, loading, txState, mint, refresh };
}
