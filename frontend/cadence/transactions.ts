const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xf8d6e0586b0a20c7";
const FUNGIBLE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS || "0xee82856bf20e2aa6";
const NON_FUNGIBLE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_NON_FUNGIBLE_TOKEN_ADDRESS || "0xf8d6e0586b0a20c7";

export const SETUP_COLLECTION = `
import SmileCardToken from ${CONTRACT_ADDRESS}
import SmileCardNFT from ${CONTRACT_ADDRESS}
import NonFungibleToken from ${NON_FUNGIBLE_TOKEN_ADDRESS}
import StakingContract from ${CONTRACT_ADDRESS}

transaction(brandID: UInt64) {
    prepare(signer: auth(BorrowValue, SaveValue, Capabilities) &Account) {
        if signer.storage.borrow<&SmileCardToken.Vault>(from: SmileCardToken.VaultStoragePath) == nil {
            let vault <- SmileCardToken.createEmptyBrandVault(brandID: brandID)
            signer.storage.save(<- vault, to: SmileCardToken.VaultStoragePath)
            let vaultCap = signer.capabilities.storage.issue<&SmileCardToken.Vault>(SmileCardToken.VaultStoragePath)
            signer.capabilities.publish(vaultCap, at: SmileCardToken.VaultPublicPath)
        }
        if signer.storage.borrow<&SmileCardNFT.Collection>(from: SmileCardNFT.CollectionStoragePath) == nil {
            let collection <- SmileCardNFT.createEmptyCollection(nftType: Type<@SmileCardNFT.NFT>())
            signer.storage.save(<- collection, to: SmileCardNFT.CollectionStoragePath)
            let collectionCap = signer.capabilities.storage.issue<&SmileCardNFT.Collection>(SmileCardNFT.CollectionStoragePath)
            signer.capabilities.publish(collectionCap, at: SmileCardNFT.CollectionPublicPath)
        }
        if signer.storage.borrow<&StakingContract.StakeRecord>(from: StakingContract.StakeRecordStoragePath) == nil {
            let stakeRecord <- StakingContract.createStakeRecord()
            signer.storage.save(<- stakeRecord, to: StakingContract.StakeRecordStoragePath)
            let stakeCap = signer.capabilities.storage.issue<&StakingContract.StakeRecord>(StakingContract.StakeRecordStoragePath)
            signer.capabilities.publish(stakeCap, at: StakingContract.StakeRecordPublicPath)
        }
    }
}
`;

export const STAKE_TOKENS = `
import SmileCardToken from ${CONTRACT_ADDRESS}
import StakingContract from ${CONTRACT_ADDRESS}
import FungibleToken from ${FUNGIBLE_TOKEN_ADDRESS}

transaction(brandID: UInt64, amount: UFix64) {
    let vault: auth(FungibleToken.Withdraw) &SmileCardToken.Vault
    let stakeRecord: auth(StakingContract.StakeEntitlement) &StakingContract.StakeRecord

    prepare(signer: auth(BorrowValue) &Account) {
        self.vault = signer.storage.borrow<auth(FungibleToken.Withdraw) &SmileCardToken.Vault>(
            from: SmileCardToken.VaultStoragePath
        ) ?? panic("Could not borrow token vault")
        self.stakeRecord = signer.storage.borrow<auth(StakingContract.StakeEntitlement) &StakingContract.StakeRecord>(
            from: StakingContract.StakeRecordStoragePath
        ) ?? panic("Could not borrow stake record")
    }

    execute {
        let tokens <- self.vault.withdraw(amount: amount) as! @SmileCardToken.Vault
        self.stakeRecord.stake(from: <- tokens)
    }
}
`;

export const UNSTAKE_TOKENS = `
import StakingContract from ${CONTRACT_ADDRESS}

transaction(brandID: UInt64, amount: UFix64) {
    let stakeRecord: auth(StakingContract.StakeEntitlement) &StakingContract.StakeRecord

    prepare(signer: auth(BorrowValue) &Account) {
        self.stakeRecord = signer.storage.borrow<auth(StakingContract.StakeEntitlement) &StakingContract.StakeRecord>(
            from: StakingContract.StakeRecordStoragePath
        ) ?? panic("Could not borrow stake record")
    }

    execute {
        self.stakeRecord.requestUnstake(brandID: brandID, amount: amount)
    }
}
`;

export const CLAIM_UNSTAKED = `
import SmileCardToken from ${CONTRACT_ADDRESS}
import StakingContract from ${CONTRACT_ADDRESS}

transaction(index: Int) {
    let stakeRecord: auth(StakingContract.StakeEntitlement) &StakingContract.StakeRecord
    let vault: &SmileCardToken.Vault

    prepare(signer: auth(BorrowValue) &Account) {
        self.stakeRecord = signer.storage.borrow<auth(StakingContract.StakeEntitlement) &StakingContract.StakeRecord>(
            from: StakingContract.StakeRecordStoragePath
        ) ?? panic("Could not borrow stake record")
        self.vault = signer.storage.borrow<&SmileCardToken.Vault>(
            from: SmileCardToken.VaultStoragePath
        ) ?? panic("Could not borrow token vault")
    }

    execute {
        let tokens <- self.stakeRecord.claimUnstaked(index: index)
        self.vault.deposit(from: <- tokens)
    }
}
`;

export const CLAIM_CARD = `
import SmileCardNFT from ${CONTRACT_ADDRESS}
import StakingContract from ${CONTRACT_ADDRESS}
import NonFungibleToken from ${NON_FUNGIBLE_TOKEN_ADDRESS}

transaction(brandID: UInt64) {
    let minter: auth(SmileCardNFT.MinterEntitlement) &SmileCardNFT.NFTMinter
    let collection: &{NonFungibleToken.Collection}
    let stakeRecord: &{StakingContract.StakeRecordPublic}
    let recipientAddress: Address

    prepare(signer: auth(BorrowValue) &Account) {
        self.recipientAddress = signer.address
        self.minter = signer.storage.borrow<auth(SmileCardNFT.MinterEntitlement) &SmileCardNFT.NFTMinter>(
            from: SmileCardNFT.MinterStoragePath
        ) ?? panic("Could not borrow NFT minter")
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
`;

export const TRANSFER_TOKENS = `
import SmileCardToken from ${CONTRACT_ADDRESS}
import FungibleToken from ${FUNGIBLE_TOKEN_ADDRESS}

transaction(amount: UFix64, recipientAddress: Address) {
    let senderVault: auth(FungibleToken.Withdraw) &SmileCardToken.Vault

    prepare(signer: auth(BorrowValue) &Account) {
        self.senderVault = signer.storage.borrow<auth(FungibleToken.Withdraw) &SmileCardToken.Vault>(
            from: SmileCardToken.VaultStoragePath
        ) ?? panic("Could not borrow sender vault")
    }

    execute {
        let tokens <- self.senderVault.withdraw(amount: amount)
        let recipientAccount = getAccount(recipientAddress)
        let receiverRef = recipientAccount.capabilities.borrow<&SmileCardToken.Vault>(
            SmileCardToken.VaultPublicPath
        ) ?? panic("Recipient does not have a SmileCardToken vault")
        receiverRef.deposit(from: <- tokens)
    }
}
`;
