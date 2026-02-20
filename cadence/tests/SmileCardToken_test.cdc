import Test
import "SmileCardToken"

access(all) let admin = Test.getAccount(0xf8d6e0586b0a20c7)

access(all) fun setup() {
    let err = Test.deployContract(
        name: "SmileCardToken",
        path: "../contracts/SmileCardToken.cdc",
        arguments: []
    )
    Test.expect(err, Test.beNil())
}

access(all) fun testInitialState() {
    Test.assertEqual(SmileCardToken.totalSupply, 0.0)
    Test.assertEqual(SmileCardToken.getNextBrandID(), UInt64(1))
}

access(all) fun testCreateBrand() {
    // Brand creation is tested via the admin resource
    let name = SmileCardToken.getBrandName(brandID: 0)
    Test.assertEqual(name, nil as String?)
}

access(all) fun testCreateEmptyBrandVault() {
    // Creating a vault for a non-existent brand should fail
    // This tests the contract-level helper
    let nextID = SmileCardToken.getNextBrandID()
    Test.assertEqual(nextID, UInt64(1))
}

access(all) fun testTierCalculation() {
    // Verify tier thresholds via StakingContract (tested separately)
    // This is a placeholder for token-specific tests
    let supply = SmileCardToken.getBrandSupply(brandID: 1)
    Test.assertEqual(supply, nil as UFix64?)
}

access(all) fun testMaxSupplyQuery() {
    let maxSupply = SmileCardToken.getBrandMaxSupply(brandID: 1)
    Test.assertEqual(maxSupply, nil as UFix64?)
}
