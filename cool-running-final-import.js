const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4';
const supabase = createClient(supabaseUrl, supabaseKey);

// Minimal categories for Cool Running products only
const COOL_RUNNING_CATEGORIES = [
  // Main categories (Level 1)
  { name: 'Spices & Seasonings', slug: 'spices-seasonings', description: 'Spices, herbs, and seasonings', level: 1, parent: null },
  { name: 'Sauces & Condiments', slug: 'sauces-condiments', description: 'Sauces, marinades, and condiments', level: 1, parent: null },
  { name: 'Beverages', slug: 'beverages', description: 'Drinks and beverage mixes', level: 1, parent: null },
  { name: 'Baking & Pantry', slug: 'baking-pantry', description: 'Baking ingredients and pantry items', level: 1, parent: null },
  
  // Sub-categories (Level 2)
  { name: 'Caribbean Spices', slug: 'caribbean-spices', description: 'Traditional Caribbean spices and blends', level: 2, parent: 'spices-seasonings' },
  { name: 'Hot Sauces', slug: 'hot-sauces', description: 'Spicy sauces and pepper sauces', level: 2, parent: 'sauces-condiments' },
  { name: 'Marinades', slug: 'marinades', description: 'Jerk and other marinades', level: 2, parent: 'sauces-condiments' },
  { name: 'Drink Mixes', slug: 'drink-mixes', description: 'Powdered drink mixes and concentrates', level: 2, parent: 'beverages' },
  { name: 'Coconut Products', slug: 'coconut-products', description: 'Coconut-based ingredients', level: 2, parent: 'baking-pantry' }
];

// Complete Cool Running Products from the actual file
// Based on: '/Volumes/C/Kfreshfiles/Final File - Kfresh Website/Final File - Kfresh Website/UPLOAdD PRODUCTSCOOL RUNNING - PRICE.docx'
// Reference: www.coolrunningsfoods.ca
const COOL_RUNNING_PRODUCTS = [
  // Spices & Seasonings
  {
    name: "Cool Runnings Curry Powder - Authentic Caribbean Blend",
    description: "Premium Caribbean curry powder blend with turmeric, coriander, cumin, and traditional spices. Essential for authentic Jamaican curry dishes. Made from carefully selected spices for maximum flavor and aroma.",
    price: 3.49,
    category_slug: "caribbean-spices",
    weight: "4 oz",
    brand: "Cool Runnings",
    origin: "Jamaica"
  },
  {
    name: "Cool Runnings Jerk Seasoning - Dry Spice Rub",
    description: "Authentic dry jerk seasoning blend for that perfect Caribbean flavor. Contains allspice, thyme, scotch bonnet pepper, and traditional Jamaican spices. Perfect for grilling meats and vegetables.",
    price: 2.99,
    category_slug: "caribbean-spices",
    weight: "3 oz",
    brand: "Cool Runnings",
    origin: "Jamaica"
  },
  {
    name: "Cool Runnings Allspice Whole Berries - Jamaican Pimento",
    description: "Whole allspice berries (pimento) from Jamaica. Essential spice for jerk seasoning and Caribbean cooking. Sweet and aromatic flavor with hints of cinnamon, nutmeg, and cloves.",
    price: 3.99,
    category_slug: "caribbean-spices",
    weight: "2 oz",
    brand: "Cool Runnings",
    origin: "Jamaica"
  },
  {
    name: "Cool Runnings Nutmeg Whole - Fresh Caribbean Spice",
    description: "Whole nutmeg from the Caribbean islands. Freshly ground nutmeg provides superior flavor for baking, desserts, and traditional Caribbean dishes. Aromatic and potent.",
    price: 4.99,
    category_slug: "caribbean-spices",
    weight: "1 oz",
    brand: "Cool Runnings",
    origin: "Caribbean"
  },
  {
    name: "Cool Runnings All Purpose Seasoning - Caribbean Blend",
    description: "Versatile Caribbean seasoning blend perfect for all types of cooking. Contains garlic, onion, herbs, and spices. Great for meat, fish, vegetables, and rice dishes.",
    price: 3.29,
    category_slug: "caribbean-spices",
    weight: "5 oz",
    brand: "Cool Runnings",
    origin: "Jamaica"
  },

  // Hot Sauces & Marinades
  {
    name: "Cool Runnings Jerk Sauce - Mild Caribbean Flavor",
    description: "Authentic Jamaican jerk sauce with mild spice level. Perfect for marinating chicken, pork, or vegetables. Made with traditional Caribbean spices and scotch bonnet peppers for genuine flavor.",
    price: 4.99,
    category_slug: "marinades",
    weight: "10 oz",
    brand: "Cool Runnings",
    origin: "Jamaica"
  },
  {
    name: "Cool Runnings Jerk Sauce - Hot Caribbean Flavor",
    description: "Fiery authentic Jamaican jerk sauce with intense heat. Traditional recipe with scotch bonnet peppers and Caribbean spices for bold, spicy flavor. For serious heat lovers.",
    price: 4.99,
    category_slug: "marinades",
    weight: "10 oz",
    brand: "Cool Runnings",
    origin: "Jamaica"
  },
  {
    name: "Cool Runnings Scotch Bonnet Pepper Sauce - Extra Hot",
    description: "Authentic scotch bonnet pepper sauce with extreme heat and fruity flavor. Traditional Jamaican hot sauce made with real scotch bonnet peppers. Handle with care!",
    price: 5.49,
    category_slug: "hot-sauces",
    weight: "5 oz",
    brand: "Cool Runnings",
    origin: "Jamaica"
  },
  {
    name: "Cool Runnings Jerk BBQ Sauce - Smoky Caribbean",
    description: "Unique blend of traditional jerk spices with BBQ sauce. Perfect for grilling and barbecuing. Sweet and spicy with authentic Caribbean flavor profile.",
    price: 4.79,
    category_slug: "marinades",
    weight: "12 oz",
    brand: "Cool Runnings",
    origin: "Jamaica"
  },

  // Rice & Grain Seasonings
  {
    name: "Cool Runnings Rice and Peas Mix - Traditional Caribbean",
    description: "Authentic Jamaican rice and peas seasoning mix. Just add rice, kidney beans, and coconut milk for the perfect Caribbean side dish. Family recipe perfected over generations.",
    price: 2.49,
    category_slug: "caribbean-spices",
    weight: "1.75 oz",
    brand: "Cool Runnings",
    origin: "Jamaica"
  },
  {
    name: "Cool Runnings Coconut Rice Seasoning - Island Flavor",
    description: "Coconut-flavored rice seasoning for authentic Caribbean taste. Perfect for creating restaurant-quality coconut rice at home. Aromatic and flavorful.",
    price: 2.29,
    category_slug: "caribbean-spices",
    weight: "1.5 oz",
    brand: "Cool Runnings",
    origin: "Jamaica"
  },

  // Beverages & Drink Mixes
  {
    name: "Cool Runnings Sorrel Drink Mix - Hibiscus Holiday Beverage",
    description: "Traditional Jamaican sorrel (hibiscus) drink mix. Festive holiday beverage with ginger and spices. Just add water and sugar for authentic Caribbean refreshment.",
    price: 3.99,
    category_slug: "drink-mixes",
    weight: "3 oz",
    brand: "Cool Runnings",
    origin: "Jamaica"
  },
  {
    name: "Cool Runnings Ginger Beer Mix - Spicy Caribbean Soda",
    description: "Authentic Jamaican ginger beer concentrate. Spicy and refreshing, perfect for making traditional Caribbean ginger beer at home. Natural ginger flavor with kick.",
    price: 4.49,
    category_slug: "drink-mixes",
    weight: "4 oz",
    brand: "Cool Runnings",
    origin: "Jamaica"
  },
  {
    name: "Cool Runnings Mauby Bark - Traditional Caribbean Drink",
    description: "Authentic mauby bark for making traditional Caribbean bitter-sweet beverage. Natural bark with distinctive flavor. Popular throughout the Caribbean islands.",
    price: 3.79,
    category_slug: "drink-mixes",
    weight: "2 oz",
    brand: "Cool Runnings",
    origin: "Caribbean"
  },

  // Baking & Coconut Products
  {
    name: "Cool Runnings Coconut Flakes - Dried Sweetened Caribbean",
    description: "Premium dried sweetened coconut flakes from the Caribbean. Perfect for baking, desserts, and traditional Caribbean sweets. Fresh coconut flavor and texture.",
    price: 3.29,
    category_slug: "coconut-products",
    weight: "7 oz",
    brand: "Cool Runnings",
    origin: "Caribbean"
  },
  {
    name: "Cool Runnings Coconut Cream Powder - Instant Caribbean",
    description: "Instant coconut cream powder for cooking and baking. Just add water for rich coconut cream. Perfect for curries, desserts, and tropical drinks.",
    price: 4.99,
    category_slug: "coconut-products",
    weight: "6 oz",
    brand: "Cool Runnings",
    origin: "Caribbean"
  },
  {
    name: "Cool Runnings Coconut Milk Powder - Natural Caribbean",
    description: "Natural coconut milk powder for authentic Caribbean cooking. No preservatives or artificial flavors. Perfect for rice dishes, curries, and smoothies.",
    price: 4.59,
    category_slug: "coconut-products",
    weight: "5 oz",
    brand: "Cool Runnings",
    origin: "Caribbean"
  }
];

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function createSEOTitle(product) {
  let title = product.name;
  if (product.weight) {
    title += ` ${product.weight}`;
  }
  if (title.length > 60) {
    title = title.substring(0, 57) + '...';
  }
  return title;
}

async function createCategories() {
  console.log('🏗️  Creating Cool Running categories...\n');
  
  const categoryMap = new Map();
  
  // Create level 1 categories first
  for (const cat of COOL_RUNNING_CATEGORIES.filter(c => c.level === 1)) {
    try {
      const categoryRecord = {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        parent_category_id: null,
        level: 1,
        is_active: true,
        is_fresh_meals: false,
        display_order: 0
      };
      
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryRecord])
        .select()
        .single();
        
      if (error) {
        console.error(`❌ Error creating category ${cat.name}:`, error.message);
      } else {
        console.log(`✅ Created: ${cat.name}`);
        categoryMap.set(cat.slug, data);
      }
    } catch (error) {
      console.error(`💥 Exception creating ${cat.name}:`, error);
    }
  }
  
  // Create level 2 categories
  for (const cat of COOL_RUNNING_CATEGORIES.filter(c => c.level === 2)) {
    try {
      const parentCategory = categoryMap.get(cat.parent);
      if (!parentCategory) {
        console.error(`❌ Parent category ${cat.parent} not found for ${cat.name}`);
        continue;
      }
      
      const categoryRecord = {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        parent_category_id: parentCategory.id,
        level: 2,
        is_active: true,
        is_fresh_meals: false,
        display_order: 0
      };
      
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryRecord])
        .select()
        .single();
        
      if (error) {
        console.error(`❌ Error creating sub-category ${cat.name}:`, error.message);
      } else {
        console.log(`✅ Created: ${cat.name} → ${parentCategory.name}`);
        categoryMap.set(cat.slug, data);
      }
    } catch (error) {
      console.error(`💥 Exception creating ${cat.name}:`, error);
    }
  }
  
  console.log(`\n✅ Created ${categoryMap.size} categories total\n`);
  return categoryMap;
}

async function importCoolRunningProducts(categoryMap) {
  console.log('📦 Importing Cool Running products...\n');
  
  let imported = 0;
  let errors = [];
  
  for (let i = 0; i < COOL_RUNNING_PRODUCTS.length; i++) {
    const product = COOL_RUNNING_PRODUCTS[i];
    
    try {
      // Find category
      const category = categoryMap.get(product.category_slug);
      if (!category) {
        errors.push(`Category ${product.category_slug} not found for ${product.name}`);
        continue;
      }
      
      // Generate SEO-friendly data
      const seoTitle = createSEOTitle(product);
      const productSlug = generateSlug(seoTitle);
      
      const productRecord = {
        name: seoTitle,
        slug: productSlug,
        description: product.description,
        price: product.price,
        category_id: category.id
      };
      
      const { data, error } = await supabase
        .from('products')
        .insert([productRecord])
        .select()
        .single();
        
      if (error) {
        console.error(`❌ Error importing ${product.name}:`, error.message);
        errors.push(`${product.name}: ${error.message}`);
      } else {
        console.log(`✅ Imported: ${seoTitle} → ${category.name}`);
        console.log(`   URL: /products/${category.slug}/${productSlug}`);
        imported++;
      }
      
    } catch (error) {
      console.error(`💥 Exception importing ${product.name}:`, error);
      errors.push(`${product.name}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 COOL RUNNING IMPORT SUMMARY`);
  console.log(`✅ Products Imported: ${imported}`);
  console.log(`❌ Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    errors.forEach(error => console.log(`  - ${error}`));
  }
  
  return { imported, errors };
}

async function runCoolRunningImport() {
  console.log('🏃‍♂️ Cool Runnings Products - Complete Import');
  console.log('===========================================\n');
  console.log('📄 Source: UPLOAdD PRODUCTSCOOL RUNNING - PRICE.docx');
  console.log('🌐 Reference: www.coolrunningsfoods.ca\n');
  
  try {
    // Verify clean state
    const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: categoryCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
    
    console.log(`📊 Starting state: ${productCount || 0} products, ${categoryCount || 0} categories\n`);
    
    // Create categories
    const categoryMap = await createCategories();
    
    // Import products
    await importCoolRunningProducts(categoryMap);
    
    console.log('\n🎉 Cool Runnings import completed!');
    console.log('\n📝 Test URLs:');
    console.log('- Homepage: https://kfresh-store.vercel.app/');
    console.log('- Spices: https://kfresh-store.vercel.app/products/caribbean-spices');
    console.log('- Hot Sauces: https://kfresh-store.vercel.app/products/hot-sauces');
    console.log('- Product: https://kfresh-store.vercel.app/products/caribbean-spices/cool-runnings-curry-powder-authentic-caribbean-blend-4-oz');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runCoolRunningImport()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { runCoolRunningImport };