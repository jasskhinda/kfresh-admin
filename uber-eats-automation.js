const puppeteer = require('puppeteer')
const readline = require('readline')

// ============================================================================
// UBER EATS MENU DATA - All products with prices and modifiers
// ============================================================================

const MENU_DATA = {
  categories: [
    {
      name: 'African Rice Meals',
      items: [
        {
          name: 'Nigerian Jollof Rice',
          price: 23.10,
          description: 'Comes with Goat stew or Beef stew or grilled Chicken or Fish (fried whiting fish), Fried Plantains, Coleslaw',
          modifiers: [
            { name: '2 Eggs (boiled)', price: 3.12 },
            { name: 'KFresh Shito Regular Spicy', price: 4.62 },
            { name: 'KFresh Shito Extra Spicy', price: 4.62 },
            { name: 'Jollof Stew (no meat)', price: 4.04 },
            { name: 'Jollof Stew (with meat)', price: 5.78 },
            { name: 'Fried Ripe Plantains', price: 8.09 },
            { name: 'Coleslaw', price: 5.20 }
          ]
        },
        {
          name: 'Ghanaian Jollof Rice',
          price: 23.10,
          description: 'Comes with Goat stew or Beef stew or grilled Chicken or Fish (fried whiting fish), Fried Plantains, Coleslaw',
          modifiers: [
            { name: '2 Eggs (boiled)', price: 3.12 },
            { name: 'KFresh Shito Regular Spicy', price: 4.62 },
            { name: 'KFresh Shito Extra Spicy', price: 4.62 },
            { name: 'Jollof Stew (no meat)', price: 4.04 },
            { name: 'Jollof Stew (with meat)', price: 5.78 },
            { name: 'Fried Ripe Plantains', price: 8.09 },
            { name: 'Coleslaw', price: 5.20 }
          ]
        },
        {
          name: 'Waakye',
          price: 25.41,
          description: 'Comes with Goat stew or Beef stew or grilled Chicken or Fish (fried whiting fish), Fried Plantains, Coleslaw, Gari, Spaghetti',
          modifiers: [
            { name: '2 Eggs (boiled)', price: 3.12 },
            { name: 'KFresh Shito Regular Spicy', price: 4.62 },
            { name: 'KFresh Shito Extra Spicy', price: 4.62 },
            { name: 'Waakye Stew (no meat)', price: 4.04 },
            { name: 'Waakye Stew (with meat)', price: 5.78 },
            { name: 'Fried Ripe Plantains', price: 8.09 },
            { name: 'Coleslaw', price: 5.20 },
            { name: 'Gari', price: 2.89 },
            { name: 'Spaghetti', price: 4.04 },
            { name: 'Waakye in Leaf wrap', price: 4.04 }
          ]
        }
      ]
    },
    {
      name: 'Individual Side Orders',
      items: [
        { name: 'Beef (in stew)', price: 23.10, description: '' },
        { name: 'Goat (in stew)', price: 23.10, description: '' },
        { name: 'Oxtail', price: 28.88, description: '' },
        { name: 'Curry Goat', price: 28.88, description: '' },
        { name: 'Rice & Peas', price: 13.86, description: '' },
        { name: 'Jollof Rice', price: 13.86, description: '' },
        { name: 'Waakye Rice', price: 13.86, description: '' },
        { name: 'Grilled Tilapia', price: 17.33, description: '' },
        { name: 'Jerk Chicken', price: 13.86, description: '' },
        { name: 'Curry Chicken', price: 17.33, description: '' },
        { name: 'Roti Wrap (with boneless chicken)', price: 19.06, description: '' },
        { name: 'Roti Wrap (with boneless goat)', price: 19.06, description: '' },
        {
          name: 'Peanut Soup with assorted meat',
          price: 17.33,
          description: '',
          modifiers: [
            { name: 'Hot Pepper Sauce', price: 2.89 },
            { name: 'Okra', price: 2.89 }
          ]
        },
        {
          name: 'Light Soup with assorted Meat & Fish',
          price: 17.33,
          description: '',
          modifiers: [
            { name: 'Hot Pepper Sauce', price: 2.89 },
            { name: 'Okra', price: 2.89 }
          ]
        },
        {
          name: 'Palm Soup with assorted Meat & Fish',
          price: 17.33,
          description: '',
          modifiers: [
            { name: 'Hot Pepper Sauce', price: 2.89 },
            { name: 'Okra', price: 2.89 }
          ]
        }
      ]
    },
    {
      name: 'Caribbean Rice Meals',
      items: [
        {
          name: 'Oxtail with Rice & Peas',
          price: 28.88,
          description: '',
          modifiers: [
            { name: 'Avocado', price: 4.04 },
            { name: 'Oxtail (portion)', price: 6.35 },
            { name: 'Oxtail Gravy', price: 2.89 },
            { name: 'Curry Goat (stew only)', price: 2.89 },
            { name: 'Hot Pepper Sauce', price: 2.89 }
          ]
        },
        {
          name: 'Jerk Chicken with Rice & Peas',
          price: 23.10,
          description: '',
          modifiers: [
            { name: '2 piece jerk chicken', price: 9.82 },
            { name: 'Oxtail Gravy', price: 2.99 },
            { name: 'Curry Goat (Stew only)', price: 2.89 },
            { name: 'Hot Pepper Sauce', price: 2.89 }
          ]
        },
        {
          name: 'Curry Goat with Rice & Peas',
          price: 28.88,
          description: '',
          modifiers: [
            { name: 'Avocado', price: 4.04 },
            { name: 'Curry Goat (portion)', price: 6.35 },
            { name: 'Curry Goat (Stew only)', price: 2.89 },
            { name: 'Oxtail Gravy', price: 2.89 },
            { name: 'Hot Pepper Sauce', price: 2.89 }
          ]
        },
        {
          name: 'Curry Chicken with Rice & Peas',
          price: 23.10,
          description: '',
          modifiers: [
            { name: 'Avocado', price: 4.04 },
            { name: 'Curry Chicken (portion)', price: 6.35 },
            { name: 'Curry Chicken (Stew only)', price: 2.89 },
            { name: 'Oxtail Gravy', price: 2.89 },
            { name: 'Hot Pepper Sauce', price: 2.89 }
          ]
        }
      ]
    },
    {
      name: 'Jamaican Patties',
      items: [
        { name: 'Regular Spicy (dozen/box)', price: 19.63, description: '' },
        { name: 'Extra Spicy (dozen/box)', price: 19.63, description: '' },
        { name: 'Vegetarian (dozen/box)', price: 19.63, description: '' },
        { name: 'Chicken Extra Spicy (dozen/box)', price: 19.63, description: '' }
      ]
    },
    {
      name: 'Soup Meals',
      items: [
        {
          name: 'Peanut Soup',
          price: 23.10,
          description: '',
          modifiers: [
            { name: 'Hot Pepper Sauce', price: 2.89 },
            { name: 'Okra', price: 2.89 }
          ]
        },
        {
          name: 'Light Soup',
          price: 23.10,
          description: '',
          modifiers: [
            { name: 'Hot Pepper Sauce', price: 2.89 },
            { name: 'Okra', price: 2.89 }
          ]
        },
        {
          name: 'Palm Soup',
          price: 23.10,
          description: '',
          modifiers: [
            { name: 'Hot Pepper Sauce', price: 2.89 },
            { name: 'Okra', price: 2.89 }
          ]
        }
      ]
    },
    {
      name: 'Individual Swallows',
      items: [
        { name: 'Fufu', price: 10.38, description: '' },
        { name: 'Rice Balls / Omotuo', price: 10.38, description: '' },
        { name: 'Banku', price: 10.38, description: '' }
      ]
    },
    {
      name: 'Ghanaian Specials',
      items: [
        { name: 'Kenkey (2 Kenkey) meal', price: 23.10, description: '' },
        {
          name: 'Gobe/Red Red in leaf wrap',
          price: 25.41,
          description: '',
          modifiers: [
            { name: 'Egg (boiled)', price: 3.12 },
            { name: 'Hot Pepper Sauce', price: 2.89 }
          ]
        },
        {
          name: 'Gobe/Red Red',
          price: 23.39,
          description: '',
          modifiers: [
            { name: 'Egg (boiled)', price: 3.12 },
            { name: 'Hot Pepper Sauce', price: 2.89 }
          ]
        }
      ]
    },
    {
      name: 'KFresh Shito',
      items: [
        { name: 'KFresh Shito 5L', price: 173.25, description: '' },
        { name: 'KFresh Shito 2.5L', price: 86.63, description: '' },
        { name: 'KFresh Shito 500ml', price: 19.63, description: '' },
        { name: 'KFresh Shito 250ml', price: 10.38, description: '' }
      ]
    },
    {
      name: 'Vegetarian Meals',
      items: [
        { name: 'Roti Wrap with Curry Potatoes & Chickpeas', price: 15.59, description: '' },
        { name: 'Gobe/Red Red in leaf wrap (Vegetarian)', price: 25.41, description: '' },
        { name: 'Gobe/Red Red (Vegetarian)', price: 23.39, description: '' }
      ]
    },
    {
      name: 'Platters / Party Trays',
      items: [
        { name: 'Jerk Chicken Platter', price: 115.50, description: '' },
        { name: 'Grilled Tilapia Platter', price: 173.25, description: '' },
        { name: 'Curry Goat Platter', price: 173.25, description: '' },
        { name: 'Jollof Platter', price: 57.75, description: '' },
        { name: 'Waakye Platter', price: 75.08, description: '' },
        { name: 'Oxtail Platter', price: 173.25, description: '' },
        { name: 'Rice & Peas Platter', price: 57.75, description: '' },
        { name: 'Curry Chicken Platter', price: 115.50, description: '' },
        { name: 'Fried Ripe Plantain Platter', price: 57.75, description: '' },
        { name: 'Gobe/Red Red in leaf wrap Platter', price: 60.06, description: '' },
        { name: 'Gobe/Red Red Platter', price: 58.04, description: '' },
        { name: 'Meat Pie (10 pcs)', price: 40.43, description: '' },
        { name: 'Chin Chin', price: 69.18, description: '' },
        { name: 'Puff Puff (80 pcs)', price: 80.85, description: '' }
      ]
    },
    {
      name: 'Large Container of Soup',
      items: [
        { name: 'Nigerian Egusi Soup (Large)', price: 115.50, description: '' },
        { name: 'Peanut Soup (Large)', price: 115.50, description: '' },
        { name: 'Light Soup (Large)', price: 115.50, description: '' },
        { name: 'Palm Soup (Large)', price: 115.50, description: '' }
      ]
    }
  ]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer)
    })
  })
}

// ============================================================================
// MAIN AUTOMATION - Updated for Uber Eats UI
// ============================================================================

async function main() {
  console.log('=' .repeat(70))
  console.log('          UBER EATS MENU MAKER AUTOMATION v2')
  console.log('=' .repeat(70))
  console.log('')
  console.log('This script connects to your EXISTING Chrome browser.')
  console.log('')
  console.log('SETUP (one time):')
  console.log('1. Close Chrome completely')
  console.log('2. Open Chrome with this command:')
  console.log('   /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222')
  console.log('3. Log into Uber Eats Menu Maker in that Chrome window')
  console.log('4. Navigate to the Menu page')
  console.log('5. Then run this script')
  console.log('')

  await askQuestion('Press ENTER when Chrome is open with Uber Eats logged in...')

  // Connect to existing Chrome browser
  let browser
  try {
    browser = await puppeteer.connect({
      browserURL: 'http://localhost:9222',
      defaultViewport: null
    })
    console.log('✅ Connected to existing Chrome browser!')
  } catch (e) {
    console.log('')
    console.log('❌ Could not connect to Chrome. Make sure you:')
    console.log('   1. Closed all Chrome windows')
    console.log('   2. Opened Chrome with: /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222')
    console.log('')
    console.log('Error:', e.message)
    process.exit(1)
  }

  // Get existing pages and find Uber Eats tab, or use first tab
  const pages = await browser.pages()
  let page = pages.find(p => p.url().includes('ubereats.com')) || pages[0]

  if (!page.url().includes('ubereats.com')) {
    console.log('\n📍 Navigating to Uber Eats Menu Maker...')
    await page.goto('https://merchants.ubereats.com/manager/menumaker/16ea266a-1abd-5cfb-b0f8-f5bee42fd370/overview', {
      waitUntil: 'networkidle2',
      timeout: 60000
    })
  }

  console.log('')
  console.log('Current page:', page.url())
  console.log('')
  await askQuestion('Make sure you are on the Menu Maker page, then press ENTER...')

  await wait(2000)

  console.log('\n🚀 Starting menu automation...\n')

  // Count totals
  let totalCategories = MENU_DATA.categories.length
  let totalItems = MENU_DATA.categories.reduce((sum, cat) => sum + cat.items.length, 0)

  console.log(`📊 Menu Summary:`)
  console.log(`   Categories: ${totalCategories}`)
  console.log(`   Items: ${totalItems}`)
  console.log('')

  // STEP 1: First, go to Categories tab and create all categories
  console.log('=' .repeat(70))
  console.log('STEP 1: Creating Categories')
  console.log('=' .repeat(70))
  console.log('')

  // Click on Categories tab
  try {
    await page.click('a[href*="categories"], button:has-text("Categories")')
    await wait(1500)
  } catch (e) {
    console.log('⚠️  Please click on the "Categories" tab manually, then press ENTER...')
    await askQuestion('')
  }

  // Create each category
  for (let i = 0; i < MENU_DATA.categories.length; i++) {
    const category = MENU_DATA.categories[i]
    console.log(`\n📁 [${i + 1}/${totalCategories}] Creating category: ${category.name}`)

    try {
      // Click "+ Add" button
      const addButtons = await page.$$('button')
      let clicked = false
      for (const btn of addButtons) {
        const text = await page.evaluate(el => el.textContent, btn)
        if (text && text.includes('Add')) {
          await btn.click()
          clicked = true
          break
        }
      }

      if (!clicked) {
        console.log('   ⚠️  Click "+ Add" button to add category, then press ENTER...')
        await askQuestion('')
      }

      await wait(1000)

      // Type category name in the input field
      const inputs = await page.$$('input[type="text"]')
      if (inputs.length > 0) {
        await inputs[0].click({ clickCount: 3 })
        await inputs[0].type(category.name, { delay: 30 })
      } else {
        console.log('   ⚠️  Type category name manually: ' + category.name)
        await askQuestion('   Press ENTER when done...')
      }

      await wait(500)

      // Click Save button
      const saveButtons = await page.$$('button')
      for (const btn of saveButtons) {
        const text = await page.evaluate(el => el.textContent, btn)
        if (text && (text.includes('Save') || text.includes('Done') || text.includes('Create'))) {
          await btn.click()
          break
        }
      }

      await wait(1000)
      console.log(`   ✅ Category created: ${category.name}`)

    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`)
      console.log(`   ⚠️  Please create category "${category.name}" manually, then press ENTER...`)
      await askQuestion('')
    }
  }

  // STEP 2: Now go to Items tab and add all items
  console.log('')
  console.log('=' .repeat(70))
  console.log('STEP 2: Adding Items')
  console.log('=' .repeat(70))
  console.log('')

  // Click on Items tab
  try {
    const tabs = await page.$$('a, button')
    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab)
      if (text && text.trim() === 'Items') {
        await tab.click()
        break
      }
    }
    await wait(1500)
  } catch (e) {
    console.log('⚠️  Please click on the "Items" tab manually, then press ENTER...')
    await askQuestion('')
  }

  let itemCount = 0
  for (const category of MENU_DATA.categories) {
    console.log(`\n📂 Adding items for: ${category.name}`)

    for (const item of category.items) {
      itemCount++
      console.log(`   📦 [${itemCount}/${totalItems}] ${item.name} - $${item.price.toFixed(2)}`)

      try {
        // Click "+ Add" or "+ Add item" button
        const addButtons = await page.$$('button')
        let clicked = false
        for (const btn of addButtons) {
          const text = await page.evaluate(el => el.textContent, btn)
          if (text && (text.includes('Add item') || text.includes('+ Add'))) {
            await btn.click()
            clicked = true
            break
          }
        }

        if (!clicked) {
          // Try clicking any Add button
          for (const btn of addButtons) {
            const text = await page.evaluate(el => el.textContent, btn)
            if (text && text.includes('Add')) {
              await btn.click()
              clicked = true
              break
            }
          }
        }

        if (!clicked) {
          console.log('      ⚠️  Click "+ Add item" button, then press ENTER...')
          await askQuestion('')
        }

        await wait(1000)

        // Fill in item details - find all text inputs
        const inputs = await page.$$('input[type="text"], input:not([type])')

        // Usually: first input is name, there might be a price input
        if (inputs.length > 0) {
          // Item name
          await inputs[0].click({ clickCount: 3 })
          await inputs[0].type(item.name, { delay: 20 })
        }

        await wait(300)

        // Find price input (might be type="number" or have "price" in placeholder)
        const priceInputs = await page.$$('input[type="number"], input[placeholder*="price"], input[placeholder*="Price"]')
        if (priceInputs.length > 0) {
          await priceInputs[0].click({ clickCount: 3 })
          await priceInputs[0].type(item.price.toFixed(2), { delay: 20 })
        }

        await wait(300)

        // Description textarea
        if (item.description) {
          const textareas = await page.$$('textarea')
          if (textareas.length > 0) {
            await textareas[0].click()
            await textareas[0].type(item.description, { delay: 10 })
          }
        }

        await wait(300)

        // Select category from dropdown if available
        try {
          const selects = await page.$$('select')
          for (const select of selects) {
            const options = await select.$$('option')
            for (const option of options) {
              const optionText = await page.evaluate(el => el.textContent, option)
              if (optionText && optionText.includes(category.name)) {
                await select.select(await page.evaluate(el => el.value, option))
                break
              }
            }
          }
        } catch (e) {
          // Category dropdown might not exist or work differently
        }

        await wait(500)

        // Click Save
        const saveButtons = await page.$$('button')
        for (const btn of saveButtons) {
          const text = await page.evaluate(el => el.textContent, btn)
          if (text && (text.includes('Save') || text.includes('Done') || text.includes('Add'))) {
            await btn.click()
            break
          }
        }

        await wait(800)
        console.log(`      ✅ Added`)

      } catch (err) {
        console.log(`      ❌ Error: ${err.message}`)
        console.log(`      ⚠️  Please add this item manually:`)
        console.log(`         Name: ${item.name}`)
        console.log(`         Price: $${item.price.toFixed(2)}`)
        console.log(`         Category: ${category.name}`)
        if (item.description) console.log(`         Description: ${item.description}`)
        await askQuestion('      Press ENTER when done...')
      }
    }
  }

  // STEP 3: Reminder about modifiers
  console.log('')
  console.log('=' .repeat(70))
  console.log('STEP 3: Modifiers (Customizations)')
  console.log('=' .repeat(70))
  console.log('')
  console.log('Some items have modifiers/extras. You\'ll need to add these in the')
  console.log('"Customizations" tab. Here\'s the list:')
  console.log('')

  for (const category of MENU_DATA.categories) {
    for (const item of category.items) {
      if (item.modifiers && item.modifiers.length > 0) {
        console.log(`📦 ${item.name}:`)
        for (const mod of item.modifiers) {
          console.log(`   • ${mod.name} +$${mod.price.toFixed(2)}`)
        }
        console.log('')
      }
    }
  }

  console.log('')
  console.log('=' .repeat(70))
  console.log('✅ AUTOMATION COMPLETE!')
  console.log('=' .repeat(70))
  console.log('')
  console.log('Next steps:')
  console.log('1. Review the menu in the browser')
  console.log('2. Click "Save" at the top right to save all changes')
  console.log('3. Add modifiers in the "Customizations" tab if needed')
  console.log('4. Click "See Changes" and publish when ready')
  console.log('')

  await askQuestion('Press ENTER to finish (browser will stay open)...')

  // Don't close the browser - user might want to review
  console.log('\n👋 Done! Browser left open for you to review and save changes.')
}

// Run
main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
