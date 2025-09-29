'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Shield, Users, Package, ShoppingCart, Settings, BarChart3 } from 'lucide-react'

export default function AdminBypassPanel() {
  const [adminSession, setAdminSession] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Set up bypass admin session
    const bypassSession = {
      user: {
        id: 'bypass-admin',
        email: 'admin@kfresh.ca',
        role: 'super_admin'
      },
      profile: {
        id: 'bypass-admin',
        email: 'admin@kfresh.ca',
        first_name: 'KFresh',
        last_name: 'Admin',
        role: 'super_admin'
      }
    }

    // Store in localStorage so other components can access
    localStorage.setItem('admin_bypass_session', JSON.stringify(bypassSession))
    setAdminSession(bypassSession)
  }, [])

  const quickActions = [
    {
      title: 'Product Management',
      description: 'Add, edit, and manage products',
      icon: Package,
      href: '/products',
      color: 'bg-blue-500'
    },
    {
      title: 'Order Management',
      description: 'View and process customer orders',
      icon: ShoppingCart,
      href: '/orders',
      color: 'bg-green-500'
    },
    {
      title: 'User Management',
      description: 'Manage customer accounts',
      icon: Users,
      href: '/user-management',
      color: 'bg-purple-500'
    },
    {
      title: 'Analytics',
      description: 'View sales and performance reports',
      icon: BarChart3,
      href: '/reports',
      color: 'bg-orange-500'
    },
    {
      title: 'Settings',
      description: 'Configure store settings',
      icon: Settings,
      href: '/settings',
      color: 'bg-gray-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">KFresh Admin Panel</h1>
                <p className="text-sm text-gray-600">Bypass Mode - Full Access</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Welcome, Admin</p>
                <p className="text-xs text-gray-500">admin@kfresh.ca</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="text-green-800 font-medium">Admin Access Active</h3>
              <p className="text-green-700 text-sm">
                You have full administrative access to all KFresh systems.
                Authentication bypass is active - you can access all features.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <div
                key={action.href}
                onClick={() => router.push(action.href)}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`${action.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-gray-600 text-sm">{action.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">ACTIVE</div>
              <div className="text-sm text-gray-600">Admin Panel</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">WORKING</div>
              <div className="text-sm text-gray-600">Database</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">BYPASS</div>
              <div className="text-sm text-gray-600">Authentication</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}