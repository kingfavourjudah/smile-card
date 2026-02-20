# SmileCard - Multi-Brand Loyalty Platform on Flow Blockchain

## Architecture
Purchase -> Brand Tokens -> Stake -> NFT Loyalty Card -> Perks

## Contract Dependency Order
1. SmileCardToken (FungibleToken)
2. BrandRegistry
3. StakingContract (imports SmileCardToken)
4. SmileCardNFT (imports NonFungibleToken, MetadataViews, StakingContract)
5. ZKVerifier
6. RewardCoordinator (imports SmileCardToken, BrandRegistry, ZKVerifier)

## Key Commands
- Start emulator: `flow emulator start`
- Deploy contracts: `flow project deploy --network emulator`
- Run tests: `flow test cadence/tests/`
- Frontend dev: `cd frontend && npm run dev`

## Emulator Addresses
- FungibleToken: 0xee82856bf20e2aa6
- NonFungibleToken: 0xf8d6e0586b0a20c7
- MetadataViews: 0xf8d6e0586b0a20c7
- All custom contracts: 0xf8d6e0586b0a20c7 (emulator-account)

## Tier Thresholds
- Bronze: 50 tokens staked
- Silver: 150 tokens staked
- Gold: 500 tokens staked

## Staking Rules
- Unstake delay: 7 days (604800 seconds)
- Stake cooldown: 1 day (86400 seconds)
- NFT loyalty cards: 1 per brand per user, 365-day expiry
