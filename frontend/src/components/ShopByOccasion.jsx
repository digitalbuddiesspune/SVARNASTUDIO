import CategoryInfoSection from './CategoryInfoSection'

const occasionItems = [
  { name: 'Wedding Festivities', meta: 'Rich weaves and statement silhouettes' },
  { name: 'Festive Gatherings', meta: 'Celebration-ready color palettes' },
  { name: 'Office Elegance', meta: 'Refined looks for professional settings' },
  { name: 'Everyday Classics', meta: 'Comfort-first pieces with graceful charm' },
]

function ShopByOccasion() {
  return (
    <CategoryInfoSection
      title="Shop by Occasion"
      tone="from-[#f8f3ec] to-[#efe5d8]"
      items={occasionItems}
    />
  )
}

export default ShopByOccasion
