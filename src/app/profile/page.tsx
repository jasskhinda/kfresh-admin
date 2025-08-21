'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { User, Mail, Shield, Calendar, Save, Edit3, X, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminProfilePage() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  })

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
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSuccess('Profile updated successfully!')
      setEditing(false)
      
      // Force a page refresh to update the header
      setTimeout(() => {
        window.location.reload()
      }, 1500)

    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
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

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-green-700 font-medium">Success!</p>
              <p className="text-green-600 text-sm mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
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
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6">
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
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter first name"
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
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter last name"
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
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-600">Last changed: Not available</p>
              </div>
              <button
                onClick={() => {
                  // You can implement password change functionality here
                  alert('Password change functionality can be implemented here')
                }}
                className="px-4 py-2 text-green-600 hover:text-green-700 font-medium"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
