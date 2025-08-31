// Test database connection and data
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testConnection() {
  console.log('🔍 Testing database connection...')
  
  try {
    // Test basic connection
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(5)
    
    console.log('📂 Categories:', categories?.length || 0, 'found')
    if (catError) console.error('Categories error:', catError)
    
    // Test products
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .limit(5)
    
    console.log('📦 Products:', products?.length || 0, 'found')
    if (prodError) console.error('Products error:', prodError)
    
    // Test orders
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .limit(5)
    
    console.log('🛍️  Orders:', orders?.length || 0, 'found')
    if (orderError) console.error('Orders error:', orderError)
    
    // Test admin profiles
    const { data: profiles, error: profileError } = await supabase
      .from('admin_profiles')
      .select('*')
      .limit(5)
    
    console.log('👤 Admin profiles:', profiles?.length || 0, 'found')
    if (profileError) console.error('Admin profiles error:', profileError)
    
    console.log('✅ Database connection test complete')
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
  }
}

testConnection()
