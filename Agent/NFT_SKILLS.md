# 🛠 SKILLS.md — Stellar NFT Minting dApp

All technical skill domains required to build, test, and deploy the `stellar-nft` decentralized NFT minting dApp on Stellar Soroban.

---

## 1. Rust — Soroban Smart Contract Development

**Proficiency Required:** Intermediate–Advanced

### What You Need to Know
- Write `#![no_std]` Rust compatible with the Soroban WebAssembly runtime
- Use Soroban SDK procedural macros correctly:
  - `#[contract]` — marks the contract struct
  - `#[contractimpl]` — marks the implementation block
  - `#[contracttype]` — marks enums/structs for on-chain serialization
- Model on-chain state using Soroban native types:
  - `Address` — represents a Stellar account or contract
  - `Vec<T>` — growable list stored on-chain
  - `Map<K, V>` — key/value map stored on-chain
  - `u32`, `Symbol`, `String` — primitives
- Use `env.storage().persistent()` for long-lived state with correct `DataKey` enum variants
- Implement `require_auth()` on `Address` for on-chain access control
- Understand Soroban's execution model: pure functions, deterministic, sandboxed
- Compile to `wasm32-unknown-unknown` target and optimize for minimum binary size
- Write unit tests using `soroban_sdk::testutils`:
  - `Env::default()` for a test environment
  - `Address::generate(&env)` for mock addresses
  - `register_contract` + `StellarNFTClient::new` pattern for calling contract in tests

### Tools & Commands
```bash
cargo build --target wasm32-unknown-unknown --release
cargo test
rustup target add wasm32-unknown-unknown
```

---

## 2. Stellar CLI — Testnet Operations

**Proficiency Required:** Intermediate

### What You Need to Know
- Install and configure the `stellar` CLI
- Create and manage key identities:
  - `stellar keys generate <name> --network testnet`
  - `stellar keys ls`
  - `stellar keys address <name>`
- Fund a testnet account via the Stellar Friendbot HTTP API
- Optimize the compiled WASM binary:
  - `stellar contract optimize --wasm <path>.wasm`
- Deploy a Soroban contract to testnet:
  - `stellar contract deploy --wasm <path> --network testnet --source <identity>`
  - Capture and store the returned `CONTRACT_ID`
- Invoke contract functions from the terminal:
  - `stellar contract invoke --id <CONTRACT_ID> --network testnet --source <identity> --fn <function> -- --arg value`
- Interpret CLI output (XDR, JSON, raw values)

### Tools
- `stellar` CLI (Stellar Developer Tools v20+)
- `curl` for Friendbot funding
- `bash` for automation scripts

---

## 3. Stellar JavaScript SDK

**Proficiency Required:** Advanced

### What You Need to Know
- Core imports from `@stellar/stellar-sdk`:
  - `SorobanRpc.Server` — connect to Soroban RPC node
  - `Contract` — load a deployed contract by ID
  - `TransactionBuilder` — construct Stellar transactions
  - `Networks` — access standard network passphrases
  - `Operation.invokeContractFunction` — build a Soroban invocation
  - `nativeToScVal`, `scValToNative` — encode/decode XDR ↔ JS values
  - `xdr.ScVal` — raw XDR type for arguments
- Full Soroban transaction lifecycle:
  1. **Simulate** — `server.simulateTransaction(tx)` to estimate fees + resources
  2. **Assemble** — `SorobanRpc.assembleTransaction(tx, sim)` to apply footprint
  3. **Sign** — pass XDR to Freighter for wallet signing
  4. **Submit** — `server.sendTransaction(signedTx)`
  5. **Poll** — `server.getTransaction(hash)` every 2s until `SUCCESS` or `FAILED`
- Read contract state without a transaction using `server.getContractData()`
- Parse Soroban return values from simulation response to get the minted NFT ID
- Handle error cases: `FAILED`, `NOT_FOUND`, simulation errors, fee bumps

### Tools
- `@stellar/stellar-sdk` npm package (v11+)
- Soroban RPC: `https://soroban-testnet.stellar.org`
- Horizon: `https://horizon-testnet.stellar.org`
- Stellar Expert (block explorer): `https://stellar.expert/explorer/testnet`

---

## 4. Freighter Wallet Integration

**Proficiency Required:** Intermediate

### What You Need to Know
- Detect Freighter extension availability: `isConnected()` from `@stellar/freighter-api`
- Request wallet access from user: `requestAccess()`
- Get connected public key: `getPublicKey()`
- Get network details: `getNetworkDetails()` — returns `{ networkPassphrase, network }`
- Sign a Stellar XDR transaction: `signTransaction(xdr, { networkPassphrase })`
- Validate that the user is on Stellar Testnet before allowing any action
- Handle extension-not-installed gracefully (prompt user to install)
- Handle user rejection of signature request gracefully (user clicked "Reject" in Freighter)

### Tools
- `@stellar/freighter-api` npm package (v1.7+)
- Freighter browser extension (Chrome / Brave / Firefox)

---

## 5. React + TypeScript Frontend

**Proficiency Required:** Intermediate–Advanced

### What You Need to Know

#### TypeScript
- Strict mode: `"strict": true` in `tsconfig.json`
- Zero use of `any` — type everything explicitly
- Define shared types in a single `types.ts` file
- Use discriminated union types for transaction status state machine

#### React Patterns
- Functional components only — no class components
- Custom hooks for all business logic (`useWallet`, `useNFTs`)
- React Context for sharing wallet state app-wide without prop drilling
- `useEffect` with correct dependency arrays to avoid stale closures
- `useCallback` and `useMemo` where appropriate for performance
- React `ErrorBoundary` class component wrapping the root tree

#### State Management
- `useState` for local component state
- `useReducer` for complex state machines (e.g., `TxState`)
- No Redux, no Zustand — keep it minimal

#### Async UI Patterns
- Every async operation has three states: `loading`, `success`, `error`
- Optimistic updates where possible (e.g., show new NFT immediately, revert on failure)
- Disable buttons and inputs during in-flight transactions
- Clear, human-readable error messages — never surface raw XDR or SDK errors to the user

#### Styling
- CSS Modules (`.module.css`) for component-scoped styles
- No external UI component libraries (no MUI, Chakra, shadcn)
- Responsive: CSS Grid with `auto-fill` + `minmax` for NFT card grid
- Dynamic inline styles for NFT card color tinting: `hsl((id * 47) % 360, 70%, 90%)`

### Tools
- Vite 5 (build + dev server)
- React 18 with concurrent features
- TypeScript 5.3+ strict mode
- CSS Modules (built into Vite)

---

## 6. Web3 Security Practices

**Proficiency Required:** Intermediate

### What You Need to Know
- **On-chain auth**: `to.require_auth()` in Rust ensures only the rightful owner can authorize a mint to their address
- **Network validation**: Always check `networkPassphrase` from Freighter before submitting any transaction — prevent mainnet accidents on testnet code
- **Key hygiene**: Deployer private keys live only in Stellar CLI identity store (`~/.config/stellar/identity/`), never in code or env files
- **`.env` safety**: Commit only `.env.example` with placeholder values; add `.env` to `.gitignore`
- **No secrets in frontend**: `VITE_*` variables are public — never put private keys or mnemonics in Vite env vars
- **Input validation**: Validate all user inputs on the frontend before constructing transactions

---

## 7. Bash Scripting & Deployment Automation

**Proficiency Required:** Basic–Intermediate

### What You Need to Know
- Write safe bash scripts with `set -euo pipefail` (exit on error, undefined vars, pipe failures)
- Extract and reuse values across scripts using sourced env files
- Use `curl` for HTTP requests (Friendbot API)
- Parse Stellar CLI text output to capture contract IDs
- Write `CONTRACT_ID` to `frontend/.env` automatically after deploy
- Smoke-test all contract functions via CLI after deployment to verify correctness

---

## 8. Project Organization

**Proficiency Required:** Intermediate

### What You Need to Know
- Maintain a clean monorepo with `contract/` and `frontend/` as completely independent units
- `contract/` has no knowledge of the frontend; `frontend/` only knows the deployed contract ID
- `scripts/` contains deployment and testing automation separate from both
- `README.md` at root level is the single source of truth for setup
- Follow conventional commit messages for traceability
- A new developer should be able to clone → follow README → have a working dApp in under 20 minutes

---

## Skill Summary Table

| # | Domain | Level | Primary Tools |
|---|---|---|---|
| 1 | Rust / Soroban SDK | Intermediate–Advanced | `soroban-sdk`, `cargo` |
| 2 | Stellar CLI & Testnet | Intermediate | `stellar` CLI, Friendbot |
| 3 | Stellar JS SDK | Advanced | `stellar-sdk`, Soroban RPC |
| 4 | Freighter Wallet | Intermediate | `@stellar/freighter-api` |
| 5 | React + TypeScript | Intermediate–Advanced | Vite, React 18, TS 5 |
| 6 | Web3 Security | Intermediate | Auth model, key hygiene |
| 7 | Bash Scripting | Basic–Intermediate | `deploy.sh`, `invoke-test.sh` |
| 8 | Project Organization | Intermediate | Monorepo, README, `.gitignore` |
