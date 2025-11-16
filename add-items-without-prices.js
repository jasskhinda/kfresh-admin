require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const productsToAdd = [
  // Bakery Items
  {
    title: 'Pholourie',
    price: 10.00,
    category: 'Bakery & Bread',
    brand: null,
    short_description: 'Traditional Caribbean fried split pea fritters.',
    description: 'Pholourie are delicious Caribbean fried fritters made from ground split peas and spices. These golden, crispy bites are a popular snack or appetizer throughout Trinidad, Guyana, and other Caribbean islands. Traditionally served with tangy tamarind chutney or hot pepper sauce, pholourie are perfect for parties, gatherings, or as a tasty snack any time of day. The soft, fluffy interior contrasts perfectly with the crispy exterior, and the blend of spices including turmeric, cumin, and garlic creates an unforgettable flavor that\'s beloved across the Caribbean.'
  },
  {
    title: 'Cheese Toll',
    price: 10.00,
    category: 'Bakery & Bread',
    brand: null,
    short_description: 'Caribbean cheese-filled pastry roll.',
    description: 'Cheese Toll is a beloved Caribbean pastry featuring a soft, slightly sweet dough rolled and filled with savory cheese. This traditional treat is popular throughout the Caribbean islands as a snack or breakfast item. The combination of the tender bread and melted cheese creates a delightful contrast of flavors and textures. Often enjoyed with tea or coffee, cheese toll is a comforting food that brings back memories of home for many Caribbean people. Freshly made and perfect for any time of day.'
  },
  {
    title: 'Pine Tart',
    price: 10.00,
    category: 'Bakery & Bread',
    brand: null,
    short_description: 'Caribbean pineapple-filled pastry tart.',
    description: 'Pine Tart is a traditional Caribbean pastry filled with sweet, spiced pineapple jam. These individual tarts feature a buttery, flaky crust encasing a generous filling of caramelized pineapple that has been cooked down with sugar and warm spices. Popular throughout the Caribbean, especially in Jamaica and other islands, pine tarts are perfect with tea or coffee or as a sweet snack. The combination of the crisp pastry and sweet-tart pineapple filling makes these tarts irresistible. A nostalgic treat that captures the tropical flavors of the Caribbean.'
  },
  {
    title: 'Puff Puff',
    price: 10.00,
    category: 'Bakery & Bread',
    brand: null,
    short_description: 'West African fried dough balls, sweet and fluffy.',
    description: 'Puff Puff is a popular West African snack made from deep-fried dough, similar to doughnuts but without the hole. These golden, pillowy balls are slightly sweet and incredibly addictive. Made from a simple yeast dough that\'s allowed to rise before being fried to perfection, puff puff has a crispy exterior and soft, airy interior. Popular across Nigeria, Ghana, and other West African countries, they\'re enjoyed as a snack, at parties, or with breakfast. Often served plain or dusted with powdered sugar, puff puff is a beloved treat that brings joy to any occasion.'
  },
  {
    title: 'Coconut Buns',
    price: 10.00,
    category: 'Bakery & Bread',
    brand: null,
    short_description: 'Sweet Caribbean buns with coconut.',
    description: 'Coconut Buns are sweet, soft Caribbean bread rolls infused with coconut flavor. These tender buns are made with coconut milk and often topped with shredded coconut, creating a tropical treat that\'s perfect for breakfast or as a snack. The subtle sweetness and rich coconut flavor make them a favorite throughout the Caribbean islands. Enjoy them on their own, with butter, or alongside your morning coffee or tea. These buns capture the essence of Caribbean baking traditions and bring the taste of the islands to your table.'
  },
  {
    title: 'Salara',
    price: 10.00,
    category: 'Bakery & Bread',
    brand: null,
    short_description: 'Guyanese coconut roll with red filling.',
    description: 'Salara, also known as Red Cake, is a traditional Guyanese sweet bread roll filled with spiced shredded coconut that has been colored red. The soft, slightly sweet bread is rolled with a filling made from fresh coconut, sugar, and spices including cinnamon and sometimes ginger. The distinctive red color traditionally comes from red food coloring. This unique treat is beloved in Guyana and throughout the Caribbean, often enjoyed with tea or as a special snack. The combination of soft bread and sweet, spiced coconut filling makes salara a nostalgic favorite.'
  },
  {
    title: 'Dhal Puri',
    price: 10.00,
    category: 'Bakery & Bread',
    brand: null,
    short_description: 'Trinidadian flatbread filled with split peas.',
    description: 'Dhal Puri is a traditional Trinidadian flatbread filled with seasoned ground split peas (dhal). This beloved roti variation features a soft, layered bread with a savory filling of curried split peas right inside the dough. Typically served with curries, chutneys, and other Caribbean dishes, dhal puri is a staple in Trinidad and Tobago cuisine. The bread is cooked on a flat griddle until golden spots appear, creating a slightly crispy exterior while remaining soft inside. Often enjoyed as a complete meal when wrapped around curry chicken, goat, or vegetables, dhal puri is comfort food at its finest.'
  },
  {
    title: 'Mithai',
    price: 10.00,
    category: 'Bakery & Bread',
    brand: null,
    short_description: 'Indo-Caribbean sweet confection.',
    description: 'Mithai refers to traditional Indo-Caribbean sweets that are popular in Trinidad, Guyana, and Suriname. These confections are made from ingredients like milk, sugar, flour, and ghee, often flavored with cardamom, saffron, or rose water. Indo-Caribbean mithai represents the fusion of Indian sweets traditions with Caribbean ingredients and techniques. These treats are especially popular during Diwali and other celebrations but are enjoyed year-round. Rich, sweet, and often beautifully decorated, mithai are a cherished part of Indo-Caribbean culinary heritage.'
  },
  {
    title: 'Fresh Roti',
    price: 10.00,
    category: 'Bakery & Bread',
    brand: null,
    short_description: 'Fresh Caribbean flatbread, soft and layered.',
    description: 'Fresh Roti is a staple Caribbean flatbread with Indian origins, popular throughout Trinidad, Guyana, Suriname, and other islands. This soft, layered bread is made from wheat flour and cooked on a flat griddle, creating a tender texture perfect for wrapping around curries or eating alongside stews. Caribbean roti comes in several varieties including sada roti, paratha roti, and buss-up-shut, each with its own unique texture and preparation method. Freshly made roti is incomparable - soft, warm, and perfect for soaking up flavorful sauces. An essential component of Caribbean cuisine.'
  },
  {
    title: 'Cheese Straws',
    price: 10.00,
    category: 'Bakery & Bread',
    brand: null,
    short_description: 'Crispy Caribbean cheese-flavored pastry sticks.',
    description: 'Cheese Straws are crispy, savory pastry sticks made with cheese, butter, and flour. These crunchy treats are popular throughout the Caribbean as a snack or appetizer. The dough is flavored with sharp cheese and sometimes a hint of cayenne pepper, rolled out, cut into strips, and baked until golden and crispy. Perfect for parties, holidays, or just as a tasty snack, cheese straws have a satisfying crunch and rich cheese flavor. They\'re often served during Christmas and other celebrations but are enjoyed year-round. A Caribbean favorite that combines British baking traditions with local flavors.'
  },
  {
    title: 'Sugar Cake',
    price: 10.00,
    category: 'Bakery & Bread',
    brand: null,
    short_description: 'Traditional Caribbean coconut and sugar candy.',
    description: 'Sugar Cake is a traditional Caribbean coconut candy made from fresh grated coconut, brown or white sugar, and spices like ginger. Popular throughout the Caribbean islands, especially in Barbados and Guyana, these sweet treats have a chewy, crystallized texture and intense coconut flavor. The coconut and sugar mixture is cooked until it reaches the right consistency, then formed into small cakes or bars. Often colored pink and white, sugar cakes are a nostalgic treat that brings back childhood memories for many Caribbean people. The perfect balance of sweet and chewy.'
  },
  {
    title: 'Tennis Rolls',
    price: 10.00,
    category: 'Bakery & Bread',
    brand: null,
    short_description: 'Guyanese coconut-filled sweet bread.',
    description: 'Tennis Rolls are traditional Guyanese sweet bread rolls filled with a sweet coconut mixture. Despite the name, these have nothing to do with tennis - they\'re named for their size and shape. The soft, slightly sweet bread is filled with a mixture of grated coconut, sugar, and spices, then rolled up and baked to golden perfection. Popular in Guyana and throughout the Caribbean, tennis rolls are enjoyed as a breakfast treat or afternoon snack with tea. The combination of soft bread and sweet coconut filling makes them irresistible. A beloved part of Guyanese baking traditions.'
  },
  {
    title: 'Plait Bread',
    price: 10.00,
    category: 'Bakery & Bread',
    brand: null,
    short_description: 'Caribbean braided sweet bread loaf.',
    description: 'Plait Bread, also known as Challah in some traditions, is a beautifully braided sweet bread popular in Caribbean bakeries. This loaf features a soft, slightly sweet interior with a golden, glossy crust. The plaited (braided) design isn\'t just for show - it creates wonderful texture and makes the bread perfect for tearing and sharing. Often enriched with eggs, butter, and milk, plait bread has a tender crumb and rich flavor. Enjoyed plain, toasted, or used for sandwiches, this bread is a Caribbean bakery staple that graces many breakfast and tea tables.'
  },
  {
    title: 'Chinese Cakes',
    price: 10.00,
    category: 'Bakery & Bread',
    brand: null,
    short_description: 'Guyanese vanilla sponge cake squares.',
    description: 'Chinese Cakes are a beloved Guyanese treat despite having no actual Chinese origin - the name comes from their square shape resembling Chinese food containers. These simple, delicious cakes are made from a basic vanilla sponge cake recipe, creating a light, fluffy texture with a delicate crumb. Often topped with pink or white icing and sometimes sprinkles, Chinese cakes are a nostalgic treat for many Guyanese people. Perfect with tea or coffee, these unassuming little cakes have a special place in Guyanese bakery traditions. Simple, sweet, and satisfying.'
  },
  {
    title: 'Black Cake',
    price: 10.00,
    category: 'Bakery & Bread',
    brand: null,
    short_description: 'Caribbean rum-soaked fruit cake, rich and dark.',
    description: 'Black Cake, also known as Rum Cake, is the crown jewel of Caribbean baking. This rich, dark fruit cake is made with dried fruits that have been soaked in rum for weeks or even months, creating an incredibly moist, flavorful cake. Popular throughout the Caribbean, especially during Christmas and weddings, black cake is a celebration cake that represents Caribbean hospitality and tradition. The cake gets its dark color from burnt sugar (browning) and is packed with prunes, raisins, currants, and cherries. Each family has their own treasured recipe, often passed down through generations. Absolutely decadent and unforgettable.'
  },
  {
    title: 'Fresh Buns Bread',
    price: 10.00,
    category: 'Bakery & Bread',
    brand: null,
    short_description: 'Soft Caribbean bread buns, fresh daily.',
    description: 'Fresh Buns Bread refers to soft, slightly sweet Caribbean bread rolls that are a daily staple throughout the islands. These buns have a tender crumb and golden crust, perfect for breakfast sandwiches, burgers, or just enjoying with butter. Caribbean buns are typically slightly sweeter than their European counterparts and may be enriched with milk and a touch of sugar. Freshly baked daily, these buns are a cornerstone of Caribbean bakeries and are enjoyed by families across the region. Whether for sandwiches or alongside a meal, fresh buns are essential Caribbean comfort food.'
  },

  // Other Items
  {
    title: 'KFresh Body and Hair Cream',
    price: 10.00,
    category: 'Health & Beauty',
    brand: 'KFresh',
    short_description: 'Moisturizing cream for body and hair.',
    description: 'KFresh Body and Hair Cream is a multi-purpose moisturizing cream designed for both skin and hair care. This versatile cream helps hydrate dry skin while also providing conditioning benefits for hair. Formulated with nourishing ingredients, it can be used daily to keep skin soft and supple and hair manageable and healthy-looking. Perfect for the whole family, this cream is especially beneficial in dry climates or during winter months. The convenient single-product solution simplifies your beauty routine while providing effective moisturizing benefits for both body and hair.'
  },
  {
    title: 'Pig Tail',
    price: 10.00,
    category: 'Meat & Seafood',
    brand: null,
    short_description: 'Fresh pig tail for Caribbean cooking.',
    description: 'Fresh Pig Tail (not salted) is used in Caribbean and Southern cooking to add rich, meaty flavor and satisfying texture to various dishes. Unlike salted pig tail, fresh pig tail doesn\'t require soaking and can be used directly in your recipes. Popular in soups, stews, and rice dishes, pig tail adds depth and richness while providing tender, gelatinous meat when cooked slowly. Use it in split pea soup, beans and rice, or any dish where you want to add hearty, traditional flavor. Fresh pig tail is a staple ingredient in authentic Caribbean home cooking.'
  }
]

async function addProducts() {
  console.log(`\n🔄 Adding ${productsToAdd.length} products without prices (using $10 placeholder)...\n`)

  let added = 0
  let skipped = 0
  let errors = 0

  for (const product of productsToAdd) {
    try {
      // Check if product already exists
      const { data: existing } = await supabase
        .from('products')
        .select('id, name')
        .ilike('name', product.title)
        .single()

      if (existing) {
        console.log(`⏭️  Skipped: "${product.title}" (already exists)`)
        skipped++
        continue
      }

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
  console.log(`⏭️  Skipped (already exist): ${skipped} products`)
  console.log(`❌ Errors: ${errors} products`)
  console.log(`📊 Total products in database: ${count}`)
  console.log('='.repeat(60))
}

addProducts()
