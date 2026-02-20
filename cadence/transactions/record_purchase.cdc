import "SmileCardToken"
import "RewardCoordinator"

transaction(
    hashID: String,
    orderID: String,
    purchaseAmount: UFix64,
    rewardAmount: UFix64,
    brandID: UInt64
) {
    let operator: auth(RewardCoordinator.OperatorEntitlement) &RewardCoordinator.BrandOperator
    let minter: auth(SmileCardToken.Minter) &SmileCardToken.BrandMinter

    prepare(signer: auth(BorrowValue) &Account) {
        let operatorPath = StoragePath(identifier: "RewardCoordinatorBrandOperator_".concat(brandID.toString()))!
        self.operator = signer.storage.borrow<auth(RewardCoordinator.OperatorEntitlement) &RewardCoordinator.BrandOperator>(
            from: operatorPath
        ) ?? panic("Could not borrow BrandOperator")

        let minterPath = StoragePath(identifier: "SmileCardBrandMinter_".concat(brandID.toString()))!
        self.minter = signer.storage.borrow<auth(SmileCardToken.Minter) &SmileCardToken.BrandMinter>(
            from: minterPath
        ) ?? panic("Could not borrow BrandMinter")
    }

    execute {
        let rewardTokens <- self.minter.mintTokens(amount: rewardAmount)

        let returnedVault <- self.operator.recordPurchaseAndReward(
            hashID: hashID,
            orderID: orderID,
            purchaseAmount: purchaseAmount,
            rewardVault: <- rewardTokens
        )

        if let vault <- returnedVault {
            // Deliver to user's vault if they have one
            if let address = RewardCoordinator.getUserAddress(hashID: hashID) {
                let recipientAccount = getAccount(address)
                let receiverRef = recipientAccount.capabilities.borrow<&SmileCardToken.Vault>(
                    SmileCardToken.VaultPublicPath
                )
                if let receiver = receiverRef {
                    receiver.deposit(from: <- vault)
                } else {
                    destroy vault
                }
            } else {
                destroy vault
            }
        }
    }
}
