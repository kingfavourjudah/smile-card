import "BrandRegistry"

access(all) fun main(): [BrandRegistry.BrandInfo] {
    return BrandRegistry.getAllBrands()
}
