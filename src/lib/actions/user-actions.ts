'use server'

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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


interface CreateUserData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  role?: 'admin' | 'super_admin'
}

interface CreateUserResult {
  success: boolean
  error?: string
  user?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    role: string
  }
}

export async function createAdminUser(userData: CreateUserData): Promise<CreateUserResult> {
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

    // Verify current user is authenticated and has admin privileges
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Check if current user has admin permissions
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!currentProfile || !['admin', 'super_admin'].includes(currentProfile.role)) {
      return { success: false, error: 'Insufficient permissions' }
    }

    // Validate input
    const { email, password, firstName, lastName, role = 'admin' } = userData

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' }
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' }
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Invalid email format' }
    }

    // Check if user already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingProfile) {
      return { success: false, error: 'User with this email already exists' }
    }

    console.log('Creating auth user with metadata:', { email, firstName, lastName, role })

    // Step 1: Create authentication user (profile will be auto-created by database trigger)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email to avoid email verification
      app_metadata: {
        provider: 'email',
        providers: ['email']
      },
      user_metadata: {
        first_name: firstName || '',
        last_name: lastName || '',
        role: role,
        created_by: user.id
      }
    })

    if (authError || !authUser.user) {
      console.error('❌ Auth user creation failed:', authError)
      console.error('   Error details:', JSON.stringify(authError, null, 2))
      return {
        success: false,
        error: `Database error creating new user`
      }
    }

    console.log('✓ Auth user created:', authUser.user.id)

    // Step 2: Wait for database trigger to create profile, then verify and update
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
          // Clean up auth user
          try {
            await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
            console.log('✓ Cleaned up auth user after profile update failure')
          } catch (cleanupError) {
            console.error('Failed to cleanup auth user:', cleanupError)
          }
          return {
            success: false,
            error: `Database error creating new user`
          }
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
          console.log('✓ Cleaned up auth user after manual profile creation failure')
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError)
        }
        return {
          success: false,
          error: `Database error creating new user`
        }
      }

      profileData = manualProfile
    }

    console.log('✓ User profile created/updated:', profileData.id)

    // Test the login to ensure everything works
    try {
      const testLogin = await supabaseAdmin.auth.signInWithPassword({
        email,
        password
      })

      if (testLogin.data.user) {
        console.log('✓ Login test successful')
        // Sign out the test session
        await supabaseAdmin.auth.signOut()
      } else {
        console.warn('⚠️ Login test failed, but user was created')
      }
    } catch (testError) {
      console.warn('⚠️ Login test error:', testError)
      // Don't fail the creation for this
    }

    // Revalidate any pages that might show user lists
    revalidatePath('/users')
    revalidatePath('/settings')

    return {
      success: true,
      user: {
        id: authUser.user.id,
        email: authUser.user.email!,
        firstName: firstName,
        lastName: lastName,
        role: role
      }
    }

  } catch (error) {
    console.error('Unexpected error in createAdminUser:', error)
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<CreateUserResult> {
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

    // Verify current user is authenticated and has admin privileges
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Check admin permissions
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!currentProfile || !['admin', 'super_admin'].includes(currentProfile.role)) {
      return { success: false, error: 'Insufficient permissions' }
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' }
    }

    // Update password using admin API
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) {
      return { success: false, error: `Failed to update password: ${error.message}` }
    }

    return { success: true }

  } catch (error) {
    console.error('Error updating password:', error)
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

export async function deleteAdminUser(userId: string): Promise<CreateUserResult> {
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

    // Verify current user is authenticated and has admin privileges
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Check admin permissions
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!currentProfile || !['admin', 'super_admin'].includes(currentProfile.role)) {
      return { success: false, error: 'Admin permissions required to delete users' }
    }

    // Don't allow deleting yourself
    if (user.id === userId) {
      return { success: false, error: 'Cannot delete your own account' }
    }

    // Delete auth user (this will cascade delete the profile if set up correctly)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      return { success: false, error: `Failed to delete user: ${authError.message}` }
    }

    // Also delete profile explicitly to be safe
    await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    revalidatePath('/users')

    return { success: true }

  } catch (error) {
    console.error('Error deleting user:', error)
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}