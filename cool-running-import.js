const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase configuration
const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4';
const supabase = createClient(supabaseUrl, supabaseKey);

// Cool Running Products Data (manually extracted from the document)
// Based on file: '/Volumes/C/Kfreshfiles/Final File - Kfresh Website/Final File - Kfresh Website/UPLOAdD PRODUCTSCOOL RUNNING - PRICE.docx'
// Reference: www.coolrunningsfoods.ca

const COOL_RUNNING_PRODUCTS = [
  // Caribbean Sauces & Condiments
  {
    name: "Cool Runnings Jerk Sauce - Mild Caribbean Flavor",
    brand: "Cool Runnings",
    description: "Authentic Jamaican jerk sauce with mild spice level. Perfect for marinating chicken, pork, or vegetables. Made with traditional Caribbean spices and scotch bonnet peppers.",
    price: 4.99,
    category_keywords: ["sauce", "jerk", "caribbean", "jamaican", "condiment"],
    weight: "10 oz",
    origin: "Jamaica",
    website_ref: "www.coolrunningsfoods.ca"
  },
  {
    name: "Cool Runnings Jerk Sauce - Hot Caribbean Flavor", 
    brand: "Cool Runnings",
    description: "Fiery authentic Jamaican jerk sauce with intense heat. Traditional recipe with scotch bonnet peppers and Caribbean spices for bold flavor.",
    price: 4.99,
    category_keywords: ["sauce", "jerk", "caribbean", "jamaican", "condiment", "hot"],
    weight: "10 oz",
    origin: "Jamaica",
    website_ref: "www.coolrunningsfoods.ca"
  },
  {
    name: "Cool Runnings Curry Powder - Authentic Caribbean Spice Blend",
    brand: "Cool Runnings", 
    description: "Premium Caribbean curry powder blend with turmeric, coriander, cumin, and traditional spices. Essential for authentic Jamaican curry dishes.",
    price: 3.49,
    category_keywords: ["curry", "spice", "powder", "caribbean", "jamaican", "seasoning"],
    weight: "4 oz",
    origin: "Jamaica",
    website_ref: "www.coolrunningsfoods.ca"
  },
  {
    name: "Cool Runnings Jerk Seasoning - Dry Spice Rub",
    brand: "Cool Runnings",
    description: "Dry jerk seasoning blend for authentic Caribbean flavor. Perfect for grilling and roasting meats. Contains allspice, thyme, and scotch bonnet pepper.",
    price: 2.99,
    category_keywords: ["jerk", "seasoning", "spice", "caribbean", "jamaican", "rub"],
    weight: "3 oz", 
    origin: "Jamaica",
    website_ref: "www.coolrunningsfoods.ca"
  },
  {
    name: "Cool Runnings Allspice Whole Berries - Jamaican Pimento",
    brand: "Cool Runnings",
    description: "Whole allspice berries (pimento) from Jamaica. Essential spice for jerk seasoning and Caribbean cooking. Sweet and aromatic flavor.",
    price: 3.99,
    category_keywords: ["allspice", "pimento", "spice", "caribbean", "jamaican", "whole"],
    weight: "2 oz",
    origin: "Jamaica", 
    website_ref: "www.coolrunningsfoods.ca"
  },
  {
    name: "Cool Runnings Scotch Bonnet Pepper Sauce - Extra Hot",
    brand: "Cool Runnings",
    description: "Authentic scotch bonnet pepper sauce with extreme heat and fruity flavor. Traditional Jamaican hot sauce for serious spice lovers.",
    price: 5.49,
    category_keywords: ["hot sauce", "scotch bonnet", "pepper", "caribbean", "jamaican", "spicy"],
    weight: "5 oz",
    origin: "Jamaica",
    website_ref: "www.coolrunningsfoods.ca"
  },
  
  // Caribbean Rice & Grains
  {
    name: "Cool Runnings Rice and Peas Mix - Traditional Caribbean Side",
    brand: "Cool Runnings",
    description: "Authentic Jamaican rice and peas seasoning mix. Just add rice, kidney beans, and coconut milk for the perfect Caribbean side dish.",
    price: 2.49,
    category_keywords: ["rice", "peas", "caribbean", "jamaican", "seasoning", "mix"],
    weight: "1.75 oz",
    origin: "Jamaica",
    website_ref: "www.coolrunningsfoods.ca"
  },
  {
    name: "Cool Runnings Coconut Rice Seasoning - Island Flavor",
    brand: "Cool Runnings", 
    description: "Coconut-flavored rice seasoning for authentic Caribbean taste. Perfect for creating restaurant-quality coconut rice at home.",
    price: 2.29,
    category_keywords: ["coconut", "rice", "seasoning", "caribbean", "jamaican", "island"],
    weight: "1.5 oz",
    origin: "Jamaica",
    website_ref: "www.coolrunningsfoods.ca"
  },
  
  // Caribbean Beverages & Mixes
  {
    name: "Cool Runnings Sorrel Drink Mix - Hibiscus Holiday Beverage",
    brand: "Cool Runnings",
    description: "Traditional Jamaican sorrel (hibiscus) drink mix. Festive holiday beverage with ginger and spices. Just add water and sugar.",
    price: 3.99,
    category_keywords: ["sorrel", "hibiscus", "drink", "beverage", "caribbean", "jamaican"],
    weight: "3 oz",
    origin: "Jamaica", 
    website_ref: "www.coolrunningsfoods.ca"
  },
  {
    name: "Cool Runnings Ginger Beer Mix - Spicy Caribbean Soda",
    brand: "Cool Runnings",
    description: "Authentic Jamaican ginger beer concentrate. Spicy and refreshing, perfect for making traditional Caribbean ginger beer at home.",
    price: 4.49,
    category_keywords: ["ginger beer", "ginger", "beverage", "caribbean", "jamaican", "soda"],
    weight: "4 oz",
    origin: "Jamaica",
    website_ref: "www.coolrunningsfoods.ca"
  },
  
  // Caribbean Baking & Desserts  
  {
    name: "Cool Runnings Coconut Flakes - Dried Sweetened Caribbean",
    brand: "Cool Runnings",
    description: "Premium dried sweetened coconut flakes from the Caribbean. Perfect for baking, desserts, and traditional Caribbean sweets.",
    price: 3.29,
    category_keywords: ["coconut", "flakes", "dried", "sweetened", "caribbean", "baking"],
    weight: "7 oz",
    origin: "Caribbean",
    website_ref: "www.coolrunningsfoods.ca"
  },
  {
    name: "Cool Runnings Nutmeg Whole - Fresh Caribbean Spice",
    brand: "Cool Runnings",
    description: "Whole nutmeg from the Caribbean islands. Freshly ground nutmeg provides superior flavor for baking and Caribbean desserts.",
    price: 4.99,
    category_keywords: ["nutmeg", "whole", "spice", "caribbean", "baking", "fresh"],
    weight: "1 oz",
    origin: "Caribbean",
    website_ref: "www.coolrunningsfoods.ca"
  }
];

// Helper functions
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateSKU(productName, brand, index) {
  const brandCode = brand.substring(0, 2).toUpperCase();
  const nameCode = productName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
  const timestamp = Date.now().toString().slice(-4);
  return `${brandCode}-${nameCode}-${timestamp}-${String(index).padStart(3, '0')}`;
}

function createSEOFriendlyTitle(product) {
  // Create SEO-friendly title with brand, product name, and key descriptors
  const { name, brand, weight, origin } = product;
  
  // Extract key SEO terms
  let seoTitle = name;
  
  // Add weight if available
  if (weight) {
    seoTitle += ` ${weight}`;
  }
  
  // Add origin for SEO
  if (origin && !seoTitle.toLowerCase().includes(origin.toLowerCase())) {
    seoTitle += ` - ${origin}`;
  }
  
  // Ensure it's under 60 characters for SEO
  if (seoTitle.length > 60) {
    seoTitle = seoTitle.substring(0, 57) + '...';
  }
  
  return seoTitle;
}

async function findBestCategory(product) {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('level', { ascending: false });

  if (error || !categories) {
    console.error('Error fetching categories:', error);
    return null;
  }

  const searchText = `${product.name} ${product.description} ${product.category_keywords.join(' ')}`.toLowerCase();
  
  // Category mapping for Cool Runnings products
  const categoryMatches = categories.map(category => {
    let score = 0;
    const categorySlug = category.slug.toLowerCase();
    
    // Specific mappings for Cool Runnings products
    const mappings = {
      'sauce': ['cooking-sauces', 'sauces-condiments', 'table-condiments'],
      'jerk': ['cooking-sauces', 'jamaican', 'caribbean'],
      'hot sauce': ['table-condiments', 'sauces-condiments'],
      'curry': ['dried-spices', 'spice-blends', 'spices-seasonings'],
      'seasoning': ['spices-seasonings', 'dried-spices', 'spice-blends'],
      'spice': ['spices-seasonings', 'dried-spices'],
      'allspice': ['dried-spices', 'spices-seasonings'],
      'nutmeg': ['dried-spices', 'spices-seasonings'],
      'rice': ['rice', 'basmati-rice', 'jasmine-rice'],
      'coconut': ['pantry-dry-goods', 'baking-cooking'],
      'drink': ['beverages', 'non-alcoholic'],
      'ginger beer': ['soft-drinks', 'non-alcoholic'],
      'sorrel': ['beverages', 'non-alcoholic'],
      'jamaican': ['jamaican', 'caribbean'],
      'caribbean': ['caribbean']
    };
    
    // Check keywords
    for (const keyword of product.category_keywords) {
      if (mappings[keyword]) {
        if (mappings[keyword].includes(categorySlug)) {
          score += 15;
        }
      }
      
      // Direct matches
      if (categorySlug.includes(keyword) || keyword.includes(categorySlug.replace(/-/g, ' '))) {
        score += 10;
      }
    }
    
    // Prefer Caribbean/Jamaican categories for Cool Runnings
    if (categorySlug.includes('caribbean') || categorySlug.includes('jamaican')) {
      score += 20;
    }
    
    return { category, score };
  });
  
  categoryMatches.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return b.category.level - a.category.level;
  });
  
  const bestMatch = categoryMatches.length > 0 ? categoryMatches[0] : null;
  return bestMatch && bestMatch.score > 0 ? bestMatch.category : 
    categories.find(c => c.slug === 'international-foods-caribbean-jamaican') || 
    categories.find(c => c.slug === 'caribbean') ||
    categories.find(c => c.slug === 'jamaican') ||
    categories[0];
}

async function importCoolRunningProducts() {
  console.log('🏃‍♂️ Starting Cool Runnings Products Import');
  console.log('==========================================\n');
  
  let imported = 0;
  let skipped = 0;
  const errors = [];
  
  for (let i = 0; i < COOL_RUNNING_PRODUCTS.length; i++) {
    const product = COOL_RUNNING_PRODUCTS[i];
    
    try {
      console.log(`📦 Processing: ${product.name}`);
      
      // Generate SEO-friendly data
      const seoTitle = createSEOFriendlyTitle(product);
      const slug = generateSlug(seoTitle);
      const sku = generateSKU(product.name, product.brand, i + 1);
      
      // Find best category
      const category = await findBestCategory(product);
      if (!category) {
        errors.push(`No suitable category found for ${product.name}`);
        skipped++;
        continue;
      }
      
      // Check for duplicates
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('name', seoTitle)
        .single();
      
      if (existingProduct) {
        console.log(`⏭️  Skipping duplicate: ${seoTitle}`);
        skipped++;
        continue;
      }
      
      // Create product record with minimal required fields
      const productRecord = {
        name: seoTitle,
        slug: slug,
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
        skipped++;
      } else {
        console.log(`✅ Imported: ${seoTitle} → ${category.name}`);
        imported++;
      }
      
    } catch (error) {
      console.error(`💥 Exception importing ${product.name}:`, error);
      errors.push(`${product.name}: ${error.message}`);
      skipped++;
    }
  }
  
  console.log('\n📊 COOL RUNNINGS IMPORT SUMMARY');
  console.log('================================');
  console.log(`✅ Products Imported: ${imported}`);
  console.log(`⏭️  Products Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    errors.forEach(error => console.log(`  - ${error}`));
  }
  
  return { imported, skipped, errors };
}

// Run if called directly
if (require.main === module) {
  importCoolRunningProducts()
    .then((result) => {
      console.log('\n🎉 Cool Runnings import completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import failed:', error);
      process.exit(1);
    });
}

module.exports = { importCoolRunningProducts, COOL_RUNNING_PRODUCTS };