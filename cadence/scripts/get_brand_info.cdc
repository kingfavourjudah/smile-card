import "BrandRegistry"

access(all) fun main(brandID: UInt64): BrandRegistry.BrandInfo? {
    return BrandRegistry.getBrand(brandID: brandID)
}
