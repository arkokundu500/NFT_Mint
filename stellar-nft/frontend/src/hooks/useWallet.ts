import { useState, useEffect, useCallback } from 'react';
import { isConnected as freighterIsConnected, setAllowed, getPublicKey, getNetworkDetails } from '@stellar/freighter-api';
import { WalletState } from '../types';

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    publicKey: null,
    isConnected: false,
    networkPassphrase: null,
    isCorrectNetwork: false,
  });

  const checkConnection = useCallback(async () => {
    try {
      if (await freighterIsConnected()) {
        setState(prev => ({ ...prev, isConnected: true }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const connect = async () => {
    try {
      await setAllowed();
      const pubKey = await getPublicKey();
      const networkObj = await getNetworkDetails();
      
      const passphrase = networkObj.networkPassphrase;
      const isCorrect = passphrase === import.meta.env.VITE_NETWORK_PASSPHRASE;

      setState({
        publicKey: pubKey,
        isConnected: true,
        networkPassphrase: passphrase,
        isCorrectNetwork: isCorrect,
      });
    } catch (err) {
      console.error('Connection failed', err);
    }
  };

  const disconnect = () => {
    setState({
      publicKey: null,
      isConnected: false,
      networkPassphrase: null,
      isCorrectNetwork: false,
    });
  };

  return { ...state, connect, disconnect };
}
