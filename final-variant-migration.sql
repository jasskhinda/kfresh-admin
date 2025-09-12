-- Final migration for product variants (safe to run multiple times)

-- Add content fields if they don't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS ingredients TEXT,
ADD COLUMN IF NOT EXISTS nutrition_info TEXT;

-- Create product_variants table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  sku VARCHAR(100),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_default ON product_variants(product_id, is_default);

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Allow read access to product_variants" ON product_variants;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON product_variants;
DROP POLICY IF EXISTS "Allow update for authenticated" ON product_variants;
DROP POLICY IF EXISTS "Allow delete for authenticated" ON product_variants;

-- Create RLS policies
CREATE POLICY "Allow read access to product_variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated" ON product_variants FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update for authenticated" ON product_variants FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete for authenticated" ON product_variants FOR DELETE USING (auth.role() = 'authenticated');

-- Verify the setup
SELECT 'Setup complete! You can now use product variants in the admin panel.' as status;