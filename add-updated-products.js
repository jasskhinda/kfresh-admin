require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to create slug from name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

// Helper function to parse price from string
function parsePrice(priceStr) {
  const match = priceStr.match(/\$?([\d.,]+)/);
  if (match) {
    return parseFloat(match[1].replace(/,/g, ''));
  }
  return 0;
}

// Helper function to extract unit from price string
function extractUnit(priceStr) {
  const units = ['/lb', '/kg', '/pack', '/one', '/1', '/case', '/box', '/bag', '/bottle', '/L', '/ml', 'g', 'kg', 'lb', 'lbs', 'oz'];
  for (const unit of units) {
    if (priceStr.includes(unit)) {
      return unit.replace('/', '');
    }
  }
  return 'each';
}

async function addProducts() {
  console.log('🚀 Starting to add updated products to database...');

  try {
    // Get or create categories first
    const categories = {
      'frozen-goods': { name: 'Frozen Goods', slug: 'frozen-goods' },
      'canned-goods': { name: 'Canned & Packaged Goods', slug: 'canned-goods' },
      'cooking-oils': { name: 'Cooking Oils', slug: 'cooking-oils' },
      'spices-seasoning': { name: 'Spices & Seasoning', slug: 'spices-seasoning' },
      'sauces': { name: 'Sauces', slug: 'sauces' },
      'baked-goods': { name: 'Baked Goods', slug: 'baked-goods' },
      'beverages': { name: 'Beverages', slug: 'beverages' },
      'fresh-produce': { name: 'Fresh Produce', slug: 'fresh-produce' },
      'tubers-plantain': { name: 'Tubers & Plantain', slug: 'tubers-plantain' }
    };

    // Create categories if they don't exist
    for (const [slug, category] of Object.entries(categories)) {
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existing) {
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: category.name,
            slug: category.slug,
            is_active: true
          })
          .select()
          .single();

        if (error) {
          console.error(`Error creating category ${category.name}:`, error);
          continue;
        }
        categories[slug].id = data.id;
        console.log(`✅ Created category: ${category.name}`);
      } else {
        categories[slug].id = existing.id;
      }
    }

    // Product data organized by category
    const productData = {
      'frozen-goods': [
        { name: 'Whiting Fish', price: '$7.50/lb', description: 'Fresh frozen whiting fish, perfect for traditional African dishes. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives. Same rich taste we get from back home. Delivered every week from the farm to our shop.' },
        { name: 'Tilapia Fish', price: '$6.90/lb', description: 'Fresh frozen tilapia fish, mild flavor and firm texture. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' },
        { name: 'Mackerel Fish', price: '$7/lb', description: 'Fresh frozen mackerel fish, rich in omega-3 fatty acids. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' },
        { name: 'Smoked Mackerel', price: '$7/lb', description: 'Traditionally smoked mackerel with authentic flavor. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' },
        { name: 'Crocker Fish (Headless)', price: '$8.00/lb', description: 'Fresh frozen crocker fish, headless and ready to cook. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' },
        { name: 'Soft Chicken Drumstick (Halal)', price: '$7/lb', description: 'Halal certified soft chicken drumsticks. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives. Same rich taste we get from back home. Delivered every week from the farm to our shop.' },
        { name: 'Chicken Feet', price: '$5/lb', description: 'Fresh chicken feet, perfect for making rich broths and traditional dishes. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' },
        { name: 'Smoked Turkey Wings - Cut', price: '$12.00/lb', description: 'Premium smoked turkey wings, pre-cut for convenience. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' },
        { name: 'Smoked Turkey Wings - Split', price: '$12.00/lb', description: 'Premium smoked turkey wings, split for easy cooking. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' },
        { name: 'Smoked Turkey', price: '$8.50/lb', description: 'Traditional smoked turkey with rich, smoky flavor. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' },
        { name: 'Smoked Turkey Drumstick', price: '$12.00/lb', description: 'Large smoked turkey drumsticks, perfect for hearty meals. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' },
        { name: 'Unsmoked Turkey Wings', price: '$12.00/lb', description: 'Fresh unsmoked turkey wings, ready for your favorite preparation. Our meat is fresh and straight from the farm in Ontario without any antibiotics/hormones and preservatives.' },
        { name: 'Ugwu Leaves', price: '$5.50/pack', description: 'Fresh frozen ugwu leaves, essential for Nigerian cuisine. Rich in nutrients and perfect for soups and stews.' },
        { name: 'Jute Leaves (Ewedu)', price: '$5.55/pack', description: 'Traditional jute leaves (ewedu) for authentic Yoruba cuisine. Frozen fresh to preserve nutrients.' },
        { name: 'Water Leaves', price: '$5.50/pack', description: 'Fresh frozen water leaves, a staple vegetable for African soups and stews.' },
        { name: 'Bitter Leaves', price: '$5.55/pack', description: 'Authentic bitter leaves for traditional African bitter leaf soup. Frozen fresh to maintain quality.' },
        { name: 'Spinach', price: '$3.65/pack', description: 'Fresh frozen spinach, versatile and nutritious green vegetable.' },
        { name: 'CASII Sliced Okro', price: '$3.70/pack', description: 'Pre-sliced okra for convenience, perfect for soups and stews.' },
        { name: 'CASII Chopped Okro', price: '$3.70/pack', description: 'Pre-chopped okra, ready to use in your favorite dishes.' },
        { name: 'Mixed Vegetables', price: '$3.50/pack', description: 'Blend of frozen mixed vegetables for quick and nutritious meals.' },
        { name: 'Cassava Leaves', price: '$5.55/pack', description: 'Fresh frozen cassava leaves for traditional African dishes.' },
        { name: 'Ghana Fermented Corn Dough (10lbs)', price: '$23.50/pack', description: 'Traditional Ghanaian fermented corn dough, perfect for making banku and other traditional dishes.' },
        { name: 'Ghana Fermented Corn Dough (4lbs)', price: '$11.50/pack', description: 'Traditional Ghanaian fermented corn dough in convenient 4lb pack.' },
        { name: 'Ghana Fermented Corn Dough (2lbs)', price: '$7.50/pack', description: 'Traditional Ghanaian fermented corn dough in small 2lb pack.' },
        { name: 'Ghana Fermented Grated Cassava (2lbs)', price: '$7.50/pack', description: 'Fresh fermented grated cassava from Ghana, perfect for traditional dishes.' },
        { name: 'Chicken Patty - Spicy', price: '$12.00', description: 'Spicy chicken patty made with authentic Caribbean spices.' },
        { name: 'Chicken Patty - Mild', price: '$12.00', description: 'Mild chicken patty with traditional Caribbean flavors.' },
        { name: 'Beef Patty - Spicy', price: '$12.00', description: 'Spicy beef patty with hot Caribbean spices.' },
        { name: 'Beef Patty - Mild', price: '$12.00', description: 'Mild beef patty with traditional flavors.' },
        { name: 'Vegetable Patty - Spicy', price: '$12.00', description: 'Spicy vegetable patty for vegetarian option.' },
        { name: 'Vegetable Patty - Mild', price: '$12.00', description: 'Mild vegetable patty with traditional seasoning.' },
        { name: 'Yam Chips (2.5kg)', price: '$21.50', description: 'Large pack of crispy yam chips, perfect for snacking or side dishes.' },
        { name: 'Yam Chips (600g)', price: '$8.20', description: 'Small pack of crispy yam chips for convenient portioning.' }
      ],
      
      'canned-goods': [
        { name: 'Golden Mourn 900g', price: '$13.99', description: 'Premium golden mourn cereal blend, nutritious breakfast option.' },
        { name: 'Grandious Ogi White 500g', price: '$8.00', description: 'Traditional white ogi (fermented corn flour) for making porridge.' },
        { name: 'Grandious Ogi Yellow 500g', price: '$8.00', description: 'Traditional yellow ogi (fermented corn flour) with natural corn flavor.' },
        { name: 'Ijebu Garri 4lbs', price: '$8.00', description: 'Premium Ijebu garri, finest quality cassava flakes from Nigeria.' },
        { name: 'Ijebu Garri 2lbs', price: '$4.00', description: 'Premium Ijebu garri in convenient 2lb pack.' },
        { name: 'Yellow Garri 4lbs', price: '$8.00', description: 'Traditional yellow garri with rich color and flavor.' },
        { name: 'Yellow Garri 2lbs', price: '$4.00', description: 'Traditional yellow garri in smaller portion.' },
        { name: 'Peeled Beans 2lbs', price: '$11.99', description: 'High-quality peeled beans, perfect for moin-moin and akara.' },
        { name: 'Honey Beans 2lbs', price: '$10.99', description: 'Sweet honey beans, excellent for porridge and stews.' },
        { name: 'Ofada Rice 4lbs', price: '$12.00', description: 'Authentic Nigerian Ofada rice with unique aroma and taste.' },
        { name: 'Guyanese Pride Rice', price: '$25/20lbs', description: 'Premium long-grain rice from Guyana, perfect for all rice dishes.' },
        { name: 'Durum Semolina 1.8kg', price: '$9.99', description: 'High-quality durum semolina for making couscous and pasta.' },
        { name: 'Unico Tomato Paste 156ml', price: '$1.29', description: 'Rich and concentrated tomato paste for cooking.' },
        { name: 'Hereford Corned Beef 340g', price: '$4.99', description: 'Premium corned beef, ready to eat or cook.' },
        { name: 'Hereford Corned Beef - Halal 340g', price: '$4.99', description: 'Halal certified corned beef with authentic taste.' },
        { name: 'Tropiway Plantain Fufu 700g', price: '$9.99', description: 'Instant plantain fufu mix, easy to prepare traditional dish.' },
        { name: 'Tropiway Cocoyam Fufu 700g', price: '$9.99', description: 'Instant cocoyam fufu mix for authentic African meals.' },
        { name: 'Smoked Cat Fish Large', price: '$9.90', description: 'Large smoked catfish with rich, smoky flavor perfect for pepper soup.' },
        { name: 'Smoked Cat Fish Medium', price: '$10.00', description: 'Medium smoked catfish, ideal for traditional African dishes.' },
        { name: 'Peeled Large Herrings', price: '$9.00/pack', description: 'Premium peeled herrings, ready to cook and full of flavor.' },
        { name: 'Koobi (Salted Fish)', price: '$7.00', description: 'Traditional salted fish (koobi) essential for authentic Ghanaian cooking.' },
        { name: 'Crayfish Whole 100g', price: '$9.99', description: 'Whole dried crayfish for authentic African flavor in soups and stews.' },
        { name: 'Crayfish Ground 100g', price: '$9.99', description: 'Ground crayfish powder for easy seasoning of dishes.' },
        { name: 'Crayfish Ground 50g', price: '$5.00', description: 'Convenient small pack of ground crayfish.' },
        { name: 'Fried Fish with Shrimps Large', price: '$12.50', description: 'Premium fried fish with shrimps, ready to eat delicacy.' },
        { name: 'Fried Fish with Shrimps Medium', price: '$8.00', description: 'Medium portion of fried fish with shrimps.' },
        { name: 'Kivo 4in1 - Crispy White Garri Mixed 125g', price: '$4.55', description: 'Convenient ready-to-eat garri mixed with sugar, milk & roasted peanuts.' },
        { name: 'Cassava Flour/Konkonte 3.5lbs', price: '$8.00', description: 'Traditional cassava flour for making konkonte (cassava fufu).' },
        { name: 'Cassava Flour/Konkonte 7lbs', price: '$16.00', description: 'Large pack of cassava flour for families.' },
        { name: 'Diehuo - Corn Flour Mixed 3.5lbs', price: '$11.99', description: 'Special blend of corn flour mixed with cassava flour.' },
        { name: 'Egusi Ground 200g', price: '$5.00', description: 'Ground egusi seeds for making traditional Nigerian egusi soup.' },
        { name: 'Egusi Whole 200g', price: '$5.00', description: 'Whole egusi seeds for authentic traditional preparation.' },
        { name: 'Peanut Butter 498g', price: '$6.99', description: 'Creamy natural peanut butter, perfect for sandwiches and cooking.' },
        { name: 'Prekese/Tetrapleura Tetraptera', price: '$5.00/pack', description: 'Traditional West African spice pod, essential for authentic flavoring.' },
        { name: 'Wakye Leaves', price: '$4.00/pack', description: 'Traditional leaves used for cooking wakye (rice and beans).' },
        { name: 'Akuas Special Koose 438g', price: '$8.00', description: 'Blended peeled beans with pepper, ginger, onions & spices for making koose.' },
        { name: 'Hausa Koko Flour', price: '$11.99', description: 'Traditional flour blend for making Hausa koko porridge.' },
        { name: 'Nkulenu Palm Soup Base 780g', price: '$6.99', description: 'Authentic palm soup base for traditional Ghanaian palm nut soup.' },
        { name: 'Nkulenu Palm Soup Base with Prekese 780g', price: '$6.99', description: 'Palm soup base enhanced with prekese and abemuduro spices.' },
        { name: 'Gino Tomato Paste 210g', price: '$4.99', description: 'Rich concentrated tomato paste perfect for stews and sauces.' },
        { name: 'Derica Tomato Paste 210g', price: '$4.99', description: 'Premium tomato paste with authentic African flavor.' },
        { name: 'Dry Okro', price: '$5.99', description: 'Dried okra for traditional soups and stews, adds natural thickening.' },
        { name: 'Star Kist Tuna - Kpapko Shito 160g', price: '$6.46', description: 'Tuna in spicy Ghanaian shito sauce.' },
        { name: 'Star Kist Tuna - Flakes 160g', price: '$6.46', description: 'Premium tuna flakes in natural juice.' },
        { name: 'Mamas Choice Plantain Fufu 10lbs', price: '$54.00', description: 'Large family pack of instant plantain fufu mix.' },
        { name: 'Mamas Choice Plantain Fufu 4lbs', price: '$24.00', description: 'Medium pack of instant plantain fufu mix.' },
        { name: 'OCASII Okro Sliced', price: '$6.75/pack', description: 'Pre-sliced okra for convenient cooking.' },
        { name: 'OCASII Chopped Okro', price: '$6.75/pack', description: 'Pre-chopped okra ready for your recipes.' },
        { name: 'Ola-Ola Poundo Yam 10lbs', price: '$90.00', description: 'Premium instant pounded yam flour, large family pack.' },
        { name: 'Ola-Ola Poundo Yam 4lbs', price: '$24.00', description: 'Instant pounded yam flour, medium pack.' },
        { name: 'Ola-Ola Poundo Yam 2lbs', price: '$11.00', description: 'Instant pounded yam flour, convenient small pack.' },
        { name: 'Ayo-Ola Poundo Yam Flour 4lbs', price: '$24.00', description: 'Premium pounded yam flour for authentic texture.' },
        { name: '555 Basmati Rice 4.54kg', price: '$17.99', description: 'Premium basmati rice with long grains and aromatic flavor.' },
        { name: 'Botan Calrose Rice 8kg', price: '$20.00', description: 'Japanese-style calrose rice, perfect for sushi and everyday meals.' },
        { name: 'Mekong Jasmine Scented Rice 8kg', price: '$20.00', description: 'Fragrant jasmine rice from the Mekong region.' },
        { name: 'OX Head Fragrance Rice 8kg', price: '$20.00', description: 'Premium fragrant rice with excellent aroma.' },
        { name: 'Rooster Scented Jasmine Rice 8kg', price: '$20.00', description: 'High-quality jasmine rice with natural fragrance.' },
        { name: 'Indomie Chicken Box', price: '$22.50', description: 'Box of Indomie chicken flavor instant noodles (24 packs).' },
        { name: 'Indomie Chicken Pack', price: '$0.95', description: 'Single pack of Indomie chicken flavor instant noodles.' },
        { name: 'Indomie Onion Box', price: '$22.50', description: 'Box of Indomie onion flavor instant noodles (24 packs).' },
        { name: 'Indomie Onion Pack', price: '$0.95', description: 'Single pack of Indomie onion flavor instant noodles.' },
        { name: 'Ghana Milo 400g', price: '$10.99', description: 'Authentic Ghana Milo chocolate malt drink mix.' },
        { name: 'Nigeria Milo 400g', price: '$10.99', description: 'Original Nigeria Milo chocolate malt drink mix.' },
        { name: 'Primo Crushed Tomatoes 796ml', price: '$2.49', description: 'Premium crushed tomatoes for cooking and sauces.' },
        { name: 'Primo Diced Tomato 796ml', price: '$2.49', description: 'Diced tomatoes perfect for stews and cooking.' },
        { name: 'Unico Crushed Tomatoes 796ml', price: '$2.49', description: 'High-quality crushed tomatoes for all your cooking needs.' },
        { name: 'Turkey Berry/Kwahu Nkwasusua 700g', price: '$8.00', description: 'Traditional West African turkey berries for authentic soups.' },
        { name: 'Titus Sardine in Soybean Oil 125g (3 pack)', price: '$5.00', description: 'Pack of 3 Titus sardines in soybean oil.' },
        { name: 'Titus Sardine in Soybean Oil 125g', price: '$2.00', description: 'Single can of Titus sardine in soybean oil.' },
        { name: 'Moi-Moi Plate', price: '$2/one', description: 'Traditional leaves/plates for steaming moi-moi.' },
        { name: 'Red Beans 2lbs', price: '$9.00', description: 'High-quality red kidney beans for stews and rice dishes.' },
        { name: 'CEDAR Chick Peas 907g', price: '$3.99', description: 'Premium chickpeas, great for curry and salads.' },
        { name: 'CEDAR Black Eyed Beans 907g', price: '$3.99', description: 'Traditional black-eyed peas for African and Caribbean dishes.' },
        { name: 'CEDAR Long Grain Parboiled Rice 4lbs', price: '$6.00', description: 'Parboiled long grain rice, fluffy and nutritious.' },
        { name: 'CEDAR Long Grain Parboiled Rice 8.8lbs', price: '$12.00', description: 'Large pack of parboiled long grain rice.' },
        { name: 'Carnation Evaporated Milk 354ml', price: '$2.49', description: 'Rich evaporated milk for cooking and beverages.' },
        { name: 'Carnation Fat Free Evaporated Milk 354ml', price: '$2.49', description: 'Fat-free evaporated milk, healthier option.' },
        { name: 'Honeywell Semolina 1.8kg', price: '$10.00', description: 'Premium semolina for making tuwo and other dishes.' }
      ],

      'cooking-oils': [
        { name: 'Palm Oil Regular 2L', price: '$16.83', description: 'Traditional red palm oil, essential for authentic African cuisine. Rich in vitamins and natural flavor.' },
        { name: 'Palm Oil Regular 1L', price: '$8.99', description: 'Premium red palm oil in convenient 1L bottle.' },
        { name: 'Palm Oil Regular 500ml', price: '$4.99', description: 'Small bottle of red palm oil, perfect for trying.' },
        { name: 'Palm Oil Zomi 2L', price: '$16.83', description: 'Zomi brand premium red palm oil, 2L family size.' },
        { name: 'Palm Oil Zomi 1L', price: '$8.99', description: 'Zomi brand red palm oil in 1L bottle.' },
        { name: 'Palm Oil Zomi 500ml', price: '$4.99', description: 'Zomi brand red palm oil in convenient 500ml size.' },
        { name: 'Palm Kernel Oil 1L', price: '$11.00', description: 'Pure palm kernel oil with natural coconut aroma.' },
        { name: 'Gallo Extra Virgin Olive Oil 1L', price: '$12.00', description: 'Premium extra virgin olive oil for healthy cooking.' },
        { name: 'Saporito Vegetable Oil 3L', price: '$9.78', description: 'Multi-purpose vegetable oil for frying and cooking.' },
        { name: 'Saporito Canola Oil 3L', price: '$9.78', description: 'Heart-healthy canola oil with neutral flavor.' }
      ],

      'spices-seasoning': [
        { name: 'Suya Spice/Pepper 125g', price: '$8.25', description: 'Authentic Nigerian suya spice blend with groundnuts and spices.' },
        { name: 'Maggi Chicken (Pack)', price: '$14.00/pack', description: 'Maggi chicken flavour cubes, essential for African cooking.' },
        { name: 'Maggi Chicken (6 pieces)', price: '$2/6pieces', description: 'Small pack of 6 Maggi chicken cubes.' },
        { name: 'Maggi Shrimp (Pack)', price: '$14.00/pack', description: 'Maggi shrimp flavour cubes for seafood taste.' },
        { name: 'Maggi Shrimp (6 pieces)', price: '$2/6pieces', description: 'Small pack of 6 Maggi shrimp cubes.' },
        { name: 'Maggi Crayfish (Pack)', price: '$14.00/pack', description: 'Maggi crayfish flavour cubes for authentic African taste.' },
        { name: 'Maggi Crayfish (6 pieces)', price: '$2/6pieces', description: 'Small pack of 6 Maggi crayfish cubes.' },
        { name: 'Adam Salt/Kawu 210g', price: '$5.00', description: 'Traditional Adam salt (kawu) for authentic African seasoning.' },
        { name: 'Knorr Chicken Seasoning Powder 400g', price: '$9.33', description: 'Nigerian Knorr chicken seasoning powder for rich flavor.' },
        { name: 'Onga Powder - Classic', price: '$2.75', description: 'Classic Onga seasoning powder, essential Nigerian spice.' },
        { name: 'Irie All Purpose Seasoning 275g', price: '$5.99', description: 'Jamaican all-purpose seasoning blend for Caribbean dishes.' },
        { name: 'Irie Oxtail Seasoning 400g', price: '$5.99', description: 'Special seasoning blend perfect for oxtail and beef dishes.' },
        { name: 'Irie Jerk BBQ 454ml', price: '$5.29', description: 'Authentic Jamaican jerk BBQ sauce and marinade.' },
        { name: 'Seasoning Salt 454ml', price: '$5.99', description: 'All-purpose seasoning salt for enhanced flavor.' },
        { name: 'Aurora Fine Sea Salt 1kg', price: '$2.99', description: 'Pure fine sea salt for cooking and seasoning.' },
        { name: 'Kalas Classic Iodized Sea Salt 750g', price: '$2.99', description: 'Iodized sea salt for healthy cooking.' }
      ],

      'sauces': [
        { name: 'Irie Ultimate BBQ Sauce 16oz', price: '$5.00', description: 'Premium Caribbean BBQ sauce with authentic island flavors.' },
        { name: 'Brown Betty Pomeroon Style Cassareep 300ml', price: '$6.99', description: 'Traditional Guyanese cassareep for authentic pepperpot.' },
        { name: 'Guyanese Pride Cassareep 300ml', price: '$6.99', description: 'Premium Guyanese cassareep sauce for traditional cooking.' },
        { name: 'Shito 500ml', price: '$15.00', description: 'Authentic Ghanaian shito (black pepper sauce) - hot and flavorful.' },
        { name: 'Shito 250ml', price: '$8.00', description: 'Traditional Ghanaian shito sauce in convenient smaller size.' }
      ],

      'baked-goods': [
        { name: 'Pine Tart', price: '$8.00', description: 'Traditional Caribbean pineapple tart with sweet pastry.' },
        { name: 'Salara', price: '$8.00', description: 'Guyanese coconut roll with red coconut filling.' },
        { name: 'Pilourie', price: '$8.00', description: 'Caribbean fried split pea fritters, perfect snack.' },
        { name: 'Fresh Bread', price: '$9.99', description: 'Freshly baked bread, soft and delicious.' },
        { name: 'Chinchin', price: '$7.00/pack', description: 'Crunchy Nigerian snack, sweet and addictive.' },
        { name: 'Meat Pie', price: '$3.00/1', description: 'Flaky pastry filled with seasoned ground meat.' },
        { name: 'Vegetable Pie', price: '$3.00/1', description: 'Flaky pastry filled with seasoned mixed vegetables.' },
        { name: 'Bofrot/Beignet/Pufpuf', price: '$6.00/pack', description: 'Traditional West African fried dough balls, sweet and fluffy.' },
        { name: 'Chicken Patty - Spicy (Individual)', price: '$3.00/1', description: 'Spicy chicken patty with Caribbean seasonings.' },
        { name: 'Chicken Patty - Mild (Individual)', price: '$3.00/1', description: 'Mild chicken patty with traditional flavors.' },
        { name: 'Beef Patty - Spicy (Individual)', price: '$3.00/1', description: 'Spicy beef patty with hot pepper seasoning.' },
        { name: 'Beef Patty - Mild (Individual)', price: '$3.00/1', description: 'Mild beef patty with classic Caribbean taste.' },
        { name: 'Vegetable Patty - Spicy (Individual)', price: '$3.00/1', description: 'Spicy vegetable patty for vegetarian option.' },
        { name: 'Vegetable Patty - Mild (Individual)', price: '$3.00/1', description: 'Mild vegetable patty with traditional seasoning.' }
      ],

      'beverages': [
        { name: 'Rayjuice Co. Zobo/Sobolo', price: '$5.00', description: 'Cold pressed ginger hibiscus blend, refreshing and healthy.' },
        { name: 'Hajia Fati (Burkina)', price: '$5.00', description: 'Traditional West African fermented millet drink.' },
        { name: 'Hajia Fati (Fura)', price: '$5.00', description: 'Traditional Nigerian fura drink, nutritious and refreshing.' },
        { name: 'Kirkland Spring Water 500ml', price: '$1.00', description: 'Pure natural spring water in convenient bottle.' },
        { name: 'Eska Natural Spring Water 500ml', price: '$1.50', description: 'Premium natural spring water with crisp taste.' },
        { name: 'Coca-Cola 355ml', price: '$2.50', description: 'Classic Coca-Cola in 355ml can.' },
        { name: 'Fanta 355ml', price: '$2.50', description: 'Orange Fanta soda in 355ml can.' },
        { name: 'Sprite 355ml', price: '$2.50', description: 'Lemon-lime Sprite soda in 355ml can.' },
        { name: 'Ginger Ale 355ml', price: '$2.50', description: 'Refreshing ginger ale in 355ml can.' },
        { name: 'Aladun Zobo 500ml', price: '$5.00', description: 'Premium Nigerian zobo drink with natural ingredients.' }
      ],

      'fresh-produce': [
        { name: 'Ginger Root', price: '$6.59/kg', description: 'Fresh ginger root, essential for African and Asian cuisine.' },
        { name: 'Organic Ginger Root 160g', price: '$4.99', description: 'Organic ginger root in convenient 160g pack.' },
        { name: 'Fresh Tomatoes', price: '$3.99/lb', description: 'Fresh ripe tomatoes, perfect for sauces and cooking.' },
        { name: 'Yellow Onions', price: '$3.49/bag', description: 'Fresh yellow onions in convenient bag.' },
        { name: 'Fresh Garlic', price: '$2.49/bag', description: 'Fresh garlic bulbs for flavor and health benefits.' },
        { name: 'Fresh Lemon', price: '$0.99/one', description: 'Fresh lemon for cooking and natural vitamin C.' },
        { name: 'Wirri Wirri Pepper 200g', price: '$7.66', description: 'Extremely hot West African pepper, use sparingly!' }
      ],

      'tubers-plantain': [
        { name: 'Ghana Yam', price: '$3.15/lb', description: 'Authentic Ghana yam, perfect for pounded yam and boiled yam.' },
        { name: 'Green Plantain', price: '$1.25/lb', description: 'Fresh green plantains for frying, boiling, and cooking.' },
        { name: 'Ripe Plantain', price: '$1.20/lb', description: 'Sweet ripe plantains, perfect for frying and baking.' }
      ]
    };

    let totalAdded = 0;

    // Process each category
    for (const [categorySlug, products] of Object.entries(productData)) {
      console.log(`\n📦 Processing ${categories[categorySlug].name}...`);
      
      for (const product of products) {
        try {
          const price = parsePrice(product.price);
          const unit = extractUnit(product.price);
          const slug = createSlug(product.name);
          
          // Check if product already exists
          const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('slug', slug)
            .single();

          if (existing) {
            console.log(`⚠️  Product already exists: ${product.name}`);
            continue;
          }

          // Add product
          const { data, error } = await supabase
            .from('products')
            .insert({
              name: product.name,
              slug: slug,
              description: product.description,
              price: price,
              category_id: categories[categorySlug].id,
              unit: unit,
              brand: 'KFresh',
              stock_quantity: 50,
              is_available: true,
              is_featured: Math.random() > 0.8, // 20% chance of being featured
              images: [],
              sku: `KF-${slug.toUpperCase().slice(0, 10)}`,
              weight: null,
              compare_price: null,
              origin: categorySlug === 'fresh-produce' || categorySlug === 'tubers-plantain' ? 'Ghana' : null
            })
            .select()
            .single();

          if (error) {
            console.error(`❌ Error adding ${product.name}:`, error);
          } else {
            console.log(`✅ Added: ${product.name} - $${price}`);
            totalAdded++;
          }
        } catch (err) {
          console.error(`❌ Error processing ${product.name}:`, err);
        }
      }
    }

    console.log(`\n🎉 Successfully added ${totalAdded} products to the database!`);

  } catch (error) {
    console.error('❌ Error in main process:', error);
  }
}

addProducts();