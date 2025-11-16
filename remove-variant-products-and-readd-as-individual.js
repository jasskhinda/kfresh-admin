require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Products to remove (the ones we added with variants)
const productsToRemove = [
  'Big Foot',
  'Tastees Jamaican Patties',
  'Nestle Nido Milk Powder',
  'Peak Milk Powder',
  'Bertie\'s Original Pepper Sauce',
  'Bertie\'s Pimento Pepper Sauce',
  'Bertie\'s Scorpion Pepper Sauce',
  'Matouk\'s Hot Pepper Sauce',
  'Matouks Calypso Hot Pepper Sauce',
  'Matouk\'s Chadon Beni Hot Sauce',
  'Matouk\'s Trinidad Scorpion Pepper Sauce',
  'Matouk\'s Tamarind Chutney',
  'Matouck\'s Soca hot Sauce',
  'Slap Ya Mama Cajun Seasoning',
  'KFresh Shito',
  'White Gari',
  'Ijebu Garri',
  'Yellow Gari',
  'Vitamalt'
]

// All individual products from the document
const individualProducts = [
  // Big Foot
  { title: 'Big Foot 25g Spicy', price: 2.85, category: 'Snacks', short_description: 'Spicy Big Foot snack - bold Caribbean flavor.', description: 'Big Foot Spicy is a popular Caribbean snack with bold, fiery flavor. Crunchy and satisfying with a spicy kick. Perfect for snacking anytime. 25g package.', brand: 'Big Foot' },
  { title: 'Big Foot 25g Regular', price: 2.85, category: 'Snacks', short_description: 'Regular Big Foot snack - classic Caribbean flavor.', description: 'Big Foot Regular is a popular Caribbean snack with classic, savory flavor. Crunchy and delicious without the heat. Perfect for snacking anytime. 25g package.', brand: 'Big Foot' },

  // Tastees Patties
  { title: 'Tastees Jamaican Patties (Regular Spicy Beef)', price: 16.99, category: 'Frozen Foods', short_description: 'Authentic Jamaican beef patties with regular spice level.', description: 'Tastees Jamaican Patties with Regular Spicy Beef filling. Authentic flaky golden crust with seasoned beef. Perfect heat level for most palates. 1.2kg box.', brand: 'Tastees' },
  { title: 'Tastees Jamaican Patties (Extra Spicy Beef)', price: 16.99, category: 'Frozen Foods', short_description: 'Authentic Jamaican beef patties - extra hot!', description: 'Tastees Jamaican Patties with Extra Spicy Beef filling. For those who love extra heat! Authentic flaky crust with hot seasoned beef. 1.2kg box.', brand: 'Tastees' },
  { title: 'Tastees Jamaican Patties (Vegetarian)', price: 16.99, category: 'Frozen Foods', short_description: 'Authentic Jamaican vegetarian patties.', description: 'Tastees Jamaican Vegetarian Patties. Flaky golden crust with seasoned vegetable filling. Perfect meat-free option. 1.2kg box.', brand: 'Tastees' },

  // Nestle Nido
  { title: 'Nestle Nido Milk Powder 400g', price: 14.99, category: 'Canned & Package Goods', short_description: 'Rich instant milk powder - 400g size.', description: 'Nestle Nido Instant Full Cream Milk Powder 400g. Rich, creamy, and fortified with vitamins. Perfect for drinking, cooking, and baking.', brand: 'Nestle Nido', weight: '400g' },
  { title: 'Nestle Nido Milk Powder 900g', price: 38.00, category: 'Canned & Package Goods', short_description: 'Rich instant milk powder - 900g size.', description: 'Nestle Nido Instant Full Cream Milk Powder 900g. Rich, creamy, and fortified with vitamins. Family size for daily use.', brand: 'Nestle Nido', weight: '900g' },
  { title: 'Nestle Nido Milk Powder 2.5kg', price: 90.00, category: 'Canned & Package Goods', short_description: 'Rich instant milk powder - 2.5kg bulk size.', description: 'Nestle Nido Instant Full Cream Milk Powder 2.5kg. Rich, creamy, and fortified with vitamins. Large family or commercial size.', brand: 'Nestle Nido', weight: '2.5kg' },

  // Peak Milk
  { title: 'Peak Milk Powder 400g', price: 14.99, category: 'Canned & Package Goods', short_description: 'Premium milk powder - 400g size.', description: 'Peak Powdered Milk 400g. Premium full cream milk powder rich in calcium and protein. Perfect for the whole family.', brand: 'Peak', weight: '400g' },
  { title: 'Peak Milk Powder 900g', price: 38.00, category: 'Canned & Package Goods', short_description: 'Premium milk powder - 900g size.', description: 'Peak Powdered Milk 900g. Premium full cream milk powder rich in calcium and protein. Family size.', brand: 'Peak', weight: '900g' },
  { title: 'Peak Milk Powder 2.5kg', price: 90.00, category: 'Canned & Package Goods', short_description: 'Premium milk powder - 2.5kg bulk size.', description: 'Peak Powdered Milk 2.5kg. Premium full cream milk powder rich in calcium and protein. Large family size.', brand: 'Peak', weight: '2.5kg' },

  // Bertie's Sauces
  { title: 'Bertie\'s Original Pepper Sauce 150ml (5oz)', price: 8.99, category: 'Hot Pepper Sauce', short_description: 'Authentic Trinidad pepper sauce - 150ml.', description: 'Bertie\'s Original Pepper Sauce 150ml. Made with fresh Trinidad Moruga Red and Scotch Bonnet peppers. Great flavor and heat!', brand: 'Bertie\'s', weight: '150ml' },
  { title: 'Bertie\'s Original Pepper Sauce 300ml (10oz)', price: 12.99, category: 'Hot Pepper Sauce', short_description: 'Authentic Trinidad pepper sauce - 300ml.', description: 'Bertie\'s Original Pepper Sauce 300ml. Made with fresh Trinidad Moruga Red and Scotch Bonnet peppers. Perfect medium size!', brand: 'Bertie\'s', weight: '300ml' },
  { title: 'Bertie\'s Original Pepper Sauce 500ml (17oz)', price: 14.99, category: 'Hot Pepper Sauce', short_description: 'Authentic Trinidad pepper sauce - 500ml.', description: 'Bertie\'s Original Pepper Sauce 500ml. Made with fresh Trinidad Moruga Red and Scotch Bonnet peppers. Great value size!', brand: 'Bertie\'s', weight: '500ml' },
  { title: 'Bertie\'s Original Pepper Sauce 750ml (25oz)', price: 24.99, category: 'Hot Pepper Sauce', short_description: 'Authentic Trinidad pepper sauce - 750ml.', description: 'Bertie\'s Original Pepper Sauce 750ml. Made with fresh Trinidad Moruga Red and Scotch Bonnet peppers. Large family or restaurant size!', brand: 'Bertie\'s', weight: '750ml' },
  { title: 'Bertie\'s Pimento Pepper Sauce 300ml (10oz)', price: 12.99, category: 'Hot Pepper Sauce', short_description: 'Aromatic pimento pepper sauce - 300ml.', description: 'Bertie\'s Pimento Pepper Sauce 300ml. Unique blend with aromatic pimento peppers. Perfect balance of flavor and heat.', brand: 'Bertie\'s', weight: '300ml' },
  { title: 'Bertie\'s Scorpion Pepper Sauce 150ml (5oz)', price: 15.99, category: 'Hot Pepper Sauce', short_description: 'Extremely hot Trinidad Scorpion sauce - 150ml.', description: 'Bertie\'s Scorpion Pepper Sauce 150ml. Made with Trinidad Scorpion peppers - extremely hot! Handle with care. For heat lovers only!', brand: 'Bertie\'s', weight: '150ml' },

  // Matouk's Sauces
  { title: 'Matouk\'s Hot Pepper Sauce 10oz', price: 6.66, category: 'Hot Pepper Sauce', short_description: 'Trinidad\'s favorite hot sauce - 10oz.', description: 'Matouk\'s Hot Pepper Sauce 10oz. Trinidad\'s classic hot sauce with bold, authentic flavor. Perfect everyday heat!', brand: 'Matouk\'s', weight: '10oz' },
  { title: 'Matouks Calypso Hot Pepper Sauce 10oz', price: 6.66, category: 'Hot Pepper Sauce', short_description: 'Caribbean Calypso sauce - 10oz.', description: 'Matouk\'s Calypso Hot Pepper Sauce 10oz. Medium heat with exceptional Caribbean flavor. A true classic!', brand: 'Matouk\'s', weight: '10oz' },
  { title: 'Matouk\'s Chadon Beni Hot Sauce 5.3oz', price: 6.66, category: 'Hot Pepper Sauce', short_description: 'Aromatic chadon beni sauce - 5.3oz.', description: 'Matouk\'s Chadon Beni Hot Sauce 5.3oz. Features distinctive culantro flavor. Aromatic and flavorful with moderate heat!', brand: 'Matouk\'s', weight: '5.3oz' },
  { title: 'Matouk\'s Trinidad Scorpion Pepper Sauce 10oz', price: 10.99, category: 'Hot Pepper Sauce', short_description: 'Extreme heat Trinidad Scorpion - 10oz.', description: 'Matouk\'s Trinidad Scorpion Pepper Sauce 10oz. One of the world\'s hottest peppers! Extreme heat with authentic flavor!', brand: 'Matouk\'s', weight: '10oz' },
  { title: 'Matouk\'s Tamarind Chutney 12oz', price: 6.99, category: 'Sauces & Condiments', short_description: 'Sweet tangy tamarind chutney - 12oz.', description: 'Matouk\'s Tamarind Chutney 12oz. Sweet and tangy sauce perfect for doubles and samosas. Authentic Caribbean flavor!', brand: 'Matouk\'s', weight: '12oz' },
  { title: 'Matouck\'s Soca hot Sauce 10oz', price: 6.66, category: 'Hot Pepper Sauce', short_description: 'Lively Soca hot sauce - 10oz.', description: 'Matouk\'s Soca Hot Sauce 10oz. Lively and flavorful with just the right heat. Perfect for everyday use!', brand: 'Matouk\'s', weight: '10oz' },

  // Slap Ya Mama
  { title: 'Original Blend Cajun Seasoning 227g', price: 12.00, category: 'Spices/Herbs/Seasonings', short_description: 'Authentic Louisiana Cajun seasoning - original.', description: 'Slap Ya Mama Original Blend Cajun Seasoning 227g. Authentic Louisiana spice blend for classic Cajun flavor!', brand: 'Slap Ya Mama', weight: '227g' },
  { title: 'Hot Cajun Seasoning 227g', price: 12.99, category: 'Spices/Herbs/Seasonings', short_description: 'Spicy Louisiana Cajun seasoning - hot.', description: 'Slap Ya Mama Hot Cajun Seasoning 227g. Extra spicy Louisiana blend for those who love heat!', brand: 'Slap Ya Mama', weight: '227g' },
  { title: 'Low Sodium Cajun Seasoning 170g', price: 12.99, category: 'Spices/Herbs/Seasonings', short_description: 'Low sodium Cajun seasoning - healthier option.', description: 'Slap Ya Mama Low Sodium Cajun Seasoning 170g. Same great flavor with reduced sodium. Health-conscious choice!', brand: 'Slap Ya Mama', weight: '170g' },

  // KFresh Shito
  { title: 'KFresh Shito 250ml', price: 8.00, category: 'Sauces & Condiments', short_description: 'Traditional Ghanaian shito - 250ml.', description: 'KFresh Shito 250ml. Traditional Ghanaian hot pepper sauce with shrimp and spices. Rich and savory!', brand: 'KFresh', weight: '250ml' },
  { title: 'KFresh Shito 500ml', price: 16.00, category: 'Sauces & Condiments', short_description: 'Traditional Ghanaian shito - 500ml.', description: 'KFresh Shito 500ml. Traditional Ghanaian hot pepper sauce with shrimp and spices. Great value size!', brand: 'KFresh', weight: '500ml' },
  { title: 'KFresh Shito 5L', price: 140.00, category: 'Sauces & Condiments', short_description: 'Traditional Ghanaian shito - 5L bulk.', description: 'KFresh Shito 5L. Traditional Ghanaian hot pepper sauce with shrimp and spices. Bulk size for restaurants or large families!', brand: 'KFresh', weight: '5L' },

  // White Gari
  { title: 'White Gari 3.5lbs', price: 7.50, category: 'Canned & Package Goods', short_description: 'Premium white gari - 3.5lbs.', description: 'White Gari 3.5lbs. Premium fermented cassava flour. Essential West African staple for eba or drinking!', weight: '3.5lbs' },
  { title: 'White Gari 10lbs', price: 20.00, category: 'Canned & Package Goods', short_description: 'Premium white gari - 10lbs.', description: 'White Gari 10lbs. Premium fermented cassava flour. Family size for regular use!', weight: '10lbs' },
  { title: 'White Gari 16lbs', price: 32.00, category: 'Canned & Package Goods', short_description: 'Premium white gari - 16lbs bulk.', description: 'White Gari 16lbs. Premium fermented cassava flour. Large family or bulk size!', weight: '16lbs' },

  // Ijebu Gari
  { title: 'Ijebu Garri 4lbs', price: 8.00, category: 'Canned & Package Goods', short_description: 'Fine Ijebu gari - 4lbs.', description: 'Ijebu Gari 4lbs. Premium fine-grain gari from Ijebu region. Smooth texture!', weight: '4lbs' },
  { title: 'Ijebu Garri 10lbs', price: 20.00, category: 'Canned & Package Goods', short_description: 'Fine Ijebu gari - 10lbs.', description: 'Ijebu Gari 10lbs. Premium fine-grain gari from Ijebu region. Family size!', weight: '10lbs' },
  { title: 'Ijebu Garri 16lbs', price: 32.00, category: 'Canned & Package Goods', short_description: 'Fine Ijebu gari - 16lbs bulk.', description: 'Ijebu Gari 16lbs. Premium fine-grain gari from Ijebu region. Bulk size!', weight: '16lbs' },

  // Yellow Gari
  { title: 'Yellow Gari 4lbs', price: 8.00, category: 'Canned & Package Goods', short_description: 'Yellow gari with palm oil - 4lbs.', description: 'Yellow Gari 4lbs. Traditional fermented cassava with palm oil. Rich flavor and color!', weight: '4lbs' },
  { title: 'Yellow Gari 10lbs', price: 20.00, category: 'Canned & Package Goods', short_description: 'Yellow gari with palm oil - 10lbs.', description: 'Yellow Gari 10lbs. Traditional fermented cassava with palm oil. Family size!', weight: '10lbs' },
  { title: 'Yellow Gari 16lbs', price: 32.00, category: 'Canned & Package Goods', short_description: 'Yellow gari with palm oil - 16lbs bulk.', description: 'Yellow Gari 16lbs. Traditional fermented cassava with palm oil. Bulk size!', weight: '16lbs' },

  // Vitamalt
  { title: 'Vitamalt Classic 6packs', price: 15.00, category: 'Drinks/Beverages', short_description: 'Classic Vitamalt malt beverage - 6 pack.', description: 'Vitamalt Classic 6-pack. Non-alcoholic malt beverage with vitamins. Traditional flavor!', brand: 'Vitamalt' },
  { title: 'Vitalmalt Ginger 6packs', price: 15.00, category: 'Drinks/Beverages', short_description: 'Ginger Vitamalt malt beverage - 6 pack.', description: 'Vitamalt Ginger 6-pack. Non-alcoholic malt beverage with vitamins and ginger kick!', brand: 'Vitamalt' },
  { title: 'Vitalmalt Coconut & Hibiscus 6packs', price: 15.00, category: 'Drinks/Beverages', short_description: 'Coconut Hibiscus Vitamalt - 6 pack.', description: 'Vitamalt Coconut & Hibiscus 6-pack. Non-alcoholic malt beverage with tropical flavors!', brand: 'Vitamalt' }
]

async function removeAndReaddAsIndividual() {
  console.log('🔄 Removing variant-based products and re-adding as individual products...\n')

  // Step 1: Remove old variant-based products
  console.log('Step 1: Removing products with variants...\n')

  for (const productName of productsToRemove) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .ilike('name', productName)

    if (products && products.length > 0) {
      for (const product of products) {
        // Delete variants first
        await supabase.from('product_variants').delete().eq('product_id', product.id)

        // Delete product
        await supabase.from('products').delete().eq('id', product.id)

        console.log(`   ✅ Removed: ${product.name}`)
      }
    }
  }

  console.log('\nStep 2: Adding products as individuals...\n')

  // Step 2: Get categories
  const { data: categories } = await supabase.from('categories').select('*')

  let added = 0

  // Step 3: Add all individual products
  for (const product of individualProducts) {
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
      weight: product.weight || null,
      stock_quantity: 100,
      is_featured: false,
      is_available: true
    }

    const { error } = await supabase
      .from('products')
      .insert([productData])

    if (error) {
      console.log(`❌ Error adding ${product.title}: ${error.message}`)
    } else {
      console.log(`✅ ${product.title} - $${product.price}`)
      added++
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('✨ COMPLETE!')
  console.log('='.repeat(80))
  console.log(`✅ Products added as individuals: ${added}`)

  const { data: finalCount } = await supabase.from('products').select('count')
  console.log(`📊 Total products in database: ${finalCount[0].count}`)
}

removeAndReaddAsIndividual()
