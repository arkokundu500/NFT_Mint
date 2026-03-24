#!/bin/bash
set -e

# T-202: deploy.sh
# Builds WASM, optimizes it, and deploys to Testnet, saving ID to .env
cd contract
echo "Building contract..."
cargo build --target wasm32-unknown-unknown --release

echo "Optimizing contract..."
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/stellar_nft.wasm

echo "Deploying to Testnet..."
CONTRACT_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellar_nft.optimized.wasm \
  --source deployer \
  --network testnet)

echo "Contract deployed successfully! ID: $CONTRACT_ID"

# Save to frontend env
ENV_FILE="../frontend/.env"
# Backup existing EXCEPT contract id
grep -v "^VITE_CONTRACT_ID=" "$ENV_FILE" > "${ENV_FILE}.tmp" || true
echo "VITE_CONTRACT_ID=$CONTRACT_ID" > "$ENV_FILE"
cat "${ENV_FILE}.tmp" >> "$ENV_FILE"
rm "${ENV_FILE}.tmp"

echo "Updated $ENV_FILE with new VITE_CONTRACT_ID"
