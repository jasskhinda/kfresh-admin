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

// COMPLETE PRODUCT CATALOG FROM ALL CLIENT DOCUMENTS
const allProducts = [
  // ===== COOKED MEALS / FRESH MEALS =====
  {
    name: "Curry Goat with Rice & Peas",
    description: "Traditional Caribbean curry goat served with seasoned rice and red kidney beans",
    price: 15.99,
    category_id: null,
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
    images: ["/food/rasta-pasta.jpg"],
    stock_quantity: 20,
    unit: "plate"
  },
  {
    name: "Jollof Rice with Light Soup",
    description: "West African spiced rice dish served with light soup",
    price: 11.99,
    category_id: null,
    is_cooked: true,
    is_featured: false,
    is_available: true,
    images: ["/food/jollof-rice.jpg"],
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
    images: ["/food/waakye.jpg"],
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
    images: ["/food/fresh-roti.jpg"],
    stock_quantity: 50,
    unit: "piece"
  },
  {
    name: "Gobe",
    description: "Traditional dish with beans, gari, fried ripe plantains & zomi oil",
    price: 9.99,
    category_id: null,
    is_cooked: true,
    is_featured: false,
    is_available: true,
    images: ["/food/gobe.jpg"],
    stock_quantity: 20,
    unit: "plate"
  },

  // ===== COOL RUNNING PRODUCTS =====
  // Baking
  {
    name: "Arm & Hammer Baking Powder",
    description: "Pure baking powder for all your baking needs (500g)",
    price: 2.50,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/baking-powder-500g.jpg"],
    stock_quantity: 40,
    unit: "pack"
  },
  {
    name: "Arm & Hammer Baking Soda",
    description: "Pure baking soda for baking and cleaning (500g)",
    price: 2.50,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/baking-soda-500g.jpg"],
    stock_quantity: 40,
    unit: "pack"
  },

  // Cool Running Drinks/Beverages
  {
    name: "Cool Running Fruit Punch Nectar",
    description: "Tropical fruit punch nectar (473ml)",
    price: 2.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/fruit-punch-nectar-473ml.jpg"],
    stock_quantity: 30,
    unit: "bottle"
  },
  {
    name: "Cool Running Mango Carrot Nectar",
    description: "Delicious mango carrot blend nectar (473ml)",
    price: 2.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/mango-carrot-nectar-473ml.jpg"],
    stock_quantity: 30,
    unit: "bottle"
  },
  {
    name: "Cool Running Mango Nectar",
    description: "Pure mango nectar (473ml)",
    price: 2.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/mango-nectar-473ml.jpg"],
    stock_quantity: 30,
    unit: "bottle"
  },
  {
    name: "Cool Running Pineapple Ginger Nectar",
    description: "Refreshing pineapple ginger nectar (473ml)",
    price: 2.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/pineapple-ginger-nectar-473ml.jpg"],
    stock_quantity: 30,
    unit: "bottle"
  },
  {
    name: "Cool Running Soursop Nectar",
    description: "Exotic soursop nectar (463ml)",
    price: 2.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/soursop-nectar-463ml.jpg"],
    stock_quantity: 30,
    unit: "bottle"
  },
  {
    name: "Cool Running Mango Juice",
    description: "Pure mango juice (500ml)",
    price: 2.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/mango-juice-500ml.jpg"],
    stock_quantity: 30,
    unit: "bottle"
  },
  {
    name: "Cool Running Peach Juice",
    description: "Sweet peach juice (500ml)",
    price: 2.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/peach-juice-500ml.jpg"],
    stock_quantity: 30,
    unit: "bottle"
  },
  {
    name: "Cool Running Pink Guava Juice",
    description: "Tropical pink guava juice (500ml)",
    price: 2.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/pink-guava-juice-500ml.jpg"],
    stock_quantity: 30,
    unit: "bottle"
  },

  // Cool Running Spices & Seasonings
  {
    name: "Cool Running Almond Extract",
    description: "Pure almond flavour extract for baking (150ml)",
    price: 3.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/almond-extract-150ml.jpg"],
    stock_quantity: 25,
    unit: "bottle"
  },
  {
    name: "Cool Running Mixed Essence Extract",
    description: "Mixed essence flavour extract (150ml)",
    price: 3.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/mixed-essence-150ml.jpg"],
    stock_quantity: 25,
    unit: "bottle"
  },
  {
    name: "Cool Running Vanilla Extract",
    description: "Pure vanilla flavour extract (150ml)",
    price: 3.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/vanilla-extract-150ml.jpg"],
    stock_quantity: 25,
    unit: "bottle"
  },
  {
    name: "Cool Running Adobo Seasoning",
    description: "Adobo seasoning with garlic & pepper (300g)",
    price: 5.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/adobo-seasoning-300g.jpg"],
    stock_quantity: 35,
    unit: "pack"
  },
  {
    name: "Cool Running Meat Tenderizer",
    description: "Meat tenderizer for tender meats (350g)",
    price: 5.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/meat-tenderizer-350g.jpg"],
    stock_quantity: 30,
    unit: "pack"
  },
  {
    name: "Cool Running Thyme Leaf",
    description: "Dried thyme leaf for seasoning (90g)",
    price: 4.50,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/thyme-leaf-90g.jpg"],
    stock_quantity: 40,
    unit: "pack"
  },
  {
    name: "Cool Running All Spice Whole",
    description: "Whole pimento (all spice) berries (50g)",
    price: 3.50,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/allspice-whole-50g.jpg"],
    stock_quantity: 35,
    unit: "pack"
  },
  {
    name: "Cool Running Madras Curry Powder",
    description: "Authentic Madras curry powder (340g)",
    price: 5.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/madras-curry-powder-340g.jpg"],
    stock_quantity: 30,
    unit: "pack"
  },

  // Cool Running Sauces
  {
    name: "Cool Running Golden Light Soy Sauce",
    description: "Premium golden light soy sauce (500ml)",
    price: 5.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/golden-light-soy-sauce-500ml.jpg"],
    stock_quantity: 25,
    unit: "bottle"
  },
  {
    name: "Cool Running Mushroom Soy Sauce",
    description: "Mushroom flavoured soy sauce (500ml)",
    price: 5.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/mushroom-soy-sauce-500ml.jpg"],
    stock_quantity: 25,
    unit: "bottle"
  },
  {
    name: "Cool Running Premium Dark Soy Sauce",
    description: "Premium dark soy sauce (500ml)",
    price: 5.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/premium-dark-soy-sauce-500ml.jpg"],
    stock_quantity: 25,
    unit: "bottle"
  },
  {
    name: "Cool Running Premium Oyster Sauce",
    description: "Premium oyster sauce (500ml)",
    price: 5.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/premium-oyster-sauce-500ml.jpg"],
    stock_quantity: 25,
    unit: "bottle"
  },
  {
    name: "Cool Running Barbecue Sauce",
    description: "Sweet and tangy barbecue sauce (300ml)",
    price: 5.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/barbecue-sauce-300ml.jpg"],
    stock_quantity: 30,
    unit: "bottle"
  },

  // Cool Running Teas - Complete Selection
  {
    name: "Cool Running Honey Ginger Tea",
    description: "Soothing honey ginger tea (20 tea bags)",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/honey-ginger-tea-20bags.jpg"],
    stock_quantity: 40,
    unit: "box"
  },
  {
    name: "Cool Running Honey Jasmine Tea",
    description: "Delicate honey jasmine tea (20 tea bags)",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/honey-jasmine-tea-20bags.jpg"],
    stock_quantity: 40,
    unit: "box"
  },
  {
    name: "Cool Running Turmeric Honey Ginger Tea",
    description: "Healing turmeric honey ginger tea (20 tea bags)",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/turmeric-honey-ginger-tea-20bags.jpg"],
    stock_quantity: 40,
    unit: "box"
  },
  {
    name: "Cool Running Balance Sugar Tea",
    description: "Herbal tea to help balance sugar levels (40g)",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/balance-sugar-tea-40g.jpg"],
    stock_quantity: 35,
    unit: "box"
  },
  {
    name: "Cool Running Care About Heart Tea",
    description: "Herbal tea for heart health (40g)",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/care-about-heart-tea-40g.jpg"],
    stock_quantity: 35,
    unit: "box"
  },
  {
    name: "Cool Running Everyday Detox Tea",
    description: "Daily detox herbal tea (34g)",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/everyday-detox-tea-34g.jpg"],
    stock_quantity: 35,
    unit: "box"
  },
  {
    name: "Cool Running Support Throat Tea",
    description: "Soothing throat support tea (40g)",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/support-throat-tea-40g.jpg"],
    stock_quantity: 35,
    unit: "box"
  },
  {
    name: "Cool Running Support Digestion Tea",
    description: "Digestive support herbal tea (40g)",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/support-digestion-tea-40g.jpg"],
    stock_quantity: 35,
    unit: "box"
  },
  {
    name: "Cool Running Earl Grey Tea",
    description: "Classic Earl Grey tea (30g)",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/earl-grey-tea-30g.jpg"],
    stock_quantity: 35,
    unit: "box"
  },
  {
    name: "Cool Running Green Tea with Matcha",
    description: "Premium green tea with matcha (30g)",
    price: 5.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/green-tea-matcha-30g.jpg"],
    stock_quantity: 30,
    unit: "box"
  },
  {
    name: "Cool Running Mint Tea",
    description: "Refreshing mint tea (40g)",
    price: 4.49,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/mint-tea-40g.jpg"],
    stock_quantity: 35,
    unit: "box"
  },
  {
    name: "Cool Running Rooibos Honey & Vanilla Tea",
    description: "South African rooibos with honey & vanilla (40g)",
    price: 4.49,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/rooibos-honey-vanilla-tea-40g.jpg"],
    stock_quantity: 35,
    unit: "box"
  },

  // ===== GRACE PRODUCTS =====
  // Frozen Foods
  {
    name: "Lafe Frozen Cassava 5lb",
    description: "Premium frozen cassava root (5lb)",
    price: 13.60,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/lafe-frozen-cassava-5lb.jpg"],
    stock_quantity: 20,
    unit: "pack"
  },
  {
    name: "Lafe Frozen Cassava 1lb",
    description: "Premium frozen cassava root (1lb)",
    price: 2.73,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/lafe-frozen-cassava-1lb.jpg"],
    stock_quantity: 40,
    unit: "pack"
  },
  {
    name: "Lafe Frozen Cassava Croquette",
    description: "Ready-to-cook cassava croquettes (908g)",
    price: 7.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/lafe-cassava-croquette-908g.jpg"],
    stock_quantity: 25,
    unit: "pack"
  },
  {
    name: "Grace Soursop Frozen Fruit Pulp",
    description: "Pure soursop fruit pulp (400g)",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-soursop-pulp-400g.jpg"],
    stock_quantity: 30,
    unit: "pack"
  },
  {
    name: "Grace Passion Fruit Frozen Pulp",
    description: "Pure passion fruit pulp (400g)",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-passion-fruit-pulp-400g.jpg"],
    stock_quantity: 30,
    unit: "pack"
  },

  // Grace Drinks/Beverages
  {
    name: "Ovaltine Malted Milk Drink White",
    description: "Classic white ovaltine malted milk (400g)",
    price: 7.49,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/ovaltine-white-400g.jpg"],
    stock_quantity: 30,
    unit: "jar"
  },
  {
    name: "Ovaltine Chocolate Brown",
    description: "Rich chocolate ovaltine (400g)",
    price: 7.49,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/ovaltine-chocolate-400g.jpg"],
    stock_quantity: 30,
    unit: "jar"
  },
  {
    name: "Ovaltine Original Classic",
    description: "Original classic ovaltine (400g)",
    price: 7.49,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/ovaltine-original-400g.jpg"],
    stock_quantity: 30,
    unit: "jar"
  },
  {
    name: "Grace Vita Malt Classic",
    description: "Non-alcoholic malt beverage (330ml)",
    price: 2.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-vita-malt-330ml.jpg"],
    stock_quantity: 40,
    unit: "bottle"
  },
  {
    name: "Grace Malta",
    description: "Caribbean malta drink (341ml)",
    price: 2.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-malta-341ml.jpg"],
    stock_quantity: 40,
    unit: "bottle"
  },
  {
    name: "Grace Mango Drink",
    description: "Refreshing mango flavored drink (355ml)",
    price: 1.49,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-mango-drink-355ml.jpg"],
    stock_quantity: 50,
    unit: "can"
  },
  {
    name: "Grace Cream Soda",
    description: "Classic cream soda (355ml)",
    price: 1.49,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-cream-soda-355ml.jpg"],
    stock_quantity: 50,
    unit: "can"
  },
  {
    name: "Grace Kola Champagne",
    description: "Caribbean kola champagne (355ml)",
    price: 1.49,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-kola-champagne-355ml.jpg"],
    stock_quantity: 50,
    unit: "can"
  },
  {
    name: "Grace Pineapple Drink",
    description: "Tropical pineapple drink (355ml)",
    price: 1.49,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-pineapple-drink-355ml.jpg"],
    stock_quantity: 50,
    unit: "can"
  },
  {
    name: "Grace Ginger Beer",
    description: "Spicy ginger beer (355ml)",
    price: 1.49,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-ginger-beer-355ml.jpg"],
    stock_quantity: 50,
    unit: "can"
  },

  // Grace Canned & Package Goods - Key Items
  {
    name: "Grace Ackees",
    description: "Premium canned ackees (540g)",
    price: 11.45,
    category_id: null,
    is_cooked: false,
    is_featured: true,
    is_available: true,
    images: ["/products/grace-ackees-540g.jpg"],
    stock_quantity: 25,
    unit: "can"
  },
  {
    name: "Grace Callaloo",
    description: "Caribbean callaloo (540g)",
    price: 3.75,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-callaloo-540g.jpg"],
    stock_quantity: 35,
    unit: "can"
  },
  {
    name: "Grace Red Kidney Beans",
    description: "Premium red kidney beans (540ml)",
    price: 2.50,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-red-kidney-beans-540ml.jpg"],
    stock_quantity: 45,
    unit: "can"
  },
  {
    name: "Grace Green Pigeon Peas",
    description: "Fresh green pigeon peas (425ml)",
    price: 2.50,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-green-pigeon-peas-425ml.jpg"],
    stock_quantity: 40,
    unit: "can"
  },
  {
    name: "Grace Coconut Milk",
    description: "Rich coconut milk for cooking (400ml)",
    price: 2.10,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-coconut-milk-400ml.jpg"],
    stock_quantity: 50,
    unit: "can"
  },
  {
    name: "Grace White Rice 2kg",
    description: "Premium white rice (2kg)",
    price: 5.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-white-rice-2kg.jpg"],
    stock_quantity: 30,
    unit: "bag"
  },
  {
    name: "Grace Parboiled Rice 2kg",
    description: "Parboiled rice (2kg)",
    price: 6.29,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-parboiled-rice-2kg.jpg"],
    stock_quantity: 30,
    unit: "bag"
  },

  // Grace Seasonings
  {
    name: "Grace Jerk Seasoning Mild",
    description: "Authentic Jamaican jerk seasoning - mild (284g)",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-jerk-seasoning-mild-284g.jpg"],
    stock_quantity: 35,
    unit: "jar"
  },
  {
    name: "Grace Jerk Seasoning Hot",
    description: "Authentic Jamaican jerk seasoning - hot (284g)",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-jerk-seasoning-hot-284g.jpg"],
    stock_quantity: 35,
    unit: "jar"
  },

  // Grace Hot Pepper Sauces
  {
    name: "Grace Scotch Bonnet Pepper Sauce 85ml",
    description: "Fiery scotch bonnet pepper sauce (85ml)",
    price: 2.75,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-scotch-bonnet-sauce-85ml.jpg"],
    stock_quantity: 40,
    unit: "bottle"
  },
  {
    name: "Grace Scotch Bonnet Pepper Sauce 142ml",
    description: "Fiery scotch bonnet pepper sauce (142ml)",
    price: 3.85,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/grace-scotch-bonnet-sauce-142ml.jpg"],
    stock_quantity: 35,
    unit: "bottle"
  },

  // ===== PATTY A FOODS =====
  // Fresh/Frozen Meats & Fish
  {
    name: "Fresh Whiting Fish",
    description: "Fresh whiting fish, straight from Ontario farms",
    price: 7.50,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/fresh-whiting-fish.jpg"],
    stock_quantity: 20,
    unit: "lb"
  },
  {
    name: "Fresh Tilapia Fish",
    description: "Fresh tilapia fish, antibiotic-free",
    price: 6.90,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/fresh-tilapia-fish.jpg"],
    stock_quantity: 25,
    unit: "lb"
  },
  {
    name: "Fresh Mackerel Fish",
    description: "Fresh mackerel fish, hormone-free",
    price: 7.00,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/fresh-mackerel-fish.jpg"],
    stock_quantity: 20,
    unit: "lb"
  },
  {
    name: "Fresh Croaker Fish (Headless)",
    description: "Fresh headless croaker fish",
    price: 8.00,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/fresh-croaker-fish-headless.jpg"],
    stock_quantity: 15,
    unit: "lb"
  },
  {
    name: "Fresh Catfish",
    description: "Fresh catfish, farm-raised without antibiotics",
    price: 7.41,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/fresh-catfish.jpg"],
    stock_quantity: 18,
    unit: "lb"
  },
  {
    name: "Fresh Soft Chicken Drumsticks",
    description: "Tender chicken drumsticks from Ontario farms",
    price: 8.00,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/soft-chicken-drumsticks.jpg"],
    stock_quantity: 30,
    unit: "kg"
  },
  {
    name: "Turkey Wings Cut",
    description: "Fresh cut turkey wings",
    price: 7.80,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/turkey-wings-cut.jpg"],
    stock_quantity: 25,
    unit: "kg"
  },
  {
    name: "Split Turkey Wings",
    description: "Fresh split turkey wings",
    price: 7.50,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/split-turkey-wings.jpg"],
    stock_quantity: 25,
    unit: "lb"
  },
  {
    name: "Smoked Turkey",
    description: "Premium smoked turkey",
    price: 8.25,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/smoked-turkey.jpg"],
    stock_quantity: 20,
    unit: "lb"
  },
  {
    name: "Fresh Goat Meat (with skin)",
    description: "Premium goat meat with skin, farm-fresh",
    price: 12.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/goat-meat-with-skin.jpg"],
    stock_quantity: 15,
    unit: "lb"
  },
  {
    name: "Fresh Goat Meat (without skin)",
    description: "Premium skinless goat meat, farm-fresh",
    price: 14.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/goat-meat-without-skin.jpg"],
    stock_quantity: 15,
    unit: "lb"
  },
  {
    name: "Fresh Oxtail",
    description: "Premium oxtail cuts for stewing",
    price: 16.99,
    category_id: null,
    is_cooked: false,
    is_featured: true,
    is_available: true,
    images: ["/products/fresh-oxtail.jpg"],
    stock_quantity: 12,
    unit: "lb"
  },

  // Frozen Vegetables
  {
    name: "Ugwu Leaves (Frozen)",
    description: "Frozen ugwu leaves for traditional cooking",
    price: 5.50,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/ugwu-leaves-frozen.jpg"],
    stock_quantity: 30,
    unit: "pack"
  },
  {
    name: "Jute Leaves (Ewedu) (Frozen)",
    description: "Frozen jute leaves for traditional soups",
    price: 3.70,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/jute-leaves-ewedu-frozen.jpg"],
    stock_quantity: 35,
    unit: "pack"
  },
  {
    name: "Water Leaves (Frozen)",
    description: "Frozen water leaves for traditional cooking",
    price: 5.50,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/water-leaves-frozen.jpg"],
    stock_quantity: 30,
    unit: "pack"
  },
  {
    name: "Bitter Leaves (Frozen)",
    description: "Frozen bitter leaves for traditional soups",
    price: 5.50,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/bitter-leaves-frozen.jpg"],
    stock_quantity: 30,
    unit: "pack"
  },
  {
    name: "Spinach (Frozen)",
    description: "Frozen spinach leaves",
    price: 3.65,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/spinach-frozen.jpg"],
    stock_quantity: 40,
    unit: "pack"
  },
  {
    name: "CASII Sliced Okro (Frozen)",
    description: "Pre-sliced frozen okra",
    price: 3.70,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/casii-sliced-okro.jpg"],
    stock_quantity: 35,
    unit: "pack"
  },
  {
    name: "CASII Chopped Okro (Frozen)",
    description: "Pre-chopped frozen okra",
    price: 3.70,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/casii-chopped-okro.jpg"],
    stock_quantity: 35,
    unit: "pack"
  },

  // Patty A Foods Packaged Goods
  {
    name: "Ijebu Garri",
    description: "Premium Ijebu garri (2lb)",
    price: 4.80,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/ijebu-garri-2lb.jpg"],
    stock_quantity: 40,
    unit: "pack"
  },
  {
    name: "Yellow Gari",
    description: "Traditional yellow gari (2lb)",
    price: 4.80,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/yellow-gari-2lb.jpg"],
    stock_quantity: 40,
    unit: "pack"
  },
  {
    name: "Peeled Beans",
    description: "Pre-peeled beans for cooking (1kg)",
    price: 9.25,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/peeled-beans-1kg.jpg"],
    stock_quantity: 30,
    unit: "pack"
  },
  {
    name: "Honey Beans (Black Eye Peas)",
    description: "Premium honey beans (1lb)",
    price: 4.00,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/honey-beans-1lb.jpg"],
    stock_quantity: 35,
    unit: "pack"
  },
  {
    name: "Ofada Rice",
    description: "Authentic Nigerian Ofada rice (1lb)",
    price: 4.00,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/ofada-rice-1lb.jpg"],
    stock_quantity: 30,
    unit: "pack"
  },
  {
    name: "Guyanese Pride Rice 20lbs",
    description: "Premium Guyanese rice (20lbs)",
    price: 24.00,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/guyanese-pride-rice-20lbs.jpg"],
    stock_quantity: 15,
    unit: "bag"
  },
  {
    name: "Shito 500ml",
    description: "Authentic Ghanaian shito sauce (500ml)",
    price: 15.00,
    category_id: null,
    is_cooked: false,
    is_featured: true,
    is_available: true,
    images: ["/products/shito-500ml.jpg"],
    stock_quantity: 25,
    unit: "bottle"
  },
  {
    name: "Shito 250ml",
    description: "Authentic Ghanaian shito sauce (250ml)",
    price: 11.00,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/shito-250ml.jpg"],
    stock_quantity: 35,
    unit: "bottle"
  },
  {
    name: "Indomie Chicken (Box)",
    description: "Box of chicken flavored instant noodles",
    price: 22.50,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/indomie-chicken-box.jpg"],
    stock_quantity: 20,
    unit: "box"
  },
  {
    name: "Indomie Chicken (Single Pack)",
    description: "Single pack chicken flavored instant noodles",
    price: 0.95,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/indomie-chicken-pack.jpg"],
    stock_quantity: 100,
    unit: "pack"
  },

  // Fresh Produce from Patty A
  {
    name: "Fresh Ginger Root",
    description: "Premium fresh ginger root",
    price: 3.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/fresh-ginger-root.jpg"],
    stock_quantity: 50,
    unit: "lb"
  },
  {
    name: "Ghana Yam",
    description: "Authentic Ghana yam, premium quality",
    price: 3.25,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/ghana-yam.jpg"],
    stock_quantity: 30,
    unit: "lb"
  },
  {
    name: "Green Plantain",
    description: "Fresh green cooking plantains",
    price: 1.25,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/green-plantain.jpg"],
    stock_quantity: 60,
    unit: "lb"
  },
  {
    name: "Ripe Plantain",
    description: "Sweet ripe plantains, ready to eat",
    price: 1.20,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/ripe-plantain.jpg"],
    stock_quantity: 60,
    unit: "lb"
  },

  // ===== IRIE PRODUCTS - EXTENSIVE SPICE SELECTION =====
  {
    name: "Irie All Purpose Seasoning 60g",
    description: "Versatile all-purpose seasoning blend (60g)",
    price: 3.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/irie-all-purpose-seasoning-60g.jpg"],
    stock_quantity: 40,
    unit: "pack"
  },
  {
    name: "Irie All Purpose Seasoning 256g",
    description: "Large all-natural seasoning blend (256g)",
    price: 8.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/irie-all-purpose-seasoning-256g.jpg"],
    stock_quantity: 25,
    unit: "pack"
  },
  {
    name: "Irie Jerk Seasoning Powder 40g",
    description: "Authentic Caribbean jerk seasoning (40g)",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: true,
    is_available: true,
    images: ["/products/irie-jerk-seasoning-40g.jpg"],
    stock_quantity: 35,
    unit: "pack"
  },
  {
    name: "Irie Jerk Seasoning Powder 300g",
    description: "Large authentic jerk seasoning (300g)",
    price: 12.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/irie-jerk-seasoning-300g.jpg"],
    stock_quantity: 20,
    unit: "pack"
  },
  {
    name: "Irie Curry Powder 60g",
    description: "Traditional Caribbean curry powder (60g)",
    price: 4.49,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/irie-curry-powder-60g.jpg"],
    stock_quantity: 35,
    unit: "pack"
  },
  {
    name: "Irie Curry Powder 200g",
    description: "Large traditional curry powder (200g)",
    price: 9.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/irie-curry-powder-200g.jpg"],
    stock_quantity: 25,
    unit: "pack"
  },
  {
    name: "Irie Goat Curry Powder 50g",
    description: "Specialized goat curry seasoning (50g)",
    price: 5.49,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/irie-goat-curry-powder-50g.jpg"],
    stock_quantity: 30,
    unit: "pack"
  },
  {
    name: "Irie Oxtail Seasoning 60g",
    description: "Perfect seasoning for oxtail (60g)",
    price: 5.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/irie-oxtail-seasoning-60g.jpg"],
    stock_quantity: 30,
    unit: "pack"
  },
  {
    name: "Irie Fish Seasoning 60g",
    description: "Specialized fish seasoning blend (60g)",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/irie-fish-seasoning-60g.jpg"],
    stock_quantity: 35,
    unit: "pack"
  },
  {
    name: "Irie Seafood Seasoning 50g",
    description: "Premium seafood seasoning (50g)",
    price: 5.49,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/irie-seafood-seasoning-50g.jpg"],
    stock_quantity: 35,
    unit: "pack"
  },

  // Irie Sauces & Marinades
  {
    name: "Irie Ultimate BBQ Sauce",
    description: "Premium Caribbean BBQ sauce (16oz)",
    price: 7.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/irie-ultimate-bbq-sauce-16oz.jpg"],
    stock_quantity: 30,
    unit: "bottle"
  },
  {
    name: "Irie Tamarind & Honey Marinade",
    description: "Sweet and tangy marinade (350ml)",
    price: 6.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/irie-tamarind-honey-marinade-350ml.jpg"],
    stock_quantity: 25,
    unit: "bottle"
  },
  {
    name: "Irie Oxtail Gravy",
    description: "Rich oxtail gravy sauce (454ml)",
    price: 8.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/irie-oxtail-gravy-454ml.jpg"],
    stock_quantity: 25,
    unit: "bottle"
  },

  // Irie Baking Products
  {
    name: "Irie Burnt Sugar",
    description: "Traditional burnt sugar for coloring (12oz)",
    price: 5.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/irie-burnt-sugar-12oz.jpg"],
    stock_quantity: 30,
    unit: "bottle"
  },
  {
    name: "Irie Raw Sugar",
    description: "Unrefined raw cane sugar (1kg)",
    price: 6.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/irie-raw-sugar-1kg.jpg"],
    stock_quantity: 25,
    unit: "pack"
  },

  // ===== RICK'S PRODUCTS =====
  {
    name: "Rick's Curry Powder",
    description: "Rick's signature curry powder (112g)",
    price: 5.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/ricks-curry-powder-112g.jpg"],
    stock_quantity: 30,
    unit: "pack"
  },
  {
    name: "Rick's Green Seasoning",
    description: "Fresh green seasoning blend (350ml)",
    price: 7.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/ricks-green-seasoning-350ml.jpg"],
    stock_quantity: 25,
    unit: "bottle"
  },

  // ===== GEETA SPICES =====
  {
    name: "Geeta Garam Masala Roasted",
    description: "Authentic roasted garam masala (50g)",
    price: 4.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/geeta-garam-masala-50g.jpg"],
    stock_quantity: 35,
    unit: "pack"
  },
  {
    name: "Geeta Green Cardamom Whole",
    description: "Premium green cardamom pods (15g)",
    price: 6.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/geeta-green-cardamom-15g.jpg"],
    stock_quantity: 30,
    unit: "pack"
  },
  {
    name: "Geeta Cumin Whole",
    description: "Whole cumin seeds (50g)",
    price: 3.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/geeta-cumin-whole-50g.jpg"],
    stock_quantity: 35,
    unit: "pack"
  },
  {
    name: "Geeta Goat & Duck Curry",
    description: "Specialized curry for goat & duck (340g)",
    price: 9.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/geeta-goat-duck-curry-340g.jpg"],
    stock_quantity: 20,
    unit: "pack"
  },
  {
    name: "Geeta Chadon Beni Seasoning 350ml",
    description: "Traditional chadon beni seasoning (350ml)",
    price: 7.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/geeta-chadon-beni-350ml.jpg"],
    stock_quantity: 25,
    unit: "bottle"
  },

  // ===== ADDITIONAL PALM OILS & SPECIALTY ITEMS =====
  {
    name: "Palm Oil - Regular 500ml",
    description: "Pure African palm oil for cooking",
    price: 6.99,
    category_id: null,
    is_cooked: false,
    is_featured: false,
    is_available: true,
    images: ["/products/palm-oil-regular-500ml.jpg"],
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
    images: ["/products/palm-oil-regular-1l.jpg"],
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
    images: ["/products/palm-oil-regular-2l.jpg"],
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
    images: ["/products/palm-oil-zomi-500ml.jpg"],
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
    images: ["/products/palm-oil-zomi-1l.jpg"],
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
    images: ["/products/palm-kernel-oil-1l.jpg"],
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
    images: ["/products/peanut-butter-398g.jpg"],
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
    images: ["/products/gino-tomato-paste.jpg"],
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
    images: ["/products/derica-tomato-paste.jpg"],
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
    images: ["/products/maggi-chicken-600g.jpg"],
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
    images: ["/products/maggi-crayfish-600g.jpg"],
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
    images: ["/products/knorr-chicken-400g.jpg"],
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
    images: ["/products/onga-classic.jpg"],
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
    images: ["/products/okro-powder-50g.jpg"],
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
    images: ["/products/akuas-koose-mix-356g.jpg"],
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
    images: ["/products/kivo-gari-mix-125g.jpg"],
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
    images: ["/products/kanwu-salt-104g.jpg"],
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
    images: ["/products/waakye-leaves.jpg"],
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
    images: ["/products/prekese.jpg"],
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
    images: ["/products/wooden-stick-eta.jpg"],
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
    images: ["/products/earthern-ware.jpg"],
    stock_quantity: 15,
    unit: "piece"
  }
]

async function importAllProducts() {
  try {
    console.log(`Starting complete product import... ${allProducts.length} products`)
    
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
    const productsWithCategories = allProducts.map(product => {
      let categoryId = null
      
      if (product.is_cooked) {
        // Find cooked meals category
        categoryId = categoryMap['cooked-meals'] || categories?.[0]?.id
      } else if (product.name.toLowerCase().includes('oil')) {
        categoryId = categoryMap['pantry-essentials'] || categories?.[0]?.id
      } else if (product.name.toLowerCase().includes('maggi') || 
                 product.name.toLowerCase().includes('knorr') || 
                 product.name.toLowerCase().includes('onga') ||
                 product.name.toLowerCase().includes('seasoning') ||
                 product.name.toLowerCase().includes('curry') ||
                 product.name.toLowerCase().includes('jerk') ||
                 product.name.toLowerCase().includes('spice')) {
        categoryId = categoryMap['pantry-essentials'] || categories?.[0]?.id
      } else if (product.name.toLowerCase().includes('fish') || 
                 product.name.toLowerCase().includes('meat') ||
                 product.name.toLowerCase().includes('chicken') ||
                 product.name.toLowerCase().includes('turkey') ||
                 product.name.toLowerCase().includes('goat') ||
                 product.name.toLowerCase().includes('oxtail')) {
        categoryId = categoryMap['meat-poultry'] || categories?.[0]?.id
      } else if (product.name.toLowerCase().includes('leaves') ||
                 product.name.toLowerCase().includes('plantain') ||
                 product.name.toLowerCase().includes('yam') ||
                 product.name.toLowerCase().includes('ginger')) {
        categoryId = categoryMap['fresh-produced'] || categories?.[0]?.id
      } else if (product.name.toLowerCase().includes('drink') ||
                 product.name.toLowerCase().includes('juice') ||
                 product.name.toLowerCase().includes('nectar') ||
                 product.name.toLowerCase().includes('tea') ||
                 product.name.toLowerCase().includes('malt')) {
        categoryId = categoryMap['pantry-essentials'] || categories?.[0]?.id
      } else {
        categoryId = categoryMap['international-foods'] || categoryMap['pantry-essentials'] || categories?.[0]?.id
      }
      
      return {
        ...product,
        slug: generateSlug(product.name), // Generate slug from name
        category_id: categoryId
      }
    })
    
    // Clear existing products first (optional - remove if you want to keep existing)
    console.log('Clearing existing products...')
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    // Insert products in batches
    const batchSize = 20
    let totalInserted = 0
    
    for (let i = 0; i < productsWithCategories.length; i += batchSize) {
      const batch = productsWithCategories.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('products')
        .insert(batch)
        .select()
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
        console.error('Failed products in batch:', batch.map(p => p.name))
      } else {
        totalInserted += data?.length || 0
        console.log(`✅ Successfully inserted batch ${Math.floor(i / batchSize) + 1}: ${data?.length} products`)
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log(`\n🎉 COMPLETE IMPORT FINISHED!`)
    console.log(`📊 Total products imported: ${totalInserted}`)
    
    // Get final count
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📈 Total products in database: ${count}`)
    
    // Get count by category
    const { data: categoryStats } = await supabase
      .from('products')
      .select('category_id, categories(name)')
      .not('category_id', 'is', null)
    
    console.log('\n📋 Products by category:')
    const stats: Record<string, number> = {}
    categoryStats?.forEach(product => {
      const categoryName = (product.categories as any)?.name || 'Uncategorized'
      stats[categoryName] = (stats[categoryName] || 0) + 1
    })
    
    Object.entries(stats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`)
    })
    
  } catch (error) {
    console.error('Import failed:', error)
  }
}

// Run the complete import
importAllProducts()