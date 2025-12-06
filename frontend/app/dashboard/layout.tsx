'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Navigation from '../../components/Navigation'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        
        if (!data.session) {
          router.push('/auth/login')
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth/login')
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          router.push('/auth/login')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-4">{children}</main>
    </div>
  )
}