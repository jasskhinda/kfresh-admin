'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Clock, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type ConnectionStatus = 'checking' | 'good' | 'slow' | 'offline'

export default function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('checking')
  const [latency, setLatency] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    checkConnection()
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkConnection = async () => {
    const startTime = Date.now()
    
    try {
      // Simple database ping
      const { error } = await Promise.race([
        supabase.from('user_profiles').select('id').limit(1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 5000)
        )
      ]) as any

      const endTime = Date.now()
      const responseTime = endTime - startTime

      setLatency(responseTime)

      if (error) {
        setStatus('offline')
      } else if (responseTime > 3000) {
        setStatus('slow')
      } else {
        setStatus('good')
      }
    } catch (err) {
      setStatus('offline')
      setLatency(null)
    }
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'good':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: 'Connected',
          description: latency ? `${latency}ms` : 'Good'
        }
      case 'slow':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          text: 'Slow Connection',
          description: latency ? `${latency}ms` : 'Delayed'
        }
      case 'offline':
        return {
          icon: WifiOff,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          text: 'Connection Issues',
          description: 'Offline'
        }
      default:
        return {
          icon: Wifi,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: 'Checking...',
          description: 'Testing'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
      <Icon className={`h-4 w-4 ${config.color}`} />
      <div className="text-sm">
        <span className={`font-medium ${config.color}`}>{config.text}</span>
        <span className="text-gray-500 ml-1">({config.description})</span>
      </div>
    </div>
  )
}
