// Simple verification that images are working
const testUrls = [
  'https://tmufbgaxhtqgkvcngyxg.supabase.co/storage/v1/object/public/product-images/food/curry-goat-rice-peas.jpg',
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop'
]

async function testImageUrls() {
  console.log('🧪 Testing image URLs...')
  
  for (const url of testUrls) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      console.log(`${response.ok ? '✅' : '❌'} ${url.substring(0, 80)}... (${response.status})`)
    } catch (error) {
      console.log(`❌ ${url.substring(0, 80)}... - ${error.message}`)
    }
  }
}

testImageUrls()
