import "StakingContract"

access(all) struct TierInfo {
    access(all) let tier: UInt8
    access(all) let tierName: String
    access(all) let stakedBalance: UFix64

    init(tier: UInt8, tierName: String, stakedBalance: UFix64) {
        self.tier = tier
        self.tierName = tierName
        self.stakedBalance = stakedBalance
    }
}

access(all) fun main(address: Address, brandID: UInt64): TierInfo? {
    let account = getAccount(address)
    let stakeRecordRef = account.capabilities.borrow<&{StakingContract.StakeRecordPublic}>(
        StakingContract.StakeRecordPublicPath
    )

    if let stakeRecord = stakeRecordRef {
        let balance = stakeRecord.getStakedBalance(brandID: brandID)
        let tier = stakeRecord.getTier(brandID: brandID)
        return TierInfo(
            tier: tier,
            tierName: StakingContract.tierName(tier: tier),
            stakedBalance: balance
        )
    }

    return nil
}
