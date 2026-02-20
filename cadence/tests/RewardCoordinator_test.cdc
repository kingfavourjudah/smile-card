import Test
import "RewardCoordinator"
import "BrandRegistry"

access(all) fun setup() {
    var err = Test.deployContract(
        name: "SmileCardToken",
        path: "../contracts/SmileCardToken.cdc",
        arguments: []
    )
    Test.expect(err, Test.beNil())

    err = Test.deployContract(
        name: "BrandRegistry",
        path: "../contracts/BrandRegistry.cdc",
        arguments: []
    )
    Test.expect(err, Test.beNil())

    err = Test.deployContract(
        name: "ZKVerifier",
        path: "../contracts/ZKVerifier.cdc",
        arguments: []
    )
    Test.expect(err, Test.beNil())

    err = Test.deployContract(
        name: "RewardCoordinator",
        path: "../contracts/RewardCoordinator.cdc",
        arguments: []
    )
    Test.expect(err, Test.beNil())
}

access(all) fun testInitialState() {
    let isProcessed = RewardCoordinator.isOrderProcessed(brandID: 1, orderID: "order-001")
    Test.assertEqual(isProcessed, false)
}

access(all) fun testGetUserAddressNotRegistered() {
    let addr = RewardCoordinator.getUserAddress(hashID: "nonexistent")
    Test.assertEqual(addr, nil as Address?)
}

access(all) fun testGetTotalSpentEmpty() {
    let spent = RewardCoordinator.getTotalSpent(hashID: "user1", brandID: 1)
    Test.assertEqual(spent, 0.0)
}

access(all) fun testGetPurchaseHistoryEmpty() {
    let history = RewardCoordinator.getUserPurchaseHistory(hashID: "user1")
    Test.assertEqual(history.length, 0)
}

access(all) fun testBrandRegistryInitialState() {
    let brands = BrandRegistry.getAllBrands()
    Test.assertEqual(brands.length, 0)
    Test.assertEqual(BrandRegistry.nextBrandID, UInt64(1))
}

access(all) fun testBrandNotActive() {
    let isActive = BrandRegistry.isBrandActive(brandID: 99)
    Test.assertEqual(isActive, false)
}
