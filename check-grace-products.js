const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Grace products from the PDF
const graceProducts = [
  // FROZEN FOODS
  { name: 'Lafe Frozen Cassava 5lb', price: 13.60, category: 'Frozen Foods' },
  { name: 'Lafe Frozen Cassava 1lb', price: 2.73, category: 'Frozen Foods' },
  { name: 'Lafe Frozen Cassava Croquette 908g', price: 7.99, category: 'Frozen Foods' },
  { name: 'Grace Soursop frozen fruit pulp (400g)', price: 4.99, category: 'Frozen Foods' },
  { name: 'Grace Passion fruit frozen fruit pulp (400g)', price: 4.99, category: 'Frozen Foods' },

  // DRINKS/BEVERAGES
  { name: 'Ovaltine Malted Milk Drink (White) 400g', price: 7.49, category: 'Drinks/Beverages' },
  { name: 'Ovaltine Chocolate (Brown Btl) 400g', price: 7.49, category: 'Drinks/Beverages' },
  { name: 'Ovaltine Original Classic 400g', price: 7.49, category: 'Drinks/Beverages' },
  { name: 'Grace Vita Malt Classic 330ml', price: 2.99, category: 'Drinks/Beverages' },
  { name: 'Grace Malta 341ml', price: 2.99, category: 'Drinks/Beverages' },
  { name: 'Grace Mango drink 355ml', price: 1.49, category: 'Drinks/Beverages' },
  { name: 'Grace Cream Soda 355ml', price: 1.49, category: 'Drinks/Beverages' },
  { name: 'Grace Kola Champange 355ml', price: 1.49, category: 'Drinks/Beverages' },
  { name: 'Grace Pineapple 355ml', price: 1.49, category: 'Drinks/Beverages' },
  { name: 'Grace Gingerbeer 355ml', price: 1.49, category: 'Drinks/Beverages' },
  { name: 'Grace Pineapple Guava 473ml', price: 2.29, category: 'Drinks/Beverages' },
  { name: 'Grace Island Mango 473ml', price: 2.29, category: 'Drinks/Beverages' },
  { name: 'Grace Pineapple Ginger 473ml', price: 2.29, category: 'Drinks/Beverages' },
  { name: 'Grace Mango Carrot 473ml', price: 2.29, category: 'Drinks/Beverages' },
  { name: 'Grace Fruit Punch 473ml', price: 2.29, category: 'Drinks/Beverages' },
  { name: 'Grace Sorrel Ginger 473ml', price: 2.29, category: 'Drinks/Beverages' },

  // CANNED & PACKAGE GOODS
  { name: 'Grace Ackees 540g', price: 11.45, category: 'Canned & Package Goods' },
  { name: 'Grace Callaloo 540g', price: 3.75, category: 'Canned & Package Goods' },
  { name: 'Grace Black Eye Peas 540ml', price: 2.50, category: 'Canned & Package Goods' },
  { name: 'Grace Red Kidney Bean 540ml', price: 2.50, category: 'Canned & Package Goods' },
  { name: 'Grace Green Pigeon Peas 425ml', price: 2.50, category: 'Canned & Package Goods' },
  { name: 'Grace Dry Pigeon Peas 540ml', price: 2.50, category: 'Canned & Package Goods' },
  { name: 'Grace Lima Beans 540ml', price: 3.25, category: 'Canned & Package Goods' },
  { name: 'Grace Chickpeas 540ml', price: 2.50, category: 'Canned & Package Goods' },
  { name: 'Grace Sundried Sorrel 126g', price: 4.00, category: 'Canned & Package Goods' },
  { name: 'Grace Sardine in Tom/Chili 155g', price: 1.27, category: 'Canned & Package Goods' },
  { name: 'Grace Sardines in Tomato Sauce 155g', price: 1.27, category: 'Canned & Package Goods' },
  { name: 'Grace Mackerel in Tomato Sauce 155g', price: 1.27, category: 'Canned & Package Goods' },
  { name: 'Grace Mackerel Tom/Chili 155g', price: 1.27, category: 'Canned & Package Goods' },
  { name: 'Grace Jack Mackerel in Brine 425g', price: 3.48, category: 'Canned & Package Goods' },
  { name: 'Grace Jack Mackerel Tom. 425g', price: 3.85, category: 'Canned & Package Goods' },
  { name: 'Grace Regular Vienna Sausages 113g', price: 1.99, category: 'Canned & Package Goods' },
  { name: 'Grace Vienna Sausages Hot n Spicy 113g', price: 1.99, category: 'Canned & Package Goods' },
  { name: 'Grace Corned Beef 7oz', price: 3.00, category: 'Canned & Package Goods' },
  { name: 'Grace Corned Beef Reduced Salt 340g', price: 4.75, category: 'Canned & Package Goods' },
  { name: 'Grace Halal Corned Beef 340g', price: 4.85, category: 'Canned & Package Goods' },
  { name: 'Grace Regular Corn Beef 340g', price: 4.75, category: 'Canned & Package Goods' },
  { name: 'Grace Yellow Split 2kg', price: 6.49, category: 'Canned & Package Goods' },
  { name: 'Grace Black Eye Peas 2kg', price: 9.99, category: 'Canned & Package Goods' },
  { name: 'Grace Pigeon Peas 2kg', price: 9.50, category: 'Canned & Package Goods' },
  { name: 'Grace Pigeon Peas 800g', price: 3.99, category: 'Canned & Package Goods' },
  { name: 'Grace Red Kidney 2kg', price: 8.99, category: 'Canned & Package Goods' },
  { name: 'Grace Festival 270g', price: 2.55, category: 'Canned & Package Goods' },
  { name: 'Grace Johnny Cake 270g', price: 2.40, category: 'Canned & Package Goods' },
  { name: 'Grace Salt Fish Fritter 270g', price: 3.29, category: 'Canned & Package Goods' },
  { name: 'Grace Carib. Seasoning /Rice 175g', price: 3.29, category: 'Canned & Package Goods' },
  { name: 'Grace Blackeye Peas /Rice 175g', price: 3.29, category: 'Canned & Package Goods' },
  { name: 'Grace Red Kidney Bean /Rice 175g', price: 3.29, category: 'Canned & Package Goods' },
  { name: 'Grace White Rice 8kg', price: 21.00, category: 'Canned & Package Goods' },
  { name: 'Grace White Rice 2kg', price: 5.99, category: 'Canned & Package Goods' },
  { name: 'Grace Parboiled Rice 8kg', price: 21.89, category: 'Canned & Package Goods' },
  { name: 'Grace Parboiled Rice 2kg', price: 6.29, category: 'Canned & Package Goods' },
  { name: 'Grace Corn Meal 8kg', price: 9.99, category: 'Canned & Package Goods' },
  { name: 'Grace Corn Meal 2kg', price: 4.29, category: 'Canned & Package Goods' },
  { name: 'Grace Corn Meal 800g', price: 2.99, category: 'Canned & Package Goods' },
  { name: 'Grace Hominy Corn 400g', price: 2.00, category: 'Canned & Package Goods' },
  { name: 'Grace Oats 1kg', price: 3.55, category: 'Canned & Package Goods' },
  { name: 'Grace Coconut Water with pulp 310ml', price: 1.69, category: 'Canned & Package Goods' },
  { name: 'Grace Coconut Water with pulp 500ml', price: 2.30, category: 'Canned & Package Goods' },
  { name: 'Grace Lite Coconut Milk 400ml', price: 1.79, category: 'Canned & Package Goods' },
  { name: 'Grace Coconut Milk Powder 50g', price: 1.48, category: 'Canned & Package Goods' },
  { name: 'Grace Coconut milk powder 300g', price: 6.28, category: 'Canned & Package Goods' },
  { name: 'Grace Coconut Cream 141g', price: 1.49, category: 'Canned & Package Goods' },
  { name: 'Grace Organic Coconut Milk 400ml', price: 3.48, category: 'Canned & Package Goods' },
  { name: 'Grace Coconut Milk 400ml', price: 2.10, category: 'Canned & Package Goods' },

  // BAKING PRODUCTS
  { name: 'Grace Organic Coconut Sugar 500g', price: 8.28, category: 'Baking Products' },

  // COOKING OILS
  { name: 'Grace Organic Coconut Oil 1L', price: 17.58, category: 'Cooking Oils' },
  { name: 'Grace Coconut Oil 500ml', price: 9.55, category: 'Cooking Oils' },

  // SOUPS
  { name: 'Grace Chicken Noodle Soup 60g – NALCAN', price: 1.29, category: 'Soups' },
  { name: 'Grace Cock Soup 43g – NALCAN', price: 1.83, category: 'Soups' },
  { name: 'Grace Fish Tea 45g', price: 1.83, category: 'Soups' },
  { name: 'Grace Beef Pumpkin 50g', price: 1.83, category: 'Soups' },
  { name: 'Grace Cock 42g', price: 1.83, category: 'Soups' },
  { name: 'Grace Chicken Noodle 60g', price: 1.83, category: 'Soups' },

  // SAUCES
  { name: 'Grace Fish & Meat 142ml', price: 3.00, category: 'Sauces' },
  { name: 'Grace Browning 142ml', price: 3.00, category: 'Sauces' },
  { name: 'Grace Guava Jelly 340g', price: 3.99, category: 'Sauces' },

  // SPICES, HERBS & SEASONINGS
  { name: 'Grace Oxtail Marinade 350ml', price: 4.99, category: 'Spices, Herbs & Seasonings' },
  { name: 'Grace Jerk B.B.Q. 480ml', price: 4.99, category: 'Spices, Herbs & Seasonings' },
  { name: 'Grace Jerk Seasoning - MILD 284g', price: 4.99, category: 'Spices, Herbs & Seasonings' },
  { name: 'Grace Jerk Seasoning - HOT 284g', price: 4.99, category: 'Spices, Herbs & Seasonings' },

  // CANDY
  { name: 'Grace Dinner Mint (100g)', price: 1.99, category: 'Candy' },
  { name: 'Grace Ginger Mint (90g)', price: 1.99, category: 'Candy' },
  { name: 'Grace Ice Mint (100g)', price: 1.99, category: 'Candy' },

  // SNACKS
  { name: 'Ovaltine Cookie 150g', price: 2.00, category: 'Snacks' },
  { name: 'Mr. Johns Ripe Plantain Chips (135g)', price: 5.00, category: 'Snacks' },
  { name: 'Mr. Johns Regular Plantain Chips (135g)', price: 5.00, category: 'Snacks' },
  { name: 'Mr. Johns Ripe Spicy Plantain Chips (135g)', price: 5.00, category: 'Snacks' },
  { name: 'Mr. Johns Spicy Caribbean Style Plantain Chips (135g)', price: 5.00, category: 'Snacks' },
  { name: 'Mr. Johns Caribbean Style Plantain Chips (135g)', price: 5.00, category: 'Snacks' },

  // HOT PEPPER SAUCE
  { name: 'Grace Scotch Bonnet Pepper sauce 85ml', price: 2.75, category: 'Hot Pepper Sauce' },
  { name: 'Grace Habanero Pepper 167ml', price: 2.29, category: 'Hot Pepper Sauce' },
  { name: 'Grace Scotch Bonnet 142ml', price: 3.85, category: 'Hot Pepper Sauce' },
  { name: 'Grace Hot Pepper Sauce 170ml', price: 3.25, category: 'Hot Pepper Sauce' },
  { name: 'Grace Hot Pepper Sauce 85ml', price: 3.25, category: 'Hot Pepper Sauce' }
];

async function checkProducts() {
  try {
    console.log('🔍 Checking Grace Products...\n');
    console.log(`📋 Total products to check: ${graceProducts.length}\n`);

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

    graceProducts.forEach(grProduct => {
      const dbProduct = dbProducts.find(db => {
        const dbName = db.name.toLowerCase().trim();
        const grName = grProduct.name.toLowerCase().trim();

        if (dbName === grName) return true;
        if (dbName.includes(grName.replace(/[()]/g, '').trim()) ||
            grName.includes(dbName.replace(/[()]/g, '').trim())) {
          return true;
        }

        // Special handling for variations
        const grNameClean = grName.replace(/–/g, '-').replace(/\s+/g, ' ');
        const dbNameClean = dbName.replace(/–/g, '-').replace(/\s+/g, ' ');
        if (dbNameClean === grNameClean) return true;

        return false;
      });

      if (dbProduct) {
        found.push({ gr: grProduct, db: dbProduct });
        if (Math.abs(dbProduct.price - grProduct.price) < 0.01) {
          priceMatch.push({ gr: grProduct, db: dbProduct });
        } else {
          priceDifferent.push({ gr: grProduct, db: dbProduct });
        }
      } else {
        missing.push(grProduct);
      }
    });

    console.log('='.repeat(80));
    console.log('✅ FOUND IN DATABASE (Price Matches)');
    console.log('='.repeat(80));
    priceMatch.forEach(item => {
      console.log(`✅ ${item.gr.name} - $${item.gr.price}`);
    });

    if (priceDifferent.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('⚠️  FOUND BUT PRICE DIFFERENT');
      console.log('='.repeat(80));
      priceDifferent.forEach(item => {
        console.log(`⚠️  ${item.gr.name}`);
        console.log(`   PDF: $${item.gr.price} | Database: $${item.db.price}`);
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

    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Grace products: ${graceProducts.length}`);
    console.log(`✅ Found with matching price: ${priceMatch.length}`);
    console.log(`⚠️  Found but price different: ${priceDifferent.length}`);
    console.log(`❌ Missing from database: ${missing.length}`);
    console.log(`\n📈 Coverage: ${Math.round((found.length / graceProducts.length) * 100)}%`);

    const fs = require('fs');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `grace-products-check-${timestamp}.txt`;

    let fileContent = `Grace Products Verification\n`;
    fileContent += `Generated: ${new Date().toLocaleString()}\n`;
    fileContent += `Total Products: ${graceProducts.length}\n\n`;

    if (missing.length > 0) {
      fileContent += 'MISSING PRODUCTS:\n' + '='.repeat(80) + '\n';
      missing.forEach(item => {
        fileContent += `${item.name} - $${item.price} (${item.category})\n`;
      });
    }

    if (priceDifferent.length > 0) {
      fileContent += '\nPRICE DIFFERENCES:\n' + '='.repeat(80) + '\n';
      priceDifferent.forEach(item => {
        fileContent += `${item.gr.name}\n  PDF: $${item.gr.price} | DB: $${item.db.price}\n\n`;
      });
    }

    fs.writeFileSync(filename, fileContent);
    console.log(`\n📄 Report saved to: ${filename}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkProducts();