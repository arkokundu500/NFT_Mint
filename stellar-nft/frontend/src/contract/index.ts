import {
  SorobanRpc,
  Contract,
  TransactionBuilder,
  Address,
  scValToNative
} from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';
import { NFT, TxStatus } from '../types';

export class ContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContractError';
  }
}

const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID;
const NETWORK_PASSPHRASE = import.meta.env.VITE_NETWORK_PASSPHRASE;
const RPC_URL = import.meta.env.VITE_RPC_URL;
const BASE_FEE = '1000000'; // 0.1 XLM

if (!NETWORK_PASSPHRASE || !RPC_URL) {
  throw new Error('VITE_NETWORK_PASSPHRASE and VITE_RPC_URL must be defined');
}

export const server = new SorobanRpc.Server(RPC_URL, { allowHttp: true });

async function simulateRead(method: string, ...args: any[]): Promise<any> {
  if (!CONTRACT_ID) throw new ContractError('Contract ID not configured');
  
  const contract = new Contract(CONTRACT_ID);
  
  // Use a fixed funded account for read-only simulations on testnet
  // (Deployer: GDBQIPTMDWUVPYL634KKIYSAF5T4GSCPQGPBZOVVMUZCD535RMA4JQ7H)
  const source = 'GDBQIPTMDWUVPYL634KKIYSAF5T4GSCPQGPBZOVVMUZCD535RMA4JQ7H';
  let account;
  try {
    account = await server.getAccount(source);
  } catch (e) {
    // If deployer not found, fallback to zero address (may fail some simulations)
    account = await server.getAccount('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF');
  }

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(sim)) {
    throw new ContractError(`Simulation error: ${sim.error}`);
  }
  
  //@ts-ignore
  if (sim.result && sim.result.retval) {
    //@ts-ignore
    return scValToNative(sim.result.retval);
  }
  return null;
}

/**
 * Fetch all NFTs owned by a given public key
 */
export async function getNFTsOf(owner: string): Promise<NFT[]> {
  try {
    const ownerAddr = new Address(owner);
    const nfts = await simulateRead('get_nfts_of', ownerAddr.toScVal());
    if (!Array.isArray(nfts)) return [];
    
    return nfts.map((n: any) => ({
      id: Number(n.id),
      owner: owner,
    }));
  } catch (err) {
    console.error('Failed to get NFTs:', err);
    return [];
  }
}

/**
 * Fetch total number of minted NFTs
 */
export async function getTotalSupply(): Promise<number> {
  try {
    const total = await simulateRead('total_supply');
    return Number(total);
  } catch (err) {
    console.error('Failed to get total supply:', err);
    return 0;
  }
}

async function ensureFunded(address: string) {
  try {
    await server.getAccount(address);
  } catch (e) {
    console.log(`Account ${address} not found, funding via Friendbot...`);
    await fetch(`https://friendbot.stellar.org?addr=${address}`);
    // Wait a bit for ledger to close
    await new Promise(r => setTimeout(r, 2000));
  }
}

/**
 * Mint a new NFT to the given address; returns tx hash
 */
export async function mintNFT(
  to: string,
  onStatusChange: (status: TxStatus) => void
): Promise<{ txHash: string; nftId: number }> {
  if (!CONTRACT_ID) throw new ContractError('Contract ID not configured');

  try {
    onStatusChange('building');
    await ensureFunded(to);
    const account = await server.getAccount(to);
    const contract = new Contract(CONTRACT_ID);
    const toAddr = new Address(to);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call('mint', toAddr.toScVal()))
      .setTimeout(60)
      .build();

    // Simulate
    const sim = await server.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationError(sim)) {
      throw new ContractError(`Simulation failed: ${sim.error}`);
    }

    // Assemble footprint
    const assembledTx = await server.prepareTransaction(tx);

    // Sign with freighter
    onStatusChange('awaiting_signature');
    const signed = await signTransaction(assembledTx.toXDR(), {
      network: NETWORK_PASSPHRASE,
      networkPassphrase: NETWORK_PASSPHRASE
    });

    if (!signed) {
      throw new ContractError('User rejected signature.');
    }

    // Submit
    onStatusChange('submitting');
    // signed is the string XDR of the signed transaction payload
    const signedTx = TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE);
    const sendResult = await server.sendTransaction(signedTx);
    
    if (sendResult.status === 'ERROR') {
      console.error('SendTransaction full result:', sendResult);
      let errorMsg = 'Unknown RPC error';
      try {
        //@ts-ignore
        errorMsg = sendResult.errorResult.result().switch().name;
      } catch (e) {}
      throw new ContractError(`Submit failed: ${errorMsg}`);
    }

    // Poll
    onStatusChange('polling');
    const hash = sendResult.hash;
    let finalTx;
    for (let i = 0; i < 15; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        finalTx = await server.getTransaction(hash);
        if (finalTx.status !== 'NOT_FOUND') break;
    }

    if (!finalTx || finalTx.status === 'NOT_FOUND') {
      throw new ContractError('Transaction not found after polling 30 seconds.');
    }

    if (finalTx.status === 'FAILED') {
      throw new ContractError('Transaction failed on-chain.');
    }

    onStatusChange('success');
    
    // Parse result
    let newId = -1;
    //@ts-ignore
    if (finalTx.resultMetaXdr) {
       // Just deriving the ID indirectly from the total supply if needed, or if scVal isn't strictly returned
       // Actually `sim.result.retval` already has the returned ID from simulation.
       //@ts-ignore
       if (sim.result && sim.result.retval) {
           //@ts-ignore
           newId = Number(scValToNative(sim.result.retval));
       }
    }

    return { txHash: hash, nftId: newId };
  } catch (err: any) {
    onStatusChange('failed');
    throw new ContractError(err.message || 'Unknown error occurred.');
  }
}
