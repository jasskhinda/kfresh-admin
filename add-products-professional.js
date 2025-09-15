require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to create slug from name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

// Helper function to parse price from string
function parsePrice(priceStr) {
  const match = priceStr.match(/\$?([\d.,]+)/);
  if (match) {
    return parseFloat(match[1].replace(/,/g, ''));
  }
  return 0;
}

// Helper function to extract unit from price string
function extractUnit(priceStr) {
  const units = ['/lb', '/kg', '/pack', '/one', '/1', '/case', '/box', '/bag', '/bottle', '/L', '/ml', 'g', 'kg', 'lb', 'lbs', 'oz'];
  for (const unit of units) {
    if (priceStr.includes(unit)) {
      return unit.replace('/', '');
    }
  }
  return 'each';
}

// Generate unique SKU
function generateUniqueSKU(name, existingSKUs) {
  let baseSku = `KF-${createSlug(name).toUpperCase().slice(0, 10)}`;
  let counter = 1;
  let sku = baseSku;
  
  while (existingSKUs.has(sku)) {
    sku = `${baseSku}-${counter}`;
    counter++;
  }
  
  existingSKUs.add(sku);
  return sku;
}

async function addProductsProfessionally() {
  console.log('🚀 Starting professional product import...');

  try {
    // First, get all existing categories
    const { data: existingCategories, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, slug, parent_category_id')
      .eq('is_active', true);

    if (categoryError) {
      console.error('❌ Error fetching categories:', categoryError);
      return;
    }

    console.log(`📁 Found ${existingCategories.length} existing categories`);

    // Create a map of existing categories by slug for quick lookup
    const categoryMap = new Map();
    existingCategories.forEach(cat => {
      categoryMap.set(cat.slug, cat);
    });

    // Professional category mapping with parent-child relationships
    const categoryStructure = [
      {
        name: 'Meat & Seafood',
        slug: 'meat-seafood',
        subcategories: [
          { name: 'Fresh Fish', slug: 'fresh-fish' },
          { name: 'Frozen Fish', slug: 'frozen-fish' },
          { name: 'Smoked Fish', slug: 'smoked-fish' },
          { name: 'Poultry', slug: 'poultry' },
          { name: 'Turkey', slug: 'turkey' }
        ]
      },
      {
        name: 'Vegetables & Leafy Greens',
        slug: 'vegetables-leafy-greens',
        subcategories: [
          { name: 'Fresh Vegetables', slug: 'fresh-vegetables' },
          { name: 'Frozen Vegetables', slug: 'frozen-vegetables' },
          { name: 'African Leafy Greens', slug: 'african-leafy-greens' }
        ]
      },
      {
        name: 'Pantry Staples',
        slug: 'pantry-staples',
        subcategories: [
          { name: 'Flour & Grains', slug: 'flour-grains' },
          { name: 'Rice & Cereals', slug: 'rice-cereals' },
          { name: 'Canned Goods', slug: 'canned-goods' },
          { name: 'Dried Goods', slug: 'dried-goods' }
        ]
      },
      {
        name: 'Spices & Condiments',
        slug: 'spices-condiments',
        subcategories: [
          { name: 'Traditional Spices', slug: 'traditional-spices' },
          { name: 'Seasonings', slug: 'seasonings' },
          { name: 'Sauces', slug: 'sauces' },
          { name: 'Cooking Oils', slug: 'cooking-oils' }
        ]
      },
      {
        name: 'Fresh Bakery',
        slug: 'fresh-bakery',
        subcategories: [
          { name: 'Caribbean Pastries', slug: 'caribbean-pastries' },
          { name: 'African Snacks', slug: 'african-snacks' },
          { name: 'Fresh Bread', slug: 'fresh-bread' }
        ]
      }
    ];

    // Create missing categories and subcategories
    for (const parentCat of categoryStructure) {
      let parentCategory = categoryMap.get(parentCat.slug);
      
      // Create parent category if it doesn't exist
      if (!parentCategory) {
        const { data: newParent, error } = await supabase
          .from('categories')
          .insert({
            name: parentCat.name,
            slug: parentCat.slug,
            is_active: true,
            parent_category_id: null
          })
          .select()
          .single();

        if (error) {
          console.error(`❌ Error creating parent category ${parentCat.name}:`, error);
          continue;
        }
        
        parentCategory = newParent;
        categoryMap.set(parentCat.slug, parentCategory);
        console.log(`✅ Created parent category: ${parentCat.name}`);
      }

      // Create subcategories
      if (parentCat.subcategories) {
        for (const subCat of parentCat.subcategories) {
          let subcategory = categoryMap.get(subCat.slug);
          
          if (!subcategory) {
            const { data: newSub, error } = await supabase
              .from('categories')
              .insert({
                name: subCat.name,
                slug: subCat.slug,
                is_active: true,
                parent_category_id: parentCategory.id
              })
              .select()
              .single();

            if (error) {
              console.error(`❌ Error creating subcategory ${subCat.name}:`, error);
              continue;
            }
            
            subcategory = newSub;
            categoryMap.set(subCat.slug, subcategory);
            console.log(`✅ Created subcategory: ${subCat.name} under ${parentCat.name}`);
          }
        }
      }
    }

    // Get existing SKUs to avoid duplicates
    const { data: existingProducts } = await supabase
      .from('products')
      .select('sku');
    
    const existingSKUs = new Set(existingProducts?.map(p => p.sku) || []);

    // Professional product categorization with proper category mapping
    const productCategories = {
      // Fish and Seafood
      'frozen-fish': [
        { name: 'Whiting Fish', price: '$7.50/lb', description: 'Fresh frozen whiting fish, perfect for traditional African dishes. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives. Same rich taste we get from back home. Delivered every week from the farm to our shop.' },
        { name: 'Tilapia Fish', price: '$6.90/lb', description: 'Fresh frozen tilapia fish, mild flavor and firm texture. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' },
        { name: 'Mackerel Fish', price: '$7/lb', description: 'Fresh frozen mackerel fish, rich in omega-3 fatty acids. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' },
        { name: 'Crocker Fish (Headless)', price: '$8.00/lb', description: 'Fresh frozen crocker fish, headless and ready to cook. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' }
      ],
      
      'smoked-fish': [
        { name: 'Smoked Mackerel', price: '$7/lb', description: 'Traditionally smoked mackerel with authentic flavor. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' },
        { name: 'Smoked Cat Fish Large', price: '$9.90', description: 'Large smoked catfish with rich, smoky flavor perfect for pepper soup.' },
        { name: 'Smoked Cat Fish Medium', price: '$10.00', description: 'Medium smoked catfish, ideal for traditional African dishes.' },
        { name: 'Peeled Large Herrings', price: '$9.00/pack', description: 'Premium peeled herrings, ready to cook and full of flavor.' },
        { name: 'Koobi (Salted Fish)', price: '$7.00', description: 'Traditional salted fish (koobi) essential for authentic Ghanaian cooking.' }
      ],

      'poultry': [
        { name: 'Soft Chicken Drumstick (Halal)', price: '$7/lb', description: 'Halal certified soft chicken drumsticks. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives. Same rich taste we get from back home. Delivered every week from the farm to our shop.' },
        { name: 'Chicken Feet', price: '$5/lb', description: 'Fresh chicken feet, perfect for making rich broths and traditional dishes. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' }
      ],

      'turkey': [
        { name: 'Smoked Turkey Wings - Cut', price: '$12.00/lb', description: 'Premium smoked turkey wings, pre-cut for convenience. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' },
        { name: 'Smoked Turkey Wings - Split', price: '$12.00/lb', description: 'Premium smoked turkey wings, split for easy cooking. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' },
        { name: 'Smoked Turkey', price: '$8.50/lb', description: 'Traditional smoked turkey with rich, smoky flavor. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' },
        { name: 'Smoked Turkey Drumstick', price: '$12.00/lb', description: 'Large smoked turkey drumsticks, perfect for hearty meals. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' },
        { name: 'Unsmoked Turkey Wings', price: '$12.00/lb', description: 'Fresh unsmoked turkey wings, ready for your favorite preparation. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' }
      ],

      // Vegetables and Greens
      'african-leafy-greens': [
        { name: 'Ugwu Leaves', price: '$5.50/pack', description: 'Fresh frozen ugwu leaves, essential for Nigerian cuisine. Rich in nutrients and perfect for soups and stews.' },
        { name: 'Jute Leaves (Ewedu)', price: '$5.55/pack', description: 'Traditional jute leaves (ewedu) for authentic Yoruba cuisine. Frozen fresh to preserve nutrients.' },
        { name: 'Water Leaves', price: '$5.50/pack', description: 'Fresh frozen water leaves, a staple vegetable for African soups and stews.' },
        { name: 'Bitter Leaves', price: '$5.55/pack', description: 'Authentic bitter leaves for traditional African bitter leaf soup. Frozen fresh to maintain quality.' },
        { name: 'Cassava Leaves', price: '$5.55/pack', description: 'Fresh frozen cassava leaves for traditional African dishes.' },
        { name: 'Wakye Leaves', price: '$4.00/pack', description: 'Traditional leaves used for cooking wakye (rice and beans).' }
      ],

      'frozen-vegetables': [
        { name: 'Spinach', price: '$3.65/pack', description: 'Fresh frozen spinach, versatile and nutritious green vegetable.' },
        { name: 'CASII Sliced Okro', price: '$3.70/pack', description: 'Pre-sliced okra for convenience, perfect for soups and stews.' },
        { name: 'CASII Chopped Okro', price: '$3.70/pack', description: 'Pre-chopped okra, ready to use in your favorite dishes.' },
        { name: 'Mixed Vegetables', price: '$3.50/pack', description: 'Blend of frozen mixed vegetables for quick and nutritious meals.' },
        { name: 'OCASII Okro Sliced', price: '$6.75/pack', description: 'Pre-sliced okara for convenient cooking.' },
        { name: 'OCASII Chopped Okro', price: '$6.75/pack', description: 'Pre-chopped okra ready for your recipes.' }
      ],

      'fresh-vegetables': [
        { name: 'Fresh Tomatoes', price: '$3.99/lb', description: 'Fresh ripe tomatoes, perfect for sauces and cooking.' },
        { name: 'Yellow Onions', price: '$3.49/bag', description: 'Fresh yellow onions in convenient bag.' },
        { name: 'Fresh Garlic', price: '$2.49/bag', description: 'Fresh garlic bulbs for flavor and health benefits.' },
        { name: 'Fresh Lemon', price: '$0.99/one', description: 'Fresh lemon for cooking and natural vitamin C.' },
        { name: 'Ginger Root', price: '$6.59/kg', description: 'Fresh ginger root, essential for African and Asian cuisine.' },
        { name: 'Wirri Wirri Pepper 200g', price: '$7.66', description: 'Extremely hot West African pepper, use sparingly!' }
      ],

      // Rice and Cereals
      'rice-cereals': [
        { name: 'Guyanese Pride Rice', price: '$25/20lbs', description: 'Premium long-grain rice from Guyana, perfect for all rice dishes.' },
        { name: '555 Basmati Rice 4.54kg', price: '$17.99', description: 'Premium basmati rice with long grains and aromatic flavor.' },
        { name: 'CEDAR Long Grain Parboiled Rice 4lbs', price: '$6.00', description: 'Parboiled long grain rice, fluffy and nutritious.' },
        { name: 'CEDAR Long Grain Parboiled Rice 8.8lbs', price: '$12.00', description: 'Large pack of parboiled long grain rice.' },
        { name: 'Golden Mourn 900g', price: '$13.99', description: 'Premium golden mourn cereal blend, nutritious breakfast option.' }
      ],

      // Traditional Spices and Seasonings
      'traditional-spices': [
        { name: 'Suya Spice/Pepper 125g', price: '$8.25', description: 'Authentic Nigerian suya spice blend with groundnuts and spices.' },
        { name: 'Prekese/Tetrapleura Tetraptera', price: '$5.00/pack', description: 'Traditional West African spice pod, essential for authentic flavoring.' },
        { name: 'Adam Salt/Kawu 210g', price: '$5.00', description: 'Traditional Adam salt (kawu) for authentic African seasoning.' },
        { name: 'Crayfish Whole 100g', price: '$9.99', description: 'Whole dried crayfish for authentic African flavor in soups and stews.' },
        { name: 'Crayfish Ground 100g', price: '$9.99', description: 'Ground crayfish powder for easy seasoning of dishes.' },
        { name: 'Crayfish Ground 50g', price: '$5.00', description: 'Convenient small pack of ground crayfish.' },
        { name: 'Dry Okro', price: '$5.99', description: 'Dried okra for traditional soups and stews, adds natural thickening.' }
      ],

      'seasonings': [
        { name: 'Maggi Chicken (Pack)', price: '$14.00/pack', description: 'Maggi chicken flavour cubes, essential for African cooking.' },
        { name: 'Maggi Shrimp (Pack)', price: '$14.00/pack', description: 'Maggi shrimp flavour cubes for seafood taste.' },
        { name: 'Maggi Crayfish (Pack)', price: '$14.00/pack', description: 'Maggi crayfish flavour cubes for authentic African taste.' },
        { name: 'Knorr Chicken Seasoning Powder 400g', price: '$9.33', description: 'Nigerian Knorr chicken seasoning powder for rich flavor.' },
        { name: 'Onga Powder - Classic', price: '$2.75', description: 'Classic Onga seasoning powder, essential Nigerian spice.' }
      ],

      'sauces': [
        { name: 'Shito 500ml', price: '$15.00', description: 'Authentic Ghanaian shito (black pepper sauce) - hot and flavorful.' },
        { name: 'Shito 250ml', price: '$8.00', description: 'Traditional Ghanaian shito sauce in convenient smaller size.' }
      ],

      // Caribbean and African Pastries
      'caribbean-pastries': [
        { name: 'Pine Tart', price: '$8.00', description: 'Traditional Caribbean pineapple tart with sweet pastry.' },
        { name: 'Salara', price: '$8.00', description: 'Guyanese coconut roll with red coconut filling.' },
        { name: 'Pilourie', price: '$8.00', description: 'Caribbean fried split pea fritters, perfect snack.' },
        { name: 'Chicken Patty - Spicy', price: '$12.00', description: 'Spicy chicken patty made with authentic Caribbean spices.' },
        { name: 'Beef Patty - Spicy', price: '$12.00', description: 'Spicy beef patty with hot Caribbean spices.' },
        { name: 'Vegetable Patty - Spicy', price: '$12.00', description: 'Spicy vegetable patty for vegetarian option.' },
        { name: 'Meat Pie', price: '$3.00/1', description: 'Flaky pastry filled with seasoned ground meat.' },
        { name: 'Vegetable Pie', price: '$3.00/1', description: 'Flaky pastry filled with seasoned mixed vegetables.' }
      ],

      'african-snacks': [
        { name: 'Chinchin', price: '$7.00/pack', description: 'Crunchy Nigerian snack, sweet and addictive.' },
        { name: 'Bofrot/Beignet/Pufpuf', price: '$6.00/pack', description: 'Traditional West African fried dough balls, sweet and fluffy.' },
        { name: 'Yam Chips (2.5kg)', price: '$21.50', description: 'Large pack of crispy yam chips, perfect for snacking or side dishes.' },
        { name: 'Yam Chips (600g)', price: '$8.20', description: 'Small pack of crispy yam chips for convenient portioning.' }
      ],

      'fresh-bread': [
        { name: 'Fresh Bread', price: '$9.99', description: 'Freshly baked bread, soft and delicious.' }
      ]
    };

    let totalAdded = 0;
    const errors = [];

    // Process each category
    for (const [categorySlug, products] of Object.entries(productCategories)) {
      const category = categoryMap.get(categorySlug);
      
      if (!category) {
        console.log(`⚠️  Category not found: ${categorySlug}`);
        continue;
      }

      console.log(`\n📦 Processing ${category.name}...`);
      
      for (const product of products) {
        try {
          const price = parsePrice(product.price);
          const unit = extractUnit(product.price);
          const slug = createSlug(product.name);
          
          // Check if product already exists by slug or name
          const { data: existing } = await supabase
            .from('products')
            .select('id')
            .or(`slug.eq.${slug},name.eq.${product.name}`)
            .single();

          if (existing) {
            console.log(`⚠️  Product already exists: ${product.name}`);
            continue;
          }

          // Generate unique SKU
          const sku = generateUniqueSKU(product.name, existingSKUs);

          // Add product
          const { data, error } = await supabase
            .from('products')
            .insert({
              name: product.name,
              slug: slug,
              description: product.description,
              price: price,
              category_id: category.id,
              unit: unit,
              brand: 'KFresh',
              stock_quantity: Math.floor(Math.random() * 50) + 10, // Random stock 10-60
              is_available: true,
              is_featured: Math.random() > 0.85, // 15% chance of being featured
              images: [],
              sku: sku,
              weight: null,
              compare_price: price > 10 ? Math.round((price * 1.2) * 100) / 100 : null, // 20% markup for compare price on items >$10
              origin: categorySlug.includes('fish') || categorySlug.includes('vegetables') || product.name.includes('Ghana') ? 'Ghana' : null
            })
            .select()
            .single();

          if (error) {
            console.error(`❌ Error adding ${product.name}:`, error);
            errors.push({ product: product.name, error: error.message });
          } else {
            console.log(`✅ Added: ${product.name} - $${price} (${category.name})`);
            totalAdded++;
          }
        } catch (err) {
          console.error(`❌ Error processing ${product.name}:`, err);
          errors.push({ product: product.name, error: err.message });
        }
      }
    }

    console.log(`\n🎉 Professional import completed!`);
    console.log(`✅ Successfully added ${totalAdded} products`);
    console.log(`⚠️  ${errors.length} errors encountered`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors summary:');
      errors.forEach(err => {
        console.log(`  - ${err.product}: ${err.error}`);
      });
    }

  } catch (error) {
    console.error('❌ Error in main process:', error);
  }
}

addProductsProfessionally();