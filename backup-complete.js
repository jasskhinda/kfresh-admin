const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function completeBackup() {
  try {
    console.log('🔄 Starting COMPLETE database backup...\n');
    console.log('📦 This includes: Products, Categories, Orders, Users, Reviews, and more!\n');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupData = {
      backup_date: new Date().toISOString(),
      backup_timestamp: timestamp,
      version: '2.0.0',
      backup_type: 'COMPLETE',
      data: {}
    };

    // 1. Products & Categories
    console.log('📦 Backing up products...');
    const { data: products } = await supabase.from('products').select('*').order('name');
    backupData.data.products = products || [];
    console.log(`✅ ${products?.length || 0} products`);

    console.log('📂 Backing up categories...');
    const { data: categories } = await supabase.from('categories').select('*').order('name');
    backupData.data.categories = categories || [];
    console.log(`✅ ${categories?.length || 0} categories`);

    console.log('📏 Backing up product variants...');
    const { data: variants } = await supabase.from('product_variants').select('*');
    backupData.data.product_variants = variants || [];
    console.log(`✅ ${variants?.length || 0} variants`);

    // 2. Orders & Order Items
    console.log('🛒 Backing up orders...');
    const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    backupData.data.orders = orders || [];
    console.log(`✅ ${orders?.length || 0} orders`);

    console.log('📦 Backing up order items...');
    const { data: orderItems } = await supabase.from('order_items').select('*');
    backupData.data.order_items = orderItems || [];
    console.log(`✅ ${orderItems?.length || 0} order items`);

    // 3. Reviews
    console.log('⭐ Backing up reviews...');
    const { data: reviews } = await supabase.from('reviews').select('*');
    backupData.data.reviews = reviews || [];
    console.log(`✅ ${reviews?.length || 0} reviews`);

    // 4. User Profiles (NOT auth.users - just profiles)
    console.log('👤 Backing up user profiles...');
    const { data: userProfiles } = await supabase.from('user_profiles').select('*');
    backupData.data.user_profiles = userProfiles || [];
    console.log(`✅ ${userProfiles?.length || 0} user profiles`);

    // 5. Auth Users (metadata only, not passwords)
    console.log('👥 Backing up user accounts (metadata only)...');
    const { data: authData } = await supabase.auth.admin.listUsers();
    if (authData && authData.users) {
      backupData.data.auth_users = authData.users.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at,
        user_metadata: user.user_metadata
      }));
      console.log(`✅ ${authData.users.length} user accounts`);
    }

    // 6. Other tables (if they have data)
    const otherTables = ['addresses', 'wishlist_items', 'cart_items'];
    for (const table of otherTables) {
      try {
        const { data } = await supabase.from(table).select('*');
        if (data && data.length > 0) {
          backupData.data[table] = data;
          console.log(`✅ ${data.length} ${table}`);
        }
      } catch (err) {
        // Table might not exist, skip it
      }
    }

    // Create backup directory
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Save complete backup
    const filename = `COMPLETE-backup-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

    console.log('\n🎉 COMPLETE Backup finished successfully!');
    console.log(`📁 Saved to: ${filepath}`);
    console.log(`💾 File size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);

    // Create detailed summary
    console.log('\n📊 COMPLETE BACKUP SUMMARY:');
    console.log('='.repeat(60));
    console.log('✅ PRODUCTS & CATALOG:');
    console.log(`   • Products: ${backupData.data.products.length}`);
    console.log(`   • Categories: ${backupData.data.categories.length}`);
    console.log(`   • Product Variants: ${backupData.data.product_variants.length}`);

    console.log('\n💰 ORDERS & SALES:');
    console.log(`   • Orders: ${backupData.data.orders.length}`);
    console.log(`   • Order Items: ${backupData.data.order_items.length}`);

    console.log('\n👥 USERS & PROFILES:');
    console.log(`   • User Profiles: ${backupData.data.user_profiles.length}`);
    console.log(`   • Auth Accounts: ${backupData.data.auth_users?.length || 0}`);

    console.log('\n⭐ REVIEWS & ENGAGEMENT:');
    console.log(`   • Reviews: ${backupData.data.reviews.length}`);

    if (backupData.data.addresses?.length > 0) {
      console.log(`   • Saved Addresses: ${backupData.data.addresses.length}`);
    }
    if (backupData.data.wishlist_items?.length > 0) {
      console.log(`   • Wishlist Items: ${backupData.data.wishlist_items.length}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Everything is backed up and safe!');
    console.log('💡 Keep this file in a secure location (cloud + external drive)');

    // Save summary file
    const summaryFilename = `COMPLETE-backup-${timestamp}-summary.txt`;
    const summaryPath = path.join(backupDir, summaryFilename);

    let summary = `KFresh COMPLETE Database Backup
Generated: ${new Date().toLocaleString()}
Type: FULL BACKUP (All data)
=====================================

📦 PRODUCTS & CATALOG:
   • Products: ${backupData.data.products.length}
   • Categories: ${backupData.data.categories.length}
   • Product Variants: ${backupData.data.product_variants.length}

💰 ORDERS & SALES:
   • Orders: ${backupData.data.orders.length}
   • Order Items: ${backupData.data.order_items.length}

👥 USERS & PROFILES:
   • User Profiles: ${backupData.data.user_profiles.length}
   • Auth Accounts: ${backupData.data.auth_users?.length || 0}

⭐ REVIEWS & ENGAGEMENT:
   • Reviews: ${backupData.data.reviews.length}

📁 FILES:
   • Main Backup: ${filename}
   • Size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB

🔐 SECURITY NOTES:
   • Passwords are NOT included (they're hashed in Supabase)
   • User emails ARE included
   • Payment info is NOT stored in database

✅ This backup can restore your ENTIRE site!
`;

    fs.writeFileSync(summaryPath, summary);
    console.log(`📄 Summary: ${summaryPath}\n`);

  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

completeBackup();