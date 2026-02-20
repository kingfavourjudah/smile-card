access(all) contract BrandRegistry {

    access(all) struct BrandInfo {
        access(all) let brandID: UInt64
        access(all) let name: String
        access(all) var description: String
        access(all) var logoURL: String
        access(all) let owner: Address
        access(all) let tokenMaxSupply: UFix64
        access(all) var rewardPerPurchase: UFix64
        access(all) var isActive: Bool
        access(all) let registeredAt: UFix64

        init(
            brandID: UInt64,
            name: String,
            description: String,
            logoURL: String,
            owner: Address,
            tokenMaxSupply: UFix64,
            rewardPerPurchase: UFix64,
            registeredAt: UFix64
        ) {
            self.brandID = brandID
            self.name = name
            self.description = description
            self.logoURL = logoURL
            self.owner = owner
            self.tokenMaxSupply = tokenMaxSupply
            self.rewardPerPurchase = rewardPerPurchase
            self.isActive = true
            self.registeredAt = registeredAt
        }

        access(contract) fun setDescription(_ desc: String) {
            self.description = desc
        }

        access(contract) fun setLogoURL(_ url: String) {
            self.logoURL = url
        }

        access(contract) fun setRewardPerPurchase(_ reward: UFix64) {
            self.rewardPerPurchase = reward
        }

        access(contract) fun setActive(_ active: Bool) {
            self.isActive = active
        }
    }

    access(self) let brands: {UInt64: BrandInfo}
    access(self) let ownerBrands: {Address: [UInt64]}
    access(all) var nextBrandID: UInt64

    access(all) let AdminStoragePath: StoragePath
    access(all) let BrandManagerStoragePath: StoragePath

    access(all) event BrandRegistered(brandID: UInt64, name: String, owner: Address)
    access(all) event BrandDeactivated(brandID: UInt64)
    access(all) event BrandUpdated(brandID: UInt64)

    access(all) entitlement AdminEntitlement
    access(all) entitlement BrandManagerEntitlement

    access(all) resource Admin {
        access(AdminEntitlement) fun registerBrand(
            name: String,
            description: String,
            logoURL: String,
            owner: Address,
            tokenMaxSupply: UFix64,
            rewardPerPurchase: UFix64
        ): UInt64 {
            let brandID = BrandRegistry.nextBrandID

            let info = BrandInfo(
                brandID: brandID,
                name: name,
                description: description,
                logoURL: logoURL,
                owner: owner,
                tokenMaxSupply: tokenMaxSupply,
                rewardPerPurchase: rewardPerPurchase,
                registeredAt: getCurrentBlock().timestamp
            )

            BrandRegistry.brands[brandID] = info

            if BrandRegistry.ownerBrands[owner] == nil {
                BrandRegistry.ownerBrands[owner] = []
            }
            BrandRegistry.ownerBrands[owner]!.append(brandID)

            BrandRegistry.nextBrandID = BrandRegistry.nextBrandID + 1

            emit BrandRegistered(brandID: brandID, name: name, owner: owner)
            return brandID
        }

        access(AdminEntitlement) fun deactivateBrand(brandID: UInt64) {
            pre {
                BrandRegistry.brands[brandID] != nil: "Brand does not exist"
            }
            BrandRegistry.brands[brandID]!.setActive(false)
            emit BrandDeactivated(brandID: brandID)
        }

        access(AdminEntitlement) fun updateBrand(
            brandID: UInt64,
            description: String?,
            logoURL: String?,
            rewardPerPurchase: UFix64?
        ) {
            pre {
                BrandRegistry.brands[brandID] != nil: "Brand does not exist"
            }
            if let desc = description {
                BrandRegistry.brands[brandID]!.setDescription(desc)
            }
            if let url = logoURL {
                BrandRegistry.brands[brandID]!.setLogoURL(url)
            }
            if let reward = rewardPerPurchase {
                BrandRegistry.brands[brandID]!.setRewardPerPurchase(reward)
            }
            emit BrandUpdated(brandID: brandID)
        }

        access(AdminEntitlement) fun createBrandManager(brandID: UInt64): @BrandManager {
            pre {
                BrandRegistry.brands[brandID] != nil: "Brand does not exist"
            }
            return <- create BrandManager(brandID: brandID)
        }
    }

    access(all) resource BrandManager {
        access(all) let brandID: UInt64

        init(brandID: UInt64) {
            self.brandID = brandID
        }

        access(BrandManagerEntitlement) fun updateDescription(_ description: String) {
            pre {
                BrandRegistry.brands[self.brandID] != nil: "Brand does not exist"
            }
            BrandRegistry.brands[self.brandID]!.setDescription(description)
            emit BrandUpdated(brandID: self.brandID)
        }

        access(BrandManagerEntitlement) fun updateLogoURL(_ logoURL: String) {
            pre {
                BrandRegistry.brands[self.brandID] != nil: "Brand does not exist"
            }
            BrandRegistry.brands[self.brandID]!.setLogoURL(logoURL)
            emit BrandUpdated(brandID: self.brandID)
        }

        access(BrandManagerEntitlement) fun updateRewardPerPurchase(_ reward: UFix64) {
            pre {
                BrandRegistry.brands[self.brandID] != nil: "Brand does not exist"
            }
            BrandRegistry.brands[self.brandID]!.setRewardPerPurchase(reward)
            emit BrandUpdated(brandID: self.brandID)
        }
    }

    access(all) view fun getBrand(brandID: UInt64): BrandInfo? {
        return self.brands[brandID]
    }

    access(all) fun getAllBrands(): [BrandInfo] {
        let result: [BrandInfo] = []
        for id in self.brands.keys {
            result.append(self.brands[id]!)
        }
        return result
    }

    access(all) fun getBrandsByOwner(owner: Address): [BrandInfo] {
        let result: [BrandInfo] = []
        if let brandIDs = self.ownerBrands[owner] {
            for id in brandIDs {
                if let brand = self.brands[id] {
                    result.append(brand)
                }
            }
        }
        return result
    }

    access(all) view fun isBrandActive(brandID: UInt64): Bool {
        if let brand = self.brands[brandID] {
            return brand.isActive
        }
        return false
    }

    init() {
        self.brands = {}
        self.ownerBrands = {}
        self.nextBrandID = 1

        self.AdminStoragePath = /storage/BrandRegistryAdmin
        self.BrandManagerStoragePath = /storage/BrandRegistryManager

        let admin <- create Admin()
        self.account.storage.save(<- admin, to: self.AdminStoragePath)
    }
}
