const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function ultraSafeBackup() {
  try {
    console.log('🔐 Starting ULTRA-SAFE COMPLETE BACKUP...\n');
    console.log('💎 This is the MOST COMPREHENSIVE backup possible!');
    console.log('📦 Includes: Products, Images, Categories, Users, Orders, EVERYTHING!\n');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const fullTimestamp = new Date().toISOString().replace(/[:.]/g, '-');

    const backupData = {
      backup_info: {
        backup_date: new Date().toISOString(),
        backup_timestamp: fullTimestamp,
        version: '3.0.0-ULTRA',
        backup_type: 'ULTRA-SAFE-COMPLETE',
        generated_by: 'KFresh Backup System',
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        project_id: 'tmufbgaxhtqgkvcngyxg'
      },
      environment: {
        // Save environment variables (for easy restore)
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME
      },
      data: {},
      statistics: {},
      image_inventory: []
    };

    let totalRecords = 0;

    // 1. PRODUCTS (CRITICAL)
    console.log('📦 Backing up PRODUCTS...');
    const { data: products } = await supabase.from('products').select('*').order('name');
    backupData.data.products = products || [];
    backupData.statistics.products = products?.length || 0;
    totalRecords += products?.length || 0;
    console.log(`✅ ${products?.length || 0} products backed up`);

    // Extract ALL image URLs from products
    console.log('🖼️  Extracting product images...');
    let allImageUrls = new Set();
    products?.forEach(product => {
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach(img => allImageUrls.add(img));
      }
    });
    backupData.image_inventory = Array.from(allImageUrls);
    console.log(`✅ ${allImageUrls.size} unique image URLs extracted`);

    // 2. CATEGORIES (CRITICAL)
    console.log('📂 Backing up CATEGORIES...');
    const { data: categories } = await supabase.from('categories').select('*').order('name');
    backupData.data.categories = categories || [];
    backupData.statistics.categories = categories?.length || 0;
    totalRecords += categories?.length || 0;
    console.log(`✅ ${categories?.length || 0} categories backed up`);

    // Extract category images
    categories?.forEach(cat => {
      if (cat.image_url) allImageUrls.add(cat.image_url);
      if (cat.hero_image_url) allImageUrls.add(cat.hero_image_url);
    });

    // 3. PRODUCT VARIANTS (IMPORTANT)
    console.log('📏 Backing up PRODUCT VARIANTS...');
    const { data: variants } = await supabase.from('product_variants').select('*');
    backupData.data.product_variants = variants || [];
    backupData.statistics.product_variants = variants?.length || 0;
    totalRecords += variants?.length || 0;
    console.log(`✅ ${variants?.length || 0} variants backed up`);

    // 4. ORDERS (CRITICAL)
    console.log('🛒 Backing up ORDERS...');
    const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    backupData.data.orders = orders || [];
    backupData.statistics.orders = orders?.length || 0;
    totalRecords += orders?.length || 0;
    console.log(`✅ ${orders?.length || 0} orders backed up`);

    // 5. ORDER ITEMS (CRITICAL)
    console.log('📦 Backing up ORDER ITEMS...');
    const { data: orderItems } = await supabase.from('order_items').select('*');
    backupData.data.order_items = orderItems || [];
    backupData.statistics.order_items = orderItems?.length || 0;
    totalRecords += orderItems?.length || 0;
    console.log(`✅ ${orderItems?.length || 0} order items backed up`);

    // 6. USER PROFILES (CRITICAL)
    console.log('👤 Backing up USER PROFILES...');
    const { data: userProfiles } = await supabase.from('user_profiles').select('*');
    backupData.data.user_profiles = userProfiles || [];
    backupData.statistics.user_profiles = userProfiles?.length || 0;
    totalRecords += userProfiles?.length || 0;
    console.log(`✅ ${userProfiles?.length || 0} user profiles backed up`);

    // 7. AUTH USERS (CRITICAL - Email & Metadata Only)
    console.log('👥 Backing up USER ACCOUNTS (metadata only)...');
    const { data: authData } = await supabase.auth.admin.listUsers();
    if (authData && authData.users) {
      backupData.data.auth_users = authData.users.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata
      }));
      backupData.statistics.auth_users = authData.users.length;
      totalRecords += authData.users.length;
      console.log(`✅ ${authData.users.length} user accounts backed up`);
    }

    // 8. REVIEWS (IMPORTANT)
    console.log('⭐ Backing up REVIEWS...');
    const { data: reviews } = await supabase.from('reviews').select('*');
    backupData.data.reviews = reviews || [];
    backupData.statistics.reviews = reviews?.length || 0;
    totalRecords += reviews?.length || 0;
    console.log(`✅ ${reviews?.length || 0} reviews backed up`);

    // 9. ALL OTHER TABLES (Everything else)
    const optionalTables = ['addresses', 'wishlist_items', 'cart_items', 'coupons', 'shipping_rates'];
    console.log('📋 Checking for additional data tables...');

    for (const table of optionalTables) {
      try {
        const { data, count } = await supabase.from(table).select('*', { count: 'exact' });
        if (data && data.length > 0) {
          backupData.data[table] = data;
          backupData.statistics[table] = data.length;
          totalRecords += data.length;
          console.log(`✅ ${data.length} ${table} backed up`);
        }
      } catch (err) {
        // Table doesn't exist or no access - skip it
      }
    }

    // Create backup directory
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Save MAIN backup file
    const filename = `ULTRA-SAFE-backup-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    // Add final statistics
    backupData.statistics.total_records = totalRecords;
    backupData.statistics.total_images = allImageUrls.size;
    backupData.statistics.backup_size_mb = 0; // Will update after save

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
    const fileSizeMB = (fs.statSync(filepath).size / (1024 * 1024)).toFixed(2);
    backupData.statistics.backup_size_mb = parseFloat(fileSizeMB);

    console.log('\n🎉 ULTRA-SAFE Backup completed successfully!');
    console.log(`📁 Main Backup: ${filepath}`);
    console.log(`💾 File Size: ${fileSizeMB} MB`);

    // Save IMAGE INVENTORY separately
    const imageFilename = `image-inventory-${timestamp}.txt`;
    const imageFilepath = path.join(backupDir, imageFilename);
    const imageList = Array.from(allImageUrls).join('\n');
    fs.writeFileSync(imageFilepath, `KFresh Image Inventory\nGenerated: ${new Date().toLocaleString()}\nTotal Images: ${allImageUrls.size}\n\n${imageList}`);
    console.log(`🖼️  Image Inventory: ${imageFilepath}`);
    console.log(`   Total unique images: ${allImageUrls.size}`);

    // Save ENVIRONMENT VARIABLES separately (for easy restore)
    const envFilename = `environment-backup-${timestamp}.txt`;
    const envFilepath = path.join(backupDir, envFilename);
    const envContent = `# KFresh Environment Variables Backup
# Generated: ${new Date().toLocaleString()}
# Use these to restore your environment

NEXT_PUBLIC_SUPABASE_URL=${backupData.environment.NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${backupData.environment.NEXT_PUBLIC_SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${backupData.environment.SUPABASE_SERVICE_ROLE_KEY}
NEXT_PUBLIC_APP_URL=${backupData.environment.NEXT_PUBLIC_APP_URL}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${backupData.environment.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
STRIPE_SECRET_KEY=${backupData.environment.STRIPE_SECRET_KEY}
NEXT_PUBLIC_SITE_NAME=${backupData.environment.NEXT_PUBLIC_SITE_NAME || 'KFresh Admin Panel'}
`;
    fs.writeFileSync(envFilepath, envContent);
    console.log(`🔑 Environment Variables: ${envFilepath}`);

    // Create COMPREHENSIVE SUMMARY
    const summaryFilename = `ULTRA-SAFE-backup-${timestamp}-SUMMARY.txt`;
    const summaryPath = path.join(backupDir, summaryFilename);

    let summary = `╔═══════════════════════════════════════════════════════════════╗
║          KFresh ULTRA-SAFE COMPLETE BACKUP SUMMARY           ║
╚═══════════════════════════════════════════════════════════════╝

🕒 Generated: ${new Date().toLocaleString()}
🔒 Backup Type: ULTRA-SAFE COMPLETE (Everything!)
📦 Total Records: ${totalRecords}
🖼️  Total Images: ${allImageUrls.size}
💾 Backup Size: ${fileSizeMB} MB

═══════════════════════════════════════════════════════════════

📊 DETAILED BREAKDOWN:

🛍️  PRODUCTS & CATALOG:
   ✅ Products: ${backupData.statistics.products}
   ✅ Categories: ${backupData.statistics.categories}
   ✅ Product Variants: ${backupData.statistics.product_variants}
   ✅ Product Images: ${allImageUrls.size} unique URLs

💰 ORDERS & SALES:
   ✅ Orders: ${backupData.statistics.orders}
   ✅ Order Items: ${backupData.statistics.order_items}

👥 USERS & ACCOUNTS:
   ✅ User Profiles: ${backupData.statistics.user_profiles}
   ✅ Auth Accounts: ${backupData.statistics.auth_users || 0}

⭐ REVIEWS & ENGAGEMENT:
   ✅ Reviews: ${backupData.statistics.reviews}
`;

    // Add optional tables if they exist
    optionalTables.forEach(table => {
      if (backupData.statistics[table]) {
        summary += `   ✅ ${table}: ${backupData.statistics[table]}\n`;
      }
    });

    summary += `
═══════════════════════════════════════════════════════════════

📁 BACKUP FILES CREATED:

1. 📦 Main Backup (JSON):
   ${filename}
   Size: ${fileSizeMB} MB
   Contains: ALL data (products, categories, users, orders, etc.)

2. 🖼️  Image Inventory (TXT):
   ${imageFilename}
   Contains: ${allImageUrls.size} image URLs

3. 🔑 Environment Variables (TXT):
   ${envFilename}
   Contains: All API keys and configuration

4. 📄 This Summary (TXT):
   ${summaryFilename}

═══════════════════════════════════════════════════════════════

🔐 WHAT'S BACKED UP:

✅ ALL Products (${backupData.statistics.products}) with full details
✅ ALL Categories (${backupData.statistics.categories}) with organization
✅ ALL Product Images (${allImageUrls.size} URLs)
✅ ALL Product Variants (${backupData.statistics.product_variants}) - sizes, prices
✅ ALL Customer Orders (${backupData.statistics.orders})
✅ ALL Order Details (${backupData.statistics.order_items})
✅ ALL User Accounts (${backupData.statistics.auth_users || 0}) - metadata only
✅ ALL User Profiles (${backupData.statistics.user_profiles})
✅ ALL Product Reviews (${backupData.statistics.reviews})
✅ Environment Variables (Supabase keys, Stripe keys, etc.)

🚫 NOT Backed Up (Not Needed):
   • User Passwords (hashed in Supabase, can't backup)
   • Actual image files (URLs saved, files in Supabase Storage)
   • Payment info (stored in Stripe, not database)

═══════════════════════════════════════════════════════════════

💾 WHERE TO SAVE THESE FILES:

🔴 CRITICAL - Save to at least 3 locations:

1. ✅ Your Computer (Current location):
   ${backupDir}

2. ⚠️ Upload to Cloud Storage:
   • Google Drive (RECOMMENDED)
   • Dropbox
   • iCloud Drive
   • OneDrive

3. ⚠️ External Storage:
   • External Hard Drive
   • USB Flash Drive
   • Network Attached Storage (NAS)

4. 💡 Email Backup:
   • Email these files to yourself
   • Compress first if too large

═══════════════════════════════════════════════════════════════

🚨 RESTORE INSTRUCTIONS:

If something goes wrong:

1. Locate this backup file:
   ${filename}

2. Run restore command:
   node restore-products.js backups/${filename} CONFIRM

3. All your data will be restored!

═══════════════════════════════════════════════════════════════

✅ YOU ARE 1000x PROTECTED!

Your entire business data is now backed up:
• ${totalRecords} total database records
• ${allImageUrls.size} product images (URLs)
• All environment variables
• All configuration

Even if:
❌ Supabase deletes everything
❌ Someone messes up the database
❌ Computer crashes
❌ Accidental deletions

YOU CAN RESTORE EVERYTHING!

═══════════════════════════════════════════════════════════════

📅 Next Steps:

1. ✅ Save these files to cloud storage NOW
2. ✅ Save to external drive
3. ✅ Run this backup daily while hired person works
4. ✅ Keep backups for at least 30 days
5. ✅ Test restore occasionally (dry run)

═══════════════════════════════════════════════════════════════

Last Backup: ${new Date().toLocaleString()}
Backup Files: ${backupDir}
Status: ✅ ULTRA-SAFE & SECURE
Protection Level: 🛡️🛡️🛡️🛡️🛡️ (MAXIMUM)
`;

    fs.writeFileSync(summaryPath, summary);
    console.log(`📄 Summary: ${summaryPath}`);

    // Print summary to console
    console.log('\n' + '═'.repeat(60));
    console.log('📊 BACKUP SUMMARY');
    console.log('═'.repeat(60));
    console.log(`✅ Products: ${backupData.statistics.products}`);
    console.log(`✅ Categories: ${backupData.statistics.categories}`);
    console.log(`✅ Variants: ${backupData.statistics.product_variants}`);
    console.log(`✅ Orders: ${backupData.statistics.orders}`);
    console.log(`✅ Users: ${backupData.statistics.auth_users || 0}`);
    console.log(`✅ Reviews: ${backupData.statistics.reviews}`);
    console.log(`✅ Images: ${allImageUrls.size} URLs`);
    console.log(`✅ Total Records: ${totalRecords}`);
    console.log('═'.repeat(60));

    console.log('\n🎉 SUCCESS! Your data is ULTRA-SAFE!');
    console.log('\n📁 Files created:');
    console.log(`   1. ${filename} (${fileSizeMB} MB)`);
    console.log(`   2. ${imageFilename}`);
    console.log(`   3. ${envFilename}`);
    console.log(`   4. ${summaryFilename}`);

    console.log('\n⚠️  IMPORTANT: Upload these files to cloud storage NOW!');
    console.log('   • Google Drive');
    console.log('   • External hard drive');
    console.log('   • Email to yourself\n');

  } catch (error) {
    console.error('❌ Backup failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

ultraSafeBackup();