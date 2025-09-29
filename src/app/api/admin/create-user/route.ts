import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Verify current user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get request data
    const { email, password, firstName, lastName, role = 'admin' } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Check if user already exists in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingProfile) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    console.log('Creating auth user with metadata:', { email, firstName, lastName, role })

    // Step 1: Create auth user (profile will be auto-created by trigger)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      app_metadata: {
        provider: 'email',
        providers: ['email']
      },
      user_metadata: {
        first_name: firstName || '',
        last_name: lastName || '',
        role: role
      }
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      return NextResponse.json({
        error: 'Database error creating new user',
        details: authError.message
      }, { status: 500 })
    }

    if (!authUser.user) {
      return NextResponse.json({
        error: 'Database error creating new user',
        details: 'No user returned from auth creation'
      }, { status: 500 })
    }

    console.log('Auth user created successfully:', authUser.user.id)

    // Step 2: Wait for trigger to create profile, then verify and update if needed
    await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds for trigger

    // Verify profile was created and update with correct data
    let profileData = null
    let attempts = 0
    const maxAttempts = 5

    while (!profileData && attempts < maxAttempts) {
      attempts++
      console.log(`Checking for profile creation, attempt ${attempts}`)

      const { data: existingProfile, error: checkError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.user.id)
        .single()

      if (existingProfile) {
        console.log('Profile found, updating with correct data')

        // Update profile with correct information
        const { data: updatedProfile, error: updateError } = await supabaseAdmin
          .from('user_profiles')
          .update({
            first_name: firstName || null,
            last_name: lastName || null,
            role: role,
            updated_at: new Date().toISOString()
          })
          .eq('id', authUser.user.id)
          .select()
          .single()

        if (updateError) {
          console.error('Profile update error:', updateError)
          // Try to delete the auth user
          try {
            await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
          } catch (cleanupError) {
            console.error('Failed to cleanup auth user:', cleanupError)
          }
          return NextResponse.json({
            error: 'Database error creating new user',
            details: 'Failed to update user profile: ' + updateError.message
          }, { status: 500 })
        }

        profileData = updatedProfile
        break
      } else if (checkError && !checkError.message.includes('No rows')) {
        console.error('Profile check error:', checkError)
        break
      }

      // Wait before next attempt
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    if (!profileData) {
      console.error('Profile was not created by trigger, creating manually')

      // Fallback: create profile manually
      const { data: manualProfile, error: manualError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: authUser.user.id,
          email: email,
          first_name: firstName || null,
          last_name: lastName || null,
          role: role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (manualError) {
        console.error('Manual profile creation error:', manualError)

        // Clean up auth user
        try {
          await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError)
        }

        return NextResponse.json({
          error: 'Database error creating new user',
          details: 'Profile creation failed: ' + manualError.message
        }, { status: 500 })
      }

      profileData = manualProfile
    }

    console.log('User profile created/updated successfully:', profileData.id)

    // Return success
    return NextResponse.json({
      success: true,
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        firstName: firstName,
        lastName: lastName,
        role: role,
        created_at: authUser.user.created_at
      },
      message: 'User created successfully'
    })

  } catch (error) {
    console.error('Unexpected error creating user:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Test endpoint to verify API is working
export async function GET() {
  return NextResponse.json({
    message: 'User creation API endpoint is working',
    timestamp: new Date().toISOString()
  })
}