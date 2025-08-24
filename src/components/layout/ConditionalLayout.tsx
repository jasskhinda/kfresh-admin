'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading } = useAuth()

  // Don't show sidebar/header on login page
  const isLoginPage = pathname === '/login'
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  // If on login page, just show the children (login form)
  if (isLoginPage) {
    return <>{children}</>
  }

  // If not logged in and not on login page, redirect to login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // If logged in and not on login page, show full layout with sidebar
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
