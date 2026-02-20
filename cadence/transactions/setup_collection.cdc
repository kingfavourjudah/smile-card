import "SmileCardToken"
import "SmileCardNFT"
import "NonFungibleToken"
import "StakingContract"

transaction(brandID: UInt64) {
    prepare(signer: auth(BorrowValue, SaveValue, Capabilities) &Account) {
        // Setup SmileCardToken Vault for this brand
        if signer.storage.borrow<&SmileCardToken.Vault>(from: SmileCardToken.VaultStoragePath) == nil {
            let vault <- SmileCardToken.createEmptyBrandVault(brandID: brandID)
            signer.storage.save(<- vault, to: SmileCardToken.VaultStoragePath)

            let vaultCap = signer.capabilities.storage.issue<&SmileCardToken.Vault>(SmileCardToken.VaultStoragePath)
            signer.capabilities.publish(vaultCap, at: SmileCardToken.VaultPublicPath)
        }

        // Setup NFT Collection
        if signer.storage.borrow<&SmileCardNFT.Collection>(from: SmileCardNFT.CollectionStoragePath) == nil {
            let collection <- SmileCardNFT.createEmptyCollection(nftType: Type<@SmileCardNFT.NFT>())
            signer.storage.save(<- collection, to: SmileCardNFT.CollectionStoragePath)

            let collectionCap = signer.capabilities.storage.issue<&SmileCardNFT.Collection>(SmileCardNFT.CollectionStoragePath)
            signer.capabilities.publish(collectionCap, at: SmileCardNFT.CollectionPublicPath)
        }

        // Setup StakeRecord
        if signer.storage.borrow<&StakingContract.StakeRecord>(from: StakingContract.StakeRecordStoragePath) == nil {
            let stakeRecord <- StakingContract.createStakeRecord()
            signer.storage.save(<- stakeRecord, to: StakingContract.StakeRecordStoragePath)

            let stakeCap = signer.capabilities.storage.issue<&StakingContract.StakeRecord>(StakingContract.StakeRecordStoragePath)
            signer.capabilities.publish(stakeCap, at: StakingContract.StakeRecordPublicPath)
        }
    }
}
