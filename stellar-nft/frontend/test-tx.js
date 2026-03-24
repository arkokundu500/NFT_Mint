const { SorobanRpc, TransactionBuilder, Contract, Address, Keypair } = require('@stellar/stellar-sdk');

async function run() {
  const SERVER = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
  const networkPassphrase = 'Test SDF Network ; September 2015';
  
  const contractId = require('fs').readFileSync('.env', 'utf8').match(/VITE_CONTRACT_ID=(.*)/)[1];
  const kp = Keypair.random();
  const to = kp.publicKey();

  // fund account just to make sure
  try { await fetch(`https://friendbot.stellar.org/?addr=${to}`); } catch(e) {}

  const account = await SERVER.getAccount(to);
  const contract = new Contract(contractId);
  
  console.log("Building tx...");
  const tx = new TransactionBuilder(account, { fee: '100000', networkPassphrase })
    .addOperation(contract.call('mint', new Address(to).toScVal()))
    .setTimeout(60)
    .build();

  console.log("Simulating...");
  const sim = await SERVER.simulateTransaction(tx);
  
  console.log("Preparing...");
  const assembledTx = await SERVER.prepareTransaction(tx);
  
  const xdr = assembledTx.toXDR();
  console.log("Assembled XDR: ", xdr.substring(0, 20) + '...');
  
  const parsedTx = TransactionBuilder.fromXDR(xdr, networkPassphrase);
  
  // Try sending without sig directly to see if it throws bad union switch or just "missing sig"
  console.log("Sending...");
  try {
    const res = await SERVER.sendTransaction(parsedTx);
    if (res.status === 'ERROR') {
         console.log("Error Result XDR:", res.errorResultXdr);
    }
    console.log("SendResult:", JSON.stringify(res, null, 2));
  } catch (e) {
    console.error("Caught error:", e);
  }
}
run().catch(console.dir);
