const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function restoreFromBackup(backupFilePath) {
  try {
    console.log('🔄 Starting database restore...\n');

    // Read the backup file
    if (!fs.existsSync(backupFilePath)) {
      console.error('❌ Backup file not found:', backupFilePath);
      console.log('\n💡 Available backups:');
      const backupDir = path.join(__dirname, 'backups');
      const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
      files.forEach(f => console.log(`   • ${f}`));
      return;
    }

    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
    console.log(`📁 Loaded backup from: ${backupData.backup_date}`);
    console.log(`📊 Backup contains:`);
    console.log(`   Categories: ${backupData.data.categories?.length || 0}`);
    console.log(`   Products: ${backupData.data.products?.length || 0}`);
    console.log(`   Product Variants: ${backupData.data.product_variants?.length || 0}`);
    console.log(`   Media Items: ${backupData.data.media?.length || 0}`);

    // WARNING - Ask for confirmation
    console.log('\n⚠️  WARNING: This will REPLACE all existing data!');
    console.log('⚠️  Make sure you have a current backup before proceeding.');
    console.log('\n🛑 This is a DRY RUN - showing what would be restored.\n');

    let stats = {
      categories: { inserted: 0, updated: 0, errors: 0 },
      products: { inserted: 0, updated: 0, errors: 0 },
      variants: { inserted: 0, updated: 0, errors: 0 }
    };

    // 1. Restore Categories (UPSERT to update or insert)
    if (backupData.data.categories && backupData.data.categories.length > 0) {
      console.log('📂 Restoring categories...');
      for (const category of backupData.data.categories) {
        console.log(`   • ${category.name} (${category.slug})`);
        // In real restore: await supabase.from('categories').upsert(category)
        stats.categories.inserted++;
      }
      console.log(`✅ Would restore ${stats.categories.inserted} categories\n`);
    }

    // 2. Restore Products
    if (backupData.data.products && backupData.data.products.length > 0) {
      console.log('📦 Restoring products...');
      for (const product of backupData.data.products) {
        console.log(`   • ${product.name} - $${product.price}`);
        // In real restore: await supabase.from('products').upsert(product)
        stats.products.inserted++;
      }
      console.log(`✅ Would restore ${stats.products.inserted} products\n`);
    }

    // 3. Restore Product Variants
    if (backupData.data.product_variants && backupData.data.product_variants.length > 0) {
      console.log('📏 Restoring product variants...');
      for (const variant of backupData.data.product_variants) {
        console.log(`   • ${variant.size_name} - $${variant.price}`);
        // In real restore: await supabase.from('product_variants').upsert(variant)
        stats.variants.inserted++;
      }
      console.log(`✅ Would restore ${stats.variants.inserted} variants\n`);
    }

    console.log('🎉 DRY RUN Complete!\n');
    console.log('📊 Summary (what would be restored):');
    console.log(`   Categories: ${stats.categories.inserted}`);
    console.log(`   Products: ${stats.products.inserted}`);
    console.log(`   Variants: ${stats.variants.inserted}`);
    console.log('\n💡 To perform ACTUAL restore:');
    console.log('   1. Uncomment the upsert lines in the script');
    console.log('   2. Run: node restore-products.js path/to/backup.json CONFIRM');
    console.log('\n⚠️  IMPORTANT: Always backup current data before restoring!');

  } catch (error) {
    console.error('❌ Restore failed:', error);
    process.exit(1);
  }
}

// Usage
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('📖 Usage: node restore-products.js <backup-file.json> [CONFIRM]');
  console.log('\nExample:');
  console.log('   node restore-products.js backups/product-backup-2025-10-20.json');
  console.log('\n💡 Available backups:');
  const backupDir = path.join(__dirname, 'backups');
  if (fs.existsSync(backupDir)) {
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
    files.forEach(f => console.log(`   • backups/${f}`));
  }
} else {
  const backupFile = args[0];
  const isConfirmed = args[1] === 'CONFIRM';

  if (!isConfirmed) {
    console.log('🛑 Running in DRY RUN mode (showing what would happen)...\n');
  }

  restoreFromBackup(backupFile);
}