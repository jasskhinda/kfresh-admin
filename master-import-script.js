const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4';
const supabase = createClient(supabaseUrl, supabaseKey);

// Professional 4-level category structure
const CATEGORY_STRUCTURE = {
  // Fresh & Frozen Foods
  'fresh-frozen': {
    name: 'Fresh & Frozen Foods',
    level: 1,
    children: {
      'fresh-produce': {
        name: 'Fresh Produce',
        level: 2,
        children: {
          'fruits': { name: 'Fruits', level: 3, children: {
            'tropical-fruits': { name: 'Tropical Fruits', level: 4 },
            'citrus-fruits': { name: 'Citrus Fruits', level: 4 },
            'berries': { name: 'Berries', level: 4 }
          }},
          'vegetables': { name: 'Vegetables', level: 3, children: {
            'leafy-greens': { name: 'Leafy Greens', level: 4 },
            'root-vegetables': { name: 'Root Vegetables', level: 4 },
            'peppers-onions': { name: 'Peppers & Onions', level: 4 }
          }},
          'herbs-spices': { name: 'Fresh Herbs & Spices', level: 3 }
        }
      },
      'meat-seafood': {
        name: 'Meat & Seafood',
        level: 2,
        children: {
          'poultry': { name: 'Poultry', level: 3, children: {
            'chicken': { name: 'Chicken', level: 4 },
            'turkey': { name: 'Turkey', level: 4 }
          }},
          'beef-lamb': { name: 'Beef & Lamb', level: 3, children: {
            'ground-meat': { name: 'Ground Meat', level: 4 },
            'steaks-chops': { name: 'Steaks & Chops', level: 4 }
          }},
          'fish': { name: 'Fish', level: 3, children: {
            'fresh-fish': { name: 'Fresh Fish', level: 4 },
            'frozen-fish': { name: 'Frozen Fish', level: 4 }
          }},
          'shellfish': { name: 'Shellfish', level: 3 }
        }
      },
      'frozen-foods': {
        name: 'Frozen Foods',
        level: 2,
        children: {
          'frozen-meals': { name: 'Frozen Meals', level: 3, children: {
            'ready-meals': { name: 'Ready Meals', level: 4 },
            'pizza': { name: 'Frozen Pizza', level: 4 }
          }},
          'frozen-vegetables': { name: 'Frozen Vegetables', level: 3 },
          'ice-cream': { name: 'Ice Cream & Desserts', level: 3, children: {
            'ice-cream-tubs': { name: 'Ice Cream Tubs', level: 4 },
            'frozen-desserts': { name: 'Frozen Desserts', level: 4 }
          }}
        }
      }
    }
  },

  // Pantry & Dry Goods
  'pantry-dry-goods': {
    name: 'Pantry & Dry Goods',
    level: 1,
    children: {
      'grains-cereals': {
        name: 'Grains & Cereals',
        level: 2,
        children: {
          'rice': { name: 'Rice', level: 3, children: {
            'basmati-rice': { name: 'Basmati Rice', level: 4 },
            'jasmine-rice': { name: 'Jasmine Rice', level: 4 },
            'brown-rice': { name: 'Brown Rice', level: 4 }
          }},
          'pasta': { name: 'Pasta', level: 3, children: {
            'dried-pasta': { name: 'Dried Pasta', level: 4 },
            'fresh-pasta': { name: 'Fresh Pasta', level: 4 }
          }},
          'breakfast-cereals': { name: 'Breakfast Cereals', level: 3 },
          'oats-grains': { name: 'Oats & Other Grains', level: 3 }
        }
      },
      'canned-jarred': {
        name: 'Canned & Jarred Goods',
        level: 2,
        children: {
          'canned-vegetables': { name: 'Canned Vegetables', level: 3 },
          'canned-fruits': { name: 'Canned Fruits', level: 3 },
          'sauces-condiments': { name: 'Sauces & Condiments', level: 3, children: {
            'cooking-sauces': { name: 'Cooking Sauces', level: 4 },
            'table-condiments': { name: 'Table Condiments', level: 4 }
          }},
          'preserves-spreads': { name: 'Preserves & Spreads', level: 3 }
        }
      },
      'baking-cooking': {
        name: 'Baking & Cooking',
        level: 2,
        children: {
          'flour-baking': { name: 'Flour & Baking Mixes', level: 3 },
          'oils-vinegars': { name: 'Oils & Vinegars', level: 3 },
          'spices-seasonings': { name: 'Spices & Seasonings', level: 3, children: {
            'dried-spices': { name: 'Dried Spices', level: 4 },
            'spice-blends': { name: 'Spice Blends', level: 4 }
          }}
        }
      }
    }
  },

  // Dairy & Refrigerated
  'dairy-refrigerated': {
    name: 'Dairy & Refrigerated',
    level: 1,
    children: {
      'milk-cream': {
        name: 'Milk & Cream',
        level: 2,
        children: {
          'fresh-milk': { name: 'Fresh Milk', level: 3 },
          'plant-milk': { name: 'Plant-Based Milk', level: 3 },
          'cream-butter': { name: 'Cream & Butter', level: 3 }
        }
      },
      'cheese-yogurt': {
        name: 'Cheese & Yogurt',
        level: 2,
        children: {
          'fresh-cheese': { name: 'Fresh Cheese', level: 3 },
          'aged-cheese': { name: 'Aged Cheese', level: 3 },
          'yogurt': { name: 'Yogurt', level: 3, children: {
            'greek-yogurt': { name: 'Greek Yogurt', level: 4 },
            'regular-yogurt': { name: 'Regular Yogurt', level: 4 }
          }}
        }
      },
      'eggs': { name: 'Eggs', level: 2 }
    }
  },

  // International Foods
  'international-foods': {
    name: 'International Foods',
    level: 1,
    children: {
      'caribbean': {
        name: 'Caribbean',
        level: 2,
        children: {
          'jamaican': { name: 'Jamaican', level: 3 },
          'trinidadian': { name: 'Trinidadian', level: 3 },
          'barbadian': { name: 'Barbadian', level: 3 }
        }
      },
      'african': {
        name: 'African',
        level: 2,
        children: {
          'west-african': { name: 'West African', level: 3 },
          'east-african': { name: 'East African', level: 3 },
          'north-african': { name: 'North African', level: 3 }
        }
      },
      'asian': {
        name: 'Asian',
        level: 2,
        children: {
          'indian': { name: 'Indian', level: 3 },
          'chinese': { name: 'Chinese', level: 3 },
          'thai': { name: 'Thai', level: 3 }
        }
      },
      'latin-american': {
        name: 'Latin American',
        level: 2,
        children: {
          'mexican': { name: 'Mexican', level: 3 },
          'south-american': { name: 'South American', level: 3 }
        }
      }
    }
  },

  // Beverages
  'beverages': {
    name: 'Beverages',
    level: 1,
    children: {
      'non-alcoholic': {
        name: 'Non-Alcoholic',
        level: 2,
        children: {
          'soft-drinks': { name: 'Soft Drinks', level: 3, children: {
            'cola': { name: 'Cola', level: 4 },
            'fruit-sodas': { name: 'Fruit Sodas', level: 4 }
          }},
          'juices': { name: 'Juices', level: 3, children: {
            'fruit-juices': { name: 'Fruit Juices', level: 4 },
            'vegetable-juices': { name: 'Vegetable Juices', level: 4 }
          }},
          'water': { name: 'Water', level: 3 },
          'hot-beverages': { name: 'Hot Beverages', level: 3, children: {
            'coffee': { name: 'Coffee', level: 4 },
            'tea': { name: 'Tea', level: 4 }
          }}
        }
      },
      'alcoholic': {
        name: 'Alcoholic Beverages',
        level: 2,
        children: {
          'beer': { name: 'Beer', level: 3 },
          'wine': { name: 'Wine', level: 3 },
          'spirits': { name: 'Spirits', level: 3 }
        }
      }
    }
  },

  // Snacks & Confectionery
  'snacks-confectionery': {
    name: 'Snacks & Confectionery',
    level: 1,
    children: {
      'sweet-snacks': {
        name: 'Sweet Snacks',
        level: 2,
        children: {
          'chocolate': { name: 'Chocolate', level: 3 },
          'candy': { name: 'Candy', level: 3 },
          'cookies-biscuits': { name: 'Cookies & Biscuits', level: 3 }
        }
      },
      'savory-snacks': {
        name: 'Savory Snacks',
        level: 2,
        children: {
          'chips-crisps': { name: 'Chips & Crisps', level: 3 },
          'nuts-seeds': { name: 'Nuts & Seeds', level: 3 },
          'crackers': { name: 'Crackers', level: 3 }
        }
      }
    }
  }
};

// File import configuration
const IMPORT_FILES = [
  {
    name: 'Cool Running Products',
    path: '/Volumes/C/Kfreshfiles/Final File - Kfresh Website/Final File - Kfresh Website/Cool Running Products.docx',
    priority: 1
  },
  {
    name: 'Grace Products', 
    path: '/Volumes/C/Kfreshfiles/Final File - Kfresh Website/Final File - Kfresh Website/Grace Products.docx',
    priority: 2
  },
  {
    name: 'Grocery Items 2',
    path: '/Volumes/C/Kfreshfiles/Final File - Kfresh Website/Final File - Kfresh Website/Grocery Items 2.docx',
    priority: 3
  },
  {
    name: 'UPLOADED PRODUCTS',
    path: '/Volumes/C/Kfreshfiles/Final File - Kfresh Website/Final File - Kfresh Website/UPlOADED PRODUCTS',
    priority: 4
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

function generateSKU(productName, categorySlug, index) {
  const prefix = categorySlug.substring(0, 3).toUpperCase();
  const nameCode = productName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${nameCode}-${timestamp}-${String(index).padStart(3, '0')}`;
}

// Category creation functions
async function createCategoryHierarchy() {
  console.log('🏗️  Creating 4-level category hierarchy...');
  const createdCategories = new Map();
  
  async function createCategory(categoryData, parentId = null, pathParts = []) {
    const fullPath = [...pathParts, categoryData.slug || generateSlug(categoryData.name)];
    const slug = fullPath.join('-');
    
    if (createdCategories.has(slug)) {
      return createdCategories.get(slug);
    }

    const categoryRecord = {
      name: categoryData.name,
      slug: slug,
      description: categoryData.description || `${categoryData.name} products`,
      parent_category_id: parentId,
      level: categoryData.level,
      is_active: true,
      is_fresh_meals: false,
      display_order: 0
    };

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryRecord])
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating category ${categoryData.name}:`, error.message);
        return null;
      }

      console.log(`✅ Created category: ${categoryData.name} (Level ${categoryData.level})`);
      createdCategories.set(slug, data);

      // Create child categories
      if (categoryData.children) {
        for (const [childSlug, childData] of Object.entries(categoryData.children)) {
          await createCategory(
            { ...childData, slug: childSlug },
            data.id,
            fullPath
          );
        }
      }

      return data;
    } catch (error) {
      console.error(`❌ Database error creating category ${categoryData.name}:`, error);
      return null;
    }
  }

  // Create all categories
  for (const [rootSlug, rootData] of Object.entries(CATEGORY_STRUCTURE)) {
    await createCategory({ ...rootData, slug: rootSlug });
  }

  console.log(`✅ Category hierarchy created! Total categories: ${createdCategories.size}`);
  return createdCategories;
}

// Product import functions
async function findBestCategory(productName, description = '') {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('level', { ascending: false }); // Prefer deeper categories

  if (error || !categories) {
    console.error('Error fetching categories:', error);
    return null;
  }

  const searchText = `${productName} ${description}`.toLowerCase();
  
  // Smart category matching logic
  const categoryMatches = categories.map(category => {
    let score = 0;
    const categoryName = category.name.toLowerCase();
    const categorySlug = category.slug.toLowerCase();
    
    // Direct name matches
    if (searchText.includes(categoryName)) score += 10;
    if (searchText.includes(categorySlug.replace(/-/g, ' '))) score += 8;
    
    // Keyword matching
    const keywords = {
      // Fresh Produce
      'fruit': ['fruits', 'tropical-fruits', 'citrus-fruits', 'berries'],
      'vegetable': ['vegetables', 'leafy-greens', 'root-vegetables'],
      'fresh': ['fresh-produce', 'fresh-fish', 'fresh-milk'],
      
      // Meat & Seafood
      'chicken': ['chicken', 'poultry'],
      'beef': ['beef-lamb', 'ground-meat', 'steaks-chops'],
      'fish': ['fish', 'fresh-fish', 'frozen-fish'],
      'seafood': ['shellfish', 'fish'],
      
      // Frozen
      'frozen': ['frozen-foods', 'frozen-meals', 'frozen-vegetables', 'frozen-fish'],
      'ice cream': ['ice-cream', 'ice-cream-tubs'],
      
      // Dairy
      'milk': ['milk-cream', 'fresh-milk', 'plant-milk'],
      'cheese': ['cheese-yogurt', 'fresh-cheese', 'aged-cheese'],
      'yogurt': ['yogurt', 'greek-yogurt', 'regular-yogurt'],
      
      // Pantry
      'rice': ['rice', 'basmati-rice', 'jasmine-rice', 'brown-rice'],
      'pasta': ['pasta', 'dried-pasta'],
      'sauce': ['sauces-condiments', 'cooking-sauces'],
      'spice': ['spices-seasonings', 'dried-spices', 'spice-blends'],
      
      // Beverages
      'juice': ['juices', 'fruit-juices'],
      'soda': ['soft-drinks', 'cola', 'fruit-sodas'],
      'coffee': ['coffee', 'hot-beverages'],
      'tea': ['tea', 'hot-beverages'],
      
      // International
      'jamaican': ['jamaican', 'caribbean'],
      'grace': ['jamaican', 'caribbean'], // Grace is a Jamaican brand
      'caribbean': ['caribbean'],
      
      // Snacks
      'chip': ['chips-crisps', 'savory-snacks'],
      'chocolate': ['chocolate', 'sweet-snacks'],
      'cookie': ['cookies-biscuits', 'sweet-snacks']
    };
    
    for (const [keyword, slugs] of Object.entries(keywords)) {
      if (searchText.includes(keyword)) {
        if (slugs.includes(categorySlug)) {
          score += 15;
        }
      }
    }
    
    return { category, score };
  });
  
  // Sort by score and prefer deeper levels
  categoryMatches.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return b.category.level - a.category.level;
  });
  
  const bestMatch = categoryMatches[0];
  return bestMatch.score > 0 ? bestMatch.category : categories.find(c => c.slug === 'pantry-dry-goods') || categories[0];
}

async function importProductsFromFile(filePath, fileName) {
  console.log(`📁 Starting import from: ${fileName}`);
  
  // This is a placeholder - in the actual implementation, we would:
  // 1. Read the file content (Word doc or text file)
  // 2. Parse products from the content
  // 3. Clean and normalize product data
  // 4. Find appropriate categories for each product
  // 5. Insert products into database
  
  // For now, return a mock result
  return {
    imported: 0,
    skipped: 0,
    errors: []
  };
}

// Main execution function
async function runMasterImport() {
  console.log('🚀 Starting Master Product Import Script');
  console.log('=====================================\n');
  
  try {
    // Step 1: Verify database is clean
    console.log('🔍 Verifying database state...');
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    const { count: categoryCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Current state: ${productCount || 0} products, ${categoryCount || 0} categories`);
    
    // Step 2: Create category hierarchy
    const categories = await createCategoryHierarchy();
    
    // Step 3: Import products file by file
    console.log('\n📦 Starting systematic product import...');
    
    const importResults = [];
    
    for (const fileConfig of IMPORT_FILES.sort((a, b) => a.priority - b.priority)) {
      console.log(`\n🔄 Processing: ${fileConfig.name}`);
      
      if (!fs.existsSync(fileConfig.path)) {
        console.log(`⚠️  File not found: ${fileConfig.path}`);
        importResults.push({
          file: fileConfig.name,
          status: 'file_not_found',
          imported: 0,
          skipped: 0,
          errors: [`File not found: ${fileConfig.path}`]
        });
        continue;
      }
      
      const result = await importProductsFromFile(fileConfig.path, fileConfig.name);
      result.file = fileConfig.name;
      result.status = 'completed';
      importResults.push(result);
      
      console.log(`✅ Completed ${fileConfig.name}: ${result.imported} imported, ${result.skipped} skipped`);
    }
    
    // Step 4: Final summary
    console.log('\n📋 IMPORT SUMMARY');
    console.log('==================');
    
    const totalImported = importResults.reduce((sum, r) => sum + r.imported, 0);
    const totalSkipped = importResults.reduce((sum, r) => sum + r.skipped, 0);
    const totalErrors = importResults.reduce((sum, r) => sum + r.errors.length, 0);
    
    console.log(`✅ Total Products Imported: ${totalImported}`);
    console.log(`⏭️  Total Products Skipped: ${totalSkipped}`);
    console.log(`❌ Total Errors: ${totalErrors}`);
    console.log(`📁 Files Processed: ${importResults.length}`);
    
    if (totalErrors > 0) {
      console.log('\n⚠️  ERRORS ENCOUNTERED:');
      importResults.forEach(result => {
        if (result.errors.length > 0) {
          console.log(`\n${result.file}:`);
          result.errors.forEach(error => console.log(`  - ${error}`));
        }
      });
    }
    
    console.log('\n🎉 Master import script completed!');
    
  } catch (error) {
    console.error('💥 Fatal error in master import:', error);
    process.exit(1);
  }
}

// Export for external use
module.exports = {
  runMasterImport,
  createCategoryHierarchy,
  findBestCategory,
  generateSKU,
  generateSlug,
  CATEGORY_STRUCTURE,
  IMPORT_FILES
};

// Run if called directly
if (require.main === module) {
  runMasterImport()
    .then(() => {
      console.log('\n✨ Script execution completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}