require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function getProductSlug() {
  const { data } = await supabase
    .from('products')
    .select('slug, name')
    .eq('id', '5ebe887a-e223-4609-bee7-8323fdd4826c')
    .single();
  
  console.log('Product:', data?.name);
  console.log('Slug:', data?.slug);
}

getProductSlug();
