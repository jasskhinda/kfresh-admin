'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Shield, Plus, Trash2, Edit, Check, X, AlertCircle } from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: string
  created_at: string
  last_sign_in_at: string | null
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      
      // Fetch admin users from user_profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      setAdmins(profiles || [])
    } catch (err: any) {
      console.error('Error fetching admins:', err)
      setError('Failed to load admin users')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      // For now, just create the profile (user creation would need special admin permissions)
      const { data: { user }, error: getCurrentUserError } = await supabase.auth.getUser()
      
      if (getCurrentUserError) throw getCurrentUserError

      // Create a temporary profile entry for demonstration
      // In production, this would need proper user creation flow
      const tempId = `temp-${Date.now()}`
      
      setSuccess('Admin creation requires special permissions. Contact system administrator.')
      setShowAddForm(false)
      setNewAdminData({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        role: 'admin'
      })

      // Auto-clear success message
      setTimeout(() => setSuccess(''), 5000)

    } catch (err: any) {
      console.error('Error creating admin:', err)
      setError('Admin creation requires special database permissions. Please contact your system administrator.')
    }
  }

  const handleEditAdmin = async (adminId: string) => {
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: editData.first_name,
          last_name: editData.last_name,
          role: editData.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminId)

      if (error) throw error

      setSuccess('Admin updated successfully!')
      setEditing(null)
      fetchAdmins()

      // Auto-clear success message
      setTimeout(() => setSuccess(''), 3000)

    } catch (err: any) {
      console.error('Error updating admin:', err)
      setError(err.message || 'Failed to update admin')
    }
  }

  const handleDeleteAdmin = async (adminId: string, adminEmail: string) => {
    if (!confirm(`Are you sure you want to delete admin: ${adminEmail}?`)) {
      return
    }

    setError('')
    setSuccess('')

    try {
      // Only delete from user_profiles (auth deletion requires special permissions)
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', adminId)

      if (profileError) throw profileError

      setSuccess('Admin profile removed successfully!')
      fetchAdmins()

      // Auto-clear success message
      setTimeout(() => setSuccess(''), 3000)

    } catch (err: any) {
      console.error('Error deleting admin:', err)
      setError(err.message || 'Failed to delete admin profile')
    }
  }

  const startEdit = (admin: AdminUser) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading admin users...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Check className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <p className="text-green-700 font-medium">Success!</p>
            <p className="text-green-600 text-sm mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Add Admin Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Admin Users ({admins.length})</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Admin
        </button>
      </div>

      {/* Add Admin Form */}
      {showAddForm && (
        <form onSubmit={handleAddAdmin} className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Admin</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={newAdminData.email}
                onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@kfresh.ca"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={newAdminData.password}
                onChange={(e) => setNewAdminData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Temporary password"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={newAdminData.first_name}
                onChange={(e) => setNewAdminData(prev => ({ ...prev, first_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="First name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={newAdminData.last_name}
                onChange={(e) => setNewAdminData(prev => ({ ...prev, last_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={newAdminData.role}
                onChange={(e) => setNewAdminData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="admin">Administrator</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Admin
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Admin Users List */}
      <div className="space-y-4">
        {admins.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No admin users found</p>
          </div>
        ) : (
          admins.map((admin) => (
            <div key={admin.id} className="bg-white border border-gray-200 rounded-lg p-4">
              {editing === admin.id ? (
                /* Edit Form */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={editData.first_name}
                        onChange={(e) => setEditData(prev => ({ ...prev, first_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={editData.last_name}
                        onChange={(e) => setEditData(prev => ({ ...prev, last_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
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
                      className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {admin.first_name?.[0]?.toUpperCase() || admin.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {admin.first_name && admin.last_name 
                          ? `${admin.first_name} ${admin.last_name}`
                          : 'Unnamed Admin'
                        }
                      </h4>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {admin.email}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Shield className="h-3 w-3" />
                        {admin.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(admin)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit admin"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete admin"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
