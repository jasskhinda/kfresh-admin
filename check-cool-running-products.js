const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Cool Running products from the PDF
const coolRunningProducts = [
  // BAKING
  { name: 'Baking Powder (400g)', price: 4.00, category: 'Baking' },
  { name: 'Baking Soda (454g)', price: 4.00, category: 'Baking' },
  { name: 'Instant Yeast (185g)', price: 9.99, category: 'Baking' },
  { name: 'Instant Yeast (85g)', price: 3.99, category: 'Baking' },

  // DRINKS/BEVERAGES
  { name: 'Fruit Punch Nectar (473ml)', price: 2.99, category: 'Drinks/Beverages' },
  { name: 'Mango Carrot Nectar (473ml)', price: 2.99, category: 'Drinks/Beverages' },
  { name: 'Mango Nectar (473ml)', price: 2.99, category: 'Drinks/Beverages' },
  { name: 'Pineapple Ginger Nectar (473ml)', price: 2.99, category: 'Drinks/Beverages' },
  { name: 'Soursop Nectar (463ml)', price: 2.99, category: 'Drinks/Beverages' },
  { name: 'Mango Juice (500ml)', price: 2.99, category: 'Drinks/Beverages' },
  { name: 'Peach Juice (500ml)', price: 2.99, category: 'Drinks/Beverages' },
  { name: 'Pink Guava Juice (500ml)', price: 2.99, category: 'Drinks/Beverages' },

  // SPICES, HERBS & SEASONING
  { name: 'Almond Flavour Extract (150ml)', price: 3.99, category: 'Spices, Herbs & Seasoning' },
  { name: 'Mixed Essence Flavour Extract (150ml)', price: 3.99, category: 'Spices, Herbs & Seasoning' },
  { name: 'Vanilla Flavour Extract (150ml)', price: 3.99, category: 'Spices, Herbs & Seasoning' },
  { name: 'Adobo Seasoning w/Garlic & Pepper (300g)', price: 5.99, category: 'Spices, Herbs & Seasoning' },
  { name: 'Meat Tenderizer (350g)', price: 5.99, category: 'Spices, Herbs & Seasoning' },
  { name: 'Thyme Leaf (90g)', price: 4.50, category: 'Spices, Herbs & Seasoning' },
  { name: 'All Spice Whole (Pimento) (50g)', price: 3.50, category: 'Spices, Herbs & Seasoning' },
  { name: 'Madras Curry Powder (454g)', price: 5.99, category: 'Spices, Herbs & Seasoning' },

  // SAUCES
  { name: 'Golden Light Soy Sauce (500ml)', price: 5.99, category: 'Sauces' },
  { name: 'Mushroom Flavoured Soy Sauce (500ml)', price: 5.99, category: 'Sauces' },
  { name: 'Premium Dark Soy Sauce (500ml)', price: 5.99, category: 'Sauces' },
  { name: 'Premium Oyster Sauce (500ml)', price: 5.99, category: 'Sauces' },
  { name: 'Barbecue Sauce (300ml)', price: 5.99, category: 'Sauces' },

  // TEAS
  { name: 'Honey Ginger Tea (20 Tea Bags)', price: 4.99, category: 'Teas' },
  { name: 'Honey Jasmine Tea (20 Tea Bags)', price: 4.99, category: 'Teas' },
  { name: 'Turmeric Honey Ginger Tea (20 Tea Bags)', price: 4.99, category: 'Teas' },
  { name: 'Balance Sugar (40g)', price: 4.99, category: 'Teas' },
  { name: 'Care About Heart (40g)', price: 4.99, category: 'Teas' },
  { name: 'Everyday Detox (34g)', price: 4.99, category: 'Teas' },
  { name: 'Support Throat (40g)', price: 4.99, category: 'Teas' },
  { name: 'Support Digestion (40g)', price: 4.99, category: 'Teas' },
  { name: 'Black Tea Citrus (34g)', price: 4.99, category: 'Teas' },
  { name: 'Blackcurrant & Elderberry (40g)', price: 4.99, category: 'Teas' },
  { name: 'Citrus Fruits & Ginger (40g)', price: 4.99, category: 'Teas' },
  { name: 'Cold Infusion - Mint, Lemon & Lime (30g)', price: 4.99, category: 'Teas' },
  { name: 'Cranberry & Ginger (40g)', price: 4.99, category: 'Teas' },
  { name: 'Earl Grey (30g)', price: 4.99, category: 'Teas' },
  { name: 'Green Tea w/Lemon & Lemongrass (30g)', price: 4.99, category: 'Teas' },
  { name: 'Green Tea w/Matcha (30g)', price: 5.99, category: 'Teas' },
  { name: 'Mint Tea (40g)', price: 4.49, category: 'Teas' },
  { name: 'Rooibos Honey & Vanilla (40g)', price: 4.49, category: 'Teas' }
];

async function checkProducts() {
  try {
    console.log('🔍 Checking Cool Running Products...\n');
    console.log(`📋 Total products to check: ${coolRunningProducts.length}\n`);

    // Get all products from database
    const { data: dbProducts, error } = await supabase
      .from('products')
      .select('name, price, categories(name)')
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    let found = [];
    let missing = [];
    let priceMatch = [];
    let priceDifferent = [];

    // Check each Cool Running product
    coolRunningProducts.forEach(crProduct => {
      // Try to find in database (case insensitive, flexible matching)
      const dbProduct = dbProducts.find(db => {
        const dbName = db.name.toLowerCase().trim();
        const crName = crProduct.name.toLowerCase().trim();

        // Exact match
        if (dbName === crName) return true;

        // Contains match (for variants like "Instant Yeast - 85g" vs "Instant Yeast (85g)")
        if (dbName.includes(crName.replace(/[()]/g, '').trim()) ||
            crName.includes(dbName.replace(/[()]/g, '').trim())) {
          return true;
        }

        return false;
      });

      if (dbProduct) {
        found.push({ cr: crProduct, db: dbProduct });

        if (Math.abs(dbProduct.price - crProduct.price) < 0.01) {
          priceMatch.push({ cr: crProduct, db: dbProduct });
        } else {
          priceDifferent.push({ cr: crProduct, db: dbProduct });
        }
      } else {
        missing.push(crProduct);
      }
    });

    // Display results
    console.log('='.repeat(80));
    console.log('✅ FOUND IN DATABASE (Price Matches)');
    console.log('='.repeat(80));
    priceMatch.forEach(item => {
      console.log(`✅ ${item.cr.name} - $${item.cr.price}`);
    });

    if (priceDifferent.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('⚠️  FOUND BUT PRICE DIFFERENT');
      console.log('='.repeat(80));
      priceDifferent.forEach(item => {
        console.log(`⚠️  ${item.cr.name}`);
        console.log(`   PDF Price: $${item.cr.price} | Database Price: $${item.db.price}`);
      });
    }

    if (missing.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('❌ MISSING FROM DATABASE (Need to Add)');
      console.log('='.repeat(80));
      missing.forEach(item => {
        console.log(`❌ ${item.name} - $${item.price} (${item.category})`);
      });
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Cool Running products: ${coolRunningProducts.length}`);
    console.log(`✅ Found with matching price: ${priceMatch.length}`);
    console.log(`⚠️  Found but price different: ${priceDifferent.length}`);
    console.log(`❌ Missing from database: ${missing.length}`);
    console.log(`\n📈 Coverage: ${Math.round((found.length / coolRunningProducts.length) * 100)}%`);

    // Save results to file
    const fs = require('fs');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `cool-running-check-${timestamp}.txt`;

    let fileContent = `Cool Running Products Verification\n`;
    fileContent += `Generated: ${new Date().toLocaleString()}\n`;
    fileContent += `Total Products: ${coolRunningProducts.length}\n\n`;
    fileContent += '='.repeat(80) + '\n\n';

    if (missing.length > 0) {
      fileContent += 'MISSING PRODUCTS (Need to Add):\n';
      fileContent += '='.repeat(80) + '\n';
      missing.forEach(item => {
        fileContent += `${item.name} - $${item.price} (${item.category})\n`;
      });
      fileContent += '\n';
    }

    if (priceDifferent.length > 0) {
      fileContent += 'PRICE DIFFERENCES:\n';
      fileContent += '='.repeat(80) + '\n';
      priceDifferent.forEach(item => {
        fileContent += `${item.cr.name}\n`;
        fileContent += `  PDF: $${item.cr.price} | Database: $${item.db.price}\n\n`;
      });
    }

    fs.writeFileSync(filename, fileContent);
    console.log(`\n📄 Full report saved to: ${filename}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkProducts();