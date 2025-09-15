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
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
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

// Professional 4-level category structure
const categoryStructure = [
  {
    name: 'Meat & Seafood',
    slug: 'meat-seafood',
    level: 1,
    children: [
      {
        name: 'Fish',
        slug: 'fish',
        level: 2,
        children: [
          {
            name: 'Frozen Fish',
            slug: 'frozen-fish',
            level: 3,
            children: [
              { name: 'Whole Fish', slug: 'whole-fish', level: 4 },
              { name: 'Fish Fillets', slug: 'fish-fillets', level: 4 }
            ]
          },
          {
            name: 'Smoked Fish',
            slug: 'smoked-fish',
            level: 3,
            children: [
              { name: 'Catfish', slug: 'smoked-catfish', level: 4 },
              { name: 'Mackerel', slug: 'smoked-mackerel', level: 4 },
              { name: 'Herrings', slug: 'smoked-herrings', level: 4 }
            ]
          }
        ]
      },
      {
        name: 'Poultry & Meat',
        slug: 'poultry-meat',
        level: 2,
        children: [
          {
            name: 'Chicken',
            slug: 'chicken',
            level: 3,
            children: [
              { name: 'Drumsticks', slug: 'chicken-drumsticks', level: 4 },
              { name: 'Wings', slug: 'chicken-wings', level: 4 },
              { name: 'Feet', slug: 'chicken-feet', level: 4 }
            ]
          },
          {
            name: 'Turkey',
            slug: 'turkey',
            level: 3,
            children: [
              { name: 'Turkey Wings', slug: 'turkey-wings', level: 4 },
              { name: 'Turkey Drumsticks', slug: 'turkey-drumsticks', level: 4 }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Fresh Produce',
    slug: 'fresh-produce',
    level: 1,
    children: [
      {
        name: 'Vegetables',
        slug: 'vegetables',
        level: 2,
        children: [
          {
            name: 'Leafy Greens',
            slug: 'leafy-greens',
            level: 3,
            children: [
              { name: 'African Greens', slug: 'african-greens', level: 4 },
              { name: 'Regular Greens', slug: 'regular-greens', level: 4 }
            ]
          },
          {
            name: 'Root Vegetables',
            slug: 'root-vegetables',
            level: 3,
            children: [
              { name: 'Yam', slug: 'yam', level: 4 },
              { name: 'Ginger', slug: 'ginger', level: 4 }
            ]
          }
        ]
      },
      {
        name: 'Fruits',
        slug: 'fruits',
        level: 2,
        children: [
          {
            name: 'Tropical Fruits',
            slug: 'tropical-fruits',
            level: 3,
            children: [
              { name: 'Plantains', slug: 'plantains', level: 4 },
              { name: 'Citrus', slug: 'citrus', level: 4 }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Pantry Essentials',
    slug: 'pantry-essentials',
    level: 1,
    children: [
      {
        name: 'Grains & Cereals',
        slug: 'grains-cereals',
        level: 2,
        children: [
          {
            name: 'Rice',
            slug: 'rice',
            level: 3,
            children: [
              { name: 'Basmati Rice', slug: 'basmati-rice', level: 4 },
              { name: 'Jasmine Rice', slug: 'jasmine-rice', level: 4 }
            ]
          },
          {
            name: 'Flour & Meals',
            slug: 'flour-meals',
            level: 3,
            children: [
              { name: 'Cassava Flour', slug: 'cassava-flour', level: 4 },
              { name: 'Corn Flour', slug: 'corn-flour', level: 4 }
            ]
          }
        ]
      },
      {
        name: 'Canned & Packaged',
        slug: 'canned-packaged',
        level: 2,
        children: [
          {
            name: 'Canned Goods',
            slug: 'canned-goods',
            level: 3,
            children: [
              { name: 'Tomato Products', slug: 'tomato-products', level: 4 },
              { name: 'Beans', slug: 'canned-beans', level: 4 }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Spices & Seasonings',
    slug: 'spices-seasonings',
    level: 1,
    children: [
      {
        name: 'Traditional Spices',
        slug: 'traditional-spices',
        level: 2,
        children: [
          {
            name: 'African Spices',
            slug: 'african-spices',
            level: 3,
            children: [
              { name: 'Suya Spice', slug: 'suya-spice', level: 4 },
              { name: 'Crayfish', slug: 'crayfish', level: 4 }
            ]
          }
        ]
      },
      {
        name: 'Seasonings & Cubes',
        slug: 'seasonings-cubes',
        level: 2,
        children: [
          {
            name: 'Maggi Products',
            slug: 'maggi-products',
            level: 3,
            children: [
              { name: 'Chicken Cubes', slug: 'chicken-cubes', level: 4 },
              { name: 'Shrimp Cubes', slug: 'shrimp-cubes', level: 4 }
            ]
          }
        ]
      },
      {
        name: 'Cooking Oils',
        slug: 'cooking-oils',
        level: 2,
        children: [
          {
            name: 'Palm Oil',
            slug: 'palm-oil',
            level: 3,
            children: [
              { name: 'Regular Palm Oil', slug: 'regular-palm-oil', level: 4 },
              { name: 'Zomi Palm Oil', slug: 'zomi-palm-oil', level: 4 }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Fresh Bakery',
    slug: 'fresh-bakery',
    level: 1,
    children: [
      {
        name: 'Pastries',
        slug: 'pastries',
        level: 2,
        children: [
          {
            name: 'Caribbean Pastries',
            slug: 'caribbean-pastries',
            level: 3,
            children: [
              { name: 'Patties', slug: 'patties', level: 4 },
              { name: 'Tarts', slug: 'tarts', level: 4 }
            ]
          },
          {
            name: 'African Snacks',
            slug: 'african-snacks',
            level: 3,
            children: [
              { name: 'Fried Snacks', slug: 'fried-snacks', level: 4 },
              { name: 'Chips', slug: 'chips', level: 4 }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Beverages',
    slug: 'beverages',
    level: 1,
    children: [
      {
        name: 'Traditional Drinks',
        slug: 'traditional-drinks',
        level: 2,
        children: [
          {
            name: 'Zobo & Natural',
            slug: 'zobo-natural',
            level: 3,
            children: [
              { name: 'Zobo Drinks', slug: 'zobo-drinks', level: 4 },
              { name: 'Fura Drinks', slug: 'fura-drinks', level: 4 }
            ]
          }
        ]
      },
      {
        name: 'Soft Drinks',
        slug: 'soft-drinks',
        level: 2,
        children: [
          {
            name: 'Carbonated',
            slug: 'carbonated',
            level: 3,
            children: [
              { name: 'Colas', slug: 'colas', level: 4 },
              { name: 'Citrus Sodas', slug: 'citrus-sodas', level: 4 }
            ]
          },
          {
            name: 'Water',
            slug: 'water',
            level: 3,
            children: [
              { name: 'Spring Water', slug: 'spring-water', level: 4 }
            ]
          }
        ]
      }
    ]
  }
];

// Product mapping to most specific category (level 4 when possible, otherwise deepest available)
const productMapping = {
  // Fish Products
  'whole-fish': [
    { name: 'Whiting Fish', price: '$7.50/lb', description: 'Fresh frozen whiting fish, perfect for traditional African dishes. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' },
    { name: 'Tilapia Fish', price: '$6.90/lb', description: 'Fresh frozen tilapia fish, mild flavor and firm texture.' },
    { name: 'Mackerel Fish', price: '$7/lb', description: 'Fresh frozen mackerel fish, rich in omega-3 fatty acids.' },
    { name: 'Crocker Fish (Headless)', price: '$8.00/lb', description: 'Fresh frozen crocker fish, headless and ready to cook.' }
  ],
  
  'smoked-catfish': [
    { name: 'Smoked Cat Fish Large', price: '$9.90', description: 'Large smoked catfish with rich, smoky flavor perfect for pepper soup.' },
    { name: 'Smoked Cat Fish Medium', price: '$10.00', description: 'Medium smoked catfish, ideal for traditional African dishes.' }
  ],
  
  'smoked-mackerel': [
    { name: 'Smoked Mackerel', price: '$7/lb', description: 'Traditionally smoked mackerel with authentic flavor.' }
  ],
  
  'smoked-herrings': [
    { name: 'Peeled Large Herrings', price: '$9.00/pack', description: 'Premium peeled herrings, ready to cook and full of flavor.' },
    { name: 'Koobi (Salted Fish)', price: '$7.00', description: 'Traditional salted fish (koobi) essential for authentic Ghanaian cooking.' }
  ],
  
  // Poultry
  'chicken-drumsticks': [
    { name: 'Soft Chicken Drumstick (Halal)', price: '$7/lb', description: 'Halal certified soft chicken drumsticks.' }
  ],
  
  'chicken-feet': [
    { name: 'Chicken Feet', price: '$5/lb', description: 'Fresh chicken feet, perfect for making rich broths.' }
  ],
  
  'turkey-wings': [
    { name: 'Smoked Turkey Wings - Cut', price: '$12.00/lb', description: 'Premium smoked turkey wings, pre-cut for convenience.' },
    { name: 'Smoked Turkey Wings - Split', price: '$12.00/lb', description: 'Premium smoked turkey wings, split for easy cooking.' },
    { name: 'Unsmoked Turkey Wings', price: '$12.00/lb', description: 'Fresh unsmoked turkey wings.' }
  ],
  
  'turkey-drumsticks': [
    { name: 'Smoked Turkey Drumstick', price: '$12.00/lb', description: 'Large smoked turkey drumsticks, perfect for hearty meals.' }
  ],
  
  // African Greens
  'african-greens': [
    { name: 'Ugwu Leaves', price: '$5.50/pack', description: 'Fresh frozen ugwu leaves, essential for Nigerian cuisine.' },
    { name: 'Jute Leaves (Ewedu)', price: '$5.55/pack', description: 'Traditional jute leaves (ewedu) for authentic Yoruba cuisine.' },
    { name: 'Water Leaves', price: '$5.50/pack', description: 'Fresh frozen water leaves, a staple vegetable for African soups.' },
    { name: 'Bitter Leaves', price: '$5.55/pack', description: 'Authentic bitter leaves for traditional African bitter leaf soup.' },
    { name: 'Cassava Leaves', price: '$5.55/pack', description: 'Fresh frozen cassava leaves for traditional African dishes.' }
  ],
  
  'regular-greens': [
    { name: 'Spinach', price: '$3.65/pack', description: 'Fresh frozen spinach, versatile and nutritious green vegetable.' }
  ],
  
  // Root Vegetables
  'yam': [
    { name: 'Ghana Yam', price: '$3.15/lb', description: 'Authentic Ghana yam, perfect for pounded yam and boiled yam.' }
  ],
  
  'ginger': [
    { name: 'Ginger Root', price: '$6.59/kg', description: 'Fresh ginger root, essential for African and Asian cuisine.' }
  ],
  
  // Plantains
  'plantains': [
    { name: 'Green Plantain', price: '$1.25/lb', description: 'Fresh green plantains for frying, boiling, and cooking.' },
    { name: 'Ripe Plantain', price: '$1.20/lb', description: 'Sweet ripe plantains, perfect for frying and baking.' }
  ],
  
  // Citrus
  'citrus': [
    { name: 'Fresh Lemon', price: '$0.99/one', description: 'Fresh lemon for cooking and natural vitamin C.' }
  ],
  
  // Rice
  'basmati-rice': [
    { name: '555 Basmati Rice 4.54kg', price: '$17.99', description: 'Premium basmati rice with long grains and aromatic flavor.' }
  ],
  
  'jasmine-rice': [
    { name: 'Guyanese Pride Rice', price: '$25/20lbs', description: 'Premium long-grain rice from Guyana.' }
  ],
  
  // Spices
  'suya-spice': [
    { name: 'Suya Spice/Pepper 125g', price: '$8.25', description: 'Authentic Nigerian suya spice blend with groundnuts and spices.' }
  ],
  
  'crayfish': [
    { name: 'Crayfish Whole 100g', price: '$9.99', description: 'Whole dried crayfish for authentic African flavor.' },
    { name: 'Crayfish Ground 100g', price: '$9.99', description: 'Ground crayfish powder for easy seasoning.' },
    { name: 'Crayfish Ground 50g', price: '$5.00', description: 'Convenient small pack of ground crayfish.' }
  ],
  
  // Seasonings
  'chicken-cubes': [
    { name: 'Maggi Chicken (Pack)', price: '$14.00/pack', description: 'Maggi chicken flavour cubes, essential for African cooking.' }
  ],
  
  'shrimp-cubes': [
    { name: 'Maggi Shrimp (Pack)', price: '$14.00/pack', description: 'Maggi shrimp flavour cubes for seafood taste.' }
  ],
  
  // Palm Oil
  'regular-palm-oil': [
    { name: 'Palm Oil Regular 2L', price: '$16.83', description: 'Traditional red palm oil, essential for authentic African cuisine.' },
    { name: 'Palm Oil Regular 1L', price: '$8.99', description: 'Premium red palm oil in convenient 1L bottle.' }
  ],
  
  'zomi-palm-oil': [
    { name: 'Palm Oil Zomi 2L', price: '$16.83', description: 'Zomi brand premium red palm oil.' },
    { name: 'Palm Oil Zomi 1L', price: '$8.99', description: 'Zomi brand red palm oil in 1L bottle.' }
  ],
  
  // Pastries & Snacks
  'patties': [
    { name: 'Chicken Patty - Spicy', price: '$12.00', description: 'Spicy chicken patty made with authentic Caribbean spices.' },
    { name: 'Beef Patty - Spicy', price: '$12.00', description: 'Spicy beef patty with hot Caribbean spices.' },
    { name: 'Vegetable Patty - Spicy', price: '$12.00', description: 'Spicy vegetable patty for vegetarian option.' }
  ],
  
  'tarts': [
    { name: 'Pine Tart', price: '$8.00', description: 'Traditional Caribbean pineapple tart with sweet pastry.' }
  ],
  
  'fried-snacks': [
    { name: 'Chinchin', price: '$7.00/pack', description: 'Crunchy Nigerian snack, sweet and addictive.' },
    { name: 'Bofrot/Beignet/Pufpuf', price: '$6.00/pack', description: 'Traditional West African fried dough balls.' }
  ],
  
  'chips': [
    { name: 'Yam Chips (2.5kg)', price: '$21.50', description: 'Large pack of crispy yam chips.' }
  ],
  
  // Drinks
  'zobo-drinks': [
    { name: 'Aladun Zobo 500ml', price: '$5.00', description: 'Premium Nigerian zobo drink with natural ingredients.' },
    { name: 'Rayjuice Co. Zobo/Sobolo', price: '$5.00', description: 'Cold pressed ginger hibiscus blend.' }
  ],
  
  'fura-drinks': [
    { name: 'Hajia Fati (Fura)', price: '$5.00', description: 'Traditional Nigerian fura drink, nutritious and refreshing.' }
  ],
  
  'colas': [
    { name: 'Coca-Cola 355ml', price: '$2.50', description: 'Classic Coca-Cola in 355ml can.' }
  ],
  
  'citrus-sodas': [
    { name: 'Fanta 355ml', price: '$2.50', description: 'Orange Fanta soda in 355ml can.' },
    { name: 'Sprite 355ml', price: '$2.50', description: 'Lemon-lime Sprite soda in 355ml can.' }
  ],
  
  'spring-water': [
    { name: 'Kirkland Spring Water 500ml', price: '$1.00', description: 'Pure natural spring water.' },
    { name: 'Eska Natural Spring Water 500ml', price: '$1.50', description: 'Premium natural spring water.' }
  ]
};

async function createCategoryHierarchy() {
  console.log('🚀 Creating professional 4-level category hierarchy...');
  
  const categoryMap = new Map();
  
  async function createCategory(categoryData, parentId = null, displayOrder = 0) {
    try {
      // Check if category exists
      const { data: existing } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('slug', categoryData.slug)
        .single();

      let category;
      
      if (existing) {
        console.log(`⚠️  Using existing category: ${categoryData.name} (Level ${categoryData.level})`);
        category = existing;
      } else {
        const { data: newCategory, error } = await supabase
          .from('categories')
          .insert({
            name: categoryData.name,
            slug: categoryData.slug,
            parent_category_id: parentId,
            level: categoryData.level,
            display_order: displayOrder,
            is_active: true
          })
          .select()
          .single();

        if (error) {
          console.error(`❌ Error creating category ${categoryData.name}:`, error);
          return null;
        }
        
        category = newCategory;
        console.log(`✅ Created: ${categoryData.name} (Level ${categoryData.level})`);
      }
      
      categoryMap.set(categoryData.slug, category);
      
      // Create children recursively
      if (categoryData.children) {
        for (let i = 0; i < categoryData.children.length; i++) {
          await createCategory(categoryData.children[i], category.id, i);
        }
      }
      
      return category;
    } catch (error) {
      console.error(`❌ Error processing category ${categoryData.name}:`, error);
      return null;
    }
  }
  
  // Create all categories
  for (let i = 0; i < categoryStructure.length; i++) {
    await createCategory(categoryStructure[i], null, i);
  }
  
  return categoryMap;
}

async function addProductsProfessionally() {
  try {
    // Create category hierarchy
    const categoryMap = await createCategoryHierarchy();
    
    // Get existing SKUs to avoid duplicates
    const { data: existingProducts } = await supabase
      .from('products')
      .select('sku');
    
    const existingSKUs = new Set(existingProducts?.map(p => p.sku) || []);
    
    let totalAdded = 0;
    const errors = [];
    
    // Add products
    for (const [categorySlug, products] of Object.entries(productMapping)) {
      const category = categoryMap.get(categorySlug);
      
      if (!category) {
        console.log(`⚠️  Category not found: ${categorySlug}`);
        continue;
      }
      
      console.log(`\n📦 Adding products to ${category.name}...`);
      
      for (const product of products) {
        try {
          const price = parsePrice(product.price);
          const unit = extractUnit(product.price);
          const slug = createSlug(product.name);
          
          // Check if product already exists
          const { data: existing } = await supabase
            .from('products')
            .select('id')
            .or(`slug.eq.${slug},name.eq.${product.name}`)
            .single();

          if (existing) {
            console.log(`⚠️  Product already exists: ${product.name}`);
            continue;
          }

          const sku = generateUniqueSKU(product.name, existingSKUs);

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
              stock_quantity: Math.floor(Math.random() * 50) + 10,
              is_available: true,
              is_featured: Math.random() > 0.9, // 10% featured
              images: [],
              sku: sku,
              weight: null,
              compare_price: price > 5 ? Math.round((price * 1.15) * 100) / 100 : null,
              origin: product.name.includes('Ghana') || categorySlug.includes('african') ? 'Ghana' : null
            })
            .select()
            .single();

          if (error) {
            console.error(`❌ Error adding ${product.name}:`, error);
            errors.push({ product: product.name, error: error.message });
          } else {
            console.log(`✅ Added: ${product.name} → ${category.name}`);
            totalAdded++;
          }
        } catch (err) {
          console.error(`❌ Error processing ${product.name}:`, err);
          errors.push({ product: product.name, error: err.message });
        }
      }
    }
    
    console.log(`\n🎉 Professional 4-level import completed!`);
    console.log(`✅ Successfully added ${totalAdded} products`);
    console.log(`📁 Created hierarchical category structure with up to 4 levels`);
    console.log(`⚠️  ${errors.length} errors encountered`);
    
  } catch (error) {
    console.error('❌ Error in main process:', error);
  }
}

addProductsProfessionally();