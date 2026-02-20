import "SmileCardToken"

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
