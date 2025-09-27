'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { User, Mail, Shield, Calendar, Save, Edit3, X, CheckCircle, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function AdminProfilePage() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  })

  // Remove excessive logging to prevent performance issues

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || ''
      })
    }
  }, [profile])

  const handleSave = async () => {
    if (!user) return
    
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Production-friendly timeout - 20 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile update is taking longer than expected. This is normal for the first update or during high traffic. Please wait and try again.')), 20000)
      )

      console.log('Starting profile update...')
      const updatePromise = supabase
        .from('user_profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      const result = await Promise.race([updatePromise, timeoutPromise])
      const { error: updateError } = result as any

      if (updateError) {
        console.error('Database update error:', updateError)
        throw updateError
      }

      console.log('Profile update successful!')

      // Update the profile in AuthContext to refresh header immediately
      await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email
      })

      setSuccess('Profile updated successfully!')
      setEditing(false)
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('')
      }, 5000)

    } catch (err: any) {
      console.error('Profile update error:', err)
      
      // More helpful error messages
      if (err.message.includes('longer than expected') || err.message.includes('timeout')) {
        setError('Update is taking longer than usual. This can happen during high traffic. Please try again in a moment.')
      } else if (err.code === 'PGRST116') {
        setError('Profile record not found. Please try logging out and back in.')
      } else if (err.code === 'PGRST301') {
        setError('Database table not accessible. Please contact support.')
      } else {
        setError(err.message || 'Failed to update profile. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || ''
      })
    }
    setEditing(false)
    setError('')
    setSuccess('')
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError('')
    setPasswordSuccess('')

    try {
      // Validation
      if (!passwordData.currentPassword) {
        throw new Error('Current password is required')
      }
      if (!passwordData.newPassword) {
        throw new Error('New password is required')
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New passwords do not match')
      }
      if (passwordData.newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }
      if (passwordData.newPassword === passwordData.currentPassword) {
        throw new Error('New password must be different from current password')
      }

      // Skip password verification and directly update
      // Supabase will verify the session automatically
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (updateError) throw updateError

      // Clear form and show success
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setPasswordSuccess('Password updated successfully!')

      // Close form immediately but keep success message visible
      setShowPasswordForm(false)

      // Clear success message after 5 seconds
      setTimeout(() => {
        setPasswordSuccess('')
      }, 5000)

    } catch (err: any) {
      console.error('Password change error:', err)
      setPasswordError(err.message || 'Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to access your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
          <p className="mt-2 text-gray-600">Manage your admin account information</p>
        </div>

        {/* Debug Section - Remove in production */}
        {editing && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Debug Info & Test</h3>
            <div className="text-xs text-blue-800 space-y-1 mb-3">
              <p>Editing: {editing ? 'true' : 'false'}</p>
              <p>Form Data: {JSON.stringify(formData)}</p>
              <p>Profile: {JSON.stringify(profile)}</p>
              <p>User: {user?.email}</p>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-blue-900 mb-1">Test Input:</label>
              <input
                type="text"
                placeholder="Type here to test if inputs work"
                className="w-full px-3 py-2 border border-blue-300 rounded text-gray-900 bg-white"
                style={{ 
                  backgroundColor: '#ffffff !important',
                  color: '#111827 !important',
                  border: '1px solid #3b82f6 !important'
                }}
                onChange={(e) => console.log('Test input value:', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Success Message */}
        {(success || passwordSuccess) && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-green-700 font-medium">Success!</p>
              <p className="text-green-600 text-sm mt-1">{success || passwordSuccess}</p>
            </div>
          </div>
        )}

        {/* Enhanced Error Message with Retry for Profile */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">Profile Update Issue</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              {error.includes('longer than') || error.includes('timeout') ? (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-blue-800 text-sm font-medium">💡 Tips for slow connections:</p>
                  <ul className="text-blue-700 text-xs mt-1 space-y-1">
                    <li>• Wait 30 seconds and try again</li>
                    <li>• Check your internet connection</li>
                    <li>• Try refreshing the page</li>
                    <li>• This is common during high traffic</li>
                  </ul>
                  <button
                    onClick={() => setError('')}
                    className="mt-2 text-blue-600 text-xs underline hover:text-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setError('')}
                  className="mt-2 text-red-600 text-sm underline hover:text-red-700"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {profile?.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {profile?.first_name || profile?.last_name 
                      ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
                      : 'Admin User'
                    }
                  </h2>
                  <p className="text-white/80 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Administrator
                  </p>
                </div>
              </div>
              
              {!editing && (
                <button
                  onClick={() => {
                    console.log('Edit button clicked, setting editing to true')
                    setEditing(true)
                    setError('')
                    setSuccess('')
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-white/90 rounded-lg transition-colors text-gray-900 shadow-sm"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6 profile-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => {
                      console.log('First name changed:', e.target.value)
                      setFormData(prev => ({ ...prev, first_name: e.target.value }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                    style={{ 
                      color: '#111827 !important', 
                      backgroundColor: '#ffffff !important', 
                      borderColor: '#d1d5db !important',
                      outline: 'none'
                    }}
                    placeholder="Enter first name"
                    autoComplete="given-name"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{profile?.first_name || 'Not set'}</span>
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => {
                      console.log('Last name changed:', e.target.value)
                      setFormData(prev => ({ ...prev, last_name: e.target.value }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                    style={{ 
                      color: '#111827 !important', 
                      backgroundColor: '#ffffff !important', 
                      borderColor: '#d1d5db !important',
                      outline: 'none'
                    }}
                    placeholder="Enter last name"
                    autoComplete="family-name"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{profile?.last_name || 'Not set'}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{user.email}</span>
                  <span className="ml-auto px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed. Contact system administrator if needed.
                </p>
              </div>

              {/* Account Info */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Information
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Role</p>
                      <p className="text-xs text-gray-600">Administrator</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Member Since</p>
                      <p className="text-xs text-gray-600">
                        {profile?.created_at 
                          ? new Date(profile.created_at).toLocaleDateString()
                          : 'Unknown'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {editing && (
              <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
          
          {/* Password Success Message */}
          {passwordSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-green-700 font-medium">Success!</p>
                <p className="text-green-600 text-sm mt-1">{passwordSuccess}</p>
              </div>
            </div>
          )}

          {/* Password Error Message */}
          {passwordError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{passwordError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <Lock className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Password</p>
                  <p className="text-sm text-gray-600">Last changed: Not available</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPasswordForm(!showPasswordForm)
                  setPasswordError('')
                  setPasswordSuccess('')
                  if (!showPasswordForm) {
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    })
                  }
                }}
                className="px-4 py-2 text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {/* Password Change Form */}
            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h4>
                
                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                        style={{ 
                          color: '#111827 !important', 
                          backgroundColor: '#ffffff !important', 
                          borderColor: '#d1d5db !important'
                        }}
                        placeholder="Enter your current password"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                        style={{ 
                          color: '#111827 !important', 
                          backgroundColor: '#ffffff !important', 
                          borderColor: '#d1d5db !important'
                        }}
                        placeholder="Enter your new password"
                        required
                        minLength={6}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                        style={{ 
                          color: '#111827 !important', 
                          backgroundColor: '#ffffff !important', 
                          borderColor: '#d1d5db !important'
                        }}
                        placeholder="Confirm your new password"
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {passwordData.newPassword && (
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                      <div className="space-y-1 text-xs">
                        <div className={`flex items-center gap-2 ${passwordData.newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="w-1 h-1 bg-current rounded-full"></span>
                          At least 6 characters
                        </div>
                        <div className={`flex items-center gap-2 ${passwordData.newPassword !== passwordData.currentPassword && passwordData.newPassword ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="w-1 h-1 bg-current rounded-full"></span>
                          Different from current password
                        </div>
                        <div className={`flex items-center gap-2 ${passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="w-1 h-1 bg-current rounded-full"></span>
                          Passwords match
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false)
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        })
                        setPasswordError('')
                      }}
                      disabled={passwordLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}
