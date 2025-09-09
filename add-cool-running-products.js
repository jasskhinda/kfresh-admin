// Add Cool Running Products Script
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const coolRunningProducts = [
  {
    "productName": "Baking Powder (400g)",
    "urlSlug": "baking-powder-400g",
    "price": 4.00,
    "brand": "Cool Running",
    "category": "Baking Supplies",
    "unitType": "g",
    "weight": 400,
    "unit": "piece",
    "origin": "Caribbean",
    "shortDescription": "Premium double-acting baking powder for perfect rise in cakes, muffins, and breads",
    "description": "Cool Running Baking Powder provides reliable leavening power for all your baking needs. Double-acting formula ensures consistent results every time. Perfect for Caribbean and international baking recipes.",
    "stockQuantity": 50,
    "lowStockThreshold": 5,
    "sku": "CR-BP-400",
    "settings": {
      "availableForSale": true,
      "requiresShipping": true,
      "trackInventory": true
    }
  },
  {
    "productName": "Baking Soda (454g)",
    "urlSlug": "baking-soda-454g",
    "price": 4.00,
    "brand": "Cool Running",
    "category": "Baking Supplies",
    "unitType": "g",
    "weight": 454,
    "unit": "piece",
    "origin": "Caribbean",
    "shortDescription": "Pure sodium bicarbonate for baking, cooking, and household use",
    "description": "High-quality baking soda perfect for leavening baked goods, neutralizing acids, and various household applications. Essential ingredient for Caribbean cooking and baking.",
    "stockQuantity": 50,
    "lowStockThreshold": 5,
    "sku": "CR-BS-454",
    "settings": {
      "availableForSale": true,
      "requiresShipping": true,
      "trackInventory": true
    }
  },
  {
    "productName": "Instant Yeast (185g)",
    "urlSlug": "instant-yeast-185g",
    "price": 9.99,
    "brand": "Cool Running",
    "category": "Baking Supplies",
    "unitType": "g",
    "weight": 185,
    "unit": "piece",
    "origin": "Caribbean",
    "shortDescription": "Fast-acting instant yeast for bread making and baking",
    "description": "Premium instant yeast that doesn't require proofing. Perfect for bread, pizza dough, and traditional Caribbean baked goods. Fast-acting formula saves time in the kitchen.",
    "stockQuantity": 30,
    "lowStockThreshold": 3,
    "sku": "CR-IY-185",
    "settings": {
      "availableForSale": true,
      "requiresShipping": true,
      "trackInventory": true
    }
  },
  {
    "productName": "Fruit Punch Nectar (473ml)",
    "urlSlug": "fruit-punch-nectar-473ml",
    "price": 2.99,
    "brand": "Cool Running",
    "category": "Beverages",
    "unitType": "ml",
    "weight": 473,
    "unit": "piece",
    "origin": "Caribbean",
    "shortDescription": "Tropical fruit punch nectar with authentic Caribbean flavors",
    "description": "Refreshing blend of tropical fruits in a smooth, rich nectar. Made with real fruit flavors for an authentic Caribbean taste experience. Perfect chilled or over ice.",
    "stockQuantity": 100,
    "lowStockThreshold": 10,
    "sku": "CR-FPN-473",
    "settings": {
      "availableForSale": true,
      "requiresShipping": true,
      "trackInventory": true
    }
  },
  {
    "productName": "Mango Nectar (473ml)",
    "urlSlug": "mango-nectar-473ml",
    "price": 2.99,
    "brand": "Cool Running",
    "category": "Beverages",
    "unitType": "ml",
    "weight": 473,
    "unit": "piece",
    "origin": "Caribbean",
    "shortDescription": "Sweet and smooth mango nectar made from ripe Caribbean mangoes",
    "description": "Luxurious mango nectar capturing the essence of ripe Caribbean mangoes. Thick, smooth texture with natural mango flavor. Enjoy chilled for the best taste experience.",
    "stockQuantity": 100,
    "lowStockThreshold": 10,
    "sku": "CR-MN-473",
    "settings": {
      "availableForSale": true,
      "requiresShipping": true,
      "trackInventory": true
    }
  },
  {
    "productName": "Scotch Bonnet Pepper Sauce",
    "urlSlug": "scotch-bonnet-pepper-sauce",
    "price": 3.50,
    "brand": "Cool Running",
    "category": "Sauces",
    "unitType": "ml",
    "weight": 150,
    "unit": "piece",
    "origin": "Caribbean",
    "shortDescription": "Authentic fiery scotch bonnet pepper sauce for true Caribbean heat",
    "description": "Made with genuine scotch bonnet peppers, this sauce delivers authentic Caribbean heat and flavor. Perfect for jerk seasoning, curry dishes, and adding spice to any meal.",
    "stockQuantity": 75,
    "lowStockThreshold": 8,
    "sku": "CR-SBP-150",
    "settings": {
      "availableForSale": true,
      "requiresShipping": true,
      "trackInventory": true
    }
  }
];

async function createCategoriesIfNeeded() {
  console.log('🏷️ Checking/creating categories...');
  
  const requiredCategories = ['Baking Supplies', 'Beverages', 'Sauces'];
  const categoryMap = {};
  
  for (const categoryName of requiredCategories) {
    // Check if category exists
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id, name')
      .eq('name', categoryName)
      .single();
    
    if (existingCategory) {
      console.log(`✅ Category "${categoryName}" already exists`);
      categoryMap[categoryName] = existingCategory.id;
    } else {
      // Create category
      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert([{
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
          is_active: true,
          sort_order: 1,
          is_fresh_meals: false
        }])
        .select('id, name')
        .single();
      
      if (error) {
        console.error(`❌ Failed to create category "${categoryName}":`, error);
        continue;
      }
      
      console.log(`✅ Created category "${categoryName}"`);
      categoryMap[categoryName] = newCategory.id;
    }
  }
  
  return categoryMap;
}

async function addProducts() {
  console.log('📦 Starting product addition process...\n');
  
  try {
    // First, ensure categories exist
    const categoryMap = await createCategoriesIfNeeded();
    
    console.log('\n📦 Adding products...');
    
    for (const product of coolRunningProducts) {
      console.log(`\n🔄 Processing: ${product.productName}`);
      
      // Check if product already exists
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id, name')
        .eq('slug', product.urlSlug)
        .single();
      
      if (existingProduct) {
        console.log(`⚠️  Product "${product.productName}" already exists, skipping...`);
        continue;
      }
      
      // Get category ID
      const categoryId = categoryMap[product.category];
      if (!categoryId) {
        console.log(`❌ Category "${product.category}" not found for ${product.productName}`);
        continue;
      }
      
      // Prepare product data
      const productData = {
        name: product.productName,
        slug: product.urlSlug,
        description: product.description,
        short_description: product.shortDescription,
        price: product.price,
        sku: product.sku,
        category_id: categoryId,
        brand: product.brand,
        unit: product.unit,
        weight: product.weight,
        stock_quantity: product.stockQuantity,
        low_stock_threshold: product.lowStockThreshold,
        track_inventory: product.settings.trackInventory,
        is_available: product.settings.availableForSale,
        requires_shipping: product.settings.requiresShipping,
        is_featured: false,
        is_cooked: false,
        tax_exempt: false,
        images: [],
        metadata: {
          origin: product.origin,
          unit_type: product.unitType
        }
      };
      
      // Insert product
      const { data: insertedProduct, error } = await supabase
        .from('products')
        .insert([productData])
        .select('id, name')
        .single();
      
      if (error) {
        console.error(`❌ Failed to add ${product.productName}:`, error.message);
        continue;
      }
      
      console.log(`✅ Successfully added: ${product.productName}`);
    }
    
    console.log('\n🎉 Product addition completed!');
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
addProducts();