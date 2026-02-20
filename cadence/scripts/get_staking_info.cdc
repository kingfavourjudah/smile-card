import "StakingContract"

access(all) struct StakingInfo {
    access(all) let stakedBrands: [UInt64]
    access(all) let balances: {UInt64: UFix64}
    access(all) let tiers: {UInt64: UInt8}
    access(all) let unstakeRequests: [StakingContract.UnstakeRequest]

    init(
        stakedBrands: [UInt64],
        balances: {UInt64: UFix64},
        tiers: {UInt64: UInt8},
        unstakeRequests: [StakingContract.UnstakeRequest]
    ) {
        self.stakedBrands = stakedBrands
        self.balances = balances
        self.tiers = tiers
        self.unstakeRequests = unstakeRequests
    }
}

access(all) fun main(address: Address): StakingInfo? {
    let account = getAccount(address)
    let stakeRecordRef = account.capabilities.borrow<&{StakingContract.StakeRecordPublic}>(
        StakingContract.StakeRecordPublicPath
    )

    if let stakeRecord = stakeRecordRef {
        let brands = stakeRecord.getAllStakedBrands()
        var balances: {UInt64: UFix64} = {}
        var tiers: {UInt64: UInt8} = {}

        for brandID in brands {
            balances[brandID] = stakeRecord.getStakedBalance(brandID: brandID)
            tiers[brandID] = stakeRecord.getTier(brandID: brandID)
        }

        return StakingInfo(
            stakedBrands: brands,
            balances: balances,
            tiers: tiers,
            unstakeRequests: stakeRecord.getUnstakeRequests()
        )
    }

    return nil
}
