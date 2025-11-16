const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function backupAllData() {
  try {
    console.log('🔄 Starting complete database backup...\n');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupData = {
      backup_date: new Date().toISOString(),
      backup_timestamp: timestamp,
      version: '1.0.0',
      data: {}
    };

    // 1. Backup Categories
    console.log('📂 Backing up categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    } else {
      backupData.data.categories = categories;
      console.log(`✅ Backed up ${categories.length} categories`);
    }

    // 2. Backup Products
    console.log('📦 Backing up products...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (productsError) {
      console.error('Error fetching products:', productsError);
    } else {
      backupData.data.products = products;
      console.log(`✅ Backed up ${products.length} products`);
    }

    // 3. Backup Product Variants
    console.log('📏 Backing up product variants...');
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .order('product_id');

    if (variantsError && variantsError.code !== 'PGRST116') {
      console.error('Error fetching variants:', variantsError);
    } else if (variants) {
      backupData.data.product_variants = variants;
      console.log(`✅ Backed up ${variants.length} product variants`);
    } else {
      backupData.data.product_variants = [];
      console.log('✅ No product variants found');
    }

    // 4. Backup Media/Images
    console.log('🖼️  Backing up media gallery...');
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .select('*')
      .order('created_at');

    if (mediaError && mediaError.code !== 'PGRST116') {
      console.error('Error fetching media:', mediaError);
    } else if (media) {
      backupData.data.media = media;
      console.log(`✅ Backed up ${media.length} media items`);
    } else {
      backupData.data.media = [];
      console.log('✅ No media items found');
    }

    // 5. Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // 6. Save to file
    const filename = `product-backup-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

    console.log('\n🎉 Backup completed successfully!');
    console.log(`📁 Backup saved to: ${filepath}`);
    console.log('\n📊 Backup Summary:');
    console.log(`   Categories: ${backupData.data.categories?.length || 0}`);
    console.log(`   Products: ${backupData.data.products?.length || 0}`);
    console.log(`   Product Variants: ${backupData.data.product_variants?.length || 0}`);
    console.log(`   Media Items: ${backupData.data.media?.length || 0}`);
    console.log(`\n💾 File size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);

    // 7. Create a human-readable summary
    const summaryFilename = `product-backup-${timestamp}-summary.txt`;
    const summaryPath = path.join(backupDir, summaryFilename);

    let summary = `KFresh Products Backup Summary
Generated: ${new Date().toLocaleString()}
=====================================

CATEGORIES (${backupData.data.categories?.length || 0}):
`;

    if (backupData.data.categories) {
      backupData.data.categories.forEach(cat => {
        summary += `  • ${cat.name} (${cat.is_active ? 'Active' : 'Inactive'})\n`;
      });
    }

    summary += `\nPRODUCTS (${backupData.data.products?.length || 0}):\n`;

    if (backupData.data.products) {
      backupData.data.products.forEach(prod => {
        const categoryName = backupData.data.categories?.find(c => c.id === prod.category_id)?.name || 'Uncategorized';
        summary += `  • ${prod.name} - $${prod.price} - ${categoryName} - ${prod.is_available ? 'Available' : 'Unavailable'}\n`;

        // Show variants for this product if any
        const productVariants = backupData.data.product_variants?.filter(v => v.product_id === prod.id);
        if (productVariants && productVariants.length > 0) {
          productVariants.forEach(variant => {
            summary += `    └─ ${variant.size_name}: $${variant.price} (Stock: ${variant.stock_quantity})${variant.is_default ? ' [DEFAULT]' : ''}\n`;
          });
        }
      });
    }

    fs.writeFileSync(summaryPath, summary);
    console.log(`📄 Summary saved to: ${summaryPath}`);

    console.log('\n✅ Backup complete! Your data is safe.');
    console.log('\n💡 To restore from this backup, keep both files safe.');

  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

backupAllData();