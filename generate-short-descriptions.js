const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4';
const supabase = createClient(supabaseUrl, supabaseKey);

function generateShortDescription(product) {
  // If already has short description, skip
  if (product.short_description) {
    return product.short_description;
  }

  // Generate from full description if available
  if (product.description) {
    // Take first sentence or first 150 characters
    const firstSentence = product.description.split('.')[0];
    if (firstSentence && firstSentence.length <= 150) {
      return firstSentence.trim() + '.';
    }
    // If first sentence is too long, take first 150 chars
    return product.description.substring(0, 147).trim() + '...';
  }

  // Generate based on product details
  const { name, brand, origin, weight, unit, ingredients } = product;
  
  // Product-specific descriptions based on name patterns
  if (name.toLowerCase().includes('tea')) {
    if (name.toLowerCase().includes('honey')) {
      return `Soothing tea blend with natural honey flavor. Perfect for relaxation and wellness.`;
    }
    if (name.toLowerCase().includes('ginger')) {
      return `Refreshing ginger tea with warming properties. Great for digestion and immunity.`;
    }
    if (name.toLowerCase().includes('green')) {
      return `Premium green tea rich in antioxidants. A healthy choice for daily wellness.`;
    }
    return `Premium quality tea for a perfect cup every time. ${weight ? `${weight}${unit || 'g'} pack.` : ''}`;
  }

  if (name.toLowerCase().includes('sauce')) {
    if (name.toLowerCase().includes('soy')) {
      return `Authentic soy sauce for Asian cooking. Adds rich umami flavor to any dish.`;
    }
    if (name.toLowerCase().includes('barbecue') || name.toLowerCase().includes('bbq')) {
      return `Delicious barbecue sauce perfect for grilling and marinades. Rich, smoky flavor.`;
    }
    if (name.toLowerCase().includes('oyster')) {
      return `Premium oyster sauce for authentic Asian cuisine. Rich and savory flavor enhancer.`;
    }
    return `High-quality sauce to enhance your cooking. ${weight ? `${weight}${unit || 'ml'} bottle.` : ''}`;
  }

  if (name.toLowerCase().includes('spice') || name.toLowerCase().includes('seasoning')) {
    if (name.toLowerCase().includes('curry')) {
      return `Aromatic curry powder blend for authentic flavors. Perfect for traditional dishes.`;
    }
    if (name.toLowerCase().includes('thyme')) {
      return `Fresh dried thyme leaves for cooking. Essential herb for Caribbean and Mediterranean cuisine.`;
    }
    if (name.toLowerCase().includes('adobo')) {
      return `All-purpose seasoning blend with garlic and pepper. Perfect for meats and vegetables.`;
    }
    return `Premium spice blend to elevate your cooking. ${weight ? `${weight}${unit || 'g'} pack.` : ''}`;
  }

  if (name.toLowerCase().includes('juice') || name.toLowerCase().includes('nectar')) {
    if (name.toLowerCase().includes('mango')) {
      return `Refreshing mango drink made from premium fruit. Natural tropical flavor.`;
    }
    if (name.toLowerCase().includes('soursop')) {
      return `Exotic soursop nectar with unique tropical taste. Rich in nutrients.`;
    }
    if (name.toLowerCase().includes('guava')) {
      return `Sweet pink guava juice packed with vitamin C. Delicious tropical refreshment.`;
    }
    return `Delicious fruit beverage made from quality ingredients. ${weight ? `${weight}${unit || 'ml'} bottle.` : ''}`;
  }

  if (name.toLowerCase().includes('yeast')) {
    return `Premium quality instant yeast for perfect baking results. Easy to use and reliable.`;
  }

  if (name.toLowerCase().includes('baking')) {
    if (name.toLowerCase().includes('powder')) {
      return `Essential baking powder for light, fluffy baked goods. Double-acting formula.`;
    }
    if (name.toLowerCase().includes('soda')) {
      return `Pure baking soda for baking and household use. Multi-purpose kitchen essential.`;
    }
    return `Quality baking ingredient for perfect results. ${weight ? `${weight}${unit || 'g'} pack.` : ''}`;
  }

  if (name.toLowerCase().includes('extract') || name.toLowerCase().includes('flavour')) {
    if (name.toLowerCase().includes('vanilla')) {
      return `Pure vanilla extract for baking and desserts. Rich, authentic flavor.`;
    }
    if (name.toLowerCase().includes('almond')) {
      return `Premium almond extract for baking. Adds delicious nutty flavor to desserts.`;
    }
    return `Quality flavor extract for baking and cooking. ${weight ? `${weight}${unit || 'ml'} bottle.` : ''}`;
  }

  // Generic description based on available details
  let description = '';
  
  if (brand && brand !== 'KFresh') {
    description = `Authentic ${brand} product`;
  } else {
    description = `Quality ${name.toLowerCase().includes('fresh') ? 'fresh' : ''} product`;
  }

  if (origin) {
    description += ` from ${origin}`;
  }

  if (weight && unit) {
    description += `. ${weight}${unit} pack`;
  }

  if (!description || description.length < 20) {
    // Fallback generic description
    description = `Premium quality ${name.split(' ')[0].toLowerCase()} for your needs. Fresh and authentic.`;
  }

  return description.trim() + '.';
}

async function updateShortDescriptions() {
  console.log('📝 Generating short descriptions for all products...\n');
  
  try {
    // Get all products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError.message);
      return;
    }
    
    console.log(`📦 Found ${products.length} products\n`);
    
    let updated = 0;
    let skipped = 0;
    let errors = [];
    
    for (const product of products) {
      try {
        // Skip if already has short description
        if (product.short_description) {
          console.log(`⏭️  Skipping ${product.name} - already has short description`);
          skipped++;
          continue;
        }
        
        const shortDescription = generateShortDescription(product);
        
        console.log(`📝 Updating: ${product.name}`);
        console.log(`   Short desc: "${shortDescription}"`);
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ short_description: shortDescription })
          .eq('id', product.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${product.name}:`, updateError.message);
          errors.push(`${product.name}: ${updateError.message}`);
        } else {
          console.log(`✅ Updated successfully\n`);
          updated++;
        }
        
      } catch (error) {
        console.error(`💥 Exception updating ${product.name}:`, error);
        errors.push(`${product.name}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 SHORT DESCRIPTIONS UPDATE SUMMARY`);
    console.log(`===================================`);
    console.log(`✅ Products Updated: ${updated}`);
    console.log(`⏭️  Products Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n⚠️  ERRORS:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

if (require.main === module) {
  updateShortDescriptions()
    .then(() => {
      console.log('\n🎉 Short descriptions generation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { updateShortDescriptions };