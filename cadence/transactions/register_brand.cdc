import "SmileCardToken"
import "BrandRegistry"

transaction(
    name: String,
    description: String,
    logoURL: String,
    owner: Address,
    tokenMaxSupply: UFix64,
    rewardPerPurchase: UFix64
) {
    let tokenAdmin: auth(SmileCardToken.AdminEntitlement) &SmileCardToken.Admin
    let registryAdmin: auth(BrandRegistry.AdminEntitlement) &BrandRegistry.Admin
    let signerAccount: auth(SaveValue) &Account

    prepare(signer: auth(BorrowValue, SaveValue) &Account) {
        self.tokenAdmin = signer.storage.borrow<auth(SmileCardToken.AdminEntitlement) &SmileCardToken.Admin>(
            from: SmileCardToken.AdminStoragePath
        ) ?? panic("Could not borrow SmileCardToken Admin")

        self.registryAdmin = signer.storage.borrow<auth(BrandRegistry.AdminEntitlement) &BrandRegistry.Admin>(
            from: BrandRegistry.AdminStoragePath
        ) ?? panic("Could not borrow BrandRegistry Admin")

        self.signerAccount = signer
    }

    execute {
        let brandID = self.registryAdmin.registerBrand(
            name: name,
            description: description,
            logoURL: logoURL,
            owner: owner,
            tokenMaxSupply: tokenMaxSupply,
            rewardPerPurchase: rewardPerPurchase
        )

        let minter <- self.tokenAdmin.createBrand(name: name, maxSupply: tokenMaxSupply)
        let minterPath = StoragePath(identifier: "SmileCardBrandMinter_".concat(brandID.toString()))!
        self.signerAccount.storage.save(<- minter, to: minterPath)
    }
}
