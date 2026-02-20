# SmileCard

A multi-brand loyalty platform built on the Flow blockchain. Customers earn brand-specific tokens, stake them to unlock tier-based NFT loyalty cards, and shop with tier discounts across partnered brands.

**Live on Flow Testnet** — Contract address: `0x65f08673bf3a8fdc`

## How It Works

```
Connect Wallet → Pick a Brand → Mint Loyalty Card → Shop with Discounts
```

1. **Connect** — Users authenticate with a Flow-compatible wallet (Lilico, Blocto, etc.) via FCL Discovery.
2. **Mint a Card** — Choose from 3 partner brands. Minting sets up a token vault, NFT collection, and stake record on-chain in a single transaction.
3. **Shop** — Browse 12 products across 3 brands. Tier-based discounts are applied automatically.
4. **Checkout** — Apply a minted loyalty card as a promo card at checkout. Discount is calculated based on the card's tier (Bronze 5%, Silver 10%, Gold 20%).

## Architecture

```
Purchase → Brand Tokens → Stake → NFT Loyalty Card → Tier Perks
```

The platform uses 6 Cadence smart contracts that handle everything from token issuance to privacy-preserving reward distribution.

### Smart Contracts

| Contract | Purpose |
|---|---|
| **SmileCardToken** | FungibleToken implementation with brand-scoped vaults. Each brand has an isolated token supply — tokens from different brands cannot be mixed. |
| **BrandRegistry** | Central registry for brand metadata, ownership, and configuration. Tracks name, logo, reward rates, and active status. |
| **StakingContract** | Manages token staking for tier progression. Stake thresholds: Bronze (50), Silver (150), Gold (500). 7-day unstake delay, 1-day cooldown. |
| **SmileCardNFT** | NFT loyalty cards minted based on staking tier. One card per brand per user, 365-day expiry. Implements MetadataViews for Display, Traits, Serial, and Editions. |
| **ZKVerifier** | Zero-knowledge proof verification for privacy-preserving actions. Supports tier proofs, spending proofs, and unique user proofs using SHA3-256 hashing. |
| **RewardCoordinator** | Coordinates purchase recording and reward distribution using hash IDs instead of direct addresses for privacy. Prevents duplicate order processing. |

### Contract Dependency Chain

Contracts must be deployed in this order:

```
1. SmileCardToken (depends on FungibleToken)
2. BrandRegistry (standalone)
3. StakingContract (depends on SmileCardToken)
4. SmileCardNFT (depends on NonFungibleToken, MetadataViews, StakingContract)
5. ZKVerifier (standalone)
6. RewardCoordinator (depends on SmileCardToken, BrandRegistry, ZKVerifier)
```

### Tier System

| Tier | Tokens Staked | Discount | Perks |
|------|--------------|----------|-------|
| Bronze | 50+ | 5% | Basic rewards, early access |
| Silver | 150+ | 10% | Enhanced rewards, priority support |
| Gold | 500+ | 20% | Premium rewards, exclusive offers, VIP events |

## Frontend

Next.js 14 (App Router) with TypeScript, Tailwind CSS, and FCL for blockchain interaction.

### Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — hero section, "how it works" steps, brand showcase with mint CTAs, tier info |
| `/shop` | Product grid — 12 products across 3 brands, brand filter tabs, tier discount badges, add-to-cart |
| `/cart` | Shopping cart — quantity controls, promo card selection, tier-based savings calculation, checkout |
| `/cards` | My Cards — gallery of minted NFT loyalty cards with tier, perks, and expiry info |

### Mock Data (3 Brands, 12 Products)

**TechVibe** (Electronics) — Wireless Earbuds Pro (45 SMILE), Smart Watch Ultra (120 SMILE), Portable Charger X (25 SMILE), LED Desk Lamp (35 SMILE)

**StyleHaus** (Fashion) — Premium Hoodie (55 SMILE), Canvas Sneakers (80 SMILE), Leather Wallet (30 SMILE), Sunglasses Classic (40 SMILE)

**FreshBite** (Food & Drinks) — Artisan Coffee Bundle (20 SMILE), Organic Snack Box (15 SMILE), Smoothie Pack 6x (28 SMILE), Gourmet Tea Set (22 SMILE)

### State Management

Two React Context providers handle client-side state:

- **CartProvider** — Cart items, quantities, totals, tier discount calculation, add/remove/clear operations.
- **MintedCardsProvider** — Tracks minted loyalty cards. Attempts on-chain fetch via FCL on wallet connect, falls back to local state. Prevents duplicate brand minting.

Provider nesting in layout: `FlowProviderWrapper > MintedCardsProvider > CartProvider`

### Cadence Integration

**6 Transactions** — `SETUP_COLLECTION` (initialize vault + collection + stake record), `STAKE_TOKENS`, `UNSTAKE_TOKENS`, `CLAIM_UNSTAKED`, `CLAIM_CARD` (mint NFT), `TRANSFER_TOKENS` (checkout).

**7 Scripts** — `GET_ALL_BRANDS`, `GET_BRAND_INFO`, `GET_TOKEN_BALANCE`, `GET_STAKING_INFO`, `GET_TIER`, `GET_NFT_IDS`, `GET_NFT_METADATA`.

All contract addresses are sourced from environment variables so the same codebase works across emulator, testnet, and mainnet.

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Flow CLI](https://developers.flow.com/tools/flow-cli) v2.x

### Install

```bash
cd frontend
npm install
```

### Environment Variables

Create `frontend/.env.local`:

**For testnet (current deployment):**
```env
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
NEXT_PUBLIC_CONTRACT_ADDRESS=0x65f08673bf3a8fdc
NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS=0x9a0766d93b6608b7
NEXT_PUBLIC_NON_FUNGIBLE_TOKEN_ADDRESS=0x631e88ae7f1d7c20
```

**For local emulator:**
```env
NEXT_PUBLIC_FLOW_NETWORK=emulator
NEXT_PUBLIC_FLOW_ACCESS_NODE=http://localhost:8888
NEXT_PUBLIC_CONTRACT_ADDRESS=0xf8d6e0586b0a20c7
NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS=0xee82856bf20e2aa6
NEXT_PUBLIC_NON_FUNGIBLE_TOKEN_ADDRESS=0xf8d6e0586b0a20c7
```

### Run

```bash
cd frontend
npm run dev
```

App runs at `http://localhost:3000`.

### Deploy Contracts (Emulator)

```bash
flow emulator start              # Terminal 1
flow project deploy --network emulator   # Terminal 2
```

### Deploy Contracts (Testnet)

1. Generate keys: `flow keys generate`
2. Create account at [faucet.flow.com/create-account](https://faucet.flow.com/create-account) with your public key
3. Fund account at [faucet.flow.com/fund-account](https://faucet.flow.com/fund-account)
4. Add the testnet account to `flow.json` under `accounts`
5. Deploy: `flow project deploy --network testnet --update`

## Standard Contract Addresses

| Contract | Emulator | Testnet | Mainnet |
|----------|----------|---------|---------|
| FungibleToken | `0xee82856bf20e2aa6` | `0x9a0766d93b6608b7` | `0xf233dcee88fe0abe` |
| NonFungibleToken | `0xf8d6e0586b0a20c7` | `0x631e88ae7f1d7c20` | `0x1d7e57aa55817448` |
| MetadataViews | `0xf8d6e0586b0a20c7` | `0x631e88ae7f1d7c20` | `0x1d7e57aa55817448` |

## Technical Issues & Fixes

### 1. FCL `currentUser.subscribe` TypeScript Mismatch

**Problem:** FCL's `currentUser.subscribe` returns a user object where `addr` is `string | undefined`, but our component interfaces expected `string | null`. This caused TypeScript compilation failures:

```
Type 'CurrentUser' is not assignable to type 'User'.
  Types of property 'addr' are incompatible.
```

**Fix:** Changed the user interface to use optional `addr?: string` instead of `addr: string | null`, and wrapped the subscribe call with an `any` cast to bypass FCL's internal type definitions:

```typescript
fcl.currentUser.subscribe((u: any) => setUser(u));
```

When accessing `user.addr`, extract it to a local const to narrow the type:

```typescript
const addr = user.addr;
if (!addr) return;
// addr is now narrowed to string
```

### 2. FungibleToken / NonFungibleToken Address Mismatch Across Networks

**Problem:** Transaction templates had standard contract addresses (FungibleToken, NonFungibleToken) hardcoded to emulator values (`0xee82856bf20e2aa6`, `0xf8d6e0586b0a20c7`). When switching to testnet, these addresses are different and transactions would fail.

**Fix:** Moved all standard contract addresses to environment variables:

```typescript
const FUNGIBLE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS || "0xee82856bf20e2aa6";
const NON_FUNGIBLE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_NON_FUNGIBLE_TOKEN_ADDRESS || "0xf8d6e0586b0a20c7";
```

Transaction templates now interpolate these variables instead of hardcoded addresses. The `.env.local` file sets the correct addresses per network.

### 3. Testnet Account Creation via CLI Fails

**Problem:** Running `flow accounts create --network testnet --key <pubkey>` failed with:

```
Invalid argument: address f8d6e0586b0a20c7 is invalid for chain flow-testnet
```

The CLI defaults `--signer` to `emulator-account` from `flow.json`, whose address is an emulator-only address that isn't valid on testnet.

**Fix:** Used the Flow faucet API directly instead of the CLI:

```bash
curl -s -X POST "https://faucet.flow.com/api/account" \
  -H "Content-Type: application/json" \
  -d '{"publicKey":"<your-128-char-hex-pubkey>","signatureAlgorithm":"ECDSA_P256","hashAlgorithm":"SHA3_256"}'
```

This returns the new account address. Note: the older faucet endpoints (`testnet-faucet.onflow.org`) redirect to `faucet.flow.com`, and the web-facing routes (`/v1/account`) return 405. The working programmatic endpoint is `/api/account`.

### 4. Minted Cards Not Showing After Mint

**Problem:** After minting a loyalty card, it wouldn't appear on the My Cards page or the cart's promo card selector. The cards page only queried on-chain data via FCL scripts, which requires the emulator to be running. In testnet or offline scenarios, newly minted cards had no local representation.

**Fix:** Created a `MintedCardsProvider` context that tracks cards both locally (in-memory) and on-chain:

- On wallet connect, attempts to fetch NFTs via `GET_NFT_IDS` / `GET_NFT_METADATA` scripts
- If on-chain fetch fails (no connection, no collection set up), falls back to locally stored cards
- When a user mints via `MintCard` component, the card is saved locally via `addCard()` immediately
- Both the `/cards` page and `/cart` promo card selector consume the same shared context

### 5. Stale `.next` Cache After Dependency Changes

**Problem:** After modifying dependencies or configuration, the dev server threw:

```
Cannot find module './vendor-chunks/@walletconnect.js'
```

**Fix:** Delete the `.next` build cache before rebuilding:

```bash
rm -rf frontend/.next
cd frontend && npm run dev
```

### 6. Port Conflicts on Dev Server

**Problem:** `EADDRINUSE` error when starting the dev server — port 3000 already in use by a previous process.

**Fix:** Kill the process occupying the port before starting:

```bash
kill -9 $(lsof -i:3000 -t)
cd frontend && npm run dev -p 3000
```

## Project Structure

```
smile-card/
├── cadence/
│   ├── contracts/
│   │   ├── SmileCardToken.cdc
│   │   ├── BrandRegistry.cdc
│   │   ├── StakingContract.cdc
│   │   ├── SmileCardNFT.cdc
│   │   ├── ZKVerifier.cdc
│   │   └── RewardCoordinator.cdc
│   └── tests/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Landing
│   │   ├── globals.css
│   │   ├── shop/page.tsx     # Product grid
│   │   ├── cart/page.tsx     # Shopping cart
│   │   └── cards/page.tsx    # My Cards
│   ├── cadence/
│   │   ├── transactions.ts   # 6 transaction templates
│   │   └── scripts.ts        # 7 script templates
│   ├── components/
│   │   ├── CartProvider.tsx
│   │   ├── MintedCardsProvider.tsx
│   │   ├── FlowProviderWrapper.tsx
│   │   ├── ConnectWallet.tsx
│   │   ├── CartIcon.tsx
│   │   ├── MintCard.tsx
│   │   ├── ProductCard.tsx
│   │   ├── LoyaltyCard.tsx
│   │   └── BrandFilter.tsx
│   ├── config/
│   │   └── flow.ts           # FCL configuration
│   └── .env.local            # Network config (not committed)
└── flow.json                 # Contract sources, accounts, deployments
```

## Tech Stack

- **Blockchain**: Flow (Cadence 1.0)
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Wallet**: FCL (Flow Client Library) v1.12
- **Contracts**: 6 Cadence smart contracts (FungibleToken, NFT, Staking, ZK, Rewards)
- **Network**: Flow Testnet (deployed), Emulator (local dev)
