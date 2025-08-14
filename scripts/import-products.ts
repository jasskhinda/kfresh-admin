import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Sample product data structure based on the files you have
const products = [
  // COOKED MEALS / FRESH MEALS
  {
    name: "Curry Goat with Rice & Peas",
    description: "Traditional Caribbean curry goat served with seasoned rice and red kidney beans",
    price: 15.99,
    category_id: null, // Will need to get from categories table
    is_cooked: true,
    is_featured: true,
    is_available: true,
    images: ["/food/curry-goat-rice-peas.jpg"],
    stock_quantity: 20,
    unit: "plate"
  },
  {
    name: "Jerk Chicken",
    description: "Authentic Jamaican jerk chicken with traditional spices",
    price: 12.99,
    category_id: null,
    is_cooked: true,
    is_featured: true,
    is_available: true,
    images: ["/food/jerk-chicken.jpg"],
    stock_quantity: 25,
    unit: "plate"
  },
  {
    name: "Oxtail with Rice & Peas",
    description: "Tender braised oxtail with rice and peas",
    price: 18.99,
    category_id: null,
    is_cooked: true,
    is_featured: true,
    is_available: true,
    images: ["/food/oxtail-rice-peas.jpg"],
    stock_quantity: 15,
    unit: "plate"
  },
  {
    name: "Rasta Pasta",
    description: "Creamy pasta with jerk seasoning and colorful bell peppers",
    price: 13.99,
    category_id: null,
    is_cooked: true,
    is_featured: false,
    is_available: true,
    images: [ "/food/rasta-pasta.jpg"],
    stock_quantity: 20,
    unit: "plate"
  },
  {
    name: "Jollof Rice",
    description: "West African spiced rice dish",
    price: 11.99,
    category_id: null,
    is_cooked: true,
    is_featured: false,
    is_available: true,
    images: [ "/food/jollof-rice.jpg"],
    stock_quantity: 25,
    unit: "plate"
  },
  {
    name: "Waakye",
    description: "Ghanaian rice and beans dish with accompaniments",
    price: 10.99,
    category_id: null,
    is_cooked: true,
    is_featured: false,
    is_available: true,
    images: [ "/food/waakye.jpg"],
    stock_quantity: 20,
    unit: "plate"
  },
  {
    name: "Fresh Roti",
    description: "Freshly made Caribbean flatbread",
    price: 2.99,
    category_id: null,
    is_cooked: true,
    is_featured: false,
    is_available: true,
    images: [ "/food/fresh-roti.jpg"],
    stock_quantity: 50,
    unit: "piece"
  },
  {
    name: "Gobe",
    description: "Beans, Gari, Fried Ripe Plantains & Zomi Oil",
    price: 9.99,
    category_id: null,
    is_cooked: true,
    is_featured: false,
    is_available: true,
    images: [ "/food/gobe.jpg"],
    stock_quantity: 20,
    unit: "plate"
  },

  // PALM OILS & OTHER ITEMS
  {
    name: "Palm Oil - Regular 500ml",
    description: "Pure African palm oil for cooking",
    price: 6.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/palm-oil-regular-500ml.jpg"],
    stock_quantity: 50,
    unit: "bottle"
  },
  {
    name: "Palm Oil - Regular 1L",
    description: "Pure African palm oil for cooking",
    price: 11.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/palm-oil-regular-1l.jpg"],
    stock_quantity: 40,
    unit: "bottle"
  },
  {
    name: "Palm Oil - Regular 2L",
    description: "Pure African palm oil for cooking",
    price: 19.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/palm-oil-regular-2l.jpg"],
    stock_quantity: 30,
    unit: "bottle"
  },
  {
    name: "Palm Oil - Zomi 500ml",
    description: "Premium Zomi brand palm oil",
    price: 7.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/palm-oil-zomi-500ml.jpg"],
    stock_quantity: 35,
    unit: "bottle"
  },
  {
    name: "Palm Oil - Zomi 1L",
    description: "Premium Zomi brand palm oil",
    price: 13.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/palm-oil-zomi-1l.jpg"],
    stock_quantity: 30,
    unit: "bottle"
  },
  {
    name: "Palm Kernel Oil 1L",
    description: "Pure palm kernel oil",
    price: 14.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/palm-kernel-oil-1l.jpg"],
    stock_quantity: 25,
    unit: "bottle"
  },
  {
    name: "Peanut Butter 398g",
    description: "Creamy African peanut butter",
    price: 5.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/peanut-butter-398g.jpg"],
    stock_quantity: 40,
    unit: "jar"
  },
  {
    name: "Gino Tomato Paste",
    description: "Rich concentrated tomato paste",
    price: 3.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/gino-tomato-paste.jpg"],
    stock_quantity: 60,
    unit: "tin"
  },
  {
    name: "Derica Tomato Paste",
    description: "Premium quality tomato paste",
    price: 3.49,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/derica-tomato-paste.jpg"],
    stock_quantity: 55,
    unit: "tin"
  },
  {
    name: "Maggi Chicken Flavour 600g",
    description: "Seasoning cubes with chicken flavor",
    price: 8.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/maggi-chicken-600g.jpg"],
    stock_quantity: 45,
    unit: "pack"
  },
  {
    name: "Maggi Crayfish Flavour 600g",
    description: "Seasoning cubes with crayfish flavor",
    price: 9.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/maggi-crayfish-600g.jpg"],
    stock_quantity: 40,
    unit: "pack"
  },
  {
    name: "Knorr Chicken Seasoning 400g",
    description: "Chicken flavored seasoning powder",
    price: 7.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/knorr-chicken-400g.jpg"],
    stock_quantity: 50,
    unit: "pack"
  },
  {
    name: "Onga Classic Seasoning",
    description: "All-purpose seasoning mix",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/onga-classic.jpg"],
    stock_quantity: 60,
    unit: "pack"
  },
  {
    name: "Okro Powder 50g",
    description: "Ground okra for soups and stews",
    price: 3.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/okro-powder-50g.jpg"],
    stock_quantity: 35,
    unit: "pack"
  },
  {
    name: "Akua's Special Koose Mix 356g",
    description: "Ready mix for making koose (bean cakes)",
    price: 6.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/akuas-koose-mix-356g.jpg"],
    stock_quantity: 30,
    unit: "pack"
  },
  {
    name: "Kivo 4 in 1 Gari Mix 125g",
    description: "Crispy Gari with sugar, milk and roasted peanuts",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/kivo-gari-mix-125g.jpg"],
    stock_quantity: 45,
    unit: "pack"
  },
  {
    name: "Kanwu - Adam Salt 104g",
    description: "Traditional cooking salt",
    price: 2.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/kanwu-salt-104g.jpg"],
    stock_quantity: 50,
    unit: "pack"
  },
  {
    name: "Waakye Leaves",
    description: "Dried leaves for cooking waakye",
    price: 3.49,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/waakye-leaves.jpg"],
    stock_quantity: 40,
    unit: "pack"
  },
  {
    name: "Prekese",
    description: "Aromatic spice for soups and teas",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/prekese.jpg"],
    stock_quantity: 35,
    unit: "pack"
  },
  {
    name: "Wooden Stick - Eta",
    description: "Traditional wooden cooking utensil",
    price: 7.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/wooden-stick-eta.jpg"],
    stock_quantity: 20,
    unit: "piece"
  },
  {
    name: "Earthern Ware - Apotowewa",
    description: "Traditional clay cooking pot",
    price: 24.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: [ "/products/earthern-ware.jpg"],
    stock_quantity: 15,
    unit: "piece"
  }
]

async function importProducts() {
  try {
    console.log('Starting product import...')
    
    // First, get the categories to map products correctly
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
    
    if (catError) {
      console.error('Error fetching categories:', catError)
      return
    }
    
    console.log('Found categories:', categories)
    
    // Map category names to IDs
    const categoryMap: Record<string, string> = {}
    categories?.forEach(cat => {
      categoryMap[cat.slug] = cat.id
    })
    
    // Assign category IDs and slugs to products based on their type
    const productsWithCategories = products.map(product => {
      let categoryId = null
      
      if (product.is_cooked) {
        // Find cooked meals category
        categoryId = categoryMap['cooked-meals'] || categoryMap['fresh-produce'] || categories?.[0]?.id
      } else if (product.name.toLowerCase().includes('oil')) {
        categoryId = categoryMap['cooking-oils'] || categoryMap['pantry-essentials'] || categories?.[0]?.id
      } else if (product.name.toLowerCase().includes('maggi') || 
                 product.name.toLowerCase().includes('knorr') || 
                 product.name.toLowerCase().includes('onga') ||
                 product.name.toLowerCase().includes('seasoning')) {
        categoryId = categoryMap['spices-seasonings'] || categoryMap['pantry-essentials'] || categories?.[0]?.id
      } else {
        categoryId = categoryMap['pantry-essentials'] || categories?.[0]?.id
      }
      
      return {
        ...product,
        slug: generateSlug(product.name), // Generate slug from name
        category_id: categoryId
      }
    })
    
    // Insert products in batches
    const batchSize = 10
    for (let i = 0; i < productsWithCategories.length; i += batchSize) {
      const batch = productsWithCategories.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('products')
        .insert(batch)
        .select()
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
      } else {
        console.log(`Successfully inserted batch ${i / batchSize + 1}:`, data?.length, 'products')
      }
    }
    
    console.log('Product import complete!')
    
    // Get final count
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    console.log(`Total products in database: ${count}`)
    
  } catch (error) {
    console.error('Import failed:', error)
  }
}

// Run the import
importProducts()