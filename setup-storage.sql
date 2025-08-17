-- Setup Supabase Storage for Product Images
-- Run this in your Supabase SQL Editor

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Set up RLS policies for the bucket with correct syntax
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update images" ON storage.objects 
FOR UPDATE USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete images" ON storage.objects 
FOR DELETE USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Alternative: If you want to allow all authenticated users to manage images
-- You can also use these more permissive policies:

-- CREATE POLICY "Allow authenticated uploads" ON storage.objects 
-- FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- CREATE POLICY "Allow authenticated updates" ON storage.objects 
-- FOR UPDATE USING (bucket_id = 'product-images');

-- CREATE POLICY "Allow authenticated deletes" ON storage.objects 
-- FOR DELETE USING (bucket_id = 'product-images');