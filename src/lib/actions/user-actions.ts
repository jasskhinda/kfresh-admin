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

    console.log('Creating admin user:', { email, firstName, lastName, role })

    // Create user directly using admin API (more reliable than database function)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName || '',
        last_name: lastName || '',
        role: role
      }
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      return {
        success: false,
        error: `Failed to create user: ${authError.message}`
      }
    }

    console.log('✓ Auth user created:', authData.user.email)

    // Wait a moment for the database trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 500))

    // Verify profile was created by trigger
    const { data: profileCheck, error: profileCheckError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileCheckError) {
      console.error('Profile verification error:', profileCheckError)
      // Manually create profile if trigger failed
      const { error: manualProfileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: email,
          first_name: firstName || '',
          last_name: lastName || '',
          role: role
        })

      if (manualProfileError) {
        console.error('Manual profile creation error:', manualProfileError)
        // Clean up the auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        return {
          success: false,
          error: `Failed to create user profile: ${manualProfileError.message}`
        }
      }
    }

    console.log('✓ User created successfully:', authData.user.id)

    // Revalidate any pages that might show user lists
    revalidatePath('/user-management')
    revalidatePath('/settings')

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: email,
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

    console.log('Deleting user:', userId)

    // Delete user profile first
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Profile deletion error:', profileError)
      return {
        success: false,
        error: `Failed to delete user profile: ${profileError.message}`
      }
    }

    // Delete auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Auth user deletion error:', authError)
      return {
        success: false,
        error: `Failed to delete user: ${authError.message}`
      }
    }

    console.log('✓ User deleted successfully')

    revalidatePath('/user-management')

    return { success: true }

  } catch (error) {
    console.error('Error deleting user:', error)
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}