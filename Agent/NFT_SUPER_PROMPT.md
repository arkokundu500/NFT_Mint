# 🚀 SUPER PROMPT — NFT Minting dApp on Stellar Soroban

---

## 🧠 SYSTEM CONTEXT

You are an expert full-stack Web3 engineer specializing in:
- **Rust** smart contract development using the **Soroban SDK**
- **Stellar blockchain** testnet deployment via the Stellar CLI
- **React (Vite) + TypeScript** frontend development
- **Freighter Wallet** integration via `@stellar/freighter-api`
- Clean, minimal, well-documented project structure

You write production-quality code — no pseudocode, no placeholder TODOs, no skipped implementations. Every file is complete, compiles without errors, and works end-to-end on Stellar Testnet.

---

## 📐 PROJECT OVERVIEW

| Field | Value |
|---|---|
| **Project Name** | `stellar-nft` |
| **Type** | NFT Minting dApp (Full-Stack Web3) |
| **Blockchain** | Stellar Soroban Testnet |
| **Contract Language** | Rust + Soroban SDK |
| **Frontend Language** | React + TypeScript + Vite |
| **Wallet** | Freighter Browser Extension |
| **IPFS** | Not required — metadata stored on-chain |

---

## 🗂 EXACT PROJECT STRUCTURE

Generate the following directory and file structure **exactly as shown**:

```
stellar-nft/
├── contract/                          # Soroban Rust smart contract
│   ├── Cargo.toml
│   ├── Cargo.lock
│   └── src/
│       └── lib.rs                     # Full NFT contract implementation
│
├── frontend/                          # React + Vite + TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx                   # App entry point + ErrorBoundary
│       ├── App.tsx                    # Root layout + context providers
│       ├── types.ts                   # All TypeScript types/interfaces
│       ├── contract/
│       │   └── index.ts               # Soroban contract interaction layer
│       ├── hooks/
│       │   ├── useWallet.ts           # Freighter wallet state + actions
│       │   └── useNFTs.ts             # NFT fetch, mint state + actions
│       └── components/
│           ├── ConnectWallet.tsx      # Wallet connection button + status
│           ├── MintButton.tsx         # Mint NFT button + tx status display
│           └── NFTCard.tsx            # Single NFT display card
│
├── scripts/
│   ├── deploy.sh                      # Build + deploy contract to testnet
│   ├── fund-account.sh                # Fund deployer via Friendbot
│   └── invoke-test.sh                 # CLI smoke tests for all functions
│
├── .env.example                       # Environment variable template
├── .gitignore                         # Ignore target/, node_modules/, .env
└── README.md                          # Full setup + deployment guide
```

---

## 📜 SMART CONTRACT SPECIFICATION (`contract/src/lib.rs`)

### Overview
A minimal on-chain NFT contract where each NFT has an ID, an owner address, and an auto-incrementing counter. No IPFS, no token URI, no royalties — pure ownership tracking.

---

### Data Structures

```rust
// Storage key enum — all on-chain state is keyed by this
#[contracttype]
pub enum DataKey {
    TotalSupply,          // u32 — tracks the next NFT ID
    Owner(u32),           // Address — maps NFT ID to owner
    OwnedNFTs(Address),   // Vec<u32> — maps owner to their list of NFT IDs
}

// NFT record returned to the frontend
#[contracttype]
#[derive(Clone)]
pub struct NFT {
    pub id: u32,
    pub owner: Address,
}
```

---

### Contract Interface

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `mint` | `env: Env, to: Address` | `u32` | Mints a new NFT to `to`; returns the new NFT ID |
| `owner_of` | `env: Env, nft_id: u32` | `Address` | Returns the owner of a given NFT ID |
| `get_nfts_of` | `env: Env, owner: Address` | `Vec<NFT>` | Returns all NFTs owned by an address |
| `total_supply` | `env: Env` | `u32` | Returns total number of minted NFTs |

---

### Contract Rules & Invariants
- NFT IDs start at **0** and increment by 1 with each mint
- `TotalSupply` is read before minting and used as the new NFT's ID, then incremented and saved
- `Owner(id)` maps a token ID to exactly one address
- `OwnedNFTs(address)` is a `Vec<u32>` appended to on each mint; never removed from
- `mint` must call `to.require_auth()` to ensure the caller is authorizing on their own behalf
- All state stored in `env.storage().persistent()`
- Contract must be `#![no_std]` compatible
- No transfer, burn, or approval functions — mint-only scope

---

### Complete `Cargo.toml`

```toml
[package]
name = "stellar-nft"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = { version = "20.0.0", features = ["alloc"] }

[dev-dependencies]
soroban-sdk = { version = "20.0.0", features = ["testutils"] }

[profile.release]
opt-level = "z"
overflow-checks = true
debug = 0
strip = "symbols"
debug-assertions = false
panic = "abort"
codegen-units = 1
lto = true
```

---

### Unit Tests (inside `#[cfg(test)]` module in `lib.rs`)

Write ALL of the following tests. They must all pass with `cargo test`:

| Test Name | What It Verifies |
|---|---|
| `test_mint_single` | Mint one NFT → ID is 0, owner is the minter, total_supply is 1 |
| `test_mint_multiple_same_owner` | Mint 3 NFTs to same address → IDs are 0,1,2; `get_nfts_of` returns all 3 |
| `test_mint_multiple_different_owners` | Mint to 2 different addresses → each owns only their respective NFTs |
| `test_owner_of` | Mint NFT → `owner_of(0)` returns correct address |
| `test_total_supply_increments` | Mint 5 NFTs → `total_supply()` returns 5 |
| `test_get_nfts_of_empty` | Query address that never minted → returns empty Vec |

---

## 🌐 FRONTEND SPECIFICATION

### Tech Stack
- **Vite 5 + React 18 + TypeScript 5** (strict mode, no `any`)
- **@stellar/stellar-sdk** v11+ for Soroban transactions
- **@stellar/freighter-api** v1.7+ for wallet connection and signing
- **CSS Modules** for component-level styling — no UI libraries, no Tailwind
- **No Redux** — React Context for wallet state, custom hooks for NFT state

---

### Environment Variables (`.env` / `.env.example`)

```env
VITE_CONTRACT_ID=C...                            # Deployed Soroban contract ID
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_RPC_URL=https://soroban-testnet.stellar.org
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
```

---

### `src/types.ts` — All TypeScript Types

```typescript
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
```

---

### `src/contract/index.ts` — Contract Client Layer

Implement and export these fully typed async functions:

```typescript
// Fetch all NFTs owned by a given public key
export async function getNFTsOf(owner: string): Promise<NFT[]>

// Fetch total number of minted NFTs
export async function getTotalSupply(): Promise<number>

// Mint a new NFT to the given address; returns tx hash
export async function mintNFT(
  to: string,
  onStatusChange: (status: TxStatus) => void
): Promise<{ txHash: string; nftId: number }>
```

Implementation requirements:
- Use `SorobanRpc.Server` from `stellar-sdk` for all RPC calls
- Use `Contract`, `TransactionBuilder`, `Networks`, `Operation` from `stellar-sdk`
- For `mintNFT`: build → simulate → assemble → sign with Freighter → submit → poll
- Call `onStatusChange` at each stage: `'building'`, `'awaiting_signature'`, `'submitting'`, `'polling'`, `'success'`/`'failed'`
- Use `nativeToScVal` and `scValToNative` for XDR encoding/decoding
- Poll with `server.getTransaction(hash)` every 2 seconds, timeout after 30 seconds
- Return the new NFT ID by reading the return value from the transaction result

---

### `src/hooks/useWallet.ts`

```typescript
interface UseWalletReturn {
  publicKey: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}
```

- Check Freighter on mount with `isConnected()` from `@stellar/freighter-api`
- On connect: call `requestAccess()` then `getPublicKey()` then `getNetworkDetails()`
- Compare `networkDetails.networkPassphrase` to `VITE_NETWORK_PASSPHRASE`
- Store state in `useState`; expose via return object
- On disconnect: clear all state

---

### `src/hooks/useNFTs.ts`

```typescript
interface UseNFTsReturn {
  nfts: NFT[];
  totalSupply: number;
  loading: boolean;
  txState: TxState;
  mint: () => Promise<void>;
  refresh: () => Promise<void>;
}
```

- On mount and when `publicKey` changes: call `getNFTsOf(publicKey)` and `getTotalSupply()`
- `mint()` calls `mintNFT(publicKey, onStatusChange)`, updates `txState` at each step
- On mint success: call `refresh()` to reload the NFT list
- On mint failure: set `txState.error` with a human-readable message
- `loading` is `true` during initial fetch only; `txState` tracks mint progress separately

---

### Component Specifications

#### `ConnectWallet.tsx`
- When disconnected: renders a single "Connect Freighter" button
- When connected: renders truncated public key (first 6 + `...` + last 4 chars) + "Disconnect" button
- When connected but wrong network: renders a red warning banner: `"⚠️ Please switch to Stellar Testnet in Freighter"`
- Reads state from `useWallet` hook (passed as props or via context)

#### `MintButton.tsx`
- Renders "Mint NFT" button
- Disabled when: wallet not connected, wrong network, or `txState.status !== 'idle'`
- Shows dynamic label based on `txState.status`:
  - `idle` → `"Mint NFT"`
  - `building` → `"Building transaction..."`
  - `awaiting_signature` → `"Sign in Freighter..."`
  - `submitting` → `"Submitting..."`
  - `polling` → `"Confirming on-chain..."`
  - `success` → `"✅ Minted!"`
  - `failed` → `"❌ Failed — Retry"`
- Below the button, shows a status strip:
  - On success: `"NFT #<id> minted! Tx: <short_hash>"` with a link to Stellar Expert
  - On error: the error message in red
- After success, resets back to `idle` after 4 seconds

#### `NFTCard.tsx`
- Props: `nft: NFT`
- Renders:
  - A colored card with the NFT ID prominently displayed: `"NFT #<id>"`
  - Owner address (truncated: first 6 + `...` + last 4)
  - A small "Stellar" badge or label
- Each card has a unique background tint derived from the NFT ID (e.g., `hsl((id * 47) % 360, 70%, 90%)`) — purely CSS, no images

---

### `App.tsx` Layout

```
┌─────────────────────────────────────┐
│  🌟 Stellar NFT Minter              │ ← App title (header)
│  [Connect Freighter]                │ ← ConnectWallet (top-right)
├─────────────────────────────────────┤
│  Total Supply: 12 NFTs              │ ← global stat
│  [Mint NFT]  ← MintButton           │
│  Building transaction...            │ ← TxStatus strip
├─────────────────────────────────────┤
│  Your NFTs (3)                      │ ← section heading
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ #0   │ │ #3   │ │ #7   │        │ ← NFTCard grid
│  └──────┘ └──────┘ └──────┘        │
└─────────────────────────────────────┘
```

- Header with title on left, `ConnectWallet` on right
- Stats row: total supply
- `MintButton` centered below stats
- NFT grid: CSS Grid, 3 columns on desktop, 2 on tablet, 1 on mobile
- Empty state when no NFTs: `"No NFTs yet. Mint your first one above!"`
- Global loading skeleton when fetching NFTs on mount

---

## 🔧 DEPLOYMENT SCRIPTS

### `scripts/fund-account.sh`
```bash
#!/usr/bin/env bash
set -euo pipefail
# Read public key from stellar keys
# Curl Friendbot: https://friendbot.stellar.org?addr=<KEY>
# Print success message with funded key
```

### `scripts/deploy.sh`
```bash
#!/usr/bin/env bash
set -euo pipefail
# 1. cargo build --target wasm32-unknown-unknown --release
# 2. stellar contract optimize --wasm target/wasm32-unknown-unknown/release/stellar_nft.wasm
# 3. stellar contract deploy --wasm ... --network testnet --source deployer
# 4. Print the CONTRACT_ID
# 5. Write CONTRACT_ID to frontend/.env as VITE_CONTRACT_ID=...
```

### `scripts/invoke-test.sh`
```bash
#!/usr/bin/env bash
set -euo pipefail
# Load CONTRACT_ID from frontend/.env
# 1. invoke mint -- --to <DEPLOYER_ADDRESS>
# 2. invoke total_supply
# 3. invoke owner_of -- --nft_id 0
# 4. invoke get_nfts_of -- --owner <DEPLOYER_ADDRESS>
# Print results for each call
```

---

## 📦 `package.json` (exact versions)

```json
{
  "name": "stellar-nft-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@stellar/freighter-api": "^1.7.1",
    "@stellar/stellar-sdk": "^11.2.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

---

## ✅ QUALITY CHECKLIST

Every file generated must meet these standards:

| Check | Requirement |
|---|---|
| TypeScript | Strict mode, zero `any`, all props typed |
| Rust | Compiles with `cargo build --target wasm32-unknown-unknown --release` |
| Tests | All 6 unit tests pass with `cargo test` |
| No TODOs | Every function fully implemented |
| Error handling | All async calls wrapped in try/catch with typed errors |
| Loading states | Every async action has a loading/disabled state in the UI |
| Responsive | Works on 320px mobile to 1440px desktop |
| Console | No `console.log` — only `console.error` for real errors |
| Security | No private keys in frontend; network validated before tx |

---

## 🔐 SECURITY REQUIREMENTS

- `mint` must call `to.require_auth()` on-chain — no one can mint to another address without their signature
- Frontend validates `networkPassphrase` matches testnet before allowing any transaction
- `.env` is never committed — only `.env.example` with placeholder values
- Deployer private key lives only in Stellar CLI identity store (`stellar keys`) — never in code or scripts

---

## 📝 FILE GENERATION ORDER

Generate every file in full, one at a time, in this exact order. Do not summarize or skip any file:

1. `contract/Cargo.toml`
2. `contract/src/lib.rs` ← full contract + all 6 unit tests
3. `.gitignore`
4. `.env.example`
5. `frontend/package.json`
6. `frontend/tsconfig.json`
7. `frontend/vite.config.ts`
8. `frontend/index.html`
9. `frontend/src/types.ts`
10. `frontend/src/contract/index.ts`
11. `frontend/src/hooks/useWallet.ts`
12. `frontend/src/hooks/useNFTs.ts`
13. `frontend/src/components/ConnectWallet.tsx`
14. `frontend/src/components/MintButton.tsx`
15. `frontend/src/components/NFTCard.tsx`
16. `frontend/src/App.tsx`
17. `frontend/src/main.tsx`
18. `scripts/fund-account.sh`
19. `scripts/deploy.sh`
20. `scripts/invoke-test.sh`
21. `README.md`

After generating each file, print: `✅ [filename] — complete` before proceeding to the next.
