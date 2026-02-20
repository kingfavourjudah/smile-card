import "SmileCardToken"
import "StakingContract"

transaction(brandID: UInt64, amount: UFix64) {
    let vault: auth(SmileCardToken.Withdraw) &SmileCardToken.Vault
    let stakeRecord: auth(StakingContract.StakeEntitlement) &StakingContract.StakeRecord

    prepare(signer: auth(BorrowValue) &Account) {
        self.vault = signer.storage.borrow<auth(SmileCardToken.Withdraw) &SmileCardToken.Vault>(
            from: SmileCardToken.VaultStoragePath
        ) ?? panic("Could not borrow token vault")

        self.stakeRecord = signer.storage.borrow<auth(StakingContract.StakeEntitlement) &StakingContract.StakeRecord>(
            from: StakingContract.StakeRecordStoragePath
        ) ?? panic("Could not borrow stake record")
    }

    execute {
        let tokens <- self.vault.withdraw(amount: amount) as! @SmileCardToken.Vault
        self.stakeRecord.stake(from: <- tokens)
    }
}
