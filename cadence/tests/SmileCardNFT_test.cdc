import Test
import "SmileCardNFT"
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

    err = Test.deployContract(
        name: "SmileCardNFT",
        path: "../contracts/SmileCardNFT.cdc",
        arguments: []
    )
    Test.expect(err, Test.beNil())
}

access(all) fun testInitialSupply() {
    Test.assertEqual(SmileCardNFT.totalSupply, UInt64(0))
}

access(all) fun testNoMintedCard() {
    let addr = Test.getAccount(0xf8d6e0586b0a20c7)
    let cardID = SmileCardNFT.getMintedCardID(address: addr.address, brandID: 1)
    Test.assertEqual(cardID, nil as UInt64?)
}

access(all) fun testCollectionPaths() {
    Test.assertEqual(SmileCardNFT.CollectionStoragePath, /storage/SmileCardNFTCollection)
    Test.assertEqual(SmileCardNFT.CollectionPublicPath, /public/SmileCardNFTCollection)
}

access(all) fun testContractViews() {
    let views = SmileCardNFT.getContractViews(resourceType: nil)
    Test.assertEqual(views.length, 2)
}
