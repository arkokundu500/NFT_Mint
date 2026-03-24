#!/bin/bash
set -e

# T-203: invoke-test.sh
# Reads contract ID and runs CLI smoke tests

ENV_FILE="../frontend/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found. Run deploy.sh first."
  exit 1
fi

CONTRACT_ID=$(grep VITE_CONTRACT_ID "$ENV_FILE" | cut -d '=' -f2)

if [ -z "$CONTRACT_ID" ]; then
  echo "Error: VITE_CONTRACT_ID is empty in $ENV_FILE"
  exit 1
fi

echo "Testing contract $CONTRACT_ID on Testnet..."

# Use deployer as the user for smoke test
USER_ADDR=$(stellar keys address deployer)

echo "1. Checking initial total supply..."
stellar contract invoke \
  --id $CONTRACT_ID \
  --source deployer \
  --network testnet \
  -- \
  total_supply

echo "2. Minting NFT to $USER_ADDR..."
stellar contract invoke \
  --id $CONTRACT_ID \
  --source deployer \
  --network testnet \
  -- \
  mint \
  --to $USER_ADDR

echo "3. Checking new total supply..."
stellar contract invoke \
  --id $CONTRACT_ID \
  --source deployer \
  --network testnet \
  -- \
  total_supply

echo "4. Checking NFTs owned by $USER_ADDR..."
stellar contract invoke \
  --id $CONTRACT_ID \
  --source deployer \
  --network testnet \
  -- \
  get_nfts_of \
  --owner $USER_ADDR

echo "All smoke tests passed!"
