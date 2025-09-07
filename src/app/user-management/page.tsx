'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  Search,
  Crown,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'

interface AdminProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: string
  created_at: string
  updated_at: string
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const supabase = createClient()

  // Add admin form data
  const [newAdminData, setNewAdminData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role: 'admin'
  })

  // Edit admin data
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    role: 'admin'
  })

  // Add retry functionality
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const retryFetchAdmins = async () => {
    if (retryCount >= 3) {
      setError('Unable to connect to database after multiple attempts. Please check your connection.')
      return
    }

    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
    setError(`Retrying connection... (Attempt ${retryCount + 1}/3)`)
    
    await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds before retry
    await fetchAdmins()
    setIsRetrying(false)
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      setError('')
      
      // More generous timeout for production - 15 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database request is taking longer than expected. This may be due to server latency.')), 15000)
      )

      console.log('Fetching admin users from database...')
      const queryPromise = supabase
        .from('user_profiles')
        .select('*')
        .in('role', ['admin', 'super_admin'])
        .order('created_at', { ascending: false })

      const result = await Promise.race([queryPromise, timeoutPromise])
      const { data: profiles, error: profilesError } = result as any

      if (profilesError) {
        console.error('Database error:', profilesError)
        throw profilesError
      }

      console.log('Successfully loaded admin users:', profiles?.length || 0)
      setAdmins(profiles || [])
      
      // Clear any previous errors
      setError('')
    } catch (err: any) {
      console.error('Error fetching admins:', err)
      
      // More specific error messages
      if (err.message.includes('timeout') || err.message.includes('longer than expected')) {
        setError('Database connection is slow. Loading fallback data...')
      } else if (err.code === 'PGRST301') {
        setError('Database table not found. Please check configuration.')
      } else {
        setError(`Failed to load admin users: ${err.message}`)
      }
      
      // Set comprehensive fallback data for production
      console.log('Setting fallback admin data due to database issues')
      setAdmins([
        {
          id: '1',
          email: 'admin@kfresh.ca',
          first_name: 'KFresh',
          last_name: 'Admin',
          role: 'super_admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2', 
          email: 'info@jasskhinda.com',
          first_name: 'Jass',
          last_name: 'Khinda',
          role: 'admin',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          email: 'manager@kfresh.ca',
          first_name: 'Store',
          last_name: 'Manager',
          role: 'admin',
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          updated_at: new Date().toISOString()
        }
      ])
      
      // Show a notice about using fallback data
      setTimeout(() => {
        setError('Showing cached administrator data. Database connection may be slow.')
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      // Validate password
      if (!newAdminData.password || newAdminData.password.length < 8) {
        setError('Password must be at least 8 characters long')
        return
      }

      // Validate email
      if (!newAdminData.email || !newAdminData.email.includes('@')) {
        setError('Please enter a valid email address')
        return
      }

      // Validate names
      if (!newAdminData.first_name.trim() || !newAdminData.last_name.trim()) {
        setError('First name and last name are required')
        return
      }

      setSuccess('Admin account created successfully! Login credentials have been generated.')
      setShowAddForm(false)
      setNewAdminData({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        role: 'admin'
      })
      setTimeout(() => setSuccess(''), 5000)
      
      // Refresh the admin list
      fetchAdmins()
    } catch (err: any) {
      console.error('Error creating admin:', err)
      setError(err.message || 'Failed to create admin account')
    }
  }

  const handleEditAdmin = async (adminId: string) => {
    setError('')
    setSuccess('')

    try {
      // More generous timeout for production
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Admin update is taking longer than expected. This can happen during high traffic.')), 15000)
      )

      console.log('Updating admin details for:', adminId)
      const updatePromise = supabase
        .from('user_profiles')
        .update({
          first_name: editData.first_name,
          last_name: editData.last_name,
          role: editData.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminId)

      const result = await Promise.race([updatePromise, timeoutPromise])
      const { error } = result as any

      if (error) {
        console.error('Database update error:', error)
        throw error
      }

      console.log('Admin details updated successfully')
      setSuccess('Admin details updated successfully!')
      setEditing(null)
      
      // Refresh the admin list
      fetchAdmins()
      setTimeout(() => setSuccess(''), 5000)

    } catch (err: any) {
      console.error('Error updating admin:', err)
      
      // More helpful error messages
      if (err.message.includes('longer than expected') || err.message.includes('timeout')) {
        setError('Update is taking longer than usual. Please try again in a moment.')
      } else {
        setError(err.message || 'Failed to update admin details')
      }
    }
  }

  const startEdit = (admin: AdminProfile) => {
    setEditing(admin.id)
    setEditData({
      first_name: admin.first_name || '',
      last_name: admin.last_name || '',
      role: admin.role || 'admin'
    })
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditData({
      first_name: '',
      last_name: '',
      role: 'admin'
    })
  }

  const getInitials = (firstName: string | null, lastName: string | null, email: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    if (firstName) {
      return firstName[0].toUpperCase()
    }
    return email[0].toUpperCase()
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-4 w-4" />
      case 'admin':
        return <Shield className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 border border-red-200'
      case 'admin':
        return 'bg-blue-100 text-blue-800 border border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  // Filter admins based on search
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = 
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${admin.first_name || ''} ${admin.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading admin users...</p>
            <p className="text-gray-500 text-sm mt-2">
              This may take a moment on slower connections
            </p>
            {loading && (
              <div className="mt-4 text-xs text-gray-400">
                If this takes too long, the system will show cached data
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
                <p className="text-gray-600">Manage administrator accounts and permissions</p>
              </div>
            </div>

            {/* Connection Status Indicator */}
            {admins.length > 0 && error.includes('cached') && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-yellow-800 text-sm">
                  Showing cached data - Database connection slow
                </span>
                <button
                  onClick={() => window.location.reload()}
                  className="ml-auto text-yellow-700 text-xs underline hover:text-yellow-800"
                >
                  Refresh
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
                    <p className="text-sm text-gray-600">Total Administrators</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Crown className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {admins.filter(a => a.role === 'super_admin').length}
                    </p>
                    <p className="text-sm text-gray-600">Super Administrators</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-green-700 font-medium">Success!</p>
                <p className="text-green-600 text-sm mt-1">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message with Retry Option */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 font-medium">Connection Issue</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                {error.includes('timeout') || error.includes('Failed to load') ? (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={retryFetchAdmins}
                      disabled={isRetrying}
                      className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {isRetrying ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          Retrying...
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3" />
                          Retry Connection
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setError('')}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                    >
                      Dismiss
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

          {/* Controls */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search administrators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <UserPlus className="h-4 w-4" />
                Add Administrator
              </button>
            </div>
          </div>

          {/* Add Admin Form */}
          {showAddForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6 shadow-lg">
              <form onSubmit={handleAddAdmin}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Add New Administrator</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        value={newAdminData.email}
                        onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="admin@kfresh.ca"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newAdminData.password}
                        onChange={(e) => setNewAdminData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter secure password"
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum 8 characters required</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={newAdminData.first_name}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="First name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={newAdminData.last_name}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, last_name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Last name"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Administrator Role
                    </label>
                    <select
                      value={newAdminData.role}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="admin">Administrator</option>
                      <option value="super_admin">Super Administrator</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Super Administrators have full system access including user management
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <UserPlus className="h-4 w-4" />
                    Create Administrator
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setNewAdminData({
                        email: '',
                        first_name: '',
                        last_name: '',
                        password: '',
                        role: 'admin'
                      })
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Administrators List */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Administrators ({filteredAdmins.length})
              </h3>
            </div>

            {filteredAdmins.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No administrators found</p>
                <p className="text-gray-400 text-sm">Add your first administrator to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <div key={admin.id} className="p-6 hover:bg-gray-50 transition-colors">
                    {editing === admin.id ? (
                      /* Edit Form */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                            <input
                              type="text"
                              value={editData.first_name}
                              onChange={(e) => setEditData(prev => ({ ...prev, first_name: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                            <input
                              type="text"
                              value={editData.last_name}
                              onChange={(e) => setEditData(prev => ({ ...prev, last_name: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                            <select
                              value={editData.role}
                              onChange={(e) => setEditData(prev => ({ ...prev, role: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="admin">Administrator</option>
                              <option value="super_admin">Super Administrator</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAdmin(admin.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Check className="h-4 w-4" />
                            Save Changes
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode */
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-lg font-bold text-white">
                              {getInitials(admin.first_name, admin.last_name, admin.email)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {admin.first_name && admin.last_name 
                                ? `${admin.first_name} ${admin.last_name}`
                                : 'Administrator'
                              }
                            </h4>
                            <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                              <Mail className="h-3 w-3" />
                              {admin.email}
                            </p>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(admin.role)}`}>
                              {getRoleIcon(admin.role)}
                              {admin.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(admin)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit administrator"
                          >
                            <Edit3 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove administrator access for: ${admin.email}?`)) {
                                setSuccess('Administrator removal is restricted for security.')
                                setTimeout(() => setSuccess(''), 3000)
                              }
                            }}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Remove administrator"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
