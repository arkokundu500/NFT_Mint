export interface NFT {
  id: number;
  owner: string;
}

export type TxStatus =
  | 'idle'
  | 'building'
  | 'awaiting_signature'
  | 'submitting'
  | 'polling'
  | 'success'
  | 'failed';

export interface TxState {
  status: TxStatus;
  txHash: string | null;
  error: string | null;
}

export interface WalletState {
  publicKey: string | null;
  isConnected: boolean;
  networkPassphrase: string | null;
  isCorrectNetwork: boolean;
}
