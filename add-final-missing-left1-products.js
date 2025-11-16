require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const productsToAdd = [
  {
    title: 'Nestle Nido Milk Powder 2.5kg',
    price: 90.00,
    category: 'Pantry Staples',
    brand: 'Nestle Nido',
    short_description: 'Large 2.5kg instant full cream milk powder.',
    description: 'Nestle Nido Instant Full Cream Milk Powder in the family-sized 2.5kg package is perfect for large families or extended use. This fortified milk powder provides essential vitamins and minerals including Vitamins A and D, making it a nutritious choice for the whole family. Nido dissolves instantly in water to create creamy, delicious milk that tastes great on its own or in recipes. Use it for drinking, baking, cooking, or making smoothies. This bulk size offers excellent value and ensures you always have quality milk powder on hand. Trusted by families worldwide for generations.'
  },
  {
    title: 'Peak Milk Powder 2.5kg',
    price: 90.00,
    category: 'Pantry Staples',
    brand: 'Peak',
    short_description: 'Large 2.5kg instant full cream milk powder.',
    description: 'Peak Instant Full Cream Milk Powder in the economical 2.5kg size is a staple in African and Caribbean households. This premium quality milk powder is fortified with essential vitamins and minerals, providing nutrition and great taste. Peak dissolves instantly in water to create rich, creamy milk perfect for drinking, cooking, and baking. The large 2.5kg size is ideal for families and offers excellent value. Use it in tea, coffee, porridge, or your favorite recipes. Peak has been trusted for generations across Africa and the Caribbean for its consistent quality and authentic creamy taste.'
  },
  {
    title: 'Slap Ya Mama Original Blend Cajun Seasoning 227g',
    price: 12.00,
    category: 'SPICES, HERBS & SEASONINGS',
    brand: 'Slap Ya Mama',
    short_description: 'Authentic Louisiana Cajun seasoning blend.',
    description: 'Slap Ya Mama Original Blend Cajun Seasoning brings authentic Louisiana flavor to your kitchen. This 227g container of all-purpose Cajun seasoning is made from a carefully crafted blend of red pepper, garlic, and other premium spices. Perfect for seasoning seafood, chicken, pork, beef, vegetables, and everything in between. This medium-heat blend adds bold Cajun flavor without overwhelming heat, making it versatile for everyday cooking. Family-owned and made in Louisiana, Slap Ya Mama has been a favorite among Cajun cooking enthusiasts for years. Just a sprinkle transforms ordinary dishes into extraordinary Cajun creations.'
  },
  {
    title: 'Slap Ya Mama Hot Cajun Seasoning 227g',
    price: 12.99,
    category: 'SPICES, HERBS & SEASONINGS',
    brand: 'Slap Ya Mama',
    short_description: 'Spicy Louisiana Cajun seasoning with extra heat.',
    description: 'Slap Ya Mama Hot Cajun Seasoning delivers authentic Louisiana flavor with extra kick. This 227g container packs more heat than the original blend while maintaining that signature Cajun taste. Made with premium red peppers, garlic, and traditional Cajun spices, this hot blend is perfect for those who love their food with serious spice. Use it on seafood, meats, vegetables, or anything that needs bold Cajun flavor with heat. Family-owned and Louisiana-made, this seasoning brings the authentic taste of Cajun country to your kitchen. If you like it hot, this is your go-to seasoning for all your favorite dishes.'
  },
  {
    title: 'Slap Ya Mama Low Sodium Cajun Seasoning 170g',
    price: 12.99,
    category: 'SPICES, HERBS & SEASONINGS',
    brand: 'Slap Ya Mama',
    short_description: 'Cajun flavor with reduced sodium content.',
    description: 'Slap Ya Mama Low Sodium Cajun Seasoning offers authentic Louisiana flavor for those watching their salt intake. This 170g container contains 30% less sodium than the original blend while maintaining that bold Cajun taste. Made with the same quality peppers, garlic, and spices, this blend proves you don\'t have to sacrifice flavor for health. Perfect for seasoning all your favorite dishes - seafood, chicken, pork, beef, and vegetables. Family-owned and Louisiana-made, this seasoning allows everyone to enjoy authentic Cajun cooking. Great for those on restricted sodium diets who still want big, bold flavors.'
  },
  {
    title: 'Ijebu Gari 4lbs',
    price: 8.00,
    category: 'Pantry Staples',
    brand: null,
    short_description: 'Premium Ijebu gari, fine texture, 4lbs.',
    description: 'Ijebu Gari is a premium grade of gari (fermented cassava flour) that originates from the Ijebu region of Nigeria. This 4lb package contains finely ground gari with a distinctive white color and smooth texture. Ijebu gari is known for being less sour than other varieties and having a finer grain, making it perfect for drinking (soaking) with cold water, sugar, and milk or groundnuts. It can also be used for making eba when mixed with hot water. This versatile staple is rich in carbohydrates and is a beloved food across West Africa. The fine texture of Ijebu gari makes it especially popular for drinking.'
  },
  {
    title: 'Ijebu Gari 10lbs',
    price: 20.00,
    category: 'Pantry Staples',
    brand: null,
    short_description: 'Premium Ijebu gari, fine texture, 10lbs.',
    description: 'Ijebu Gari in the popular 10lb size offers excellent value for families. This premium grade gari from the Ijebu region of Nigeria is prized for its fine, smooth texture and mild taste. The white, finely ground cassava flour is less sour than other gari varieties, making it ideal for both soaking (drinking) with cold water and making eba with hot water. Ijebu gari is particularly popular for drinking with sugar, milk, and groundnuts or coconut. This 10lb package ensures you always have this essential West African staple on hand for meals and snacks. A household favorite across Nigerian and West African communities.'
  },
  {
    title: 'Ijebu Gari 16lbs',
    price: 32.00,
    category: 'Pantry Staples',
    brand: null,
    short_description: 'Premium Ijebu gari, fine texture, bulk 16lbs.',
    description: 'Ijebu Gari in the economical 16lb bulk size is perfect for large families or those who consume gari regularly. This premium grade cassava flour from the Ijebu region is renowned for its exceptionally fine texture and mild, less sour taste compared to other gari varieties. The smooth, white gari is versatile - perfect for making eba (swallow) with hot water or for drinking (soaking) with cold water, sugar, and milk or groundnuts. The fine grain of Ijebu gari makes it dissolve smoothly and quickly. This bulk size offers the best value and ensures this essential West African staple is always available in your pantry.'
  },
  {
    title: 'Vitamalt Ginger 6pack',
    price: 15.00,
    category: 'Beverages',
    brand: 'Vitamalt',
    short_description: 'Non-alcoholic malt drink with ginger flavor.',
    description: 'Vitamalt Ginger is a refreshing twist on the classic Caribbean malt beverage, infused with natural ginger flavor. This 6-pack of non-alcoholic malt drinks combines the rich, smooth taste of traditional malt with the spicy warmth of ginger, creating a unique and invigorating beverage. Vitamalt is fortified with vitamins and minerals, making it both delicious and nutritious. The ginger adds a pleasant zing and is valued in Caribbean culture for its digestive and wellness properties. Serve ice-cold for maximum refreshment. This drink has been a Caribbean favorite for generations, perfect for any time you want a flavorful, satisfying beverage.'
  },
  {
    title: 'Vitamalt Coconut & Hibiscus 6pack',
    price: 15.00,
    category: 'Beverages',
    brand: 'Vitamalt',
    short_description: 'Malt drink with tropical coconut and hibiscus.',
    description: 'Vitamalt Coconut & Hibiscus is an exotic blend that brings together Caribbean and tropical flavors in a refreshing non-alcoholic malt beverage. This 6-pack combines the rich, creamy notes of coconut with the tart, floral taste of hibiscus (sorrel), creating a uniquely Caribbean flavor experience. Fortified with essential vitamins and minerals, Vitamalt provides nutrition along with great taste. The combination of coconut and hibiscus is particularly popular in Caribbean culture, where both ingredients are cherished. Serve ice-cold for a refreshing drink that captures the essence of the islands. Perfect for those seeking adventurous, tropical flavors.'
  }
]

async function addProducts() {
  console.log(`\n🔄 Adding ${productsToAdd.length} missing products from left1...\n`)

  let added = 0
  let errors = 0

  for (const product of productsToAdd) {
    try {
      // Get or create category
      let category
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('*')
        .ilike('name', product.category)
        .single()

      if (existingCategory) {
        category = existingCategory
      } else {
        const { data: categories } = await supabase
          .from('categories')
          .select('*')

        const similarCategory = categories?.find(cat =>
          cat.name.toLowerCase().includes(product.category.toLowerCase()) ||
          product.category.toLowerCase().includes(cat.name.toLowerCase())
        )

        if (similarCategory) {
          category = similarCategory
        } else {
          const slug = product.category.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')

          const { data: newCategory, error: catError } = await supabase
            .from('categories')
            .insert({
              name: product.category,
              slug: slug,
              description: `${product.category} products`
            })
            .select()
            .single()

          if (catError) {
            console.error(`❌ Error creating category "${product.category}":`, catError.message)
            errors++
            continue
          }
          category = newCategory
          console.log(`✅ Created new category: "${product.category}"`)
        }
      }

      // Create product slug
      const slug = product.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Add product
      const productData = {
        name: product.title,
        slug: slug,
        short_description: product.short_description,
        description: product.description,
        price: product.price,
        category_id: category.id,
        brand: product.brand,
        stock_quantity: 100,
        is_featured: false,
        is_available: true
      }

      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      if (productError) {
        console.error(`❌ Error adding "${product.title}":`, productError.message)
        errors++
      } else {
        console.log(`✅ Added: "${product.title}" - $${product.price}`)
        added++
      }

    } catch (error) {
      console.error(`❌ Error processing "${product.title}":`, error.message)
      errors++
    }
  }

  // Final count
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  console.log('\n' + '='.repeat(60))
  console.log('✅ COMPLETED')
  console.log('='.repeat(60))
  console.log(`✅ Successfully added: ${added} products`)
  console.log(`❌ Errors: ${errors} products`)
  console.log(`📊 Total products in database: ${count}`)
  console.log('='.repeat(60))
}

addProducts()
