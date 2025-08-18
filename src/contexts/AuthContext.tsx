'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AdminProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: AdminProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      console.log('Getting initial session...')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Initial session:', !!session, session?.user?.id)
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('Fetching profile for user:', session.user.id)
        await fetchProfile(session.user.id)
      }
      
      console.log('Setting loading to false')
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        
        // For admin email, create a profile with admin role if it doesn't exist
        if (user?.email === 'info@jasskhinda.com') {
          const adminProfile: AdminProfile = {
            id: userId,
            email: 'info@jasskhinda.com',
            first_name: 'Jass',
            last_name: 'Khinda',
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setProfile(adminProfile)
          
          // Try to insert the profile into the database
          try {
            await supabase
              .from('user_profiles')
              .upsert(adminProfile, { onConflict: 'id' })
          } catch (insertError) {
            console.warn('Could not insert admin profile:', insertError)
          }
          return
        }
        
        // For other users, set a basic profile
        const basicProfile: AdminProfile = {
          id: userId,
          email: user?.email || '',
          first_name: null,
          last_name: null,
          role: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setProfile(basicProfile)
        return
      }

      console.log('Profile fetched successfully:', data)
      setProfile(data as AdminProfile)
    } catch (error) {
      console.error('Error in fetchProfile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // If there's an email not confirmed error, show helpful message
    if (error && error.message.includes('Email not confirmed')) {
      console.log('Email not confirmed error detected')
      return { error: new Error('This account was created before email verification was disabled. Please create a new account or contact support.') }
    }

    // For successful login without email confirmation issues
    if (!error && data.session) {
      console.log('Login successful')
      // Manually trigger the auth state change for immediate UI update
      setSession(data.session)
      setUser(data.user)
      setLoading(false)
      if (data.user) {
        await fetchProfile(data.user.id)
      }
    } else if (error) {
      // Ensure loading is false even on error
      setLoading(false)
    }

    return { error }
  }

  const signOut = async () => {
    console.log('Signing out...')
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase signOut error:', error)
      }
    } catch (error) {
      console.error('Error during signOut:', error)
    }
    
    // Clear state immediately for better UX
    setUser(null)
    setProfile(null)
    setSession(null)
    setLoading(false)
    console.log('Signed out successfully')
  }

  // Check if user is admin based on role or specific email
  const isAdmin = profile?.role === 'admin' || profile?.email === 'info@jasskhinda.com'

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signOut,
    isAdmin,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
