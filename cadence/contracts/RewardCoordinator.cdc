import "SmileCardToken"
import "BrandRegistry"
import "ZKVerifier"

access(all) contract RewardCoordinator {

    access(self) let processedOrders: {String: Bool}
    access(self) let hashToAddress: {String: Address}
    access(self) let purchaseHistory: {String: {UInt64: UFix64}}

    access(all) let AdminStoragePath: StoragePath
    access(all) let BrandOperatorStoragePath: StoragePath

    access(all) event PurchaseRecorded(hashID: String, brandID: UInt64, orderID: String, amount: UFix64)
    access(all) event RewardIssued(hashID: String, brandID: UInt64, rewardAmount: UFix64)
    access(all) event UserRegistered(hashID: String)

    access(all) entitlement AdminEntitlement
    access(all) entitlement OperatorEntitlement

    access(all) resource BrandOperator {
        access(all) let brandID: UInt64

        init(brandID: UInt64) {
            self.brandID = brandID
        }

        access(OperatorEntitlement) fun recordPurchaseAndReward(
            hashID: String,
            orderID: String,
            purchaseAmount: UFix64,
            rewardVault: @SmileCardToken.Vault
        ): @SmileCardToken.Vault? {
            pre {
                rewardVault.brandID == self.brandID: "Reward vault must match brand"
            }
            assert(BrandRegistry.isBrandActive(brandID: self.brandID), message: "Brand is not active")

            let orderKey = self.brandID.toString().concat("_").concat(orderID)
            assert(
                !RewardCoordinator.processedOrders.containsKey(orderKey),
                message: "Order already processed"
            )

            RewardCoordinator.processedOrders[orderKey] = true

            if RewardCoordinator.purchaseHistory[hashID] == nil {
                RewardCoordinator.purchaseHistory[hashID] = {}
            }

            let currentSpent = RewardCoordinator.purchaseHistory[hashID]![self.brandID] ?? 0.0
            let inner = RewardCoordinator.purchaseHistory[hashID]!
            let updated = self.updateSpending(existing: inner, brandID: self.brandID, newAmount: currentSpent + purchaseAmount)
            RewardCoordinator.purchaseHistory[hashID] = updated

            emit PurchaseRecorded(hashID: hashID, brandID: self.brandID, orderID: orderID, amount: purchaseAmount)

            if let recipientAddress = RewardCoordinator.hashToAddress[hashID] {
                emit RewardIssued(hashID: hashID, brandID: self.brandID, rewardAmount: rewardVault.balance)
                return <- rewardVault
            }

            destroy rewardVault
            return nil
        }

        access(self) fun updateSpending(existing: {UInt64: UFix64}, brandID: UInt64, newAmount: UFix64): {UInt64: UFix64} {
            var copy = existing
            copy[brandID] = newAmount
            return copy
        }
    }

    access(all) resource Admin {
        access(AdminEntitlement) fun registerUser(hashID: String, address: Address) {
            pre {
                !RewardCoordinator.hashToAddress.containsKey(hashID): "User already registered"
            }
            RewardCoordinator.hashToAddress[hashID] = address
            emit UserRegistered(hashID: hashID)
        }

        access(AdminEntitlement) fun createBrandOperator(brandID: UInt64): @BrandOperator {
            assert(BrandRegistry.getBrand(brandID: brandID) != nil, message: "Brand does not exist")
            return <- create BrandOperator(brandID: brandID)
        }
    }

    access(all) fun isOrderProcessed(brandID: UInt64, orderID: String): Bool {
        let orderKey = brandID.toString().concat("_").concat(orderID)
        return self.processedOrders.containsKey(orderKey)
    }

    access(all) fun getUserAddress(hashID: String): Address? {
        return self.hashToAddress[hashID]
    }

    access(all) fun getTotalSpent(hashID: String, brandID: UInt64): UFix64 {
        if let history = self.purchaseHistory[hashID] {
            return history[brandID] ?? 0.0
        }
        return 0.0
    }

    access(all) fun getUserPurchaseHistory(hashID: String): {UInt64: UFix64} {
        return self.purchaseHistory[hashID] ?? {}
    }

    init() {
        self.processedOrders = {}
        self.hashToAddress = {}
        self.purchaseHistory = {}

        self.AdminStoragePath = /storage/RewardCoordinatorAdmin
        self.BrandOperatorStoragePath = /storage/RewardCoordinatorBrandOperator

        let admin <- create Admin()
        self.account.storage.save(<- admin, to: self.AdminStoragePath)
    }
}
