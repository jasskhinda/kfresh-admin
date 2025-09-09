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
    const { name, slug, description, image_url, is_active, sort_order, is_fresh_meals, show_in_homepage_hero, homepage_order, icon, color_class } = body

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert([{
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        image_url: image_url || null,
        is_active,
        sort_order,
        is_fresh_meals: Boolean(is_fresh_meals),
        show_in_homepage_hero: Boolean(show_in_homepage_hero),
        homepage_order: homepage_order || 999,
        icon: icon || '🛒',
        color_class: color_class || 'bg-gray-100 text-gray-600'
      }])
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
    const { id, name, slug, description, image_url, is_active, sort_order, is_fresh_meals, show_in_homepage_hero, homepage_order, icon, color_class } = body

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || null,
        image_url: image_url || null,
        is_active,
        sort_order,
        is_fresh_meals: Boolean(is_fresh_meals),
        show_in_homepage_hero: Boolean(show_in_homepage_hero),
        homepage_order: homepage_order || 999,
        icon: icon || '🛒',
        color_class: color_class || 'bg-gray-100 text-gray-600',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
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
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('categories')
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