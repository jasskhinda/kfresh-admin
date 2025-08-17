'use client'

import { Bell, Search, ExternalLink, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  type: 'order' | 'stock' | 'system'
  title: string
  message: string
  time: string
  read: boolean
}

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      // Get recent orders for notifications
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, order_number, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      // Get low stock products
      const { data: lowStockProducts } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .lte('stock_quantity', 10)
        .eq('is_available', true)
        .limit(3)

      const orderNotifications: Notification[] = recentOrders?.map(order => ({
        id: `order-${order.id}`,
        type: 'order' as const,
        title: 'New Order',
        message: `Order ${order.order_number} - ${order.status}`,
        time: new Date(order.created_at).toLocaleTimeString(),
        read: false
      })) || []

      const stockNotifications: Notification[] = lowStockProducts?.map(product => ({
        id: `stock-${product.id}`,
        type: 'stock' as const,
        title: 'Low Stock Alert',
        message: `${product.name} - Only ${product.stock_quantity} left`,
        time: 'Now',
        read: false
      })) || []

      const allNotifications = [...orderNotifications, ...stockNotifications]
      setNotifications(allNotifications)
      setUnreadCount(allNotifications.filter(n => !n.read).length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return '📦'
      case 'stock': return '⚠️'
      case 'system': return '🔔'
      default: return '📢'
    }
  }
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, orders, customers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Store Link */}
          <a
            href={process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View Store</span>
          </a>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                            <p className="text-gray-600 text-sm">{notification.message}</p>
                            <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={fetchNotifications}
                    className="w-full text-center text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    Refresh Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">A</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}