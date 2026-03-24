# ✅ TASKS.md — Stellar NFT Minting dApp

Complete task breakdown for building and shipping the `stellar-nft` decentralized NFT minting dApp. Tasks are ordered by dependency — complete each phase before starting the next.

---

## Phase 1 — Environment Setup

- [ ] **T-001** Install Rust via `rustup`
  - Verify: `rustc --version`
- [ ] **T-002** Add the `wasm32-unknown-unknown` compilation target
  - `rustup target add wasm32-unknown-unknown`
  - Verify: `rustup target list --installed`
- [ ] **T-003** Install the Stellar CLI
  - Follow: https://developers.stellar.org/docs/tools/stellar-cli
  - Verify: `stellar --version`
- [ ] **T-004** Install Node.js (v20 LTS or later)
  - Verify: `node --version` and `npm --version`
- [ ] **T-005** Install the Freighter browser extension
  - Chrome/Brave: https://www.freighter.app
  - Set network to **Testnet** inside Freighter settings
- [ ] **T-006** Generate a Stellar testnet identity for contract deployment
  - `stellar keys generate deployer --network testnet`
  - `stellar keys address deployer` — note the public key
- [ ] **T-007** Initialize the project root directory `stellar-nft/`
  - Create all subdirectories: `contract/src/`, `frontend/src/`, `scripts/`
- [ ] **T-008** Initialize git repository at project root
  - `git init`
- [ ] **T-009** Create `.gitignore` at project root
  - Include: `target/`, `node_modules/`, `.env`, `*.wasm` (except optimized)

---

## Phase 2 — Smart Contract

### 2A — Contract Scaffolding

- [ ] **T-101** Create `contract/Cargo.toml`
  - Set `crate-type = ["cdylib"]`
  - Add `soroban-sdk = { version = "20.0.0", features = ["alloc"] }`
  - Add `[dev-dependencies]` with testutils feature
  - Set `[profile.release]` with full WASM optimizations
- [ ] **T-102** Create `contract/src/lib.rs` with `#![no_std]` declaration and module skeleton
- [ ] **T-103** Verify project compiles before adding logic
  - `cd contract && cargo build --target wasm32-unknown-unknown --release`

### 2B — Data Model

- [ ] **T-104** Define `DataKey` enum with `#[contracttype]`
  - Variants: `TotalSupply`, `Owner(u32)`, `OwnedNFTs(Address)`
- [ ] **T-105** Define `NFT` struct with `#[contracttype]` and `#[derive(Clone)]`
  - Fields: `id: u32`, `owner: Address`
- [ ] **T-106** Annotate contract struct with `#[contract]`

### 2C — Contract Functions

- [ ] **T-107** Implement `mint(env: Env, to: Address) -> u32`
  - Call `to.require_auth()`
  - Read `TotalSupply` (default 0 if unset)
  - Use current supply value as the new NFT ID
  - Write `Owner(id) = to`
  - Append `id` to `OwnedNFTs(to)` Vec (create if not exists)
  - Increment and write back `TotalSupply`
  - Return the new NFT ID
- [ ] **T-108** Implement `owner_of(env: Env, nft_id: u32) -> Address`
  - Read `Owner(nft_id)` — panic with descriptive message if not found
- [ ] **T-109** Implement `get_nfts_of(env: Env, owner: Address) -> Vec<NFT>`
  - Read `OwnedNFTs(owner)` — return empty Vec if not set
  - Map each ID to an `NFT { id, owner: owner.clone() }` struct
- [ ] **T-110** Implement `total_supply(env: Env) -> u32`
  - Read and return `TotalSupply` — default 0 if unset

### 2D — Unit Tests

- [ ] **T-111** Write `test_mint_single`
  - Create test env, register contract, mint 1 NFT
  - Assert ID == 0, `owner_of(0)` == minter, `total_supply()` == 1
- [ ] **T-112** Write `test_mint_multiple_same_owner`
  - Mint 3 NFTs to same address
  - Assert IDs are 0, 1, 2
  - Assert `get_nfts_of` returns 3 NFTs with correct IDs
- [ ] **T-113** Write `test_mint_multiple_different_owners`
  - Mint to address A (gets ID 0), mint to address B (gets ID 1)
  - Assert `get_nfts_of(A)` returns only NFT #0
  - Assert `get_nfts_of(B)` returns only NFT #1
- [ ] **T-114** Write `test_owner_of`
  - Mint 1 NFT, assert `owner_of(0)` returns the minter address
- [ ] **T-115** Write `test_total_supply_increments`
  - Mint 5 NFTs, assert `total_supply()` == 5
- [ ] **T-116** Write `test_get_nfts_of_empty`
  - Query a fresh address that has never minted
  - Assert result is an empty `Vec`
- [ ] **T-117** Run all tests and confirm they pass
  - `cargo test` — all 6 tests must show `ok`

---

## Phase 3 — Deployment Scripts

- [ ] **T-201** Create `scripts/fund-account.sh`
  - Get deployer public key via `stellar keys address deployer`
  - Call Friendbot: `curl https://friendbot.stellar.org?addr=<KEY>`
  - Print success confirmation
  - Make executable: `chmod +x scripts/fund-account.sh`
- [ ] **T-202** Create `scripts/deploy.sh`
  - Step 1: Build WASM — `cargo build --target wasm32-unknown-unknown --release`
  - Step 2: Optimize WASM — `stellar contract optimize --wasm ...`
  - Step 3: Deploy — `stellar contract deploy --wasm ... --network testnet --source deployer`
  - Step 4: Capture `CONTRACT_ID` from CLI output
  - Step 5: Write `VITE_CONTRACT_ID=<id>` to `frontend/.env`
  - Print `CONTRACT_ID` to terminal
  - Make executable: `chmod +x scripts/deploy.sh`
- [ ] **T-203** Create `scripts/invoke-test.sh`
  - Source `CONTRACT_ID` from `frontend/.env`
  - Invoke `mint` with deployer address
  - Invoke `total_supply` — print result
  - Invoke `owner_of` with `nft_id = 0` — print result
  - Invoke `get_nfts_of` with deployer address — print result
  - Make executable: `chmod +x scripts/invoke-test.sh`
- [ ] **T-204** Fund the deployer account: `./scripts/fund-account.sh`
- [ ] **T-205** Deploy the contract to testnet: `./scripts/deploy.sh`
  - Verify `CONTRACT_ID` is written to `frontend/.env`
- [ ] **T-206** Run smoke tests: `./scripts/invoke-test.sh`
  - Verify all 4 CLI invocations return expected values

---

## Phase 4 — Frontend Project Setup

- [ ] **T-301** Initialize Vite React TypeScript project
  - `npm create vite@latest frontend -- --template react-ts`
- [ ] **T-302** Install production dependencies
  - `npm install @stellar/stellar-sdk @stellar/freighter-api`
- [ ] **T-303** Configure `tsconfig.json`
  - Enable `"strict": true`
  - Enable `"moduleResolution": "bundler"`
  - Set `"target": "ES2020"`
- [ ] **T-304** Configure `vite.config.ts`
  - Add `@vitejs/plugin-react`
  - Add polyfill for `Buffer` (needed by Stellar SDK)
- [ ] **T-305** Create `frontend/.env` from `.env.example`
  - Fill in `VITE_CONTRACT_ID`, `VITE_RPC_URL`, `VITE_NETWORK_PASSPHRASE`
- [ ] **T-306** Create `.env.example` at project root with placeholder values
- [ ] **T-307** Verify Vite dev server starts without errors: `npm run dev`

---

## Phase 5 — Contract Client Layer

- [ ] **T-401** Create `frontend/src/types.ts`
  - Define: `NFT`, `TxStatus` (union type), `TxState`, `WalletState`
- [ ] **T-402** Create `frontend/src/contract/index.ts` with imports skeleton
- [ ] **T-403** Implement `getNFTsOf(owner: string): Promise<NFT[]>`
  - Use `server.getContractData` or simulate a read call
  - Decode XDR result to `NFT[]` using `scValToNative`
- [ ] **T-404** Implement `getTotalSupply(): Promise<number>`
  - Read `TotalSupply` from contract storage
- [ ] **T-405** Implement `mintNFT(to, onStatusChange): Promise<{ txHash, nftId }>`
  - Call `onStatusChange('building')` → build transaction
  - Call `onStatusChange('awaiting_signature')` → sign with Freighter
  - Call `onStatusChange('submitting')` → submit via `server.sendTransaction()`
  - Call `onStatusChange('polling')` → poll every 2s up to 30s
  - On success: call `onStatusChange('success')`, return `{ txHash, nftId }`
  - On failure: call `onStatusChange('failed')`, throw error with message
- [ ] **T-406** Add typed error class `ContractError` for all SDK failures
- [ ] **T-407** Test contract client functions manually in browser console

---

## Phase 6 — React Hooks

- [ ] **T-501** Create `frontend/src/hooks/useWallet.ts`
  - Check Freighter availability on mount
  - Implement `connect()`: `requestAccess()` → `getPublicKey()` → `getNetworkDetails()`
  - Implement `disconnect()`: reset all state
  - Compute `isCorrectNetwork` from `networkPassphrase` comparison
  - Return `{ publicKey, isConnected, isCorrectNetwork, connect, disconnect }`
- [ ] **T-502** Create `frontend/src/hooks/useNFTs.ts`
  - Fetch `getNFTsOf(publicKey)` and `getTotalSupply()` on mount and on `publicKey` change
  - Implement `mint()`:
    - Build `onStatusChange` callback that updates `txState`
    - Call `mintNFT(publicKey, onStatusChange)`
    - On success: call `refresh()`
    - On error: set `txState.error` with human-readable message
  - Implement `refresh()`: re-fetch NFTs and total supply
  - Return `{ nfts, totalSupply, loading, txState, mint, refresh }`
- [ ] **T-503** Test hooks by logging state changes in browser devtools

---

## Phase 7 — React Components

- [ ] **T-601** Create `frontend/src/components/ConnectWallet.tsx`
  - "Connect Freighter" button when disconnected
  - Truncated public key + "Disconnect" button when connected
  - Red warning banner when on wrong network
  - CSS Module: `ConnectWallet.module.css`
- [ ] **T-602** Create `frontend/src/components/MintButton.tsx`
  - Dynamic button label based on `TxStatus`
  - Disabled state during in-flight transaction or wallet not connected
  - Success strip: `"NFT #<id> minted! Tx: <hash>"` with Stellar Expert link
  - Error strip: red error message
  - Auto-reset to `idle` after 4 seconds on success
  - CSS Module: `MintButton.module.css`
- [ ] **T-603** Create `frontend/src/components/NFTCard.tsx`
  - Props: `nft: NFT`
  - Renders: `"NFT #<id>"`, truncated owner, Stellar badge
  - Dynamic background color: `hsl((nft.id * 47) % 360, 70%, 90%)`
  - CSS Module: `NFTCard.module.css`
- [ ] **T-604** Create `frontend/src/App.tsx`
  - Wallet context provider at root
  - Header with app title + `ConnectWallet` component
  - Stats row: total supply count
  - `MintButton` centered below stats
  - `"Your NFTs (N)"` section heading
  - CSS Grid of `NFTCard` components (3 cols desktop → 2 tablet → 1 mobile)
  - Empty state message when `nfts.length === 0`
  - Loading skeleton during initial fetch
  - CSS Module: `App.module.css`
- [ ] **T-605** Create `frontend/src/main.tsx`
  - Render `<App />` into `#root`
  - Wrap with `ErrorBoundary` class component
- [ ] **T-606** Create `index.html` with correct `<title>Stellar NFT Minter</title>`

---

## Phase 8 — Integration & QA

- [ ] **T-701** Start frontend dev server: `npm run dev`
- [ ] **T-702** Connect Freighter — verify public key appears in header
- [ ] **T-703** Verify NFT list loads from testnet (should be empty on fresh account)
- [ ] **T-704** Click "Mint NFT" — verify all 5 tx status transitions show correctly
- [ ] **T-705** After mint success — verify new NFT card appears in the grid
- [ ] **T-706** Verify NFT card shows correct ID, truncated owner, and unique color
- [ ] **T-707** Mint 3 more NFTs — verify all appear and total supply updates
- [ ] **T-708** Disconnect and reconnect wallet — verify NFT list reloads
- [ ] **T-709** Switch Freighter to wrong network — verify warning banner appears and Mint button is disabled
- [ ] **T-710** Check browser console — verify zero `console.log` statements
- [ ] **T-711** Test at 375px mobile width — verify single-column grid layout
- [ ] **T-712** Run `npm run build` — verify TypeScript compiles with zero errors

---

## Phase 9 — Documentation & Polish

- [ ] **T-801** Write complete `README.md` including:
  - Project description and screenshots (or ASCII art layout)
  - Prerequisites: Rust, Stellar CLI, Node 20+, Freighter extension
  - Step-by-step local setup (clone → install → env setup)
  - Contract deployment instructions (`fund-account.sh` → `deploy.sh`)
  - Frontend run instructions (`npm run dev`)
  - How to run contract unit tests (`cargo test`)
  - Environment variable reference table
  - Stellar Expert testnet link for verifying transactions
- [ ] **T-802** Add JSDoc comments to all exported functions in `contract/index.ts`
- [ ] **T-803** Add JSDoc comments to all exported hooks
- [ ] **T-804** Remove all debug `console.log` statements from frontend
- [ ] **T-805** Final audit of `.gitignore` — ensure `.env`, `target/`, `node_modules/` are excluded
- [ ] **T-806** Final commit with message: `feat: complete stellar-nft minting dApp`

---

## Task Summary Table

| Phase | Task Range | Count | Description |
|---|---|---|---|
| Phase 1 | T-001 → T-009 | 9 | Environment setup |
| Phase 2 | T-101 → T-117 | 17 | Smart contract + tests |
| Phase 3 | T-201 → T-206 | 6 | Deployment scripts + testnet |
| Phase 4 | T-301 → T-307 | 7 | Frontend project setup |
| Phase 5 | T-401 → T-407 | 7 | Contract client layer |
| Phase 6 | T-501 → T-503 | 3 | React hooks |
| Phase 7 | T-601 → T-606 | 6 | React components |
| Phase 8 | T-701 → T-712 | 12 | Integration & QA |
| Phase 9 | T-801 → T-806 | 6 | Docs & polish |
| **TOTAL** | | **73 tasks** | **Full project lifecycle** |

---

## ✔️ Definition of Done

A task is complete when **all** of the following are true:

1. Code compiles without errors (Rust) or TypeScript type errors
2. Related unit tests pass (`cargo test`)
3. Feature works end-to-end on Stellar Testnet in the browser
4. No `console.log` or debug artifacts left in the code
5. Change is committed with a meaningful commit message

---

## 🚦 Critical Path (Minimum to Demo)

If you want the fastest path to a working demo, complete these tasks in order:

```
T-001 → T-006 (setup)
T-101 → T-110 (contract, skip tests for now)
T-201 → T-206 (deploy to testnet)
T-301 → T-307 (frontend setup)
T-401 → T-405 (contract client, core only)
T-501 → T-502 (hooks)
T-601 → T-605 (components)
T-701 → T-705 (basic QA)
```

Then circle back to T-111–T-117 (tests) and T-801–T-806 (docs) to finish properly.
