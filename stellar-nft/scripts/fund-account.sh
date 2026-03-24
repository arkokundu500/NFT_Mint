#!/bin/bash
set -e

# T-201: fund-account.sh
# Generates a new identity if it doesn't exist, and funds it on Testnet

echo "Checking if identity 'deployer' exists..."
if ! stellar keys ls | grep -q 'deployer'; then
  echo "Generating new identity 'deployer'..."
  stellar keys generate deployer
else
  echo "Identity 'deployer' already exists."
fi

echo "Funding 'deployer' on testnet via Friendbot..."
stellar keys fund deployer --network testnet || true

echo "Account funded!"
stellar keys address deployer
