import "SmileCardNFT"
import "StakingContract"
import "NonFungibleToken"

transaction(brandID: UInt64) {
    let minter: auth(SmileCardNFT.MinterEntitlement) &SmileCardNFT.NFTMinter
    let collection: &{NonFungibleToken.Collection}
    let stakeRecord: &{StakingContract.StakeRecordPublic}
    let recipientAddress: Address

    prepare(signer: auth(BorrowValue) &Account) {
        self.recipientAddress = signer.address

        // Borrow the minter from the contract deployer account
        let contractAccount = getAccount(0xf8d6e0586b0a20c7)
        self.minter = signer.storage.borrow<auth(SmileCardNFT.MinterEntitlement) &SmileCardNFT.NFTMinter>(
            from: SmileCardNFT.MinterStoragePath
        ) ?? panic("Could not borrow NFT minter — this transaction must be run by the contract deployer")

        self.collection = signer.storage.borrow<&{NonFungibleToken.Collection}>(
            from: SmileCardNFT.CollectionStoragePath
        ) ?? panic("Could not borrow NFT collection")

        self.stakeRecord = signer.storage.borrow<&{StakingContract.StakeRecordPublic}>(
            from: StakingContract.StakeRecordStoragePath
        ) ?? panic("Could not borrow stake record")
    }

    execute {
        self.minter.mintLoyaltyCard(
            recipientAddress: self.recipientAddress,
            brandID: brandID,
            recipientCollection: self.collection,
            stakeRecord: self.stakeRecord
        )
    }
}
