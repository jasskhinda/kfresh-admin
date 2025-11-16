const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Category IDs
const SPICES_CATEGORY_ID = 'd9fe0ea0-f88d-4dfe-88bb-c899f3d3fb17' // SPICES, HERBS & SEASONINGS
const SAUCES_CATEGORY_ID = '9fb8a19c-0a61-40dc-9f09-cf7b2e40c3dd' // Sauces & Condiments (will fetch)
const BAKING_CATEGORY_ID = 'beb30668-d9ad-4bd3-a26b-cc96ae4e7f96' // BAKING PRODUCTS (will fetch)
const SOUPS_CATEGORY_ID = '0a8c29f0-dff3-4f7c-bfc5-a90b02eb3d0e' // SOUPS (will fetch)

async function getCategories() {
  console.log('📁 Fetching category IDs...\n')

  const { data: sauces } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'sauces-condiments')
    .single()

  const { data: baking } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', '%baking%')
    .limit(1)
    .single()

  const { data: soups } = await supabase
    .from('categories')
    .select('id')
    .ilike('slug', '%soup%')
    .limit(1)
    .single()

  return {
    spices: SPICES_CATEGORY_ID,
    sauces: sauces?.id || SPICES_CATEGORY_ID,
    baking: baking?.id || SPICES_CATEGORY_ID,
    soups: soups?.id || SPICES_CATEGORY_ID
  }
}

async function checkExisting(productName) {
  const { data } = await supabase
    .from('products')
    .select('id')
    .ilike('name', productName)
    .single()

  return !!data
}

async function uploadIrieProducts() {
  console.log('🌿 Starting IRIE Products Upload...\n')

  const categories = await getCategories()
  console.log('Categories:', categories, '\n')

  // SPICES, HERBS & SEASONINGS
  const spicesProducts = [
    { name: 'Irie All Purpose Seasoning (60g)', weight: 60, unit: 'g', brand: 'Irie', description: 'Versatile all-purpose seasoning blend perfect for meats, vegetables, and rice dishes.' },
    { name: 'Irie All Purpose Seasoning All Natural (256g)', weight: 256, unit: 'g', brand: 'Irie', description: 'All-natural versatile seasoning blend with no artificial ingredients.' },
    { name: 'Irie All Purpose Seasoning No MSG (60g)', weight: 60, unit: 'g', brand: 'Irie', description: 'MSG-free all-purpose seasoning for health-conscious cooking.' },
    { name: 'Irie All Natural Vegetable Seasoning (60g)', weight: 60, unit: 'g', brand: 'Irie', description: 'Natural seasoning blend specifically designed for vegetables.' },
    { name: 'Irie All Natural Vegetable Seasoning (275g)', weight: 275, unit: 'g', brand: 'Irie', description: 'Large size natural vegetable seasoning for frequent use.' },
    { name: 'Irie All Natural Spices & Herbs Seasoning (256g)', weight: 256, unit: 'g', brand: 'Irie', description: 'Blend of natural spices and herbs for authentic Caribbean flavor.' },
    { name: 'Irie All Purpose Soul Seasoning All Natural (40g)', weight: 40, unit: 'g', brand: 'Irie', description: 'All-natural soul seasoning for traditional comfort food dishes.' },
    { name: 'Irie All Spice Ground (30g)', weight: 30, unit: 'g', brand: 'Irie', description: 'Ground allspice with warm, aromatic flavor for Caribbean and baking recipes.' },
    { name: 'Irie All Spice Whole (30g)', weight: 30, unit: 'g', brand: 'Irie', description: 'Whole allspice berries for maximum freshness and flavor.' },
    { name: 'Irie All Spice Whole (165g)', weight: 165, unit: 'g', brand: 'Irie', description: 'Large size whole allspice berries.' },
    { name: 'Irie Anatto Seed (40g)', weight: 40, unit: 'g', brand: 'Irie', description: 'Anatto seeds for natural red-orange color and earthy flavor.' },
    { name: 'Irie Aniseed Whole (40g)', weight: 40, unit: 'g', brand: 'Irie', description: 'Whole anise seeds with sweet licorice-like flavor.' },
    { name: 'Irie BBQ Spice (70g)', weight: 70, unit: 'g', brand: 'Irie', description: 'BBQ seasoning blend for grilled meats and vegetables.' },
    { name: 'Irie BBQ Spice (350g)', weight: 350, unit: 'g', brand: 'Irie', description: 'Large size BBQ spice blend for frequent grilling.' },
    { name: 'Irie Basil Leave (12g)', weight: 12, unit: 'g', brand: 'Irie', description: 'Dried basil leaves for Italian and Mediterranean dishes.' },
    { name: 'Irie Bay Leave (12g)', weight: 12, unit: 'g', brand: 'Irie', description: 'Aromatic bay leaves essential for soups and stews.' },
    { name: 'Betapac Curry Powder (110g)', weight: 110, unit: 'g', brand: 'Betapac', description: 'Caribbean-style curry powder blend.' },
    { name: 'Betapac Curry Powder (450g)', weight: 450, unit: 'g', brand: 'Betapac', description: 'Large size Caribbean curry powder for family cooking.' },
    { name: 'Irie Black Pepper Ground (30g)', weight: 30, unit: 'g', brand: 'Irie', description: 'Freshly ground black pepper for everyday seasoning.' },
    { name: 'Irie Black Pepper Ground (227g)', weight: 227, unit: 'g', brand: 'Irie', description: 'Large size ground black pepper.' },
    { name: 'Irie Black Pepper Whole (30g)', weight: 30, unit: 'g', brand: 'Irie', description: 'Whole black peppercorns for grinding fresh.' },
    { name: 'Irie Buffalo Chicken Seasoning (60g)', weight: 60, unit: 'g', brand: 'Irie', description: 'Spicy buffalo-style seasoning for chicken wings and more.' },
    { name: 'Irie Caribbean Spice (60g)', weight: 60, unit: 'g', brand: 'Irie', description: 'Authentic Caribbean spice blend for traditional island cooking.' },
    { name: 'Irie Chicken Seasoning (70g)', weight: 70, unit: 'g', brand: 'Irie', description: 'Special blend for perfectly seasoned chicken dishes.' },
    { name: 'Irie Chicken Seasoning (284g)', weight: 284, unit: 'g', brand: 'Irie', description: 'Large size chicken seasoning for family meals.' },
    { name: 'Irie Chicken Wing Rub (70g)', weight: 70, unit: 'g', brand: 'Irie', description: 'Dry rub specifically for crispy, flavorful chicken wings.' },
    { name: 'Chief Duck & Goat Curry Powder (500g)', weight: 500, unit: 'g', brand: 'Chief', description: 'Traditional curry powder for duck and goat dishes.' },
    { name: 'Chief Duck & Goat Curry Powder (85g)', weight: 85, unit: 'g', brand: 'Chief', description: 'Small size duck and goat curry powder.' },
    { name: 'Irie Chinese Five Spice (50g)', weight: 50, unit: 'g', brand: 'Irie', description: 'Classic five-spice blend for Asian-inspired dishes.' },
    { name: 'Irie Cinnamon Sticks (30g)', weight: 30, unit: 'g', brand: 'Irie', description: 'Whole cinnamon sticks for teas, desserts, and savory dishes.' },
    { name: 'Irie Cinnamon Ground (30g)', weight: 30, unit: 'g', brand: 'Irie', description: 'Ground cinnamon for baking and cooking.' },
    { name: 'Irie Chow Mein Spice (50g)', weight: 50, unit: 'g', brand: 'Irie', description: 'Seasoning blend for authentic chow mein noodles.' },
    { name: 'Irie Clove Whole (21g)', weight: 21, unit: 'g', brand: 'Irie', description: 'Whole cloves for intense aromatic flavor.' },
    { name: 'Irie Clove Ground (21g)', weight: 21, unit: 'g', brand: 'Irie', description: 'Ground cloves for baking and cooking.' },
    { name: 'Irie Coriander Ground (60g)', weight: 60, unit: 'g', brand: 'Irie', description: 'Ground coriander with citrusy, nutty flavor.' },
    { name: 'Irie Creole Seasoning (340g)', weight: 340, unit: 'g', brand: 'Irie', description: 'Bold Creole seasoning for Louisiana-style cooking.' },
    { name: 'Irie Crushed Chilli (40g)', weight: 40, unit: 'g', brand: 'Irie', description: 'Crushed red chili flakes for heat.' },
    { name: 'Irie Crushed Chilli (150g)', weight: 150, unit: 'g', brand: 'Irie', description: 'Large size crushed chili flakes.' },
    { name: 'Irie Cummin Ground (40g)', weight: 40, unit: 'g', brand: 'Irie', description: 'Ground cumin with warm, earthy flavor.' },
    { name: 'Irie Cummin Whole (40g)', weight: 40, unit: 'g', brand: 'Irie', description: 'Whole cumin seeds for toasting and grinding.' },
    { name: 'Irie Curry Powder (60g)', weight: 60, unit: 'g', brand: 'Irie', description: 'Caribbean-style curry powder blend.' },
    { name: 'Irie Curry Powder (200g)', weight: 200, unit: 'g', brand: 'Irie', description: 'Large size curry powder for frequent use.' },
    { name: 'Irie Fish Seasoning (60g)', weight: 60, unit: 'g', brand: 'Irie', description: 'Special blend for seasoning all types of fish.' },
    { name: 'Irie Fish Seasoning (340g)', weight: 340, unit: 'g', brand: 'Irie', description: 'Large size fish seasoning.' },
    { name: 'Irie Fried Rice Seasoning (70g)', weight: 70, unit: 'g', brand: 'Irie', description: 'Seasoning blend for authentic fried rice.' },
    { name: 'Irie Garlic Salt (85g)', weight: 85, unit: 'g', brand: 'Irie', description: 'Blend of garlic and salt for easy seasoning.' },
    { name: 'Irie Garlic Pepper & Herbs (40g)', weight: 40, unit: 'g', brand: 'Irie', description: 'Garlic, pepper, and herbs combination.' },
    { name: 'Irie Garlic Powder (34g)', weight: 34, unit: 'g', brand: 'Irie', description: 'Pure garlic powder for versatile use.' },
    { name: 'Irie Garlic Powder (256g)', weight: 256, unit: 'g', brand: 'Irie', description: 'Large size garlic powder.' },
    { name: 'Geeta Amchar Masala (50g)', weight: 50, unit: 'g', brand: 'Geeta', description: 'Traditional masala blend for pickles and chutneys.' },
    { name: 'Geeta Cayenne Pepper Ground (34g)', weight: 34, unit: 'g', brand: 'Geeta', description: 'Ground cayenne pepper for heat.' },
    { name: 'Geeta Cumin Whole (50g)', weight: 50, unit: 'g', brand: 'Geeta', description: 'Whole cumin seeds.' },
    { name: 'Geeta Duck & Goat Curry Powder (340g)', weight: 340, unit: 'g', brand: 'Geeta', description: 'Specialty curry powder for duck and goat.' },
    { name: 'Geeta Fennel Whole (50g)', weight: 50, unit: 'g', brand: 'Geeta', description: 'Whole fennel seeds with sweet licorice flavor.' },
    { name: 'Geeta Fennel Ground (50g)', weight: 50, unit: 'g', brand: 'Geeta', description: 'Ground fennel for easier use.' },
    { name: 'Geeta Garam Masala Roasted (50g)', weight: 50, unit: 'g', brand: 'Geeta', description: 'Roasted garam masala for authentic Indian flavor.' },
    { name: 'Geeta Green Cardamom Whole (15g)', weight: 15, unit: 'g', brand: 'Geeta', description: 'Whole green cardamom pods.' },
    { name: 'Geeta Green Cardamom Ground (15g)', weight: 15, unit: 'g', brand: 'Geeta', description: 'Ground green cardamom.' },
    { name: 'Geeta Green Seasoning (350ml)', weight: 350, unit: 'ml', brand: 'Geeta', description: 'Fresh green herb seasoning paste.' },
    { name: 'Geeta Green Seasoning Trinidad Style (350ml)', weight: 350, unit: 'ml', brand: 'Geeta', description: 'Trinidad-style green seasoning.' },
    { name: 'Geeta Mustard Seed Brown Whole (50g)', weight: 50, unit: 'g', brand: 'Geeta', description: 'Whole brown mustard seeds.' },
    { name: 'Geeta Mustard Seed Brown Ground (50g)', weight: 50, unit: 'g', brand: 'Geeta', description: 'Ground brown mustard seeds.' },
    { name: 'Geeta Trinidad Chadon Beni (350ml)', weight: 350, unit: 'ml', brand: 'Geeta', description: 'Trinidad chadon beni (culantro) sauce.' },
    { name: 'Irie Ginger Garlic Pimento (40g)', weight: 40, unit: 'g', brand: 'Irie', description: 'Blend of ginger, garlic, and pimento.' },
    { name: 'Irie Ginger Ground (30g)', weight: 30, unit: 'g', brand: 'Irie', description: 'Ground ginger for cooking and baking.' },
    { name: 'Irie Ginger Ground (180g)', weight: 180, unit: 'g', brand: 'Irie', description: 'Large size ground ginger.' },
    { name: 'Irie Goat Curry Powder (50g)', weight: 50, unit: 'g', brand: 'Irie', description: 'Curry powder specially blended for goat dishes.' },
    { name: 'Irie Goat Curry (233g)', weight: 233, unit: 'g', brand: 'Irie', description: 'Large size goat curry seasoning.' },
    { name: 'Irie Granulated Garlic (34g)', weight: 34, unit: 'g', brand: 'Irie', description: 'Granulated garlic for texture and flavor.' },
    { name: 'Irie Hot Chilli Powder (30g)', weight: 30, unit: 'g', brand: 'Irie', description: 'Hot chili powder for spicy heat.' },
    { name: 'Irie Italian Herb Onion & Chilli (30g)', weight: 30, unit: 'g', brand: 'Irie', description: 'Italian herbs with onion and chili.' },
    { name: 'Irie Jerk Seasoning (40g)', weight: 40, unit: 'g', brand: 'Irie', description: 'Authentic Jamaican jerk seasoning blend.' },
    { name: 'Irie Jerk Seasoning Powder (300g)', weight: 300, unit: 'g', brand: 'Irie', description: 'Large size jerk seasoning powder.' },
    { name: 'Irie Jerk & Bake Coating Mix (284g)', weight: 284, unit: 'g', brand: 'Irie', description: 'Jerk-flavored coating mix for baking.' },
    { name: 'Irie Lamb Seasoning (60g)', weight: 60, unit: 'g', brand: 'Irie', description: 'Seasoning blend for lamb dishes.' },
    { name: 'Irie Latino Seasoning (60g)', weight: 60, unit: 'g', brand: 'Irie', description: 'Latin-inspired seasoning blend.' },
    { name: 'Irie Lemon Pepper (34g)', weight: 34, unit: 'g', brand: 'Irie', description: 'Zesty lemon pepper seasoning.' },
    { name: 'Irie Lemon Pepper (340g)', weight: 340, unit: 'g', brand: 'Irie', description: 'Large size lemon pepper.' },
    { name: 'Irie Linseed Flax Seed (85g)', weight: 85, unit: 'g', brand: 'Irie', description: 'Nutritious flax seeds.' },
    { name: 'Irie Mauby Bark (21g)', weight: 21, unit: 'g', brand: 'Irie', description: 'Mauby bark for traditional Caribbean drink.' },
    { name: 'Irie Meat Seasoning (50g)', weight: 50, unit: 'g', brand: 'Irie', description: 'All-purpose meat seasoning.' },
    { name: 'Irie Meat Tenderiser (60g)', weight: 60, unit: 'g', brand: 'Irie', description: 'Meat tenderizer for softer, juicier meats.' },
    { name: 'Irie Mediterranean All-Purpose Seasoning (40g)', weight: 40, unit: 'g', brand: 'Irie', description: 'Mediterranean herb blend.' },
    { name: 'Irie Mediterranean All-Purpose Seasoning (284g)', weight: 284, unit: 'g', brand: 'Irie', description: 'Large size Mediterranean seasoning.' },
    { name: 'Irie Mix Spice for Cakes (30g)', weight: 30, unit: 'g', brand: 'Irie', description: 'Baking spice blend for cakes.' },
    { name: 'Irie Monosodium Glutamate (60g)', weight: 60, unit: 'g', brand: 'Irie', description: 'MSG flavor enhancer.' },
    { name: 'Irie Morocco Seasoning (60g)', weight: 60, unit: 'g', brand: 'Irie', description: 'Moroccan-inspired spice blend.' },
    { name: 'Irie N\'wlins Cajun (60g)', weight: 60, unit: 'g', brand: 'Irie', description: 'New Orleans Cajun seasoning.' },
    { name: 'Irie Nutmeg Ground (28g)', weight: 28, unit: 'g', brand: 'Irie', description: 'Ground nutmeg for sweet and savory dishes.' },
    { name: 'Irie Nutmeg Whole (28g)', weight: 28, unit: 'g', brand: 'Irie', description: 'Whole nutmeg for grating fresh.' },
    { name: 'Irie Onion Powder (30g)', weight: 30, unit: 'g', brand: 'Irie', description: 'Onion powder for easy seasoning.' },
    { name: 'Irie Oregano (21g)', weight: 21, unit: 'g', brand: 'Irie', description: 'Dried oregano for Italian and Mediterranean dishes.' },
    { name: 'Irie Oxtail Seasoning (60g)', weight: 60, unit: 'g', brand: 'Irie', description: 'Specially blended for oxtail dishes.' },
    { name: 'Irie Oxtail Seasoning (425g)', weight: 425, unit: 'g', brand: 'Irie', description: 'Large size oxtail seasoning.' },
    { name: 'Irie Paprika (50g)', weight: 50, unit: 'g', brand: 'Irie', description: 'Sweet paprika for color and mild flavor.' },
    { name: 'Irie Paprika (200g)', weight: 200, unit: 'g', brand: 'Irie', description: 'Large size paprika.' },
    { name: 'Irie Parsley Flakes (10g)', weight: 10, unit: 'g', brand: 'Irie', description: 'Dried parsley flakes for garnish.' },
    { name: 'Irie Peri-Peri Mix (50g)', weight: 50, unit: 'g', brand: 'Irie', description: 'Spicy peri-peri seasoning blend.' },
    { name: 'Irie Poultry Seasoning (40g)', weight: 40, unit: 'g', brand: 'Irie', description: 'Herb blend for chicken, turkey, and poultry.' },
    { name: 'Irie Pilaf Seasoning (50g)', weight: 50, unit: 'g', brand: 'Irie', description: 'Seasoning for rice pilaf.' },
    { name: 'Irie Ram Goat Seasoning (50g)', weight: 50, unit: 'g', brand: 'Irie', description: 'Traditional ram goat seasoning.' },
    { name: 'Irie Rice & Peas Seasoning (50g)', weight: 50, unit: 'g', brand: 'Irie', description: 'Caribbean rice and peas seasoning.' },
    { name: 'Irie Rosemary Leave (15g)', weight: 15, unit: 'g', brand: 'Irie', description: 'Dried rosemary leaves.' },
    { name: 'Irie Sage Ground (28g)', weight: 28, unit: 'g', brand: 'Irie', description: 'Ground sage for poultry and stuffing.' },
    { name: 'Irie Seafood Seasoning (50g)', weight: 50, unit: 'g', brand: 'Irie', description: 'Seasoning blend for all seafood.' },
    { name: 'Irie Seafood Seasoning (340g)', weight: 340, unit: 'g', brand: 'Irie', description: 'Large size seafood seasoning.' },
    { name: 'Irie Seasoning Salt (70g)', weight: 70, unit: 'g', brand: 'Irie', description: 'Seasoned salt blend.' },
    { name: 'Irie Seasoning Salt (454g)', weight: 454, unit: 'g', brand: 'Irie', description: 'Large size seasoning salt.' },
    { name: 'Irie Senna Pod (12g)', weight: 12, unit: 'g', brand: 'Irie', description: 'Senna pods for tea.' },
    { name: 'Irie Shrimp Seasoning (70g)', weight: 70, unit: 'g', brand: 'Irie', description: 'Special seasoning for shrimp dishes.' },
    { name: 'Irie Star Aniseed (15g)', weight: 15, unit: 'g', brand: 'Irie', description: 'Star anise for Asian cooking.' },
    { name: 'Irie Steak Spice (65g)', weight: 65, unit: 'g', brand: 'Irie', description: 'Steak seasoning blend.' },
    { name: 'Irie Steak Spice (340g)', weight: 340, unit: 'g', brand: 'Irie', description: 'Large size steak spice.' },
    { name: 'Irie Thyme Leaf (15g)', weight: 15, unit: 'g', brand: 'Irie', description: 'Dried thyme leaves.' },
    { name: 'Irie Turmeric Powder (40g)', weight: 40, unit: 'g', brand: 'Irie', description: 'Turmeric powder for color and flavor.' },
    { name: 'Irie Turmeric Powder (200g)', weight: 200, unit: 'g', brand: 'Irie', description: 'Large size turmeric powder.' },
    { name: 'Irie White Pepper Ground (21g)', weight: 21, unit: 'g', brand: 'Irie', description: 'Ground white pepper.' },
    { name: 'Irie Yardy Fish Fry (60g)', weight: 60, unit: 'g', brand: 'Irie', description: 'Jamaican-style fish fry seasoning.' },
    { name: 'Irie Yardy Fish Fry (312g)', weight: 312, unit: 'g', brand: 'Irie', description: 'Large size fish fry seasoning.' }
  ]

  // SAUCES & CONDIMENTS
  const saucesProducts = [
    { name: 'Irie Ultimate BBQ Sauce (16oz)', weight: 16, unit: 'oz', brand: 'Irie', description: 'Rich and tangy BBQ sauce for grilling.' },
    { name: 'Irie Reggae Honey Garlic Rip Sauce (12oz)', weight: 12, unit: 'oz', brand: 'Irie', description: 'Sweet honey garlic sauce with a kick.' },
    { name: 'Irie Reggae Fish Marinade (130ml)', weight: 130, unit: 'ml', brand: 'Irie', description: 'Fish marinade with Caribbean flavors.' },
    { name: 'Irie Tamarind & Honey Marinade (350ml)', weight: 350, unit: 'ml', brand: 'Irie', description: 'Sweet and tangy tamarind honey marinade.' },
    { name: 'Irie Oxtail Gravy (454ml)', weight: 454, unit: 'ml', brand: 'Irie', description: 'Rich oxtail gravy sauce.' },
    { name: 'Irie Periperi (350ml)', weight: 350, unit: 'ml', brand: 'Irie', description: 'Spicy peri-peri sauce.' },
    { name: 'Irie Hot Jerk Seasoning (10oz)', weight: 10, unit: 'oz', brand: 'Irie', description: 'Hot liquid jerk seasoning sauce.' },
    { name: 'Irie Jerk Seasoning (10oz)', weight: 10, unit: 'oz', brand: 'Irie', description: 'Liquid jerk seasoning sauce.' },
    { name: 'Irie Jerk BBQ (454ml)', weight: 454, unit: 'ml', brand: 'Irie', description: 'Jerk-flavored BBQ sauce.' }
  ]

  // BAKING PRODUCTS
  const bakingProducts = [
    { name: 'Irie Burnt Sugar (12oz)', weight: 12, unit: 'oz', brand: 'Irie', description: 'Burnt sugar for Caribbean baking and coloring.' },
    { name: 'Irie Gravy Browning (5oz)', weight: 5, unit: 'oz', brand: 'Irie', description: 'Browning sauce for gravies and stews.' },
    { name: 'Irie Raw Sugar (1kg)', weight: 1000, unit: 'g', brand: 'Irie', description: 'Unrefined raw sugar.' },
    { name: 'Irie Island Dark Cane Sugar (800g)', weight: 800, unit: 'g', brand: 'Irie', description: 'Dark cane sugar for rich flavor.' },
    { name: 'Irie Anise Extract (5oz)', weight: 5, unit: 'oz', brand: 'Irie', description: 'Anise flavoring extract for baking.' },
    { name: 'Irie Almond Extract (5oz)', weight: 5, unit: 'oz', brand: 'Irie', description: 'Almond flavoring extract.' },
    { name: 'Irie Island Ram Extract (5oz)', weight: 5, unit: 'oz', brand: 'Irie', description: 'Rum-flavored extract for cakes.' },
    { name: 'Irie Rose Water Extract (5oz)', weight: 5, unit: 'oz', brand: 'Irie', description: 'Rose water for Middle Eastern and Indian desserts.' }
  ]

  // SOUPS
  const soupsProducts = [
    { name: 'Irie Chicken Soup Base (60g)', weight: 60, unit: 'g', brand: 'Irie', description: 'Chicken soup base for quick broths.' },
    { name: 'Irie Chicken Soup Mix & Pimento (56g)', weight: 56, unit: 'g', brand: 'Irie', description: 'Chicken soup mix with pimento.' }
  ]

  let totalSuccess = 0
  let totalSkipped = 0
  let totalFailed = 0

  // Upload Spices
  console.log('📦 Uploading SPICES, HERBS & SEASONINGS...\n')
  for (const product of spicesProducts) {
    const exists = await checkExisting(product.name)
    if (exists) {
      console.log(`⏭️  Skipped (exists): ${product.name}`)
      totalSkipped++
      continue
    }

    try {
      const productData = {
        name: product.name,
        slug: product.name.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[()]/g, '')
          .replace(/&/g, 'and'),
        description: product.description,
        short_description: product.description.substring(0, 100),
        price: 10.00,
        category_id: categories.spices,
        brand: product.brand,
        weight: product.weight,
        unit: product.unit,
        stock_quantity: 50,
        is_available: true,
        is_cooked: false,
        delivery_type: 'partner_delivery',
        requires_shipping: true,
        track_inventory: true,
        low_stock_threshold: 5,
        images: [],
        is_featured: false,
        tax_exempt: false,
        seo_title: product.name,
        seo_description: product.description
      }

      const { error } = await supabase
        .from('products')
        .insert([productData])

      if (error) {
        console.error(`❌ Error: ${product.name} - ${error.message}`)
        totalFailed++
      } else {
        console.log(`✅ ${product.name}`)
        totalSuccess++
      }
    } catch (err) {
      console.error(`❌ Exception: ${product.name} - ${err.message}`)
      totalFailed++
    }
  }

  // Upload Sauces
  console.log('\n📦 Uploading SAUCES & CONDIMENTS...\n')
  for (const product of saucesProducts) {
    const exists = await checkExisting(product.name)
    if (exists) {
      console.log(`⏭️  Skipped (exists): ${product.name}`)
      totalSkipped++
      continue
    }

    try {
      const productData = {
        name: product.name,
        slug: product.name.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[()]/g, '')
          .replace(/&/g, 'and'),
        description: product.description,
        short_description: product.description.substring(0, 100),
        price: 10.00,
        category_id: categories.sauces,
        brand: product.brand,
        weight: product.weight,
        unit: product.unit,
        stock_quantity: 50,
        is_available: true,
        is_cooked: false,
        delivery_type: 'partner_delivery',
        requires_shipping: true,
        track_inventory: true,
        low_stock_threshold: 5,
        images: [],
        is_featured: false,
        tax_exempt: false,
        seo_title: product.name,
        seo_description: product.description
      }

      const { error } = await supabase
        .from('products')
        .insert([productData])

      if (error) {
        console.error(`❌ Error: ${product.name} - ${error.message}`)
        totalFailed++
      } else {
        console.log(`✅ ${product.name}`)
        totalSuccess++
      }
    } catch (err) {
      console.error(`❌ Exception: ${product.name} - ${err.message}`)
      totalFailed++
    }
  }

  // Upload Baking
  console.log('\n📦 Uploading BAKING PRODUCTS...\n')
  for (const product of bakingProducts) {
    const exists = await checkExisting(product.name)
    if (exists) {
      console.log(`⏭️  Skipped (exists): ${product.name}`)
      totalSkipped++
      continue
    }

    try {
      const productData = {
        name: product.name,
        slug: product.name.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[()]/g, '')
          .replace(/&/g, 'and'),
        description: product.description,
        short_description: product.description.substring(0, 100),
        price: 10.00,
        category_id: categories.baking,
        brand: product.brand,
        weight: product.weight,
        unit: product.unit,
        stock_quantity: 50,
        is_available: true,
        is_cooked: false,
        delivery_type: 'partner_delivery',
        requires_shipping: true,
        track_inventory: true,
        low_stock_threshold: 5,
        images: [],
        is_featured: false,
        tax_exempt: false,
        seo_title: product.name,
        seo_description: product.description
      }

      const { error } = await supabase
        .from('products')
        .insert([productData])

      if (error) {
        console.error(`❌ Error: ${product.name} - ${error.message}`)
        totalFailed++
      } else {
        console.log(`✅ ${product.name}`)
        totalSuccess++
      }
    } catch (err) {
      console.error(`❌ Exception: ${product.name} - ${err.message}`)
      totalFailed++
    }
  }

  // Upload Soups
  console.log('\n📦 Uploading SOUPS...\n')
  for (const product of soupsProducts) {
    const exists = await checkExisting(product.name)
    if (exists) {
      console.log(`⏭️  Skipped (exists): ${product.name}`)
      totalSkipped++
      continue
    }

    try {
      const productData = {
        name: product.name,
        slug: product.name.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[()]/g, '')
          .replace(/&/g, 'and'),
        description: product.description,
        short_description: product.description.substring(0, 100),
        price: 10.00,
        category_id: categories.soups,
        brand: product.brand,
        weight: product.weight,
        unit: product.unit,
        stock_quantity: 50,
        is_available: true,
        is_cooked: false,
        delivery_type: 'partner_delivery',
        requires_shipping: true,
        track_inventory: true,
        low_stock_threshold: 5,
        images: [],
        is_featured: false,
        tax_exempt: false,
        seo_title: product.name,
        seo_description: product.description
      }

      const { error } = await supabase
        .from('products')
        .insert([productData])

      if (error) {
        console.error(`❌ Error: ${product.name} - ${error.message}`)
        totalFailed++
      } else {
        console.log(`✅ ${product.name}`)
        totalSuccess++
      }
    } catch (err) {
      console.error(`❌ Exception: ${product.name} - ${err.message}`)
      totalFailed++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`✅ Successfully uploaded: ${totalSuccess} products`)
  console.log(`⏭️  Skipped (already exist): ${totalSkipped} products`)
  console.log(`❌ Failed: ${totalFailed} products`)
  console.log('='.repeat(60))
  console.log('\n🎉 IRIE Products upload complete!')
  console.log('\n📋 All products configured as:')
  console.log('   ✅ is_cooked = false (Regular grocery items)')
  console.log('   ✅ delivery_type = "partner_delivery"')
  console.log('   ✅ price = $10.00 (placeholder)')
  console.log('   ✅ Organized by category (Spices, Sauces, Baking, Soups)')
}

uploadIrieProducts()
