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

    // Use the new database function for reliable user creation
    const { data, error } = await supabaseAdmin
      .rpc('create_admin_user', {
        user_email: email,
        user_password: password,
        user_first_name: firstName || '',
        user_last_name: lastName || '',
        user_role: role
      })

    if (error) {
      console.error('Database function error:', error)
      return {
        success: false,
        error: `Failed to create user: ${error.message}`
      }
    }

    const result = data as any

    if (!result.success) {
      console.error('User creation failed:', result.error)
      return {
        success: false,
        error: result.error || 'Failed to create user'
      }
    }

    console.log('✓ User created successfully:', result.id)

    // Revalidate any pages that might show user lists
    revalidatePath('/user-management')
    revalidatePath('/settings')

    return {
      success: true,
      user: {
        id: result.id,
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

    // Use the new database function for reliable user deletion
    const { data, error } = await supabaseAdmin
      .rpc('delete_admin_user', {
        user_id: userId
      })

    if (error) {
      console.error('Database function error:', error)
      return {
        success: false,
        error: `Failed to delete user: ${error.message}`
      }
    }

    const result = data as any

    if (!result.success) {
      console.error('User deletion failed:', result.error)
      return {
        success: false,
        error: result.error || 'Failed to delete user'
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