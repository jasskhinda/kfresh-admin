require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Remaining products (weight is in the title, not as a separate field)
const products = [
  // Nestle Nido
  { title: 'Nestle Nido Milk Powder 400g', price: 14.99, category: 'Canned & Package Goods', short_description: 'Rich instant milk powder - 400g size.', description: 'Nestle Nido Instant Full Cream Milk Powder 400g. Rich, creamy, and fortified with vitamins. Perfect for drinking, cooking, and baking.', brand: 'Nestle Nido' },
  { title: 'Nestle Nido Milk Powder 900g', price: 38.00, category: 'Canned & Package Goods', short_description: 'Rich instant milk powder - 900g size.', description: 'Nestle Nido Instant Full Cream Milk Powder 900g. Rich, creamy, and fortified with vitamins. Family size for daily use.', brand: 'Nestle Nido' },
  { title: 'Nestle Nido Milk Powder 2.5kg', price: 90.00, category: 'Canned & Package Goods', short_description: 'Rich instant milk powder - 2.5kg bulk size.', description: 'Nestle Nido Instant Full Cream Milk Powder 2.5kg. Rich, creamy, and fortified with vitamins. Large family or commercial size.', brand: 'Nestle Nido' },

  // Peak Milk
  { title: 'Peak Milk Powder 400g', price: 14.99, category: 'Canned & Package Goods', short_description: 'Premium milk powder - 400g size.', description: 'Peak Powdered Milk 400g. Premium full cream milk powder rich in calcium and protein. Perfect for the whole family.', brand: 'Peak' },
  { title: 'Peak Milk Powder 900g', price: 38.00, category: 'Canned & Package Goods', short_description: 'Premium milk powder - 900g size.', description: 'Peak Powdered Milk 900g. Premium full cream milk powder rich in calcium and protein. Family size.', brand: 'Peak' },
  { title: 'Peak Milk Powder 2.5kg', price: 90.00, category: 'Canned & Package Goods', short_description: 'Premium milk powder - 2.5kg bulk size.', description: 'Peak Powdered Milk 2.5kg. Premium full cream milk powder rich in calcium and protein. Large family size.', brand: 'Peak' },

  // Bertie's Sauces
  { title: 'Bertie\'s Original Pepper Sauce 150ml (5oz)', price: 8.99, category: 'Hot Pepper Sauce', short_description: 'Authentic Trinidad pepper sauce - 150ml.', description: 'Bertie\'s Original Pepper Sauce 150ml. Made with fresh Trinidad Moruga Red and Scotch Bonnet peppers. Great flavor and heat!', brand: 'Bertie\'s' },
  { title: 'Bertie\'s Original Pepper Sauce 300ml (10oz)', price: 12.99, category: 'Hot Pepper Sauce', short_description: 'Authentic Trinidad pepper sauce - 300ml.', description: 'Bertie\'s Original Pepper Sauce 300ml. Made with fresh Trinidad Moruga Red and Scotch Bonnet peppers. Perfect medium size!', brand: 'Bertie\'s' },
  { title: 'Bertie\'s Original Pepper Sauce 500ml (17oz)', price: 14.99, category: 'Hot Pepper Sauce', short_description: 'Authentic Trinidad pepper sauce - 500ml.', description: 'Bertie\'s Original Pepper Sauce 500ml. Made with fresh Trinidad Moruga Red and Scotch Bonnet peppers. Great value size!', brand: 'Bertie\'s' },
  { title: 'Bertie\'s Original Pepper Sauce 750ml (25oz)', price: 24.99, category: 'Hot Pepper Sauce', short_description: 'Authentic Trinidad pepper sauce - 750ml.', description: 'Bertie\'s Original Pepper Sauce 750ml. Made with fresh Trinidad Moruga Red and Scotch Bonnet peppers. Large family or restaurant size!', brand: 'Bertie\'s' },
  { title: 'Bertie\'s Pimento Pepper Sauce 300ml (10oz)', price: 12.99, category: 'Hot Pepper Sauce', short_description: 'Aromatic pimento pepper sauce - 300ml.', description: 'Bertie\'s Pimento Pepper Sauce 300ml. Unique blend with aromatic pimento peppers. Perfect balance of flavor and heat.', brand: 'Bertie\'s' },
  { title: 'Bertie\'s Scorpion Pepper Sauce 150ml (5oz)', price: 15.99, category: 'Hot Pepper Sauce', short_description: 'Extremely hot Trinidad Scorpion sauce - 150ml.', description: 'Bertie\'s Scorpion Pepper Sauce 150ml. Made with Trinidad Scorpion peppers - extremely hot! Handle with care. For heat lovers only!', brand: 'Bertie\'s' },

  // Matouk's Sauces
  { title: 'Matouk\'s Hot Pepper Sauce 10oz', price: 6.66, category: 'Hot Pepper Sauce', short_description: 'Trinidad\'s favorite hot sauce - 10oz.', description: 'Matouk\'s Hot Pepper Sauce 10oz. Trinidad\'s classic hot sauce with bold, authentic flavor. Perfect everyday heat!', brand: 'Matouk\'s' },
  { title: 'Matouks Calypso Hot Pepper Sauce 10oz', price: 6.66, category: 'Hot Pepper Sauce', short_description: 'Caribbean Calypso sauce - 10oz.', description: 'Matouk\'s Calypso Hot Pepper Sauce 10oz. Medium heat with exceptional Caribbean flavor. A true classic!', brand: 'Matouk\'s' },
  { title: 'Matouk\'s Chadon Beni Hot Sauce 5.3oz', price: 6.66, category: 'Hot Pepper Sauce', short_description: 'Aromatic chadon beni sauce - 5.3oz.', description: 'Matouk\'s Chadon Beni Hot Sauce 5.3oz. Features distinctive culantro flavor. Aromatic and flavorful with moderate heat!', brand: 'Matouk\'s' },
  { title: 'Matouk\'s Trinidad Scorpion Pepper Sauce 10oz', price: 10.99, category: 'Hot Pepper Sauce', short_description: 'Extreme heat Trinidad Scorpion - 10oz.', description: 'Matouk\'s Trinidad Scorpion Pepper Sauce 10oz. One of the world\'s hottest peppers! Extreme heat with authentic flavor!', brand: 'Matouk\'s' },
  { title: 'Matouk\'s Tamarind Chutney 12oz', price: 6.99, category: 'Sauces & Condiments', short_description: 'Sweet tangy tamarind chutney - 12oz.', description: 'Matouk\'s Tamarind Chutney 12oz. Sweet and tangy sauce perfect for doubles and samosas. Authentic Caribbean flavor!', brand: 'Matouk\'s' },
  { title: 'Matouck\'s Soca hot Sauce 10oz', price: 6.66, category: 'Hot Pepper Sauce', short_description: 'Lively Soca hot sauce - 10oz.', description: 'Matouk\'s Soca Hot Sauce 10oz. Lively and flavorful with just the right heat. Perfect for everyday use!', brand: 'Matouk\'s' },

  // Slap Ya Mama
  { title: 'Original Blend Cajun Seasoning 227g', price: 12.00, category: 'Spices/Herbs/Seasonings', short_description: 'Authentic Louisiana Cajun seasoning - original.', description: 'Slap Ya Mama Original Blend Cajun Seasoning 227g. Authentic Louisiana spice blend for classic Cajun flavor!', brand: 'Slap Ya Mama' },
  { title: 'Hot Cajun Seasoning 227g', price: 12.99, category: 'Spices/Herbs/Seasonings', short_description: 'Spicy Louisiana Cajun seasoning - hot.', description: 'Slap Ya Mama Hot Cajun Seasoning 227g. Extra spicy Louisiana blend for those who love heat!', brand: 'Slap Ya Mama' },
  { title: 'Low Sodium Cajun Seasoning 170g', price: 12.99, category: 'Spices/Herbs/Seasonings', short_description: 'Low sodium Cajun seasoning - healthier option.', description: 'Slap Ya Mama Low Sodium Cajun Seasoning 170g. Same great flavor with reduced sodium. Health-conscious choice!', brand: 'Slap Ya Mama' },

  // KFresh Shito
  { title: 'KFresh Shito 250ml', price: 8.00, category: 'Sauces & Condiments', short_description: 'Traditional Ghanaian shito - 250ml.', description: 'KFresh Shito 250ml. Traditional Ghanaian hot pepper sauce with shrimp and spices. Rich and savory!', brand: 'KFresh' },
  { title: 'KFresh Shito 500ml', price: 16.00, category: 'Sauces & Condiments', short_description: 'Traditional Ghanaian shito - 500ml.', description: 'KFresh Shito 500ml. Traditional Ghanaian hot pepper sauce with shrimp and spices. Great value size!', brand: 'KFresh' },
  { title: 'KFresh Shito 5L', price: 140.00, category: 'Sauces & Condiments', short_description: 'Traditional Ghanaian shito - 5L bulk.', description: 'KFresh Shito 5L. Traditional Ghanaian hot pepper sauce with shrimp and spices. Bulk size for restaurants or large families!', brand: 'KFresh' },

  // White Gari
  { title: 'White Gari 3.5lbs', price: 7.50, category: 'Canned & Package Goods', short_description: 'Premium white gari - 3.5lbs.', description: 'White Gari 3.5lbs. Premium fermented cassava flour. Essential West African staple for eba or drinking!' },
  { title: 'White Gari 10lbs', price: 20.00, category: 'Canned & Package Goods', short_description: 'Premium white gari - 10lbs.', description: 'White Gari 10lbs. Premium fermented cassava flour. Family size for regular use!' },
  { title: 'White Gari 16lbs', price: 32.00, category: 'Canned & Package Goods', short_description: 'Premium white gari - 16lbs bulk.', description: 'White Gari 16lbs. Premium fermented cassava flour. Large family or bulk size!' },

  // Ijebu Gari
  { title: 'Ijebu Garri 4lbs', price: 8.00, category: 'Canned & Package Goods', short_description: 'Fine Ijebu gari - 4lbs.', description: 'Ijebu Gari 4lbs. Premium fine-grain gari from Ijebu region. Smooth texture!' },
  { title: 'Ijebu Garri 10lbs', price: 20.00, category: 'Canned & Package Goods', short_description: 'Fine Ijebu gari - 10lbs.', description: 'Ijebu Gari 10lbs. Premium fine-grain gari from Ijebu region. Family size!' },
  { title: 'Ijebu Garri 16lbs', price: 32.00, category: 'Canned & Package Goods', short_description: 'Fine Ijebu gari - 16lbs bulk.', description: 'Ijebu Gari 16lbs. Premium fine-grain gari from Ijebu region. Bulk size!' },

  // Yellow Gari
  { title: 'Yellow Gari 4lbs', price: 8.00, category: 'Canned & Package Goods', short_description: 'Yellow gari with palm oil - 4lbs.', description: 'Yellow Gari 4lbs. Traditional fermented cassava with palm oil. Rich flavor and color!' },
  { title: 'Yellow Gari 10lbs', price: 20.00, category: 'Canned & Package Goods', short_description: 'Yellow gari with palm oil - 10lbs.', description: 'Yellow Gari 10lbs. Traditional fermented cassava with palm oil. Family size!' },
  { title: 'Yellow Gari 16lbs', price: 32.00, category: 'Canned & Package Goods', short_description: 'Yellow gari with palm oil - 16lbs bulk.', description: 'Yellow Gari 16lbs. Traditional fermented cassava with palm oil. Bulk size!' }
]

async function addRemainingProducts() {
  console.log('➕ Adding remaining individual products...\n')

  const { data: categories } = await supabase.from('categories').select('*')

  let added = 0

  for (const product of products) {
    const category = categories.find(c =>
      c.name.toLowerCase().includes(product.category.toLowerCase()) ||
      c.slug.toLowerCase().includes(product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    )

    if (!category) {
      console.log(`❌ Category not found for: ${product.title}`)
      continue
    }

    const slug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(7)

    const productData = {
      name: product.title,
      slug: slug,
      short_description: product.short_description,
      description: product.description,
      price: product.price,
      category_id: category.id,
      brand: product.brand || null,
      stock_quantity: 100,
      is_featured: false,
      is_available: true
    }

    const { error } = await supabase
      .from('products')
      .insert([productData])

    if (error) {
      console.log(`❌ ${product.title}: ${error.message}`)
    } else {
      console.log(`✅ ${product.title} - $${product.price}`)
      added++
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('✨ COMPLETE!')
  console.log('='.repeat(80))
  console.log(`✅ Products added: ${added}`)

  const { data: finalCount } = await supabase.from('products').select('count')
  console.log(`📊 Total products in database: ${finalCount[0].count}`)
}

addRemainingProducts()
