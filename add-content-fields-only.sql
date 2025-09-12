-- Add only the essential content fields to products table
-- Safe migration that won't break existing functionality

-- Add new content fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS ingredients TEXT,
ADD COLUMN IF NOT EXISTS nutrition_info TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN products.ingredients IS 'Rich text content for product ingredients - supports HTML formatting';
COMMENT ON COLUMN products.nutrition_info IS 'Rich text content for nutrition facts and additional product information - supports HTML formatting';