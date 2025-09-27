import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, first_name, last_name, role } = body

    // Create a fresh client for this operation
    const supabase = createClient()

    // Create the user without affecting the current session
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          role
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/login`
      }
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // Sign out from this client to prevent session persistence
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      userId: authData.user?.id,
      email: authData.user?.email
    })

  } catch (error: any) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}