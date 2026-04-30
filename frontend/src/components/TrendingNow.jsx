import CategoryInfoSection from './CategoryInfoSection'

const trendingItems = [
  { name: 'Pastel Bloom Edits', meta: 'Soft tones inspired by modern bridal looks' },
  { name: 'Floral Print Stories', meta: 'Fresh motifs for day-to-evening styling' },
  { name: 'Minimal Gold Accents', meta: 'Quiet luxury with handcrafted detailing' },
  { name: 'Signature Drapes', meta: 'Most-loved silhouettes this season' },
]

function TrendingNow() {
  return (
    <CategoryInfoSection
      title="Trending Now"
      tone="from-[#f9efe8] to-[#f1dbcd]"
      items={trendingItems}
    />
  )
}

export default TrendingNow
