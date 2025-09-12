import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([body])
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, variants, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Update product
    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Handle variants if provided
    if (variants !== undefined && variants !== null) {
      // First, get existing variants
      const { data: existingVariants } = await supabaseAdmin
        .from('product_variants')
        .select('id')
        .eq('product_id', id)

      const existingIds = existingVariants?.map(v => v.id) || []
      const updatedIds: string[] = []

      // Process each variant
      for (const variant of variants) {
        if (variant.id?.startsWith('new-')) {
          // Insert new variant
          const { error: insertError } = await supabaseAdmin
            .from('product_variants')
            .insert({
              product_id: id,
              size_name: variant.size_name,
              price: variant.price,
              compare_price: variant.compare_price,
              stock_quantity: variant.stock_quantity,
              sku: variant.sku,
              is_default: variant.is_default
            })
          
          if (insertError) {
            console.error('Error inserting variant:', insertError)
          }
        } else {
          // Update existing variant
          updatedIds.push(variant.id)
          const { error: updateError } = await supabaseAdmin
            .from('product_variants')
            .update({
              size_name: variant.size_name,
              price: variant.price,
              compare_price: variant.compare_price,
              stock_quantity: variant.stock_quantity,
              sku: variant.sku,
              is_default: variant.is_default
            })
            .eq('id', variant.id)
          
          if (updateError) {
            console.error('Error updating variant:', updateError)
          }
        }
      }

      // Delete removed variants
      const toDelete = existingIds.filter(id => !updatedIds.includes(id))
      if (toDelete.length > 0) {
        const { error: deleteError } = await supabaseAdmin
          .from('product_variants')
          .delete()
          .in('id', toDelete)
        
        if (deleteError) {
          console.error('Error deleting variants:', deleteError)
        }
      }
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}