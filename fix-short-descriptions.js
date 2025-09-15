const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4';
const supabase = createClient(supabaseUrl, supabaseKey);

function generateBetterShortDescription(product) {
  const { name, brand, origin, weight, unit } = product;
  
  // Create catchy, brief taglines based on product type
  // These should be marketing-focused, not just shortened versions of descriptions
  
  // TEA PRODUCTS
  if (name.toLowerCase().includes('tea')) {
    if (name.toLowerCase().includes('honey') && name.toLowerCase().includes('ginger')) {
      return 'Soothing blend with natural honey & warming ginger';
    }
    if (name.toLowerCase().includes('honey') && name.toLowerCase().includes('jasmine')) {
      return 'Delicate jasmine tea sweetened with pure honey';
    }
    if (name.toLowerCase().includes('turmeric')) {
      return 'Golden wellness blend with anti-inflammatory benefits';
    }
    if (name.toLowerCase().includes('balance sugar')) {
      return 'Herbal blend for healthy blood sugar support';
    }
    if (name.toLowerCase().includes('care about heart')) {
      return 'Heart-healthy herbal tea blend';
    }
    if (name.toLowerCase().includes('everyday detox')) {
      return 'Daily cleansing tea for natural detoxification';
    }
    if (name.toLowerCase().includes('support throat')) {
      return 'Soothing herbal blend for throat comfort';
    }
    if (name.toLowerCase().includes('support digestion')) {
      return 'Gentle herbs for digestive wellness';
    }
    if (name.toLowerCase().includes('black tea citrus')) {
      return 'Bold black tea with zesty citrus notes';
    }
    if (name.toLowerCase().includes('blackcurrant')) {
      return 'Fruity blend with antioxidant-rich berries';
    }
    if (name.toLowerCase().includes('citrus fruits')) {
      return 'Refreshing citrus medley with ginger kick';
    }
    if (name.toLowerCase().includes('cold infusion')) {
      return 'Refreshing cold brew with mint & citrus';
    }
    if (name.toLowerCase().includes('cranberry')) {
      return 'Tart cranberry meets warming ginger';
    }
    if (name.toLowerCase().includes('earl grey')) {
      return 'Classic bergamot-infused black tea';
    }
    if (name.toLowerCase().includes('green tea') && name.toLowerCase().includes('lemon')) {
      return 'Antioxidant-rich green tea with citrus twist';
    }
    if (name.toLowerCase().includes('matcha')) {
      return 'Premium green tea with energizing matcha';
    }
    if (name.toLowerCase().includes('mint tea')) {
      return 'Pure peppermint for fresh, cooling relief';
    }
    if (name.toLowerCase().includes('rooibos')) {
      return 'Caffeine-free South African red tea blend';
    }
    return `Premium ${weight}${unit || 'g'} tea blend`;
  }

  // SAUCES
  if (name.toLowerCase().includes('sauce')) {
    if (name.toLowerCase().includes('soy')) {
      if (name.toLowerCase().includes('golden light')) {
        return 'Light & delicate for dipping and seasoning';
      }
      if (name.toLowerCase().includes('mushroom')) {
        return 'Rich umami depth with mushroom essence';
      }
      if (name.toLowerCase().includes('dark')) {
        return 'Bold & rich for authentic color and flavor';
      }
    }
    if (name.toLowerCase().includes('oyster')) {
      return 'Savory seafood essence for stir-fries';
    }
    if (name.toLowerCase().includes('barbecue')) {
      return 'Sweet & smoky grilling perfection';
    }
    return `Premium ${weight}${unit || 'ml'} sauce`;
  }

  // SPICES & SEASONINGS
  if (name.toLowerCase().includes('spice') || name.toLowerCase().includes('seasoning') || name.toLowerCase().includes('powder')) {
    if (name.toLowerCase().includes('adobo')) {
      return 'All-purpose Latin seasoning blend';
    }
    if (name.toLowerCase().includes('all spice') || name.toLowerCase().includes('pimento')) {
      return 'Warm Caribbean whole spice berries';
    }
    if (name.toLowerCase().includes('curry')) {
      return 'Authentic Madras blend for bold curries';
    }
    if (name.toLowerCase().includes('meat tenderizer')) {
      return 'Natural enzymes for perfectly tender meat';
    }
    if (name.toLowerCase().includes('thyme')) {
      return 'Aromatic dried leaves for Caribbean cooking';
    }
    return `Premium ${weight}${unit || 'g'} seasoning`;
  }

  // BAKING INGREDIENTS
  if (name.toLowerCase().includes('baking')) {
    if (name.toLowerCase().includes('powder')) {
      return 'Double-acting leavening for fluffy bakes';
    }
    if (name.toLowerCase().includes('soda')) {
      return 'Pure sodium bicarbonate for perfect rise';
    }
    return `Essential baking ingredient ${weight}${unit || 'g'}`;
  }

  if (name.toLowerCase().includes('yeast')) {
    if (name.toLowerCase().includes('185g')) {
      return 'Fast-acting yeast for professional bakers';
    }
    if (name.toLowerCase().includes('85g')) {
      return 'Quick-rise yeast for home baking';
    }
    return 'Instant rise for perfect breads';
  }

  // EXTRACTS
  if (name.toLowerCase().includes('extract') || name.toLowerCase().includes('flavour')) {
    if (name.toLowerCase().includes('vanilla')) {
      return 'Pure vanilla for authentic flavor';
    }
    if (name.toLowerCase().includes('almond')) {
      return 'Sweet nutty essence for desserts';
    }
    if (name.toLowerCase().includes('mixed')) {
      return 'Versatile blend for creative baking';
    }
    return `Premium ${weight}${unit || 'ml'} extract`;
  }

  // JUICES & NECTARS
  if (name.toLowerCase().includes('juice') || name.toLowerCase().includes('nectar')) {
    if (name.toLowerCase().includes('fruit punch')) {
      return 'Tropical fruit party in a bottle';
    }
    if (name.toLowerCase().includes('mango') && name.toLowerCase().includes('carrot')) {
      return 'Vitamin-rich tropical fusion';
    }
    if (name.toLowerCase().includes('mango')) {
      return 'Pure tropical sunshine';
    }
    if (name.toLowerCase().includes('pineapple') && name.toLowerCase().includes('ginger')) {
      return 'Tropical zing with a spicy kick';
    }
    if (name.toLowerCase().includes('soursop')) {
      return 'Exotic Caribbean superfruit drink';
    }
    if (name.toLowerCase().includes('peach')) {
      return 'Sweet summer orchard freshness';
    }
    if (name.toLowerCase().includes('pink guava')) {
      return 'Vitamin C powerhouse with tropical flair';
    }
    return `Refreshing ${weight}${unit || 'ml'} beverage`;
  }

  // Generic fallback - short and catchy
  if (brand && brand !== 'KFresh') {
    return `Authentic ${brand} quality`;
  }
  
  if (origin) {
    return `Direct from ${origin}`;
  }

  // Final fallback
  return `Premium quality ${weight ? weight + (unit || 'g') : 'product'}`;
}

async function fixShortDescriptions() {
  console.log('🔧 Fixing short descriptions to be different from full descriptions...\n');
  
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
    
    console.log(`📦 Found ${products.length} products to update\n`);
    
    let updated = 0;
    let errors = [];
    
    for (const product of products) {
      try {
        const newShortDescription = generateBetterShortDescription(product);
        
        // Only update if the new short description is different
        if (newShortDescription === product.short_description) {
          console.log(`⏭️  Skipping ${product.name} - already optimal`);
          continue;
        }
        
        console.log(`📝 Updating: ${product.name}`);
        console.log(`   Old: "${product.short_description}"`);
        console.log(`   New: "${newShortDescription}"`);
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ short_description: newShortDescription })
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
    
    console.log(`\n📊 SHORT DESCRIPTIONS FIX SUMMARY`);
    console.log(`===================================`);
    console.log(`✅ Products Updated: ${updated}`);
    console.log(`❌ Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n⚠️  ERRORS:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('\n💡 SHORT DESCRIPTIONS NOW:');
    console.log('- Are brief marketing taglines (not truncated descriptions)');
    console.log('- Focus on key benefits or unique features');
    console.log('- Are distinct from the full descriptions');
    console.log('- Perfect for product cards and previews');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

if (require.main === module) {
  fixShortDescriptions()
    .then(() => {
      console.log('\n🎉 Short descriptions fixed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixShortDescriptions };