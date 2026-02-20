import "RewardCoordinator"

transaction(brandID: UInt64) {
    let admin: auth(RewardCoordinator.AdminEntitlement) &RewardCoordinator.Admin
    let signerAccount: auth(SaveValue) &Account

    prepare(signer: auth(BorrowValue, SaveValue) &Account) {
        self.admin = signer.storage.borrow<auth(RewardCoordinator.AdminEntitlement) &RewardCoordinator.Admin>(
            from: RewardCoordinator.AdminStoragePath
        ) ?? panic("Could not borrow RewardCoordinator Admin")

        self.signerAccount = signer
    }

    execute {
        let operator <- self.admin.createBrandOperator(brandID: brandID)
        let operatorPath = StoragePath(identifier: "RewardCoordinatorBrandOperator_".concat(brandID.toString()))!
        self.signerAccount.storage.save(<- operator, to: operatorPath)
    }
}
