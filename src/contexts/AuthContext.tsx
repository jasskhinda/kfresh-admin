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
  password_last_changed?: string | null
}

interface AuthContextType {
  user: User | null
  profile: AdminProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<AdminProfile>) => Promise<void>
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

  // console.log('AuthProvider initializing...') // Debug log

  useEffect(() => {
    let isMounted = true
    let initializationComplete = false
    
    // Force loading to false after 3 seconds regardless of what happens (more generous for production)
    const forceInitTimeout = setTimeout(() => {
      if (!initializationComplete) {
        console.log('FORCE: Auth initialization timeout - setting loading to false')
        if (isMounted) {
          setLoading(false)
        }
      }
    }, 3000)
    
    // Get initial session
    const getSession = async () => {
      console.log('Getting initial session...')
      try {
        console.log('Supabase client created, calling getSession...')
        
        // Create a timeout promise that rejects after 5 seconds (production-friendly)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('getSession timeout - this is normal on slow connections')), 5000)
        })
        
        // Race between getSession and timeout
        const result = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ])
        
        const { data: { session }, error } = result as any
        console.log('Initial session result:', { session: !!session, error, userId: session?.user?.id })
        
        if (!isMounted) return
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('Fetching profile for user:', session.user.id)
          // Don't await profile fetch to avoid blocking
          fetchProfile(session.user.id).catch(err => {
            console.warn('Profile fetch failed during init:', err)
          })
        }
        
        console.log('Setting loading to false')
        initializationComplete = true
        setLoading(false)
      } catch (error) {
        console.error('Error getting session:', error)
        if (isMounted) {
          initializationComplete = true
          setLoading(false) // Ensure loading is set to false even on error
        }
      }
    }

    console.log('About to call getSession...')
    getSession()

    // Fallback: ensure loading is set to false after maximum 2.5 seconds  
    const loadingTimeout = setTimeout(() => {
      if (!initializationComplete) {
        console.log('Loading timeout reached, forcing loading to false')
        if (isMounted) {
          initializationComplete = true
          setLoading(false)
        }
      }
    }, 2500)

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

    return () => {
      isMounted = false
      subscription.unsubscribe()
      clearTimeout(loadingTimeout)
      clearTimeout(forceInitTimeout)
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId)
      
      // Add timeout protection for production
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout - using fallback')), 10000)
      )

      const queryPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const result = await Promise.race([queryPromise, timeoutPromise])
      const { data, error } = result as any

      if (error) {
        console.error('Error fetching profile:', error)

        // For admin emails, create a profile with admin role if it doesn't exist
        if (user?.email === 'kfreshsupermarket@gmail.com' || user?.email === 'info@jasskhinda.com') {
          const adminEmail = user.email === 'kfreshsupermarket@gmail.com' ? 'kfreshsupermarket@gmail.com' : 'info@jasskhinda.com'
          const adminProfile: AdminProfile = {
            id: userId,
            email: adminEmail,
            first_name: adminEmail === 'kfreshsupermarket@gmail.com' ? 'Kwame' : 'Jass',
            last_name: adminEmail === 'kfreshsupermarket@gmail.com' ? 'Fenning' : 'Khinda',
            role: 'super_admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setProfile(adminProfile)

          // Try to insert the profile into the database
          try {
            await supabase
              .from('user_profiles')
              .upsert(adminProfile, { onConflict: 'id' })
            console.log('Admin profile created/updated in database')
          } catch (insertError) {
            console.warn('Could not insert admin profile:', insertError)
            // Even if DB insert fails, keep the profile in state for this session
          }
          return
        }

        // For other users, set a basic profile but don't create in DB
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
    return new Promise<{ error: AuthError | Error | null }>(async (resolve) => {
      try {
        console.log('Starting signIn process...')
        
        let resolved = false
        
        // Listen for auth state changes during login
        const authListener = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session && !resolved) {
            console.log('Auth state change detected - login successful!')
            resolved = true
            setSession(session)
            setUser(session.user)
            setLoading(false)
            
            // Fetch profile in background
            if (session.user) {
              fetchProfile(session.user.id).catch(err => {
                console.warn('Profile fetch failed after login:', err)
              })
            }
            
            // Clean up listener
            authListener.data.subscription.unsubscribe()
            resolve({ error: null })
          }
        })
        
        // Start the sign in process
        const signInPromise = supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        // Handle the sign in response
        signInPromise.then(({ data, error }) => {
          if (!resolved) {
            if (error) {
              console.error('Login error:', error)

              let userFriendlyError: Error

              if (error.message.includes('Email not confirmed')) {
                userFriendlyError = new Error('This account was created before email verification was disabled. Please contact support.')
              } else if (error.message.includes('Invalid login credentials')) {
                userFriendlyError = new Error('Invalid email or password. Please check your credentials and try again.')
              } else if (error.message.includes('Email rate limit exceeded')) {
                userFriendlyError = new Error('Too many login attempts. Please wait a few minutes before trying again.')
              } else if (error.message.includes('network') || error.message.includes('Network')) {
                userFriendlyError = new Error('Network error. Please check your internet connection and try again.')
              } else {
                userFriendlyError = new Error('Login failed. Please check your credentials and try again.')
              }

              resolved = true
              setLoading(false)
              authListener.data.subscription.unsubscribe()
              resolve({ error: userFriendlyError })
              return
            }

            if (!error && data.session) {
              // Auth state change should handle this, but fallback
              console.log('Sign in successful via direct response')
              resolved = true
              setSession(data.session)
              setUser(data.user)
              setLoading(false)

              if (data.user) {
                fetchProfile(data.user.id).catch(err => {
                  console.warn('Profile fetch failed after login:', err)
                })
              }

              authListener.data.subscription.unsubscribe()
              resolve({ error: null })
            }
          }
        }).catch((error) => {
          if (!resolved) {
            console.error('Sign in promise error:', error)
            resolved = true
            setLoading(false)
            authListener.data.subscription.unsubscribe()
            resolve({ error: new Error('Login failed - please try again') })
          }
        })
        
        // Timeout after 30 seconds as absolute fallback
        setTimeout(() => {
          if (!resolved) {
            console.log('Login timeout after 30 seconds')
            resolved = true
            setLoading(false)
            authListener.data.subscription.unsubscribe()
            resolve({ error: new Error('Login is taking too long - please try again') })
          }
        }, 30000)
        
      } catch (error: any) {
        console.error('SignIn catch block:', error)
        setLoading(false)
        resolve({ error: new Error('Login failed - please try again') })
      }
    })
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
    
    // Clear any cached data
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }
    
    console.log('Signed out successfully')
  }

  const updateProfile = async (updates: Partial<AdminProfile>) => {
    if (!user || !profile) return
    
    // Update local profile state immediately for responsive UI
    const updatedProfile = {
      ...profile,
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    setProfile(updatedProfile)
  }

  // Check if user is admin based on role or specific email
  const isAdmin = Boolean(
    profile?.role === 'admin' ||
    profile?.role === 'super_admin' ||
    profile?.email === 'jass@jasskhinda.com' ||
    profile?.email === 'kfreshsupermarket@gmail.com' ||
    user?.email === 'jass@jasskhinda.com' ||
    user?.email === 'kfreshsupermarket@gmail.com'
  )

  // console.log('Auth state:', {
  //   user: !!user,
  //   userEmail: user?.email,
  //   profile: !!profile,
  //   profileEmail: profile?.email,
  //   profileRole: profile?.role,
  //   isAdmin,
  //   loading
  // })

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signOut,
    updateProfile,
    isAdmin,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
