'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { createAdminUser, updateUserPassword, deleteAdminUser } from '@/lib/actions/user-actions'
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
  EyeOff,
  Loader2
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
  const { user } = useAuth()
  const [admins, setAdmins] = useState<AdminProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [processing, setProcessing] = useState(false)
  const supabase = createClient()

  // Add admin form data
  const [newAdminData, setNewAdminData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'admin' as 'admin' | 'super_admin'
  })

  // Edit admin data
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    role: 'admin' as 'admin' | 'super_admin'
  })

  // Password change data
  const [passwordData, setPasswordData] = useState({
    userId: '',
    newPassword: '',
    showPasswordForm: false
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('Fetching admin users from database...')
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('role', ['admin', 'super_admin'])
        .order('created_at', { ascending: false })

      if (profilesError) {
        throw profilesError
      }

      console.log('Successfully loaded admin users:', profiles?.length || 0)
      setAdmins(profiles || [])

    } catch (err: any) {
      console.error('Error fetching admins:', err)
      setError(`Failed to load admin users: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setProcessing(true)

    try {
      // Validate input
      if (!newAdminData.email || !newAdminData.password) {
        setError('Email and password are required')
        return
      }

      if (newAdminData.password.length < 6) {
        setError('Password must be at least 6 characters long')
        return
      }

      if (!newAdminData.firstName.trim() || !newAdminData.lastName.trim()) {
        setError('First name and last name are required')
        return
      }

      console.log('Creating admin account:', newAdminData.email)

      // Use the new professional API
      const result = await createAdminUser({
        email: newAdminData.email,
        password: newAdminData.password,
        firstName: newAdminData.firstName,
        lastName: newAdminData.lastName,
        role: newAdminData.role
      })

      if (result.success) {
        setSuccess(`Admin user created successfully! Email: ${newAdminData.email}`)
        setNewAdminData({
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          role: 'admin'
        })
        setShowAddForm(false)

        // Refresh the list
        await fetchAdmins()
      } else {
        setError(result.error || 'Failed to create admin user')
      }

    } catch (err: any) {
      console.error('Error creating admin:', err)
      setError(`Error creating admin: ${err.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdateProfile = async (adminId: string) => {
    setError('')
    setSuccess('')
    setProcessing(true)

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          first_name: editData.firstName,
          last_name: editData.lastName,
          role: editData.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminId)

      if (updateError) {
        throw updateError
      }

      setSuccess('Admin profile updated successfully')
      setEditing(null)
      await fetchAdmins()

    } catch (err: any) {
      console.error('Error updating admin:', err)
      setError(`Error updating admin: ${err.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdatePassword = async () => {
    setError('')
    setSuccess('')
    setProcessing(true)

    try {
      if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
        setError('Password must be at least 6 characters long')
        return
      }

      const result = await updateUserPassword(passwordData.userId, passwordData.newPassword)

      if (result.success) {
        setSuccess('Password updated successfully')
        setPasswordData({
          userId: '',
          newPassword: '',
          showPasswordForm: false
        })
      } else {
        setError(result.error || 'Failed to update password')
      }

    } catch (err: any) {
      console.error('Error updating password:', err)
      setError(`Error updating password: ${err.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin user? This action cannot be undone.')) {
      return
    }

    setError('')
    setSuccess('')
    setProcessing(true)

    try {
      const result = await deleteAdminUser(adminId)

      if (result.success) {
        setSuccess('Admin user deleted successfully')
        await fetchAdmins()
      } else {
        setError(result.error || 'Failed to delete admin user')
      }

    } catch (err: any) {
      console.error('Error deleting admin:', err)
      setError(`Error deleting admin: ${err.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const startEdit = (admin: AdminProfile) => {
    setEditing(admin.id)
    setEditData({
      firstName: admin.first_name || '',
      lastName: admin.last_name || '',
      role: admin.role as 'admin' | 'super_admin'
    })
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditData({
      firstName: '',
      lastName: '',
      role: 'admin'
    })
  }

  const showPasswordForm = (userId: string) => {
    setPasswordData({
      userId,
      newPassword: '',
      showPasswordForm: true
    })
  }

  const cancelPasswordChange = () => {
    setPasswordData({
      userId: '',
      newPassword: '',
      showPasswordForm: false
    })
  }

  // Filter admins based on search
  const filteredAdmins = admins.filter(admin =>
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${admin.first_name} ${admin.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewAdminData(prev => ({ ...prev, password }))
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-600" />
              Admin User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage administrator accounts and permissions</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            disabled={processing}
          >
            <UserPlus className="w-5 h-5" />
            Add Admin
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Add Admin Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New Admin</h2>
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newAdminData.email}
                    onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newAdminData.firstName}
                    onChange={(e) => setNewAdminData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newAdminData.lastName}
                    onChange={(e) => setNewAdminData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newAdminData.password}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                  >
                    Generate secure password
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={newAdminData.role}
                    onChange={(e) => setNewAdminData(prev => ({ ...prev, role: e.target.value as 'admin' | 'super_admin' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    {processing ? 'Creating...' : 'Create Admin'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Change Form */}
        {passwordData.showPasswordForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleUpdatePassword}
                    disabled={processing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    {processing ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    onClick={cancelPasswordChange}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600 mt-2">Loading admin users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editing === admin.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editData.firstName}
                              onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                              placeholder="First Name"
                            />
                            <input
                              type="text"
                              value={editData.lastName}
                              onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                              placeholder="Last Name"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {admin.first_name} {admin.last_name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {admin.email}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editing === admin.id ? (
                          <select
                            value={editData.role}
                            onChange={(e) => setEditData(prev => ({ ...prev, role: e.target.value as 'admin' | 'super_admin' }))}
                            className="px-2 py-1 text-sm border border-gray-300 rounded"
                          >
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            admin.role === 'super_admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {admin.role === 'super_admin' ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                            {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {editing === admin.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleUpdateProfile(admin.id)}
                              disabled={processing}
                              className="text-green-600 hover:text-green-800 disabled:opacity-50"
                            >
                              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-gray-600 hover:text-gray-800"
                              disabled={processing}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => startEdit(admin)}
                              className="text-blue-600 hover:text-blue-800"
                              disabled={processing}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => showPasswordForm(admin.id)}
                              className="text-orange-600 hover:text-orange-800"
                              disabled={processing}
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                            {admin.id !== user?.id && (
                              <button
                                onClick={() => handleDeleteAdmin(admin.id)}
                                className="text-red-600 hover:text-red-800"
                                disabled={processing}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAdmins.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p>No admin users found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-700 font-semibold">Total Admins</div>
            <div className="text-2xl font-bold text-blue-900">{admins.length}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-purple-700 font-semibold">Super Admins</div>
            <div className="text-2xl font-bold text-purple-900">
              {admins.filter(a => a.role === 'super_admin').length}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-700 font-semibold">Regular Admins</div>
            <div className="text-2xl font-bold text-green-900">
              {admins.filter(a => a.role === 'admin').length}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}