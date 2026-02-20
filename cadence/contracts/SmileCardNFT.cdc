import "NonFungibleToken"
import "MetadataViews"
import "ViewResolver"
import "StakingContract"

access(all) contract SmileCardNFT: NonFungibleToken {

    access(all) var totalSupply: UInt64
    access(self) let mintedCards: {String: UInt64}

    access(all) let CollectionStoragePath: StoragePath
    access(all) let CollectionPublicPath: PublicPath
    access(all) let MinterStoragePath: StoragePath

    access(all) event NFTMinted(id: UInt64, brandID: UInt64, tier: UInt8, recipient: Address)

    access(all) entitlement MinterEntitlement

    access(all) struct CardMetadata {
        access(all) let tier: UInt8
        access(all) let brandID: UInt64
        access(all) let issueDate: UFix64
        access(all) let expiryDate: UFix64
        access(all) let perks: [String]
        access(all) let isLimitedEdition: Bool
        access(all) let editionNumber: UInt64

        init(
            tier: UInt8,
            brandID: UInt64,
            issueDate: UFix64,
            perks: [String],
            isLimitedEdition: Bool,
            editionNumber: UInt64
        ) {
            self.tier = tier
            self.brandID = brandID
            self.issueDate = issueDate
            self.expiryDate = issueDate + 31536000.0 // 365 days
            self.perks = perks
            self.isLimitedEdition = isLimitedEdition
            self.editionNumber = editionNumber
        }
    }

    access(all) resource NFT: NonFungibleToken.NFT {
        access(all) let id: UInt64
        access(all) let metadata: CardMetadata

        init(metadata: CardMetadata) {
            SmileCardNFT.totalSupply = SmileCardNFT.totalSupply + 1
            self.id = SmileCardNFT.totalSupply
            self.metadata = metadata
        }

        access(all) view fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>(),
                Type<MetadataViews.Traits>(),
                Type<MetadataViews.Serial>(),
                Type<MetadataViews.Editions>(),
                Type<MetadataViews.NFTCollectionData>(),
                Type<MetadataViews.NFTCollectionDisplay>()
            ]
        }

        access(all) fun resolveView(_ view: Type): AnyStruct? {
            let tierName = StakingContract.tierName(tier: self.metadata.tier)
            switch view {
                case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                        name: "SmileCard #".concat(self.id.toString()).concat(" - ").concat(tierName),
                        description: "SmileCard Loyalty NFT - ".concat(tierName).concat(" Tier for Brand #").concat(self.metadata.brandID.toString()),
                        thumbnail: MetadataViews.HTTPFile(url: "https://smilecard.io/cards/".concat(tierName.toLower()).concat(".png"))
                    )
                case Type<MetadataViews.Traits>():
                    let traits: [MetadataViews.Trait] = [
                        MetadataViews.Trait(name: "tier", value: tierName, displayType: "String", rarity: nil),
                        MetadataViews.Trait(name: "brandID", value: self.metadata.brandID, displayType: "Number", rarity: nil),
                        MetadataViews.Trait(name: "expiryDate", value: self.metadata.expiryDate, displayType: "Date", rarity: nil),
                        MetadataViews.Trait(name: "limitedEdition", value: self.metadata.isLimitedEdition, displayType: "Boolean", rarity: nil)
                    ]
                    return MetadataViews.Traits(traits)
                case Type<MetadataViews.Serial>():
                    return MetadataViews.Serial(self.id)
                case Type<MetadataViews.Editions>():
                    let edition = MetadataViews.Edition(
                        name: tierName.concat(" Loyalty Card"),
                        number: self.metadata.editionNumber,
                        max: nil
                    )
                    return MetadataViews.Editions([edition])
                case Type<MetadataViews.NFTCollectionData>():
                    return SmileCardNFT.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>())
                case Type<MetadataViews.NFTCollectionDisplay>():
                    return SmileCardNFT.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionDisplay>())
            }
            return nil
        }

        access(all) fun createEmptyCollection(): @{NonFungibleToken.Collection} {
            return <- SmileCardNFT.createEmptyCollection(nftType: Type<@SmileCardNFT.NFT>())
        }
    }

    access(all) resource Collection: NonFungibleToken.Collection {
        access(all) var ownedNFTs: @{UInt64: {NonFungibleToken.NFT}}

        init() {
            self.ownedNFTs <- {}
        }

        access(all) view fun getSupportedNFTTypes(): {Type: Bool} {
            return {Type<@SmileCardNFT.NFT>(): true}
        }

        access(all) view fun isSupportedNFTType(type: Type): Bool {
            return type == Type<@SmileCardNFT.NFT>()
        }

        access(NonFungibleToken.Withdraw) fun withdraw(withdrawID: UInt64): @{NonFungibleToken.NFT} {
            let token <- self.ownedNFTs.remove(key: withdrawID)
                ?? panic("NFT not found in collection")
            return <- token
        }

        access(all) fun deposit(token: @{NonFungibleToken.NFT}) {
            let nft <- token as! @SmileCardNFT.NFT
            let id = nft.id
            let old <- self.ownedNFTs[id] <- nft
            destroy old
        }

        access(all) view fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        access(all) view fun getLength(): Int {
            return self.ownedNFTs.length
        }

        access(all) view fun borrowNFT(_ id: UInt64): &{NonFungibleToken.NFT}? {
            return &self.ownedNFTs[id]
        }

        access(all) fun borrowSmileCardNFT(id: UInt64): &SmileCardNFT.NFT? {
            if let ref = &self.ownedNFTs[id] as &{NonFungibleToken.NFT}? {
                return ref as! &SmileCardNFT.NFT
            }
            return nil
        }

        access(all) fun createEmptyCollection(): @{NonFungibleToken.Collection} {
            return <- SmileCardNFT.createEmptyCollection(nftType: Type<@SmileCardNFT.NFT>())
        }
    }

    access(all) resource NFTMinter {
        access(MinterEntitlement) fun mintLoyaltyCard(
            recipientAddress: Address,
            brandID: UInt64,
            recipientCollection: &{NonFungibleToken.Collection},
            stakeRecord: &{StakingContract.StakeRecordPublic}
        ) {
            let tier = stakeRecord.getTier(brandID: brandID)
            assert(tier > 0, message: "Must have at least Bronze tier to mint loyalty card")

            let mintKey = recipientAddress.toString().concat("_").concat(brandID.toString())
            assert(
                SmileCardNFT.mintedCards[mintKey] == nil,
                message: "Already minted a loyalty card for this brand"
            )

            let perks = self.getPerksForTier(tier: tier)
            let metadata = CardMetadata(
                tier: tier,
                brandID: brandID,
                issueDate: getCurrentBlock().timestamp,
                perks: perks,
                isLimitedEdition: tier == 3,
                editionNumber: SmileCardNFT.totalSupply + 1
            )

            let nft <- create NFT(metadata: metadata)
            let nftID = nft.id

            SmileCardNFT.mintedCards[mintKey] = nftID

            emit NFTMinted(id: nftID, brandID: brandID, tier: tier, recipient: recipientAddress)
            recipientCollection.deposit(token: <- nft)
        }

        access(self) fun getPerksForTier(tier: UInt8): [String] {
            switch tier {
                case 1:
                    return ["5% discount", "Early access to sales"]
                case 2:
                    return ["10% discount", "Early access to sales", "Free shipping", "Birthday bonus"]
                case 3:
                    return ["20% discount", "Priority access", "Free shipping", "Birthday bonus", "Exclusive events", "Personal shopper"]
            }
            return []
        }
    }

    access(all) fun createEmptyCollection(nftType: Type): @{NonFungibleToken.Collection} {
        return <- create Collection()
    }

    access(all) view fun getContractViews(resourceType: Type?): [Type] {
        return [
            Type<MetadataViews.NFTCollectionData>(),
            Type<MetadataViews.NFTCollectionDisplay>()
        ]
    }

    access(all) fun resolveContractView(resourceType: Type?, viewType: Type): AnyStruct? {
        switch viewType {
            case Type<MetadataViews.NFTCollectionData>():
                return MetadataViews.NFTCollectionData(
                    storagePath: self.CollectionStoragePath,
                    publicPath: self.CollectionPublicPath,
                    publicCollection: Type<&SmileCardNFT.Collection>(),
                    publicLinkedType: Type<&SmileCardNFT.Collection>(),
                    createEmptyCollectionFunction: (fun(): @{NonFungibleToken.Collection} {
                        return <- SmileCardNFT.createEmptyCollection(nftType: Type<@SmileCardNFT.NFT>())
                    })
                )
            case Type<MetadataViews.NFTCollectionDisplay>():
                let media = MetadataViews.Media(
                    file: MetadataViews.HTTPFile(url: "https://smilecard.io/collection-banner.png"),
                    mediaType: "image/png"
                )
                return MetadataViews.NFTCollectionDisplay(
                    name: "SmileCard Loyalty Cards",
                    description: "Multi-brand loyalty NFT cards on Flow",
                    externalURL: MetadataViews.ExternalURL("https://smilecard.io"),
                    squareImage: media,
                    bannerImage: media,
                    socials: {}
                )
        }
        return nil
    }

    access(all) fun getMintedCardID(address: Address, brandID: UInt64): UInt64? {
        let key = address.toString().concat("_").concat(brandID.toString())
        return self.mintedCards[key]
    }

    init() {
        self.totalSupply = 0
        self.mintedCards = {}

        self.CollectionStoragePath = /storage/SmileCardNFTCollection
        self.CollectionPublicPath = /public/SmileCardNFTCollection
        self.MinterStoragePath = /storage/SmileCardNFTMinter

        let minter <- create NFTMinter()
        self.account.storage.save(<- minter, to: self.MinterStoragePath)
    }
}
