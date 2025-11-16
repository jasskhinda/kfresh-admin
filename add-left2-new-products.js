require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// New/different products from left2 that weren't in left1
const productsToAdd = [
  // Tastees Jamaican Patties
  {
    title: 'Tastees Jamaican Patties Regular Spicy Beef 1.2kg Box',
    price: 16.99,
    category: 'Frozen Foods',
    brand: 'Tastees',
    short_description: 'Authentic Jamaican beef patties with a spicy kick.',
    description: 'Tastees Jamaican Patties are the authentic taste of Jamaica. These flaky golden pastries are filled with seasoned spicy beef, delivering a perfect blend of Caribbean spices and flavors. Each 1.2kg box contains multiple patties, perfect for family meals or entertaining. Simply heat and serve for a quick, delicious meal that brings the taste of the islands to your table. These patties have been a Caribbean favorite for generations, known for their perfect pastry-to-filling ratio and authentic seasoning.'
  },
  {
    title: 'Tastees Jamaican Patties Extra Spicy Beef 1.2kg Box',
    price: 16.99,
    category: 'Frozen Foods',
    brand: 'Tastees',
    short_description: 'Extra spicy Jamaican beef patties for heat lovers.',
    description: 'Tastees Jamaican Patties Extra Spicy bring intense heat to the classic Jamaican favorite. These golden, flaky pastries are filled with well-seasoned beef enhanced with extra scotch bonnet peppers for those who love serious heat. Each 1.2kg box contains multiple patties that are perfect for spice enthusiasts. The extra spicy version maintains the authentic Tastees flavor while delivering a powerful kick. Simply heat and enjoy this Caribbean street food classic that has been perfected over decades.'
  },
  {
    title: 'Tastees Jamaican Patties Vegetarian 1.2kg Box',
    price: 16.99,
    category: 'Frozen Foods',
    brand: 'Tastees',
    short_description: 'Delicious vegetarian Jamaican patties, no meat.',
    description: 'Tastees Jamaican Patties Vegetarian offer the authentic Jamaican patty experience without the meat. These flaky golden pastries are filled with a savory blend of vegetables and Caribbean spices, creating a satisfying meat-free option that doesn\'t compromise on flavor. Each 1.2kg box contains multiple patties, perfect for vegetarians or anyone looking to enjoy plant-based Caribbean cuisine. The vegetarian filling is expertly seasoned with traditional Jamaican spices, making these patties a favorite among both vegetarians and meat-eaters alike.'
  },

  // Roasted Peanuts
  {
    title: 'Roasted Peanuts 510g',
    price: 9.99,
    category: 'Snacks',
    brand: null,
    short_description: 'Fresh roasted peanuts, perfect for snacking.',
    description: 'Our Roasted Peanuts are freshly roasted to perfection, delivering that classic nutty flavor and satisfying crunch. This 510g package provides plenty of this protein-rich snack for the whole family. Perfect for snacking on their own, adding to trail mixes, or using in your favorite recipes. These peanuts are roasted with just the right amount of salt to enhance their natural flavor. Rich in protein, healthy fats, and essential nutrients, they make for a wholesome snack any time of day.'
  },

  // Matouk's Sauces
  {
    title: 'Matouk\'s Tamarind Chutney 12oz',
    price: 10.99,
    category: 'Sauces & Condiments',
    brand: 'Matouk\'s',
    short_description: 'Sweet and tangy tamarind chutney from Trinidad.',
    description: 'Matouk\'s Tamarind Chutney is a beloved Caribbean condiment made from tamarind pulp, creating a perfect balance of sweet and tangy flavors. This 12oz bottle is ideal for adding authentic West Indian flavor to your meals. Use it as a dipping sauce for samosas, doubles, and fried foods, or as a spread for sandwiches and wraps. The rich, complex flavor comes from carefully selected tamarind combined with spices and sugar. This chutney is a staple in Trinidad and Tobago cuisine and brings authentic island taste to any dish.'
  },
  {
    title: 'Matouk\'s Trinidad Scorpion Pepper Sauce 10oz',
    price: 10.99,
    category: 'Sauces & Condiments',
    brand: 'Matouk\'s',
    short_description: 'Extreme heat with Trinidad Scorpion peppers.',
    description: 'Matouk\'s Trinidad Scorpion Pepper Sauce features one of the world\'s hottest peppers - the Trinidad Scorpion. This 10oz bottle packs extreme heat while maintaining the authentic Caribbean flavor that Matouk\'s is known for. Made with scorpion peppers, vegetables, and traditional spices, this sauce is for serious heat lovers who want both flavor and fire. Use sparingly to add intense heat to any dish. The Trinidad Scorpion pepper is a source of pride in Caribbean cuisine, and this sauce captures its legendary heat perfectly.'
  },
  {
    title: 'Matouk\'s Soca Hot Sauce 10oz',
    price: 6.66,
    category: 'Sauces & Condiments',
    brand: 'Matouk\'s',
    short_description: 'Medium-heat Caribbean hot sauce with great flavor.',
    description: 'Matouk\'s Soca Hot Sauce brings the party to your plate with medium heat and vibrant Caribbean flavor. Named after the energetic Caribbean music genre, this sauce adds rhythm to your meals with a perfect balance of peppers and spices. The 10oz bottle is ideal for everyday use - hot enough to add excitement but not overwhelm your taste buds. Use it on everything from eggs and rice to meats and seafood. This versatile sauce has been a Caribbean favorite for decades, bringing authentic West Indian flavor to tables around the world.'
  },

  // De Rica Tomato Paste
  {
    title: 'De Rica Tomato Paste 400g',
    price: 8.99,
    category: 'Pantry Staples',
    brand: 'De Rica',
    short_description: 'Rich concentrated tomato paste for cooking.',
    description: 'De Rica Tomato Paste is a kitchen essential for authentic African and Caribbean cooking. This 400g can contains concentrated tomato paste that adds rich, deep flavor to stews, soups, sauces, and rice dishes. De Rica is a trusted brand throughout West Africa and the Caribbean, known for its quality and authentic taste. The concentrated formula means a little goes a long way in creating richly flavored dishes. Use it as a base for jollof rice, red stews, pasta sauces, and countless other recipes. This is the authentic tomato paste used in traditional African recipes.'
  },
  {
    title: 'De Rica Tomato Paste 210g',
    price: 4.99,
    category: 'Pantry Staples',
    brand: 'De Rica',
    short_description: 'Rich concentrated tomato paste, smaller size.',
    description: 'De Rica Tomato Paste in the convenient 210g size is perfect for smaller households or when you need just the right amount for a recipe. This concentrated tomato paste is a staple in African and Caribbean kitchens, adding rich, authentic flavor to stews, soups, and rice dishes. De Rica has been a trusted brand for generations, known for delivering consistent quality and that authentic taste that makes West African cuisine so special. Use it to create perfect jollof rice, red stews, or as a base for any tomato-based sauce. The smaller size ensures freshness and reduces waste.'
  },

  // Salted Meats
  {
    title: 'Salted Pig Tail per lb',
    price: 6.00,
    category: 'Meat & Seafood',
    brand: null,
    short_description: 'Traditional salted pig tail for Caribbean cooking.',
    description: 'Salted Pig Tail is a beloved ingredient in Caribbean and Southern cuisine, adding deep, savory flavor to soups, stews, and rice dishes. This traditional ingredient has been preserved through salting, which not only preserves the meat but also intensifies its flavor. Priced per pound, you can get exactly the amount you need for your recipes. Use it in split pea soup, cook-up rice, pelau, or any dish where you want to add rich, meaty depth. Before cooking, rinse and soak to remove excess salt. This ingredient is essential for authentic Caribbean home cooking and brings traditional flavors to your kitchen.'
  },
  {
    title: 'Salted Pig Feet per lb',
    price: 6.00,
    category: 'Meat & Seafood',
    brand: null,
    short_description: 'Salted pig feet for traditional Caribbean dishes.',
    description: 'Salted Pig Feet are a traditional ingredient used throughout the Caribbean for adding rich, gelatinous texture and deep flavor to soups and stews. Priced per pound, this ingredient is essential for making authentic souse, split pea soup, and other Caribbean classics. The salting process preserves the meat while enhancing its flavor profile. Before cooking, rinse thoroughly and soak to remove excess salt. When cooked slowly, pig feet release collagen that creates wonderfully rich, thick broths. This ingredient connects modern cooks to traditional Caribbean culinary heritage and is a must-have for authentic island cooking.'
  },
  {
    title: 'Salted Mackerel',
    price: 10.00,
    category: 'Meat & Seafood',
    brand: null,
    short_description: 'Salt-cured mackerel for Caribbean breakfast and more.',
    description: 'Salted Mackerel is a Caribbean breakfast staple and versatile ingredient that brings authentic island flavor to your kitchen. This salt-cured fish has been preserved using traditional methods, creating an intensely flavored ingredient that\'s perfect for "rundown," oil down, and classic Caribbean breakfasts with provisions and dumplings. Before cooking, soak the mackerel to remove excess salt, then flake and cook with onions, peppers, and tomatoes. The firm texture and rich flavor of salted mackerel make it a favorite throughout the Caribbean islands. This traditional ingredient connects you to generations of Caribbean home cooking.'
  },
  {
    title: 'Salted Tilapia Koobi',
    price: 10.00,
    category: 'Meat & Seafood',
    brand: null,
    short_description: 'Traditional salted and dried tilapia fish.',
    description: 'Salted Tilapia, known as Koobi in West African cuisine, is a traditional dried and salted fish that\'s essential for authentic Ghanaian and Nigerian cooking. This preserved fish adds incredible depth of flavor to soups, stews, and sauces. Use it in palm nut soup, groundnut soup, kontomire stew, or any dish where you want that authentic smoky, savory fish flavor. Before cooking, rinse and sometimes lightly grill to enhance the smoky notes. Koobi is packed with protein and is a cornerstone of traditional West African home cooking, bringing authentic taste to your African dishes.'
  },

  // Mauby
  {
    title: 'Mauby Drink 500ml',
    price: 5.00,
    category: 'Beverages',
    brand: null,
    short_description: 'Traditional Caribbean herbal drink, bittersweet.',
    description: 'Mauby is a traditional Caribbean drink made from the bark of the mauby tree, creating a unique bittersweet flavor that\'s an acquired taste beloved throughout the islands. This 500ml bottle offers a ready-to-drink version of this classic beverage, which is traditionally consumed for its refreshing qualities and potential health benefits. The distinctive taste combines bitter notes with sweetness and spices like cinnamon and anise. Many Caribbean people grew up drinking mauby and consider it a nostalgic taste of home. Whether served ice-cold on a hot day or enjoyed with meals, mauby is a true taste of Caribbean culture and tradition.'
  },

  // Matooki (Green Plantain)
  {
    title: 'Matooki Green Plantain 1kg',
    price: 11.99,
    category: 'Fresh Produce',
    brand: null,
    short_description: 'East African green plantains for cooking.',
    description: 'Matooki, also known as matoke, are green cooking plantains that are a staple food in East Africa, particularly Uganda where they\'re a national dish. This 1kg package provides these starchy plantains that must be cooked before eating. Unlike sweet plantains, matooki remain green and firm, perfect for steaming, boiling, or making traditional East African dishes. They can be mashed with groundnut sauce, cooked in banana leaves, or prepared in countless traditional ways. Rich in complex carbohydrates and nutrients, matooki are filling and nutritious, serving as a main starch in many East African meals.'
  },

  // African/Caribbean Specialty Items
  {
    title: 'Efom Wisa',
    price: 8.99,
    category: 'SPICES, HERBS & SEASONINGS',
    brand: null,
    short_description: 'Traditional Ghanaian spice blend.',
    description: 'Efom Wisa is a traditional Ghanaian spice blend used to add authentic West African flavor to soups and stews. This aromatic blend combines carefully selected spices and herbs that are essential in Ghanaian cooking. Use it in palm nut soup, light soup, groundnut soup, and other traditional dishes. The complex flavor profile adds depth and authenticity to your West African cuisine. This spice blend has been used for generations in Ghanaian homes and brings the taste of authentic West African cooking to your kitchen. A must-have for anyone preparing traditional Ghanaian meals.'
  },
  {
    title: 'Hwentia',
    price: 8.99,
    category: 'SPICES, HERBS & SEASONINGS',
    brand: null,
    short_description: 'Traditional Ghanaian grains of Selim spice.',
    description: 'Hwentia, also known as Guinea pepper or grains of Selim, is an essential spice in Ghanaian and West African cooking. These seed pods have a complex flavor profile combining pepper, cardamom, and nutmeg notes. Hwentia is crucial for authentic palm nut soup, light soup, and many traditional Ghanaian dishes. The spice is used whole or ground and releases its aromatic oils during cooking. This traditional ingredient has been used in West African cuisine for centuries and is irreplaceable for achieving authentic flavor in Ghanaian soups and stews. A pantry essential for West African home cooking.'
  },
  {
    title: 'Esoro Wisa',
    price: 8.99,
    category: 'SPICES, HERBS & SEASONINGS',
    brand: null,
    short_description: 'Traditional Ghanaian fish spice blend.',
    description: 'Esoro Wisa is a traditional Ghanaian spice blend specifically formulated to complement fish dishes and fish-based soups. This aromatic blend contains carefully selected spices that enhance the flavor of fish without overpowering its delicate taste. Use it when preparing fish stews, grilled fish, and traditional Ghanaian fish soups. The blend adds authentic West African character to seafood dishes and has been used in Ghanaian kitchens for generations. Essential for anyone wanting to prepare authentic Ghanaian fish dishes with traditional flavors and aromas.'
  },

  // Ground Spices
  {
    title: 'Chilli Pepper Ground',
    price: 7.99,
    category: 'SPICES, HERBS & SEASONINGS',
    brand: null,
    short_description: 'Ground African chilli pepper for heat.',
    description: 'Ground Chilli Pepper is a fiery essential in African and Caribbean cooking, adding heat and depth to countless dishes. This finely ground pepper is perfect for seasoning stews, soups, marinades, and rice dishes. Unlike standard chili powder, this is pure ground dried chilies with authentic African heat and flavor. Use it to spice up jollof rice, pepper soup, suya, and any dish where you want to add serious heat. The intensity can vary, so start with a small amount and adjust to taste. This is a pantry staple for anyone who loves the bold, spicy flavors of African cuisine.'
  },
  {
    title: 'Egusi Ground',
    price: 12.99,
    category: 'SPICES, HERBS & SEASONINGS',
    brand: null,
    short_description: 'Ground melon seeds for authentic egusi soup.',
    description: 'Ground Egusi (melon seeds) is the essential ingredient for making authentic Nigerian and West African egusi soup. These finely ground melon seeds create the rich, nutty base that makes egusi soup so beloved. Simply mix the ground egusi with water to form a paste, then cook with your choice of meats, fish, and vegetables. Egusi is rich in protein and healthy fats, making it both nutritious and delicious. This is one of the most popular soup bases in West African cuisine, and having quality ground egusi on hand means you can prepare this classic dish whenever the craving strikes.'
  },

  // Kenkey
  {
    title: 'Kenkey',
    price: 3.99,
    category: 'Bakery & Bread',
    brand: null,
    short_description: 'Traditional Ghanaian fermented corn dough.',
    description: 'Kenkey is a traditional Ghanaian staple food made from fermented corn dough, wrapped in corn husks or plantain leaves and steamed. This authentic kenkey is ready to heat and serve, offering a taste of traditional Ghanaian cuisine. Kenkey has a distinctive slightly sour flavor from the fermentation process and a firm, smooth texture. Traditionally served with fried fish, pepper sauce, and shito (black pepper sauce). It\'s a filling, nutritious meal that\'s been a Ghanaian staple for generations. Simply warm it up and enjoy with your favorite accompaniments for an authentic Ghanaian eating experience.'
  },

  // Momoni
  {
    title: 'Momoni Frozen',
    price: 8.99,
    category: 'Meat & Seafood',
    brand: null,
    short_description: 'Traditional salted and dried small fish.',
    description: 'Momoni are small salted and dried fish that are a beloved ingredient in Ghanaian cooking. These tiny fish pack huge flavor and are essential for adding authentic taste to kontomire (cocoyam leaves) stew, palm nut soup, and other traditional Ghanaian dishes. Frozen for freshness, momoni should be rinsed before use to remove excess salt. When cooked, they release rich, savory flavors that enhance vegetables and soups. This traditional ingredient has been used in Ghanaian cooking for centuries and is essential for achieving authentic flavor in many classic dishes. A must-have for traditional Ghanaian home cooking.'
  },

  // Maggi Seasoning Cubes
  {
    title: 'Maggi Crayfish Seasoning Cubes 6pcs',
    price: 3.99,
    category: 'SPICES, HERBS & SEASONINGS',
    brand: 'Maggi',
    short_description: 'Crayfish-flavored seasoning cubes for African cooking.',
    description: 'Maggi Crayfish Seasoning Cubes bring authentic seafood flavor to West African dishes. This pack of 6 cubes provides crayfish flavor that enhances soups, stews, rice dishes, and sauces. Simply dissolve the cubes in your cooking liquid to add rich, savory depth with a distinctive crayfish taste. These cubes are a staple in Nigerian and West African kitchens, making it easy to add complex flavor without using actual crayfish. Perfect for jollof rice, egusi soup, vegetable soups, and countless other dishes. A convenient way to add authentic West African flavor to your everyday cooking.'
  },
  {
    title: 'Maggi Chicken Seasoning Cubes 6pcs',
    price: 3.99,
    category: 'SPICES, HERBS & SEASONINGS',
    brand: 'Maggi',
    short_description: 'Chicken-flavored seasoning cubes for rich flavor.',
    description: 'Maggi Chicken Seasoning Cubes are a kitchen essential in West African cooking, adding rich, savory chicken flavor to countless dishes. This pack of 6 cubes makes it easy to enhance soups, stews, rice, and sauces with deep, satisfying flavor. Simply dissolve the cubes in your cooking liquid for instant depth and complexity. These cubes are used throughout Nigeria, Ghana, and other West African countries as a fundamental seasoning. Perfect for jollof rice, chicken stew, fried rice, and everyday cooking. A pantry staple that brings professional flavor to home cooking with minimal effort.'
  }
]

async function addProducts() {
  console.log(`\n🔄 Starting to add ${productsToAdd.length} new products from left2...\n`)

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
        // Try to find similar category
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
          // Create new category
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
