'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
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
    const supabase = createServerActionClient({ cookies })

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

    // Step 1: Create authentication user (profile will be auto-created by database trigger)

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email to avoid email verification
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: role,
        created_by: user.id
      }
    })

    if (authError || !authUser.user) {
      console.error('❌ Auth user creation failed:', authError)
      console.error('   Error details:', JSON.stringify(authError, null, 2))
      return {
        success: false,
        error: `Failed to create authentication: ${authError?.message || 'Unknown error'}`
      }
    }

    console.log('✓ Auth user created:', authUser.user.id)

    // Step 2: Wait for database trigger to create profile, then update it with correct data
    // The trigger creates a basic profile, but we need to update it with the correct details
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second for trigger

    const { data: profileData, error: profileError } = await supabaseAdmin
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

    if (profileError) {
      console.error('Profile update failed:', profileError)

      // Clean up auth user if profile update fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
        console.log('✓ Cleaned up auth user after profile update failure')
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError)
      }

      return {
        success: false,
        error: `Failed to update profile: ${profileError.message}`
      }
    }

    console.log('✓ User profile updated:', profileData.id)

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
    const supabase = createServerActionClient({ cookies })

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
    const supabase = createServerActionClient({ cookies })

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

    if (!currentProfile || currentProfile.role !== 'super_admin') {
      return { success: false, error: 'Only super admins can delete users' }
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