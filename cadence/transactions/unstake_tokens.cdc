import "StakingContract"

transaction(brandID: UInt64, amount: UFix64) {
    let stakeRecord: auth(StakingContract.StakeEntitlement) &StakingContract.StakeRecord

    prepare(signer: auth(BorrowValue) &Account) {
        self.stakeRecord = signer.storage.borrow<auth(StakingContract.StakeEntitlement) &StakingContract.StakeRecord>(
            from: StakingContract.StakeRecordStoragePath
        ) ?? panic("Could not borrow stake record")
    }

    execute {
        self.stakeRecord.requestUnstake(brandID: brandID, amount: amount)
    }
}
