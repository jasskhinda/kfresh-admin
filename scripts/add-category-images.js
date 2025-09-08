// Add category images to the database
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// High-quality, food-focused category images from reliable CDN sources
const categoryImages = {
  'fresh-produce': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop&crop=center',
  'fresh-produced': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop&crop=center',
  'meat-poultry': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=400&fit=crop&crop=center',
  'pantry-essentials': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center',
  'cooked-meals': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center',
  'international-foods': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop&crop=center',
  'dairy-eggs': 'https://images.unsplash.com/photo-1563379091339-03246962d96a?w=400&h=400&fit=crop&crop=center',
  'test-category': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop&crop=center'
}

async function addCategoryImages() {
  try {
    console.log('🖼️  Adding category images...')
    
    // Get all categories
    const { data: categories, error: fetchError } = await supabase
      .from('categories')
      .select('id, name, slug, image_url')
    
    if (fetchError) {
      console.error('❌ Error fetching categories:', fetchError)
      return
    }
    
    console.log(`📁 Found ${categories.length} categories`)
    
    let updateCount = 0
    
    for (const category of categories) {
      const imageUrl = categoryImages[category.slug]
      
      if (imageUrl && !category.image_url) {
        console.log(`📸 Adding image to "${category.name}" (${category.slug})`)
        console.log(`   Image: ${imageUrl}`)
        
        const { error: updateError } = await supabase
          .from('categories')
          .update({ image_url: imageUrl })
          .eq('id', category.id)
        
        if (updateError) {
          console.error(`❌ Failed to update ${category.name}:`, updateError)
        } else {
          console.log(`✅ Updated ${category.name}`)
          updateCount++
        }
      } else if (category.image_url) {
        console.log(`⏭️  Skipping "${category.name}" - already has image`)
      } else {
        console.log(`⚠️  No image mapping for slug: ${category.slug}`)
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updateCount} categories with images`)
    
    // Verify the updates
    console.log('\n🔍 Verifying updates...')
    const { data: updatedCategories, error: verifyError } = await supabase
      .from('categories')
      .select('name, slug, image_url')
      .not('image_url', 'is', null)
    
    if (verifyError) {
      console.error('❌ Error verifying:', verifyError)
    } else {
      console.log(`✅ Verification: ${updatedCategories.length} categories now have images`)
      updatedCategories.forEach((cat, i) => {
        console.log(`   ${i+1}. ${cat.name} (${cat.slug})`)
        console.log(`      ${cat.image_url.substring(0, 60)}...`)
      })
    }
    
    console.log('\n🌟 Category images have been added!')
    console.log('💡 Visit the admin panel Categories page to see the images')
    console.log('🔗 Admin: https://kfresh-admin.vercel.app/categories')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

addCategoryImages()
