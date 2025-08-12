-- KFresh Database Schema for Supabase
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  compare_price DECIMAL(10, 2),
  cost_price DECIMAL(10, 2),
  sku VARCHAR(100),
  barcode VARCHAR(100),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand VARCHAR(255),
  unit VARCHAR(50),
  weight DECIMAL(10, 2),
  dimensions JSONB,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  track_inventory BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  requires_shipping BOOLEAN DEFAULT true,
  tax_exempt BOOLEAN DEFAULT false,
  images JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  seo_title VARCHAR(255),
  seo_description TEXT,
  is_cooked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID,
  email VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  fulfillment_status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  fulfillment_method VARCHAR(50) NOT NULL,
  delivery_method VARCHAR(50),
  pickup_time TIMESTAMP WITH TIME ZONE,
  delivery_time TIMESTAMP WITH TIME ZONE,
  shipping_address JSONB,
  billing_address JSONB,
  notes TEXT,
  customer_notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_variant_id UUID,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  product_title VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  product_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_available ON products(is_available);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_is_cooked ON products(is_cooked);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories and products
CREATE POLICY "Allow public read access" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);

-- Allow authenticated users to manage categories and products
CREATE POLICY "Allow authenticated insert" ON categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON categories
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated delete" ON categories
  FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated delete" ON products
  FOR DELETE USING (true);

-- Allow all operations on orders for now (you can restrict later based on auth)
CREATE POLICY "Allow all operations" ON orders
  FOR ALL USING (true);

CREATE POLICY "Allow all operations" ON order_items
  FOR ALL USING (true);

-- Insert some initial categories
INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES
  ('Fresh Produce', 'fresh-produce', 'Fresh fruits and vegetables', 1, true),
  ('Meat & Seafood', 'meat-seafood', 'Fresh meat, poultry, and seafood', 2, true),
  ('Dairy & Eggs', 'dairy-eggs', 'Milk, cheese, yogurt, and eggs', 3, true),
  ('Cooked Meals', 'cooked-meals', 'Ready-to-eat hot meals', 4, true),
  ('Rice & Grains', 'rice-grains', 'Various types of rice and grains', 5, true),
  ('Spices & Seasonings', 'spices-seasonings', 'Herbs, spices, and cooking seasonings', 6, true),
  ('Beverages', 'beverages', 'Soft drinks, juices, and water', 7, true),
  ('Snacks', 'snacks', 'Chips, cookies, and other snacks', 8, true),
  ('Frozen Foods', 'frozen-foods', 'Frozen vegetables, meat, and ready meals', 9, true),
  ('Pantry Essentials', 'pantry-essentials', 'Cooking oils, flour, and other essentials', 10, true);

-- Insert some sample products
INSERT INTO products (name, slug, description, price, stock_quantity, category_id, is_available, is_featured, is_cooked) VALUES
  ('Ghana Yam', 'ghana-yam', 'Fresh yam imported from Ghana', 5.99, 50, 
   (SELECT id FROM categories WHERE slug = 'fresh-produce'), true, true, false),
  
  ('Jollof Rice Combo', 'jollof-rice-combo', 'Delicious Jollof rice with chicken and plantain', 15.99, 20, 
   (SELECT id FROM categories WHERE slug = 'cooked-meals'), true, true, true),
  
  ('Palm Oil (Red)', 'palm-oil-red', 'Pure African red palm oil - 500ml', 8.99, 30, 
   (SELECT id FROM categories WHERE slug = 'pantry-essentials'), true, false, false),
  
  ('Egusi Stew Special', 'egusi-stew-special', 'Traditional Egusi stew with assorted meat', 18.99, 15, 
   (SELECT id FROM categories WHERE slug = 'cooked-meals'), true, true, true),
  
  ('Fresh Plantains', 'fresh-plantains', 'Ripe plantains perfect for frying', 3.99, 100, 
   (SELECT id FROM categories WHERE slug = 'fresh-produce'), true, false, false),
  
  ('Goat Meat', 'goat-meat', 'Fresh goat meat - per pound', 12.99, 25, 
   (SELECT id FROM categories WHERE slug = 'meat-seafood'), true, false, false),
  
  ('Waakye Special', 'waakye-special', 'Ghanaian rice and beans with sides', 14.99, 10, 
   (SELECT id FROM categories WHERE slug = 'cooked-meals'), true, false, true),
  
  ('Cassava Flour', 'cassava-flour', 'Fine cassava flour for fufu - 2kg', 6.99, 40, 
   (SELECT id FROM categories WHERE slug = 'pantry-essentials'), true, false, false);

-- Grant necessary permissions (adjust based on your needs)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;