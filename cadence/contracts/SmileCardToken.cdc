import "FungibleToken"
import "FungibleTokenMetadataViews"
import "MetadataViews"
import "ViewResolver"
import "Burner"

access(all) contract SmileCardToken: FungibleToken {

    access(all) var totalSupply: UFix64
    access(all) var nextBrandID: UInt64
    access(self) let brandSupplies: {UInt64: UFix64}
    access(self) let brandMaxSupplies: {UInt64: UFix64}
    access(self) let brandNames: {UInt64: String}

    access(all) let VaultStoragePath: StoragePath
    access(all) let VaultPublicPath: PublicPath
    access(all) let AdminStoragePath: StoragePath

    access(all) event TokensMinted(amount: UFix64, brandID: UInt64)
    access(all) event TokensBurned(amount: UFix64, brandID: UInt64)
    access(all) event BrandCreated(brandID: UInt64, name: String, maxSupply: UFix64)

    access(all) entitlement Minter
    access(all) entitlement AdminEntitlement

    access(all) resource Vault: FungibleToken.Vault {
        access(all) var balance: UFix64
        access(all) let brandID: UInt64

        init(balance: UFix64, brandID: UInt64) {
            self.balance = balance
            self.brandID = brandID
        }

        access(FungibleToken.Withdraw) fun withdraw(amount: UFix64): @{FungibleToken.Vault} {
            pre {
                self.balance >= amount: "Insufficient balance"
            }
            self.balance = self.balance - amount
            return <- create Vault(balance: amount, brandID: self.brandID)
        }

        access(all) fun deposit(from: @{FungibleToken.Vault}) {
            let vault <- from as! @SmileCardToken.Vault
            assert(vault.brandID == self.brandID, message: "Cannot deposit tokens from a different brand")
            self.balance = self.balance + vault.balance
            vault.balance = 0.0
            destroy vault
        }

        access(all) view fun getViews(): [Type] {
            return SmileCardToken.getContractViews(resourceType: nil)
        }

        access(all) fun resolveView(_ view: Type): AnyStruct? {
            return SmileCardToken.resolveContractView(resourceType: nil, viewType: view)
        }

        access(all) fun createEmptyVault(): @{FungibleToken.Vault} {
            return <- create Vault(balance: 0.0, brandID: self.brandID)
        }

        access(all) view fun isAvailableToWithdraw(amount: UFix64): Bool {
            return self.balance >= amount
        }
    }

    access(all) resource BrandMinter {
        access(all) let brandID: UInt64
        access(all) let maxSupply: UFix64

        init(brandID: UInt64, maxSupply: UFix64) {
            self.brandID = brandID
            self.maxSupply = maxSupply
        }

        access(Minter) fun mintTokens(amount: UFix64): @SmileCardToken.Vault {
            let currentSupply = SmileCardToken.brandSupplies[self.brandID] ?? 0.0
            assert(
                currentSupply + amount <= self.maxSupply,
                message: "Minting would exceed max supply for brand"
            )

            SmileCardToken.brandSupplies[self.brandID] = currentSupply + amount
            SmileCardToken.totalSupply = SmileCardToken.totalSupply + amount

            emit TokensMinted(amount: amount, brandID: self.brandID)
            return <- create Vault(balance: amount, brandID: self.brandID)
        }
    }

    access(all) resource Admin {
        access(AdminEntitlement) fun createBrand(name: String, maxSupply: UFix64): @BrandMinter {
            let brandID = SmileCardToken.nextBrandID
            SmileCardToken.brandNames[brandID] = name
            SmileCardToken.brandMaxSupplies[brandID] = maxSupply
            SmileCardToken.brandSupplies[brandID] = 0.0
            SmileCardToken.nextBrandID = SmileCardToken.nextBrandID + 1

            emit BrandCreated(brandID: brandID, name: name, maxSupply: maxSupply)
            return <- create BrandMinter(brandID: brandID, maxSupply: maxSupply)
        }
    }

    access(all) fun createEmptyBrandVault(brandID: UInt64): @Vault {
        pre {
            self.brandNames[brandID] != nil: "Brand does not exist"
        }
        return <- create Vault(balance: 0.0, brandID: brandID)
    }

    access(all) fun createEmptyVault(vaultType: Type): @{FungibleToken.Vault} {
        return <- create Vault(balance: 0.0, brandID: 0)
    }

    access(all) fun getBrandName(brandID: UInt64): String? {
        return self.brandNames[brandID]
    }

    access(all) fun getBrandSupply(brandID: UInt64): UFix64? {
        return self.brandSupplies[brandID]
    }

    access(all) fun getBrandMaxSupply(brandID: UInt64): UFix64? {
        return self.brandMaxSupplies[brandID]
    }

    access(all) fun getNextBrandID(): UInt64 {
        return self.nextBrandID
    }

    access(all) view fun getContractViews(resourceType: Type?): [Type] {
        return [
            Type<FungibleTokenMetadataViews.FTView>(),
            Type<FungibleTokenMetadataViews.FTDisplay>(),
            Type<FungibleTokenMetadataViews.FTVaultData>(),
            Type<FungibleTokenMetadataViews.TotalSupply>()
        ]
    }

    access(all) fun resolveContractView(resourceType: Type?, viewType: Type): AnyStruct? {
        switch viewType {
            case Type<FungibleTokenMetadataViews.FTView>():
                return FungibleTokenMetadataViews.FTView(
                    ftDisplay: self.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTDisplay>()) as! FungibleTokenMetadataViews.FTDisplay?,
                    ftVaultData: self.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
                )
            case Type<FungibleTokenMetadataViews.FTDisplay>():
                let media = MetadataViews.Media(
                    file: MetadataViews.HTTPFile(url: "https://smilecard.io/logo.png"),
                    mediaType: "image/png"
                )
                let medias = MetadataViews.Medias([media])
                return FungibleTokenMetadataViews.FTDisplay(
                    name: "SmileCard Token",
                    symbol: "SMILE",
                    description: "Multi-brand loyalty reward token on Flow",
                    externalURL: MetadataViews.ExternalURL("https://smilecard.io"),
                    logos: medias,
                    socials: {}
                )
            case Type<FungibleTokenMetadataViews.FTVaultData>():
                return FungibleTokenMetadataViews.FTVaultData(
                    storagePath: self.VaultStoragePath,
                    receiverPath: self.VaultPublicPath,
                    metadataPath: self.VaultPublicPath,
                    receiverLinkedType: Type<&SmileCardToken.Vault>(),
                    metadataLinkedType: Type<&SmileCardToken.Vault>(),
                    createEmptyVaultFunction: (fun(): @{FungibleToken.Vault} {
                        return <- SmileCardToken.createEmptyBrandVault(brandID: 0)
                    })
                )
            case Type<FungibleTokenMetadataViews.TotalSupply>():
                return FungibleTokenMetadataViews.TotalSupply(totalSupply: self.totalSupply)
        }
        return nil
    }

    init() {
        self.totalSupply = 0.0
        self.nextBrandID = 1
        self.brandSupplies = {}
        self.brandMaxSupplies = {}
        self.brandNames = {}

        self.VaultStoragePath = /storage/SmileCardTokenVault
        self.VaultPublicPath = /public/SmileCardTokenVault
        self.AdminStoragePath = /storage/SmileCardTokenAdmin

        let admin <- create Admin()
        self.account.storage.save(<- admin, to: self.AdminStoragePath)
    }
}
