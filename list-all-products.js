const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function listAllProducts() {
  try {
    console.log('📦 Fetching all products from database...\n');

    // Get all products with their categories
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        is_available,
        category_id,
        categories(name)
      `)
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    console.log(`📊 Total Products: ${products.length}\n`);
    console.log('='.repeat(80));

    // Group by category
    const productsByCategory = {};

    products.forEach(product => {
      const categoryName = product.categories?.name || 'Uncategorized';
      if (!productsByCategory[categoryName]) {
        productsByCategory[categoryName] = [];
      }
      productsByCategory[categoryName].push(product);
    });

    // Display by category
    Object.keys(productsByCategory).sort().forEach(categoryName => {
      const categoryProducts = productsByCategory[categoryName];
      console.log(`\n📂 ${categoryName} (${categoryProducts.length} products)`);
      console.log('-'.repeat(80));

      categoryProducts.forEach((product, index) => {
        const status = product.is_available ? '✅' : '❌';
        console.log(`${index + 1}. ${status} ${product.name} - $${product.price}`);
      });
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n📊 Summary:`);
    console.log(`   Total Products: ${products.length}`);
    console.log(`   Available: ${products.filter(p => p.is_available).length}`);
    console.log(`   Unavailable: ${products.filter(p => !p.is_available).length}`);
    console.log(`   Categories: ${Object.keys(productsByCategory).length}`);

    // Save to file
    const fs = require('fs');
    const path = require('path');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `product-list-${timestamp}.txt`;
    const filepath = path.join(__dirname, filename);

    let fileContent = `KFresh Product List\nGenerated: ${new Date().toLocaleString()}\nTotal Products: ${products.length}\n\n`;
    fileContent += '='.repeat(80) + '\n\n';

    Object.keys(productsByCategory).sort().forEach(categoryName => {
      const categoryProducts = productsByCategory[categoryName];
      fileContent += `\n${categoryName} (${categoryProducts.length} products)\n`;
      fileContent += '-'.repeat(80) + '\n';

      categoryProducts.forEach((product, index) => {
        const status = product.is_available ? 'Available' : 'Unavailable';
        fileContent += `${index + 1}. ${product.name} - $${product.price} [${status}]\n`;
      });
    });

    fs.writeFileSync(filepath, fileContent);
    console.log(`\n📄 Full list saved to: ${filename}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

listAllProducts();