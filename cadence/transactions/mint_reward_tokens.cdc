import "SmileCardToken"

transaction(brandID: UInt64, amount: UFix64, recipientAddress: Address) {
    let minter: auth(SmileCardToken.Minter) &SmileCardToken.BrandMinter

    prepare(signer: auth(BorrowValue) &Account) {
        let minterPath = StoragePath(identifier: "SmileCardBrandMinter_".concat(brandID.toString()))!
        self.minter = signer.storage.borrow<auth(SmileCardToken.Minter) &SmileCardToken.BrandMinter>(
            from: minterPath
        ) ?? panic("Could not borrow BrandMinter for brand")
    }

    execute {
        let vault <- self.minter.mintTokens(amount: amount)

        let recipientAccount = getAccount(recipientAddress)
        let receiverRef = recipientAccount.capabilities.borrow<&{SmileCardToken.Vault}>(
            SmileCardToken.VaultPublicPath
        )

        if let receiver = receiverRef {
            receiver.deposit(from: <- vault)
        } else {
            destroy vault
            panic("Recipient does not have a SmileCardToken vault set up")
        }
    }
}
