import Test
import "StakingContract"

access(all) fun setup() {
    var err = Test.deployContract(
        name: "SmileCardToken",
        path: "../contracts/SmileCardToken.cdc",
        arguments: []
    )
    Test.expect(err, Test.beNil())

    err = Test.deployContract(
        name: "StakingContract",
        path: "../contracts/StakingContract.cdc",
        arguments: []
    )
    Test.expect(err, Test.beNil())
}

access(all) fun testTierThresholds() {
    Test.assertEqual(StakingContract.BRONZE_THRESHOLD, 50.0)
    Test.assertEqual(StakingContract.SILVER_THRESHOLD, 150.0)
    Test.assertEqual(StakingContract.GOLD_THRESHOLD, 500.0)
}

access(all) fun testCalculateTierNone() {
    let tier = StakingContract.calculateTier(amount: 0.0)
    Test.assertEqual(tier, UInt8(0))
}

access(all) fun testCalculateTierBronze() {
    let tier = StakingContract.calculateTier(amount: 50.0)
    Test.assertEqual(tier, UInt8(1))

    let tier2 = StakingContract.calculateTier(amount: 100.0)
    Test.assertEqual(tier2, UInt8(1))
}

access(all) fun testCalculateTierSilver() {
    let tier = StakingContract.calculateTier(amount: 150.0)
    Test.assertEqual(tier, UInt8(2))

    let tier2 = StakingContract.calculateTier(amount: 300.0)
    Test.assertEqual(tier2, UInt8(2))
}

access(all) fun testCalculateTierGold() {
    let tier = StakingContract.calculateTier(amount: 500.0)
    Test.assertEqual(tier, UInt8(3))

    let tier2 = StakingContract.calculateTier(amount: 1000.0)
    Test.assertEqual(tier2, UInt8(3))
}

access(all) fun testTierName() {
    Test.assertEqual(StakingContract.tierName(tier: 0), "None")
    Test.assertEqual(StakingContract.tierName(tier: 1), "Bronze")
    Test.assertEqual(StakingContract.tierName(tier: 2), "Silver")
    Test.assertEqual(StakingContract.tierName(tier: 3), "Gold")
}

access(all) fun testUnstakeDelay() {
    Test.assertEqual(StakingContract.UNSTAKE_DELAY, 604800.0)
}

access(all) fun testStakeCooldown() {
    Test.assertEqual(StakingContract.STAKE_COOLDOWN, 86400.0)
}

access(all) fun testBelowBronzeThreshold() {
    let tier = StakingContract.calculateTier(amount: 49.99)
    Test.assertEqual(tier, UInt8(0))
}
