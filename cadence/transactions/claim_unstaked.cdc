import "SmileCardToken"
import "StakingContract"

transaction(index: Int) {
    let stakeRecord: auth(StakingContract.StakeEntitlement) &StakingContract.StakeRecord
    let vault: &SmileCardToken.Vault

    prepare(signer: auth(BorrowValue) &Account) {
        self.stakeRecord = signer.storage.borrow<auth(StakingContract.StakeEntitlement) &StakingContract.StakeRecord>(
            from: StakingContract.StakeRecordStoragePath
        ) ?? panic("Could not borrow stake record")

        self.vault = signer.storage.borrow<&SmileCardToken.Vault>(
            from: SmileCardToken.VaultStoragePath
        ) ?? panic("Could not borrow token vault")
    }

    execute {
        let tokens <- self.stakeRecord.claimUnstaked(index: index)
        self.vault.deposit(from: <- tokens)
    }
}
