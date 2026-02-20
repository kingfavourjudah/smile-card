import "SmileCardToken"
import "FungibleToken"

transaction(amount: UFix64, recipientAddress: Address) {
    let senderVault: auth(FungibleToken.Withdraw) &SmileCardToken.Vault

    prepare(signer: auth(BorrowValue) &Account) {
        self.senderVault = signer.storage.borrow<auth(FungibleToken.Withdraw) &SmileCardToken.Vault>(
            from: SmileCardToken.VaultStoragePath
        ) ?? panic("Could not borrow sender vault")
    }

    execute {
        let tokens <- self.senderVault.withdraw(amount: amount)

        let recipientAccount = getAccount(recipientAddress)
        let receiverRef = recipientAccount.capabilities.borrow<&SmileCardToken.Vault>(
            SmileCardToken.VaultPublicPath
        ) ?? panic("Recipient does not have a SmileCardToken vault")

        receiverRef.deposit(from: <- tokens)
    }
}
