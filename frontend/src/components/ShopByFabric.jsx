import CategoryInfoSection from './CategoryInfoSection'

const fabricItems = [
  { name: 'Linen', meta: 'Breathable and effortless for summer days' },
  { name: 'Cotton', meta: 'Lightweight comfort for daily wear' },
  { name: 'Silk Blend', meta: 'Subtle sheen with rich drape' },
  { name: 'Chiffon', meta: 'Flowy silhouettes with delicate movement' },
]

function ShopByFabric() {
  return (
    <CategoryInfoSection
      title="Shop by Fabric"
      tone="from-[#f7ede2] to-[#f2ddcf]"
      items={fabricItems}
    />
  )
}

export default ShopByFabric
