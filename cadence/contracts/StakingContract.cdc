import "SmileCardToken"

access(all) contract StakingContract {

    access(all) let BRONZE_THRESHOLD: UFix64
    access(all) let SILVER_THRESHOLD: UFix64
    access(all) let GOLD_THRESHOLD: UFix64
    access(all) let UNSTAKE_DELAY: UFix64
    access(all) let STAKE_COOLDOWN: UFix64

    access(all) let StakeRecordStoragePath: StoragePath
    access(all) let StakeRecordPublicPath: PublicPath

    access(all) event TokensStaked(user: Address, brandID: UInt64, amount: UFix64)
    access(all) event UnstakeRequested(user: Address, brandID: UInt64, amount: UFix64, claimableAt: UFix64)
    access(all) event TokensUnstaked(user: Address, brandID: UInt64, amount: UFix64)

    access(all) entitlement StakeEntitlement

    access(all) struct UnstakeRequest {
        access(all) let brandID: UInt64
        access(all) let amount: UFix64
        access(all) let requestedAt: UFix64
        access(all) let claimableAt: UFix64

        init(brandID: UInt64, amount: UFix64, requestedAt: UFix64) {
            self.brandID = brandID
            self.amount = amount
            self.requestedAt = requestedAt
            self.claimableAt = requestedAt + StakingContract.UNSTAKE_DELAY
        }
    }

    access(all) resource interface StakeRecordPublic {
        access(all) fun getStakedBalance(brandID: UInt64): UFix64
        access(all) fun getTier(brandID: UInt64): UInt8
        access(all) fun getUnstakeRequests(): [UnstakeRequest]
        access(all) fun getAllStakedBrands(): [UInt64]
    }

    access(all) resource StakeRecord: StakeRecordPublic {
        access(self) var stakedVaults: @{UInt64: SmileCardToken.Vault}
        access(self) var unstakeRequests: [UnstakeRequest]
        access(self) var lastStakeTime: {UInt64: UFix64}

        init() {
            self.stakedVaults <- {}
            self.unstakeRequests = []
            self.lastStakeTime = {}
        }

        access(StakeEntitlement) fun stake(from: @SmileCardToken.Vault) {
            let brandID = from.brandID
            let amount = from.balance
            let now = getCurrentBlock().timestamp

            if let lastTime = self.lastStakeTime[brandID] {
                assert(
                    now - lastTime >= StakingContract.STAKE_COOLDOWN,
                    message: "Stake cooldown period has not elapsed"
                )
            }

            if self.stakedVaults[brandID] == nil {
                let emptyVault <- SmileCardToken.createEmptyBrandVault(brandID: brandID)
                let old <- self.stakedVaults[brandID] <- emptyVault
                destroy old
            }

            let vault <- self.stakedVaults.remove(key: brandID) ?? panic("Vault not found")
            vault.deposit(from: <- from)
            let old <- self.stakedVaults[brandID] <- vault
            destroy old
            self.lastStakeTime[brandID] = now

            emit TokensStaked(user: self.owner?.address ?? panic("No owner"), brandID: brandID, amount: amount)
        }

        access(StakeEntitlement) fun requestUnstake(brandID: UInt64, amount: UFix64) {
            pre {
                self.stakedVaults[brandID] != nil: "No staked tokens for this brand"
            }
            let balance = self.stakedVaults[brandID]?.balance ?? 0.0
            assert(balance >= amount, message: "Insufficient staked balance")

            let now = getCurrentBlock().timestamp
            let request = UnstakeRequest(brandID: brandID, amount: amount, requestedAt: now)
            self.unstakeRequests.append(request)

            emit UnstakeRequested(
                user: self.owner?.address ?? panic("No owner"),
                brandID: brandID,
                amount: amount,
                claimableAt: request.claimableAt
            )
        }

        access(StakeEntitlement) fun claimUnstaked(index: Int): @SmileCardToken.Vault {
            pre {
                index < self.unstakeRequests.length: "Invalid unstake request index"
            }
            let request = self.unstakeRequests[index]
            let now = getCurrentBlock().timestamp
            assert(now >= request.claimableAt, message: "Unstake delay has not elapsed")

            let brandID = request.brandID
            assert(self.stakedVaults[brandID] != nil, message: "No staked vault for brand")

            let stakedVault <- self.stakedVaults.remove(key: brandID) ?? panic("No staked vault for brand")
            let withdrawn <- stakedVault.withdraw(amount: request.amount)
            let old <- self.stakedVaults[brandID] <- stakedVault
            destroy old

            self.unstakeRequests.remove(at: index)

            emit TokensUnstaked(
                user: self.owner?.address ?? panic("No owner"),
                brandID: brandID,
                amount: request.amount
            )

            return <- withdrawn as! @SmileCardToken.Vault
        }

        access(all) fun getStakedBalance(brandID: UInt64): UFix64 {
            return self.stakedVaults[brandID]?.balance ?? 0.0
        }

        access(all) fun getTier(brandID: UInt64): UInt8 {
            let balance = self.getStakedBalance(brandID: brandID)
            return StakingContract.calculateTier(amount: balance)
        }

        access(all) fun getUnstakeRequests(): [UnstakeRequest] {
            return self.unstakeRequests
        }

        access(all) fun getAllStakedBrands(): [UInt64] {
            return self.stakedVaults.keys
        }
    }

    access(all) fun calculateTier(amount: UFix64): UInt8 {
        if amount >= self.GOLD_THRESHOLD {
            return 3
        } else if amount >= self.SILVER_THRESHOLD {
            return 2
        } else if amount >= self.BRONZE_THRESHOLD {
            return 1
        }
        return 0
    }

    access(all) fun tierName(tier: UInt8): String {
        switch tier {
            case 0:
                return "None"
            case 1:
                return "Bronze"
            case 2:
                return "Silver"
            case 3:
                return "Gold"
        }
        return "Unknown"
    }

    access(all) fun createStakeRecord(): @StakeRecord {
        return <- create StakeRecord()
    }

    init() {
        self.BRONZE_THRESHOLD = 50.0
        self.SILVER_THRESHOLD = 150.0
        self.GOLD_THRESHOLD = 500.0
        self.UNSTAKE_DELAY = 604800.0
        self.STAKE_COOLDOWN = 86400.0

        self.StakeRecordStoragePath = /storage/SmileCardStakeRecord
        self.StakeRecordPublicPath = /public/SmileCardStakeRecord
    }
}
