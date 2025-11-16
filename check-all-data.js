const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function checkAllData() {
  console.log('🔍 Checking ALL data in your Supabase database...\n');

  const tables = [
    'products',
    'categories',
    'product_variants',
    'user_profiles',
    'orders',
    'order_items',
    'reviews',
    'media',
    'wishlist_items',
    'addresses',
    'cart_items'
  ];

  const summary = {
    backed_up: [],
    not_backed_up: [],
    empty: [],
    not_exist: []
  };

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === 'PGRST205' || error.code === 'PGRST116') {
          summary.not_exist.push(table);
          console.log(`❌ ${table}: Table doesn't exist`);
        } else {
          console.log(`⚠️  ${table}: Error - ${error.message}`);
        }
      } else {
        const rowCount = count || 0;
        if (rowCount === 0) {
          summary.empty.push(table);
          console.log(`📭 ${table}: Empty (0 rows)`);
        } else {
          // Check if this table is in our backup
          const isBackedUp = ['products', 'categories', 'product_variants'].includes(table);
          if (isBackedUp) {
            summary.backed_up.push({ table, count: rowCount });
            console.log(`✅ ${table}: ${rowCount} rows (BACKED UP)`);
          } else {
            summary.not_backed_up.push({ table, count: rowCount });
            console.log(`⚠️  ${table}: ${rowCount} rows (NOT BACKED UP)`);
          }
        }
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));

  console.log('\n✅ BACKED UP AND SAFE:');
  summary.backed_up.forEach(({ table, count }) => {
    console.log(`   • ${table}: ${count} rows`);
  });

  if (summary.not_backed_up.length > 0) {
    console.log('\n⚠️  HAS DATA BUT NOT IN CURRENT BACKUP:');
    summary.not_backed_up.forEach(({ table, count }) => {
      console.log(`   • ${table}: ${count} rows`);
    });
    console.log('\n💡 Consider backing these up too if they\'re important!');
  }

  if (summary.empty.length > 0) {
    console.log('\n📭 EMPTY (no data to backup):');
    summary.empty.forEach(table => {
      console.log(`   • ${table}`);
    });
  }

  if (summary.not_exist.length > 0) {
    console.log('\n❌ TABLES THAT DON\'T EXIST:');
    summary.not_exist.forEach(table => {
      console.log(`   • ${table}`);
    });
  }

  // Check auth users
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (!authError && authData) {
      console.log('\n👥 USER ACCOUNTS:');
      console.log(`   • Total users: ${authData.users.length}`);
      console.log(`   • ⚠️  NOT in current backup!`);
      console.log(`   • Consider exporting if needed`);
    }
  } catch (err) {
    console.log('\n👥 USER ACCOUNTS: Could not check');
  }

  console.log('\n' + '='.repeat(60));
  console.log('💾 BACKUP RECOMMENDATIONS');
  console.log('='.repeat(60));

  console.log('\n✅ Already Backed Up:');
  console.log('   • Products (373)');
  console.log('   • Categories (30)');
  console.log('   • Product Variants (7)');

  if (summary.not_backed_up.length > 0) {
    console.log('\n⚠️  Should Consider Backing Up:');
    summary.not_backed_up.forEach(({ table, count }) => {
      const recommendations = {
        'orders': '🛒 Customer orders - IMPORTANT!',
        'order_items': '📦 Order details - IMPORTANT!',
        'user_profiles': '👤 Customer profiles - IMPORTANT!',
        'reviews': '⭐ Product reviews - Nice to have',
        'wishlist_items': '❤️  Customer wishlists - Nice to have',
        'addresses': '📍 Customer addresses - IMPORTANT if you have orders',
        'cart_items': '🛒 Active shopping carts - Can lose this'
      };
      console.log(`   • ${table} (${count}): ${recommendations[table] || ''}`);
    });
  }

  console.log('\n');
}

checkAllData();