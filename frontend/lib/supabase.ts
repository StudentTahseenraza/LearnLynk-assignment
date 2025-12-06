import { createClient } from '@supabase/supabase-js'

// Production Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

// Validate URL format
if (!supabaseUrl.startsWith('https://')) {
  console.warn('⚠️ Supabase URL should start with https:// for production')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-application-name': 'learnlynk-crm',
      'x-application-version': '1.0.0',
    },
  },
  db: {
    schema: 'public',
  },
})

// Helper function to get auth token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session?.access_token || null
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

// Helper function to check authentication status
export const checkAuth = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return !!data.session
  } catch (error) {
    console.error('Auth check error:', error)
    return false
  }
}

// Production mode - no mock data
export const shouldUseMockData = () => false

// Empty mock functions for production
export const mockFetchTodayTasks = async () => {
  console.warn('⚠️ Mock data function called in production')
  return { tasks: [], total: 0, completed: 0, pending: 0 }
}

export const mockMarkTaskComplete = async () => {
  console.warn('⚠️ Mock function called in production')
  throw new Error('Mock functions should not be called in production')
}