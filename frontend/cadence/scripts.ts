const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xf8d6e0586b0a20c7";

export const GET_ALL_BRANDS = `
import BrandRegistry from ${CONTRACT_ADDRESS}

access(all) fun main(): [BrandRegistry.BrandInfo] {
    return BrandRegistry.getAllBrands()
}
`;

export const GET_BRAND_INFO = `
import BrandRegistry from ${CONTRACT_ADDRESS}

access(all) fun main(brandID: UInt64): BrandRegistry.BrandInfo? {
    return BrandRegistry.getBrand(brandID: brandID)
}
`;

export const GET_TOKEN_BALANCE = `
import SmileCardToken from ${CONTRACT_ADDRESS}

access(all) fun main(address: Address): UFix64 {
    let account = getAccount(address)
    let vaultRef = account.capabilities.borrow<&SmileCardToken.Vault>(
        SmileCardToken.VaultPublicPath
    )
    if let vault = vaultRef {
        return vault.balance
    }
    return 0.0
}
`;

export const GET_STAKING_INFO = `
import StakingContract from ${CONTRACT_ADDRESS}

access(all) fun main(address: Address, brandID: UInt64): {String: AnyStruct} {
    let account = getAccount(address)
    let stakeRecordRef = account.capabilities.borrow<&{StakingContract.StakeRecordPublic}>(
        StakingContract.StakeRecordPublicPath
    )
    if let stakeRecord = stakeRecordRef {
        let balance = stakeRecord.getStakedBalance(brandID: brandID)
        let tier = stakeRecord.getTier(brandID: brandID)
        return {
            "balance": balance,
            "tier": tier,
            "tierName": StakingContract.tierName(tier: tier)
        }
    }
    return {}
}
`;

export const GET_TIER = `
import StakingContract from ${CONTRACT_ADDRESS}

access(all) fun main(address: Address, brandID: UInt64): UInt8 {
    let account = getAccount(address)
    let stakeRecordRef = account.capabilities.borrow<&{StakingContract.StakeRecordPublic}>(
        StakingContract.StakeRecordPublicPath
    )
    if let stakeRecord = stakeRecordRef {
        return stakeRecord.getTier(brandID: brandID)
    }
    return 0
}
`;

export const GET_NFT_IDS = `
import SmileCardNFT from ${CONTRACT_ADDRESS}

access(all) fun main(address: Address): [UInt64] {
    let account = getAccount(address)
    let collectionRef = account.capabilities.borrow<&SmileCardNFT.Collection>(
        SmileCardNFT.CollectionPublicPath
    )
    if let collection = collectionRef {
        return collection.getIDs()
    }
    return []
}
`;

export const GET_NFT_METADATA = `
import SmileCardNFT from ${CONTRACT_ADDRESS}
import StakingContract from ${CONTRACT_ADDRESS}

access(all) fun main(address: Address, nftID: UInt64): {String: AnyStruct}? {
    let account = getAccount(address)
    let collectionRef = account.capabilities.borrow<&SmileCardNFT.Collection>(
        SmileCardNFT.CollectionPublicPath
    )
    if let collection = collectionRef {
        if let nft = collection.borrowSmileCardNFT(id: nftID) {
            let metadata = nft.metadata
            return {
                "id": nft.id,
                "tier": metadata.tier,
                "tierName": StakingContract.tierName(tier: metadata.tier),
                "brandID": metadata.brandID,
                "issueDate": metadata.issueDate,
                "expiryDate": metadata.expiryDate,
                "perks": metadata.perks,
                "isLimitedEdition": metadata.isLimitedEdition,
                "editionNumber": metadata.editionNumber
            }
        }
    }
    return nil
}
`;
