import { createClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Add new fields to products table
    const addFieldsQuery = `
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS ingredients TEXT,
      ADD COLUMN IF NOT EXISTS nutrition_info TEXT;
    `
    
    // Create product_variants table
    const createVariantsTableQuery = `
      CREATE TABLE IF NOT EXISTS product_variants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        size_name VARCHAR(100) NOT NULL,
        size_value DECIMAL(10,2),
        size_unit VARCHAR(20),
        price DECIMAL(10,2) NOT NULL,
        compare_price DECIMAL(10,2),
        stock_quantity INTEGER DEFAULT 0,
        sku VARCHAR(100),
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
    
    // Create indexes
    const createIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
      CREATE INDEX IF NOT EXISTS idx_product_variants_default ON product_variants(product_id, is_default);
    `
    
    // Run the queries
    const { error: fieldsError } = await supabase.rpc('exec_sql', { sql: addFieldsQuery })
    if (fieldsError) {
      console.error('Error adding fields:', fieldsError)
      return NextResponse.json({ error: 'Failed to add product fields', details: fieldsError }, { status: 500 })
    }
    
    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createVariantsTableQuery })
    if (tableError) {
      console.error('Error creating variants table:', tableError)
      return NextResponse.json({ error: 'Failed to create variants table', details: tableError }, { status: 500 })
    }
    
    const { error: indexError } = await supabase.rpc('exec_sql', { sql: createIndexesQuery })
    if (indexError) {
      console.error('Error creating indexes:', indexError)
      return NextResponse.json({ error: 'Failed to create indexes', details: indexError }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: 'Database migration completed successfully' })
    
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Migration failed', details: error }, { status: 500 })
  }
}