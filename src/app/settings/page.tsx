'use client'

import { useState } from 'react'
import { Save, Database, Store, Bell, Shield, Globe, Mail, Phone, MapPin } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Store Settings
    storeName: 'KFresh Supermarket',
    storeDescription: 'Your neighborhood African grocery store with fresh produce and cooked meals',
    storeAddress: '2090 Robertson Rd, Nepean, ON K2H 8V5',
    storePhone: '+1 (343) 996-9979',
    storeEmail: 'info@kfresh.ca',
    
    // Business Hours
    businessHours: {
      monday: { open: '08:00', close: '22:00', closed: false },
      tuesday: { open: '08:00', close: '22:00', closed: false },
      wednesday: { open: '08:00', close: '22:00', closed: false },
      thursday: { open: '08:00', close: '22:00', closed: false },
      friday: { open: '08:00', close: '22:00', closed: false },
      saturday: { open: '08:00', close: '22:00', closed: false },
      sunday: { open: '08:00', close: '22:00', closed: false }
    },
    
    // Order Settings
    minimumOrder: 25.00,
    deliveryFee: 5.99,
    freeDeliveryThreshold: 50.00,
    taxRate: 0.13,
    pickupLeadTime: 30, // minutes
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    newOrderAlerts: true,
    
    // Payment Settings
    acceptCash: true,
    acceptCard: true,
    acceptDebit: true,
    acceptEtransfer: true,
    
    // Partner Integration
    uberEatsEnabled: false,
    doorDashEnabled: false,
    skipEnabled: false,
    instacartEnabled: false
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      // In a real app, this would save to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const updateBusinessHour = (day: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day as keyof typeof prev.businessHours],
          [field]: value
        }
      }
    }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <button
            onClick={handleSave}
            disabled={saving}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
          }`}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Information */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Store className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Store Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => updateSetting('storeName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={settings.storeDescription}
                onChange={(e) => updateSetting('storeDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="h-4 w-4 inline mr-1" />
                Address
              </label>
              <input
                type="text"
                value={settings.storeAddress}
                onChange={(e) => updateSetting('storeAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={settings.storePhone}
                  onChange={(e) => updateSetting('storePhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => updateSetting('storeEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Settings */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold">Order Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={settings.minimumOrder}
                    onChange={(e) => updateSetting('minimumOrder', parseFloat(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={settings.deliveryFee}
                    onChange={(e) => updateSetting('deliveryFee', parseFloat(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Threshold</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={settings.freeDeliveryThreshold}
                    onChange={(e) => updateSetting('freeDeliveryThreshold', parseFloat(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  value={settings.taxRate * 100}
                  onChange={(e) => updateSetting('taxRate', parseFloat(e.target.value) / 100)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Lead Time (minutes)</label>
              <input
                type="number"
                value={settings.pickupLeadTime}
                onChange={(e) => updateSetting('pickupLeadTime', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="15"
                max="120"
              />
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-lg border p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold">Business Hours</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(settings.businessHours).map(([day, hours]) => (
              <div key={day} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 capitalize">{day}</label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!hours.closed}
                      onChange={(e) => updateBusinessHour(day, 'closed', !e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-1 text-xs text-gray-500">Open</span>
                  </label>
                </div>
                {!hours.closed && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => updateBusinessHour(day, 'open', e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => updateBusinessHour(day, 'close', e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-yellow-600" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Email Notifications</span>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">SMS Notifications</span>
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => updateSetting('smsNotifications', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Low Stock Alerts</span>
              <input
                type="checkbox"
                checked={settings.lowStockAlerts}
                onChange={(e) => updateSetting('lowStockAlerts', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">New Order Alerts</span>
              <input
                type="checkbox"
                checked={settings.newOrderAlerts}
                onChange={(e) => updateSetting('newOrderAlerts', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold">Payment Methods</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Accept Cash</span>
              <input
                type="checkbox"
                checked={settings.acceptCash}
                onChange={(e) => updateSetting('acceptCash', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Accept Credit/Debit Cards</span>
              <input
                type="checkbox"
                checked={settings.acceptCard}
                onChange={(e) => updateSetting('acceptCard', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Accept Debit Cards</span>
              <input
                type="checkbox"
                checked={settings.acceptDebit}
                onChange={(e) => updateSetting('acceptDebit', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Accept E-Transfer</span>
              <input
                type="checkbox"
                checked={settings.acceptEtransfer}
                onChange={(e) => updateSetting('acceptEtransfer', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Partner Integration Status */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Delivery Partner Integration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-4 border rounded-lg">
            <div className="w-16 h-16 mx-auto mb-3 bg-black text-white rounded-lg flex items-center justify-center font-bold text-xl">U</div>
            <p className="text-base font-semibold text-gray-900">Uber Eats</p>
            <p className="text-sm text-green-600 font-medium">Account Setup in Progress</p>
            <p className="text-xs text-gray-500 mt-1">Final call scheduled for tomorrow</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="w-16 h-16 mx-auto mb-3 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">D</div>
            <p className="text-base font-semibold text-gray-900">DoorDash</p>
            <p className="text-sm text-blue-600 font-medium">Scheduled for Next Month</p>
            <p className="text-xs text-gray-500 mt-1">Waiting for free first month promotion</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium text-blue-900">Partner Strategy Update</p>
              <p className="text-sm text-blue-700 mt-1">
                KFresh will focus exclusively on <strong>Uber Eats</strong> and <strong>DoorDash</strong> for delivery services. 
                Other platforms have been removed to streamline operations and maximize efficiency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}