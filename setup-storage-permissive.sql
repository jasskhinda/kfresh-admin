-- Alternative Storage Setup - More Permissive for Admin Panel
-- Use this if the main setup still gives RLS errors

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Drop all existing policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Very permissive policies for admin panel
CREATE POLICY "Allow all authenticated operations" ON storage.objects 
FOR ALL USING (bucket_id = 'product-images');

-- Or even more permissive (use with caution in production):
-- CREATE POLICY "Allow all operations" ON storage.objects 
-- FOR ALL USING (bucket_id = 'product-images') 
-- WITH CHECK (bucket_id = 'product-images');