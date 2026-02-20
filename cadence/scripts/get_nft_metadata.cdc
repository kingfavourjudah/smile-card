import "SmileCardNFT"
import "NonFungibleToken"
import "MetadataViews"
import "StakingContract"

access(all) struct NFTMetadataView {
    access(all) let id: UInt64
    access(all) let tier: UInt8
    access(all) let tierName: String
    access(all) let brandID: UInt64
    access(all) let issueDate: UFix64
    access(all) let expiryDate: UFix64
    access(all) let perks: [String]
    access(all) let isLimitedEdition: Bool
    access(all) let editionNumber: UInt64

    init(
        id: UInt64,
        tier: UInt8,
        tierName: String,
        brandID: UInt64,
        issueDate: UFix64,
        expiryDate: UFix64,
        perks: [String],
        isLimitedEdition: Bool,
        editionNumber: UInt64
    ) {
        self.id = id
        self.tier = tier
        self.tierName = tierName
        self.brandID = brandID
        self.issueDate = issueDate
        self.expiryDate = expiryDate
        self.perks = perks
        self.isLimitedEdition = isLimitedEdition
        self.editionNumber = editionNumber
    }
}

access(all) fun main(address: Address, nftID: UInt64): NFTMetadataView? {
    let account = getAccount(address)
    let collectionRef = account.capabilities.borrow<&SmileCardNFT.Collection>(
        SmileCardNFT.CollectionPublicPath
    )

    if let collection = collectionRef {
        if let nft = collection.borrowSmileCardNFT(id: nftID) {
            let metadata = nft.metadata
            return NFTMetadataView(
                id: nft.id,
                tier: metadata.tier,
                tierName: StakingContract.tierName(tier: metadata.tier),
                brandID: metadata.brandID,
                issueDate: metadata.issueDate,
                expiryDate: metadata.expiryDate,
                perks: metadata.perks,
                isLimitedEdition: metadata.isLimitedEdition,
                editionNumber: metadata.editionNumber
            )
        }
    }

    return nil
}
