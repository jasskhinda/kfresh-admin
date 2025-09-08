// KFresh Store Configuration
// This file contains store configuration that's managed from the admin panel
// and used by the client application

export interface StoreConfig {
  store: {
    name: string
    description: string
    address: string
    phone: string
    email: string
  }
  order: {
    minimumOrder: number
    deliveryFee: number
    freeDeliveryThreshold: number
    taxRate: number
    pickupLeadTime: number
  }
  notifications: {
    email: boolean
    sms: boolean
    lowStock: boolean
    newOrder: boolean
  }
  payments: {
    cash: boolean
    card: boolean
    debit: boolean
    etransfer: boolean
  }
  partners: {
    uberEats: boolean
    doorDash: boolean
  }
  lastUpdated: string
}

// Default configuration
export const defaultStoreConfig: StoreConfig = {
  store: {
    name: 'KFresh Supermarket',
    description: 'Your neighborhood African grocery store with fresh produce and cooked meals',
    address: '2090 Robertson Rd, Nepean, ON K2H 8V5',
    phone: '+1 (343) 996-9979',
    email: 'info@kfresh.ca'
  },
  order: {
    minimumOrder: 25.00,
    deliveryFee: 5.99,
    freeDeliveryThreshold: 50.00,
    taxRate: 0.13,
    pickupLeadTime: 30
  },
  notifications: {
    email: true,
    sms: false,
    lowStock: true,
    newOrder: true
  },
  payments: {
    cash: true,
    card: true,
    debit: true,
    etransfer: true
  },
  partners: {
    uberEats: false,
    doorDash: false
  },
  lastUpdated: new Date().toISOString()
}

// Function to get current store configuration
export function getStoreConfig(): StoreConfig {
  if (typeof window === 'undefined') {
    return defaultStoreConfig
  }
  
  try {
    const stored = localStorage.getItem('kfresh_store_config')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading store config:', error)
  }
  
  return defaultStoreConfig
}

// Function to save store configuration
export function saveStoreConfig(config: StoreConfig): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    config.lastUpdated = new Date().toISOString()
    localStorage.setItem('kfresh_store_config', JSON.stringify(config))
  } catch (error) {
    console.error('Error saving store config:', error)
  }
}
