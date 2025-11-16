require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// All products with their exact details from the file
const productsData = [
  {
    title: 'Big Foot 25g',
    category: 'Snacks',
    short_description: 'Popular Caribbean snack with bold, crunchy flavor.',
    description: 'Big Foot is a beloved Caribbean snack known for its bold flavors and satisfying crunch. Made with quality ingredients, these snacks are perfect for any time of day. Whether you prefer the kick of spicy or the classic taste of regular, Big Foot delivers authentic Caribbean flavor in every bite. Perfect for snacking at home, work, or on the go.',
    brand: 'Big Foot',
    variants: [
      { size_name: 'Spicy', price: 2.85, sku: 'BIGFOOT-SPICY-25G', is_default: true },
      { size_name: 'Regular', price: 2.85, sku: 'BIGFOOT-REG-25G', is_default: false }
    ]
  },
  {
    title: 'Tastees Jamaican Patties',
    category: 'Frozen Foods',
    short_description: 'Authentic Jamaican patties with flaky golden crust and flavorful filling.',
    description: 'Tastees Jamaican Patties are the authentic taste of Jamaica. Each patty features a flaky, golden crust filled with seasoned, flavorful ingredients. These frozen patties are convenient and delicious - just heat and eat! Perfect for a quick meal, snack, or party appetizer. Each box contains 1.2kg of premium patties. Choose from Regular Spicy Beef, Extra Spicy Beef for heat lovers, or Vegetarian for a meat-free option.',
    brand: 'Tastees',
    variants: [
      { size_name: 'Regular Spicy Beef (1.2kg box)', price: 16.99, sku: 'TASTEES-REG-BEEF', is_default: true },
      { size_name: 'Extra Spicy Beef (1.2kg box)', price: 16.99, sku: 'TASTEES-XSPICY-BEEF', is_default: false },
      { size_name: 'Vegetarian (1.2kg box)', price: 16.99, sku: 'TASTEES-VEG', is_default: false }
    ]
  },
  {
    title: 'Nestle Nido Milk Powder',
    category: 'Canned & Package Goods',
    short_description: 'Rich, creamy instant milk powder fortified with vitamins and minerals.',
    description: 'Nestle Nido Instant Full Cream Milk Powder is a trusted family favorite. Rich, creamy, and nutritious, Nido provides the goodness of real milk in convenient powder form. Fortified with essential vitamins and minerals, it\'s perfect for drinking, cooking, and baking. Easy to prepare - just add water! Available in multiple sizes to suit your family\'s needs. Ideal for families who want quality nutrition and great taste.',
    brand: 'Nestle Nido',
    variants: [
      { size_name: '400g', price: 14.99, sku: 'NIDO-400G', is_default: true },
      { size_name: '900g', price: 38.00, sku: 'NIDO-900G', is_default: false },
      { size_name: '2.5kg', price: 90.00, sku: 'NIDO-2500G', is_default: false }
    ]
  },
  {
    title: 'Peak Milk Powder',
    category: 'Canned & Package Goods',
    short_description: 'Premium full cream milk powder - perfect for the whole family.',
    description: 'Peak Powdered Milk delivers premium quality nutrition for your entire family. Made from full cream milk, Peak is rich in calcium and protein, essential for strong bones and healthy growth. This versatile milk powder is perfect for drinking, adding to tea or coffee, cooking, and baking. The smooth, creamy taste makes it a family favorite. Available in convenient sizes to meet your household needs. Trust Peak for quality and nutrition.',
    brand: 'Peak',
    variants: [
      { size_name: '400g', price: 14.99, sku: 'PEAK-400G', is_default: true },
      { size_name: '900g', price: 38.00, sku: 'PEAK-900G', is_default: false },
      { size_name: '2.5kg', price: 90.00, sku: 'PEAK-2500G', is_default: false }
    ]
  },
  {
    title: 'Bertie\'s Original Pepper Sauce',
    category: 'Hot Pepper Sauce',
    short_description: 'Made with fresh Trinidad Moruga Red and Scotch Bonnet peppers.',
    description: 'Bertie\'s Original Pepper Sauce brings authentic Caribbean heat to your table. Made with fresh Trinidad Moruga Red and Scotch Bonnet Yellow Peppers, this sauce delivers great flavor and heat that tastes just like homemade. The perfect balance of spice and flavor makes it ideal for adding to any dish - from rice and beans to grilled meats and seafood. A little goes a long way! Available in multiple sizes for home use or bulk needs.',
    brand: 'Bertie\'s',
    variants: [
      { size_name: '150ml (5oz)', price: 8.99, sku: 'BERTIE-ORIG-150ML', is_default: true },
      { size_name: '300ml (10oz)', price: 12.99, sku: 'BERTIE-ORIG-300ML', is_default: false },
      { size_name: '500ml (17oz)', price: 14.99, sku: 'BERTIE-ORIG-500ML', is_default: false },
      { size_name: '750ml (25oz)', price: 24.99, sku: 'BERTIE-ORIG-750ML', is_default: false }
    ]
  },
  {
    title: 'Bertie\'s Pimento Pepper Sauce',
    category: 'Hot Pepper Sauce',
    short_description: 'Aromatic pimento pepper sauce with perfect balance of flavor and heat.',
    description: 'Bertie\'s Pimento Pepper Sauce offers a unique Caribbean flavor experience. Featuring aromatic pimento peppers (allspice), this sauce provides a perfect balance of flavor and heat. The warm, spicy notes of pimento combined with hot peppers create a distinctive taste that enhances any dish. Great for marinades, dipping, or adding to your favorite Caribbean recipes. Experience the authentic taste of the islands!',
    brand: 'Bertie\'s',
    variants: [
      { size_name: '300ml (10oz)', price: 12.99, sku: 'BERTIE-PIMENTO-300ML', is_default: true }
    ]
  },
  {
    title: 'Bertie\'s Scorpion Pepper Sauce',
    category: 'Hot Pepper Sauce',
    short_description: 'Extremely hot sauce made with Trinidad Scorpion peppers.',
    description: 'Bertie\'s Scorpion Pepper Sauce is not for the faint of heart! Made with Trinidad Scorpion peppers, one of the world\'s hottest peppers, this sauce delivers intense, fiery heat. Despite the extreme spice level, it maintains excellent flavor. Perfect for heat seekers who want to add serious kick to their meals. Use sparingly - a drop goes a long way! Handle with care and enjoy the ultimate heat experience.',
    brand: 'Bertie\'s',
    variants: [
      { size_name: '150ml (5oz)', price: 15.99, sku: 'BERTIE-SCORP-150ML', is_default: true }
    ]
  },
  {
    title: 'Matouk\'s Hot Pepper Sauce 10oz',
    category: 'Hot Pepper Sauce',
    short_description: 'Trinidad\'s favorite hot sauce with bold, authentic flavor.',
    description: 'Matouk\'s Hot Pepper Sauce is a Trinidad and Tobago classic that has been a household staple for generations. This bold, flavorful sauce offers the perfect heat level for everyday use. Made with quality peppers and traditional recipes, it adds authentic Caribbean zest to any meal. Perfect for rice, meat, fish, and vegetables. A must-have condiment for lovers of Caribbean cuisine.',
    brand: 'Matouk\'s',
    variants: [
      { size_name: '10oz', price: 6.66, sku: 'MATOUK-HOT-10OZ', is_default: true }
    ]
  },
  {
    title: 'Matouks Calypso Hot Pepper Sauce 10oz',
    category: 'Hot Pepper Sauce',
    short_description: 'Caribbean classic with medium heat and exceptional flavor.',
    description: 'Matouk\'s Calypso Hot Pepper Sauce captures the vibrant spirit of the Caribbean. This medium-heat sauce is known for its exceptional flavor balance - spicy enough to be exciting but not overwhelming. The Calypso blend uses select peppers and seasonings to create a sauce that enhances rather than overpowers your food. Perfect for those who want authentic Caribbean flavor with manageable heat.',
    brand: 'Matouk\'s',
    variants: [
      { size_name: '10oz', price: 6.66, sku: 'MATOUK-CALYP-10OZ', is_default: true }
    ]
  },
  {
    title: 'Matouk\'s Chadon Beni Hot Sauce 5.3oz',
    category: 'Hot Pepper Sauce',
    short_description: 'Distinctive chadon beni flavor with moderate heat.',
    description: 'Matouk\'s Chadon Beni Hot Sauce features the distinctive flavor of chadon beni (culantro), a beloved Caribbean herb. This aromatic sauce combines the unique taste of chadon beni with hot peppers for a flavor profile that\'s truly special. The moderate heat level makes it perfect for everyday use, while the herbal notes add complexity to any dish. A favorite among Caribbean food enthusiasts.',
    brand: 'Matouk\'s',
    variants: [
      { size_name: '5.3oz', price: 6.66, sku: 'MATOUK-CHADON-5OZ', is_default: true }
    ]
  },
  {
    title: 'Matouk\'s Trinidad Scorpion Pepper Sauce 10oz',
    category: 'Hot Pepper Sauce',
    short_description: 'Extreme heat with authentic Caribbean flavor - not for beginners!',
    description: 'Matouk\'s Trinidad Scorpion Pepper Sauce brings the heat of one of the world\'s hottest peppers - the Trinidad Scorpion! This sauce is for serious heat lovers only. Despite its extreme spice level, it maintains the authentic Caribbean flavors Matouk\'s is known for. Use with extreme caution and in very small amounts. Perfect for those who want to test their heat tolerance or add serious fire to their dishes.',
    brand: 'Matouk\'s',
    variants: [
      { size_name: '10oz', price: 10.99, sku: 'MATOUK-SCORP-10OZ', is_default: true }
    ]
  },
  {
    title: 'Matouk\'s Tamarind Chutney 12oz',
    category: 'Sauces & Condiments',
    short_description: 'Sweet and tangy tamarind sauce - perfect for doubles and samosas.',
    description: 'Matouk\'s Tamarind Chutney is a sweet and tangy Caribbean condiment that\'s essential for authentic Trinidad street food. Made from tamarind fruit, this chutney provides the perfect balance of sweet and sour flavors. It\'s the traditional accompaniment for doubles, samosas, pholourie, and other savory snacks. Also great as a dipping sauce or marinade ingredient. Experience authentic Caribbean flavor!',
    brand: 'Matouk\'s',
    variants: [
      { size_name: '12oz', price: 6.99, sku: 'MATOUK-TAMAR-12OZ', is_default: true }
    ]
  },
  {
    title: 'Matouck\'s Soca hot Sauce 10oz',
    category: 'Hot Pepper Sauce',
    short_description: 'Lively, flavorful hot sauce with just the right amount of heat.',
    description: 'Matouk\'s Soca Hot Sauce lives up to its name with lively, vibrant flavor! This sauce captures the festive spirit of Caribbean soca music with its balanced heat and bold taste. Not too mild, not too hot - just right for adding zest to your everyday meals. Perfect for those who want authentic Caribbean flavor without extreme heat. Great on everything from eggs to grilled meats.',
    brand: 'Matouk\'s',
    variants: [
      { size_name: '10oz', price: 6.66, sku: 'MATOUK-SOCA-10OZ', is_default: true }
    ]
  },
  {
    title: 'Slap Ya Mama Cajun Seasoning',
    category: 'Spices/Herbs/Seasonings',
    short_description: 'Authentic Louisiana Cajun spice blend - premium quality ingredients.',
    description: 'Slap Ya Mama Cajun Seasoning brings authentic Louisiana flavor to your kitchen. This premium spice blend combines traditional Cajun spices in perfect proportions to enhance any dish. Whether you\'re cooking seafood, chicken, vegetables, or rice, Slap Ya Mama delivers that authentic Cajun kick. Choose from Original Blend for classic flavor, Hot for extra spice, or Low Sodium for health-conscious cooking. A little goes a long way!',
    brand: 'Slap Ya Mama',
    variants: [
      { size_name: 'Original Blend (227g)', price: 12.00, sku: 'SLAPMAMA-ORIG-227G', is_default: true },
      { size_name: 'Hot Cajun Seasoning (227g)', price: 12.99, sku: 'SLAPMAMA-HOT-227G', is_default: false },
      { size_name: 'Low Sodium Cajun Seasoning (170g)', price: 12.99, sku: 'SLAPMAMA-LOWSOD-170G', is_default: false }
    ]
  },
  {
    title: 'KFresh Shito',
    category: 'Sauces & Condiments',
    short_description: 'Traditional Ghanaian hot pepper sauce made with shrimp, ginger, and spices.',
    description: 'KFresh Shito is an authentic Ghanaian black pepper sauce that\'s rich, savory, and wonderfully spicy. Made with shrimp, ginger, garlic, and aromatic spices fried in oil, this traditional sauce is a staple in West African cuisine. Perfect with rice, fufu, yam, plantain, or as a spread on bread. The complex flavors develop from slow-cooking premium ingredients. Available in convenient sizes including bulk 5L for restaurants and regular home use.',
    brand: 'KFresh',
    variants: [
      { size_name: '250ml', price: 8.00, sku: 'KFRESH-SHITO-250ML', is_default: true },
      { size_name: '500ml', price: 16.00, sku: 'KFRESH-SHITO-500ML', is_default: false },
      { size_name: '5L', price: 140.00, sku: 'KFRESH-SHITO-5L', is_default: false }
    ]
  },
  {
    title: 'White Gari',
    category: 'Canned & Package Goods',
    short_description: 'Premium fermented cassava flour - essential West African staple.',
    description: 'White Gari is a premium quality fermented cassava flour that\'s an essential staple in West African cuisine. Made from carefully processed cassava, this versatile product can be consumed in multiple ways - drink it cold with sugar and groundnuts for a refreshing snack, or prepare it hot to make eba (swallow) to accompany your favorite soups and stews. The fine texture and neutral flavor make it perfect for any preparation. Available in family-friendly sizes.',
    brand: null,
    variants: [
      { size_name: '3.5lbs', price: 7.50, sku: 'GARI-WHITE-3_5LBS', is_default: true },
      { size_name: '10lbs', price: 20.00, sku: 'GARI-WHITE-10LBS', is_default: false },
      { size_name: '16lbs', price: 32.00, sku: 'GARI-WHITE-16LBS', is_default: false }
    ]
  },
  {
    title: 'Ijebu Garri',
    category: 'Canned & Package Goods',
    short_description: 'Fine-grain gari from Ijebu region with smooth texture and excellent quality.',
    description: 'Ijebu Gari is premium fine-grain cassava flour from the renowned Ijebu region of Nigeria. Known for its exceptionally smooth texture and superior quality, Ijebu gari is the choice of connoisseurs. The fine grains dissolve easily and create a smooth, lump-free consistency when prepared. Perfect for drinking with cold water, sugar, and groundnuts, or for making silky smooth eba. Experience the difference that quality makes!',
    brand: null,
    variants: [
      { size_name: '4lbs', price: 8.00, sku: 'GARI-IJEBU-4LBS', is_default: true },
      { size_name: '10lbs', price: 20.00, sku: 'GARI-IJEBU-10LBS', is_default: false },
      { size_name: '16lbs', price: 32.00, sku: 'GARI-IJEBU-16LBS', is_default: false }
    ]
  },
  {
    title: 'Yellow Gari',
    category: 'Canned & Package Goods',
    short_description: 'Traditional fermented cassava with palm oil - rich flavor and color.',
    description: 'Yellow Gari is traditional West African fermented cassava flour enhanced with palm oil, giving it a beautiful golden color and rich, distinctive flavor. The palm oil adds nutritional value and creates a more flavorful base for your meals. Popular for making eba with a richer taste and lovely color, or for drinking with additions like milk and sugar. The robust flavor pairs perfectly with spicy soups and stews.',
    brand: null,
    variants: [
      { size_name: '4lbs', price: 8.00, sku: 'GARI-YELLOW-4LBS', is_default: true },
      { size_name: '10lbs', price: 20.00, sku: 'GARI-YELLOW-10LBS', is_default: false },
      { size_name: '16lbs', price: 32.00, sku: 'GARI-YELLOW-16LBS', is_default: false }
    ]
  },
  {
    title: 'Vitamalt',
    category: 'Drinks/Beverages',
    short_description: 'Non-alcoholic malt beverage packed with vitamins - refreshing and nutritious.',
    description: 'Vitamalt is a beloved Caribbean non-alcoholic malt beverage that\'s both refreshing and nutritious. Packed with vitamins and minerals, this smooth malt drink is perfect for any time of day. The Classic flavor offers traditional malt taste, Ginger adds a zingy kick, while Coconut & Hibiscus provides a tropical twist. Each 6-pack is perfect for sharing with family or enjoying throughout the week. A healthy, delicious alternative to sodas!',
    brand: 'Vitamalt',
    variants: [
      { size_name: 'Classic 6packs', price: 15.00, sku: 'VITAMALT-CLASS-6PK', is_default: true },
      { size_name: 'Ginger 6packs', price: 15.00, sku: 'VITAMALT-GING-6PK', is_default: false },
      { size_name: 'Coconut & Hibiscus 6packs', price: 15.00, sku: 'VITAMALT-COCO-6PK', is_default: false }
    ]
  },
  // Single products
  {
    title: 'Roasted Peanuts 510g',
    price: 9.99,
    category: 'Snacks',
    short_description: 'Premium roasted peanuts - crunchy, flavorful, and freshly roasted.',
    description: 'Our premium Roasted Peanuts are carefully selected and roasted to perfection. These crunchy, flavorful peanuts are perfect for snacking any time of day. High in protein and healthy fats, they make a nutritious snack choice. Great for parties, lunch boxes, or keeping at your desk. The 510g package provides plenty to share or enjoy over time. Freshly roasted for maximum flavor and crunch!',
    brand: null
  },
  {
    title: 'De Rica Tomato 400g',
    price: 8.99,
    category: 'Canned & Package Goods',
    short_description: 'Rich, concentrated tomato paste - essential for stews and soups.',
    description: 'De Rica Tomato Paste is a premium quality concentrated tomato product that\'s essential for authentic African cooking. The rich, deep flavor adds body and color to stews, soups, jollof rice, and sauces. Made from ripe, quality tomatoes, this paste provides intense tomato flavor without excess water. The 400g can is perfect for family meals and recipe preparations. A pantry staple you\'ll reach for again and again!',
    brand: 'De Rica'
  },
  {
    title: 'De Rica Tomato 210g',
    price: 4.99,
    category: 'Canned & Package Goods',
    short_description: 'Rich, concentrated tomato paste - perfect size for smaller meals.',
    description: 'De Rica Tomato Paste in the convenient 210g size is perfect for smaller households or specific recipes. This premium concentrated tomato paste delivers rich, authentic flavor to your cooking. Ideal for single portions, trying new recipes, or when you need just the right amount. Same quality De Rica taste in a more manageable size. Essential for stews, rice dishes, and sauces.',
    brand: 'De Rica'
  },
  {
    title: 'Salted Pig Tail',
    price: 6.00,
    category: 'Frozen Meats',
    short_description: 'Traditional Caribbean ingredient - adds rich flavor to soups and stews.',
    description: 'Salted Pig Tail is a traditional Caribbean and soul food ingredient that adds incredible depth and richness to dishes. The salting process preserves the meat and intensifies its flavor. Perfect for seasoning rice and peas, soups, stews, and traditional dishes. The rich, savory taste transforms simple ingredients into soul-satisfying meals. Sold by the pound - use sparingly as a little adds tremendous flavor!',
    brand: null,
    unit: 'lb'
  },
  {
    title: 'Salted Pig Feet',
    price: 6.00,
    category: 'Frozen Meats',
    short_description: 'Classic Caribbean ingredient - perfect for soups and stews.',
    description: 'Salted Pig Feet are a beloved ingredient in Caribbean and Southern cooking. The salting process creates a deeply flavorful product that\'s perfect for long-cooking dishes. Add to soups, stews, and beans for rich, meaty flavor and wonderful texture. The feet also add body and gelatin to broths. A traditional ingredient that brings authentic taste to classic recipes. Sold by the pound.',
    brand: null,
    unit: 'lb'
  },
  {
    title: 'Salted Tilapia/Koobi',
    price: 10.00,
    category: 'Frozen Fish & Seafood',
    short_description: 'Traditional West African salted fish - essential for authentic soups.',
    description: 'Koobi (Salted Tilapia) is a cornerstone ingredient in authentic West African cuisine. This traditionally preserved fish provides intense, savory umami flavor to soups and stews. The salting and drying process creates a unique taste that cannot be replicated with fresh fish. Essential for traditional palm nut soup, light soup, and many other beloved dishes. A true taste of home for West African food lovers!',
    brand: null
  },
  {
    title: 'Mauby 500ml',
    price: 5.00,
    category: 'Drinks/Beverages',
    short_description: 'Traditional Caribbean drink made from tree bark - refreshingly unique.',
    description: 'Mauby is a traditional Caribbean drink with a uniquely bitter-sweet flavor that\'s incredibly refreshing. Made from the bark of the mauby tree, this beverage has been enjoyed for generations. The slightly bitter taste is an acquired one that grows on you, and it\'s believed to have various health benefits. Served chilled, it\'s perfect for hot days. Experience this authentic taste of the Caribbean!',
    brand: null,
    unit: '500ml'
  },
  {
    title: 'Matooki 1kg',
    price: 11.99,
    category: 'Fresh Fruits & Vegetables',
    short_description: 'Green cooking bananas - essential East African ingredient.',
    description: 'Matooki (also known as Matoke) are green cooking bananas that are a staple food in East African cuisine. Unlike sweet bananas, these are meant to be cooked - steamed, boiled, or fried. They have a mild, starchy flavor similar to potatoes and are incredibly versatile. Perfect for traditional East African dishes, stews, or as a side dish. The 1kg package provides enough for family meals.',
    brand: null,
    unit: '1kg'
  },
  {
    title: 'Roasted Peanuts',
    price: 11.00,
    category: 'Snacks',
    short_description: 'Freshly roasted, crunchy peanuts - perfect for snacking or cooking.',
    description: 'Premium quality Roasted Peanuts that are perfect for snacking, cooking, or baking. These freshly roasted peanuts deliver satisfying crunch and rich, nutty flavor. High in protein and healthy fats, they make an excellent snack choice. Use them whole for snacking, chop them for baking, or grind them into homemade peanut butter. Versatile and delicious!',
    brand: null
  },
  {
    title: 'Kenkey',
    price: 3.99,
    category: 'Canned & Package Goods',
    short_description: 'Traditional Ghanaian fermented corn dough - ready to eat.',
    description: 'Kenkey is a traditional Ghanaian staple made from fermented corn dough. This authentic, ready-to-eat product is wrapped and steamed, creating a slightly sour, satisfying taste. Typically enjoyed with fried fish, hot pepper sauce (shito), and onions for a complete meal. A beloved street food and home-cooked favorite. Experience this authentic taste of Ghana!',
    brand: null
  },
  {
    title: 'Momoni (frozen)',
    price: 8.99,
    category: 'Frozen Fish & Seafood',
    short_description: 'Traditional West African salted/smoked fish - frozen for freshness.',
    description: 'Momoni is traditional West African salted and smoked fish that adds authentic flavor to soups and stews. The combination of salting and smoking creates a complex, deeply savory taste that\'s essential for many traditional recipes. Frozen to maintain freshness and quality. Perfect for palm nut soup, light soup, and other West African dishes. A little goes a long way in adding authentic taste!',
    brand: null
  },
  {
    title: 'Maggi Crayfish (6pcs)',
    price: 3.99,
    category: 'Spices/Herbs/Seasonings',
    short_description: 'Authentic crayfish flavor cubes - perfect for soups and stews.',
    description: 'Maggi Crayfish Flavour Cubes bring authentic seafood taste to your cooking in convenient cube form. These seasoning cubes provide rich crayfish flavor that enhances soups, stews, rice dishes, and sauces. Simply crumble a cube into your cooking for instant depth of flavor. Essential for African cuisine and beloved by home cooks. Pack of 6 cubes.',
    brand: 'Maggi'
  },
  {
    title: 'Maggi Chicken (6pcs)',
    price: 3.99,
    category: 'Spices/Herbs/Seasonings',
    short_description: 'Rich chicken flavor cubes - essential African seasoning.',
    description: 'Maggi Chicken Flavour Cubes are an essential seasoning in African cooking. These convenient cubes provide rich, savory chicken flavor that enhances any dish. Perfect for rice, soups, stews, sauces, and vegetables. Simply dissolve a cube in your cooking for instant flavor boost. A pantry staple that makes cooking easier and tastier. Pack of 6 cubes.',
    brand: 'Maggi'
  },
  {
    title: 'Suya Spice/Pepper 125g',
    price: 8.25,
    category: 'Spices/Herbs/Seasonings',
    short_description: 'Authentic West African grilling spice blend with peanuts and ginger.',
    description: 'Suya Spice is the authentic West African spice blend used for Nigeria\'s famous suya (grilled meat). This aromatic blend contains ground peanuts, ginger, cayenne pepper, and traditional spices. Perfect for grilling beef, chicken, or fish - simply coat your meat with the spice and grill for authentic flavor. Also great as a dry rub or seasoning. The 125g package provides plenty for multiple grilling sessions.',
    brand: null
  },
  {
    title: 'Chilli Pepper Ground',
    price: 6.99,
    category: 'Spices/Herbs/Seasonings',
    short_description: 'Fiery hot ground pepper - add intense heat to any dish.',
    description: 'Ground Chilli Pepper is an essential spice for those who love heat! This fiery powder adds intense spiciness to soups, stews, sauces, and any dish that needs a kick. Made from quality dried peppers and finely ground for easy use. A little goes a long way, so use according to your heat preference. Essential for authentic African and Caribbean cooking.',
    brand: null
  },
  {
    title: 'Egusi Ground',
    price: 8.99,
    category: 'Spices/Herbs/Seasonings',
    short_description: 'Finely ground melon seeds - essential for Nigerian egusi soup.',
    description: 'Ground Egusi (melon seeds) is an essential ingredient for authentic Nigerian egusi soup, one of West Africa\'s most beloved dishes. These premium melon seeds are finely ground for convenience. The seeds add rich, nutty flavor and create the signature thick texture of egusi soup. Also used in other traditional dishes. Premium quality ensures authentic taste and texture.',
    brand: null
  },
  {
    title: 'KFresh Body and Hair Cream',
    price: 19.99,
    category: 'Beauty & Personal Care',
    short_description: 'Moisturizing cream for skin and hair with natural ingredients.',
    description: 'KFresh Body and Hair Cream is a versatile moisturizing product perfect for both skin and hair care. Made with natural ingredients, this cream keeps skin soft, smooth, and hydrated while also nourishing and conditioning hair. The rich formula absorbs well without feeling greasy. Perfect for dry skin, rough patches, and managing natural hair. Suitable for the whole family.',
    brand: 'KFresh'
  }
]

async function ensureCategoryExists(categoryName) {
  // First, try to find existing category
  const { data: existing } = await supabase
    .from('categories')
    .select('*')
    .ilike('name', categoryName)
    .limit(1)

  if (existing && existing.length > 0) {
    return existing[0]
  }

  // If not found, create it
  const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const { data: newCategory, error } = await supabase
    .from('categories')
    .insert([{
      name: categoryName,
      slug: slug,
      description: `${categoryName} products`,
      is_active: true
    }])
    .select()
    .single()

  if (error) {
    console.log(`⚠️  Error creating category ${categoryName}:`, error.message)
    return null
  }

  console.log(`✅ Created new category: ${categoryName}`)
  return newCategory
}

async function addAllProductsComplete() {
  console.log('🚀 Adding all products with complete details...\n')

  let addedProducts = 0
  let addedVariants = 0
  let errors = []

  for (const productData of productsData) {
    // Ensure category exists
    const category = await ensureCategoryExists(productData.category)

    if (!category) {
      errors.push(`Failed to get/create category for: ${productData.title}`)
      continue
    }

    // Determine base price
    const basePrice = productData.price || Math.min(...productData.variants.map(v => v.price))

    // Create product slug
    const slug = productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(7)

    // Prepare product data
    const product = {
      name: productData.title,
      slug: slug,
      short_description: productData.short_description,
      description: productData.description,
      price: basePrice,
      category_id: category.id,
      brand: productData.brand,
      unit: productData.unit || null,
      stock_quantity: 100,
      is_featured: false,
      is_available: true
    }

    // Insert product
    const { data: newProduct, error: prodError } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single()

    if (prodError) {
      errors.push(`Error adding ${productData.title}: ${prodError.message}`)
      console.log(`❌ ${productData.title}: ${prodError.message}`)
      continue
    }

    console.log(`✅ ${productData.title} - $${basePrice} (${category.name})`)
    addedProducts++

    // Add variants if they exist
    if (productData.variants) {
      for (const variant of productData.variants) {
        const variantData = {
          product_id: newProduct.id,
          size_name: variant.size_name,
          price: variant.price,
          compare_price: null,
          stock_quantity: 100,
          sku: variant.sku,
          is_default: variant.is_default
        }

        const { error: varError } = await supabase
          .from('product_variants')
          .insert([variantData])

        if (varError) {
          errors.push(`Error adding variant ${variant.size_name} for ${productData.title}: ${varError.message}`)
        } else {
          console.log(`   ↳ ${variant.size_name} - $${variant.price}`)
          addedVariants++
        }
      }
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('✨ COMPLETE SUMMARY')
  console.log('='.repeat(80))
  console.log(`✅ Products added: ${addedProducts}`)
  console.log(`✅ Variants added: ${addedVariants}`)
  console.log(`❌ Errors: ${errors.length}`)

  if (errors.length > 0) {
    console.log('\n⚠️  Errors:')
    errors.forEach(err => console.log(`   - ${err}`))
  }

  const { data: finalCount } = await supabase.from('products').select('count')
  console.log(`\n📊 Total products in database: ${finalCount[0].count}`)
}

addAllProductsComplete()
