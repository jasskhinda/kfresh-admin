'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Mail, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await signIn(formData.email, formData.password)

      if (error) throw error

      setSuccess('Signed in successfully!')
      
      // Redirect to admin dashboard after 1 second
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
      </div>

      {/* Header Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <Image 
            src="/Kfreshfinallogo.webp" 
            alt="KFresh" 
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <span className="text-white text-xl font-bold">KFresh Admin</span>
        </div>
        <div className="flex items-center gap-2 text-white/80">
          <Shield className="h-5 w-5" />
          <span className="text-sm">Secure Admin Portal</span>
        </div>
      </nav>

      <div className="relative flex items-center justify-center min-h-[calc(100vh-100px)] p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full">
          
          {/* Left Side - Welcome Content */}
          <div className="flex flex-col justify-center text-white lg:pr-8">
            <div className="mb-8">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Welcome to
              </h1>
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                KFresh Admin Panel
              </h2>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Manage your supermarket operations with our comprehensive admin dashboard. 
                Control inventory, process orders, and monitor your business performance.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-white/90">Secure Administrator Access</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 2a1 1 0 100 2h2a1 1 0 100-2h-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white/90">Real-time Business Analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <svg className="h-4 w-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 15V9h4v6H8z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white/90">Inventory & Order Management</span>
              </div>
            </div>

            {/* Features List */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Admin Panel Features</h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  Product & Category Management
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Order Processing & Tracking
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  Customer & User Management
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                  Sales Analytics & Reports
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                  Inventory & Stock Control
                </li>
              </ul>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Admin Access
            </h1>
            <p className="text-gray-600 mb-6">
              Sign in to KFresh Admin Panel
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-green-700 font-medium">Success!</p>
                <p className="text-green-600 text-sm mt-1">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 bg-gray-50/50 transition-all duration-200"
                  placeholder="admin@kfresh.ca"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-12 pr-14 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 bg-gray-50/50 transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : success ? (
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Signed in! Redirecting...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Access Admin Panel
                </div>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg className="h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <h3 className="text-sm font-semibold text-amber-900">
                Demo Credentials
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-amber-700 font-medium">Email:</span>
                <code className="text-amber-800 bg-amber-100 px-2 py-1 rounded text-xs">admin@kfresh.ca</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-700 font-medium">Password:</span>
                <code className="text-amber-800 bg-amber-100 px-2 py-1 rounded text-xs">admin123</code>
              </div>
            </div>
          </div>

          {/* Admin Notice */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-blue-900">
                Admin Access Only
              </h3>
            </div>
            <p className="text-xs text-blue-700">
              This panel is restricted to authorized administrators only.
              Unauthorized access attempts are logged and monitored.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              KFresh Supermarket Admin Panel © 2025
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
  )
}
