const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4';
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple 2-level category structure (matching the UI categories you saw)
const SIMPLE_CATEGORIES = [
  // Level 1 - Main Categories
  { name: 'Rice', slug: 'rice', description: 'Rice varieties and grain products', level: 1, parent: null },
  { name: 'Meat & Seafood', slug: 'meat-seafood', description: 'Fresh and frozen meat, poultry, and seafood', level: 1, parent: null },
  { name: 'Beverages', slug: 'beverages', description: 'Drinks, juices, and beverages', level: 1, parent: null },
  { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', description: 'Fresh produce and vegetables', level: 1, parent: null },
  { name: 'Canned & Packaged', slug: 'canned-packaged', description: 'Canned goods and packaged items', level: 1, parent: null },
  { name: 'Cooked Food', slug: 'cooked-food', description: 'Ready-to-eat meals and prepared foods', level: 1, parent: null },
  { name: 'Dairy & Egg', slug: 'dairy-egg', description: 'Dairy products and eggs', level: 1, parent: null },
  { name: 'Flour & Grits', slug: 'flour-grits', description: 'Flour, grits, and baking ingredients', level: 1, parent: null },
  { name: 'Spices & Herbs', slug: 'spices-herbs', description: 'Spices, herbs, and seasonings', level: 1, parent: null },
  
  // Level 2 - Sub Categories (only a few key ones)
  { name: 'Caribbean Spices', slug: 'caribbean-spices', description: 'Traditional Caribbean spices and seasonings', level: 2, parent: 'spices-herbs' },
  { name: 'Jamaican Products', slug: 'jamaican-products', description: 'Authentic Jamaican food products', level: 2, parent: 'canned-packaged' },
  { name: 'Hot Sauces', slug: 'hot-sauces', description: 'Spicy sauces and condiments', level: 2, parent: 'canned-packaged' },
  { name: 'Soft Drinks', slug: 'soft-drinks', description: 'Sodas and carbonated beverages', level: 2, parent: 'beverages' },
  { name: 'Drink Mixes', slug: 'drink-mixes', description: 'Drink powders and concentrates', level: 2, parent: 'beverages' }
];

// Test products (just 3 Cool Running items to start)
const TEST_PRODUCTS = [
  {
    name: "Cool Runnings Jerk Sauce - Mild",
    description: "Authentic Jamaican jerk sauce with mild spice level. Perfect for marinating chicken, pork, or vegetables.",
    price: 4.99,
    category_slug: "hot-sauces",
    weight: "10 oz"
  },
  {
    name: "Cool Runnings Curry Powder",
    description: "Premium Caribbean curry powder blend with turmeric, coriander, cumin, and traditional spices.",
    price: 3.49,
    category_slug: "caribbean-spices",
    weight: "4 oz"
  },
  {
    name: "Cool Runnings Ginger Beer Mix",
    description: "Authentic Jamaican ginger beer concentrate. Spicy and refreshing.",
    price: 4.49,
    category_slug: "drink-mixes",
    weight: "4 oz"
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

async function createSimpleCategories() {
  console.log('🏗️  Creating simple category structure...\n');
  
  const categoryMap = new Map();
  
  // First pass: Create all level 1 categories
  for (const cat of SIMPLE_CATEGORIES.filter(c => c.level === 1)) {
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
        console.log(`✅ Created: ${cat.name} (${cat.slug})`);
        categoryMap.set(cat.slug, data);
      }
    } catch (error) {
      console.error(`💥 Exception creating ${cat.name}:`, error);
    }
  }
  
  // Second pass: Create level 2 categories with proper parent references
  for (const cat of SIMPLE_CATEGORIES.filter(c => c.level === 2)) {
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
        console.log(`✅ Created: ${cat.name} (${cat.slug}) → ${parentCategory.name}`);
        categoryMap.set(cat.slug, data);
      }
    } catch (error) {
      console.error(`💥 Exception creating ${cat.name}:`, error);
    }
  }
  
  console.log(`\n✅ Created ${categoryMap.size} categories total\n`);
  return categoryMap;
}

async function importTestProducts(categoryMap) {
  console.log('📦 Importing test products...\n');
  
  let imported = 0;
  let errors = [];
  
  for (let i = 0; i < TEST_PRODUCTS.length; i++) {
    const product = TEST_PRODUCTS[i];
    
    try {
      // Find category
      const category = categoryMap.get(product.category_slug);
      if (!category) {
        errors.push(`Category ${product.category_slug} not found for ${product.name}`);
        continue;
      }
      
      // Generate clean slug
      const productSlug = generateSlug(product.name);
      
      const productRecord = {
        name: product.name,
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
        console.log(`✅ Imported: ${product.name} → ${category.name}`);
        console.log(`   URL: /products/${category.slug}/${productSlug}`);
        imported++;
      }
      
    } catch (error) {
      console.error(`💥 Exception importing ${product.name}:`, error);
      errors.push(`${product.name}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 IMPORT SUMMARY`);
  console.log(`✅ Products Imported: ${imported}`);
  console.log(`❌ Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    errors.forEach(error => console.log(`  - ${error}`));
  }
  
  return { imported, errors };
}

async function runSimpleImport() {
  console.log('🚀 Starting Simple Import');
  console.log('========================\n');
  
  try {
    // Verify database is clean
    const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: categoryCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
    
    console.log(`📊 Current state: ${productCount || 0} products, ${categoryCount || 0} categories\n`);
    
    // Create categories
    const categoryMap = await createSimpleCategories();
    
    // Import test products
    await importTestProducts(categoryMap);
    
    console.log('\n🎉 Simple import completed!');
    console.log('\nTest these URLs:');
    console.log('- https://kfresh-store.vercel.app/products');
    console.log('- https://kfresh-store.vercel.app/products/hot-sauces');
    console.log('- https://kfresh-store.vercel.app/products/hot-sauces/cool-runnings-jerk-sauce-mild');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runSimpleImport()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { runSimpleImport, createSimpleCategories, importTestProducts };