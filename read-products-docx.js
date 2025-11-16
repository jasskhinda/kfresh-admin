const mammoth = require('mammoth')
const path = require('path')

async function readDocx() {
  const docxPath = path.join(__dirname, '..', 'left 1, items photosg.docx')

  try {
    const result = await mammoth.extractRawText({ path: docxPath })
    console.log('='.repeat(80))
    console.log('DOCUMENT CONTENT')
    console.log('='.repeat(80))
    console.log(result.value)
    console.log('\n' + '='.repeat(80))

    // Save to file for easier parsing
    const fs = require('fs')
    fs.writeFileSync('products-from-docx.txt', result.value)
    console.log('✅ Content saved to products-from-docx.txt')
  } catch (error) {
    console.error('❌ Error reading document:', error.message)
  }
}

readDocx()
