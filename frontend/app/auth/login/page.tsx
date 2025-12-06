'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMasked, setIsMasked] = useState(true)
  const [autoFilled, setAutoFilled] = useState(false)
  
  // Refs for inputs
  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  
  // Auto-focus on email when component mounts
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus()
    }
  }, [])

  // Mask password on double click
  useEffect(() => {
    const handleDoubleClick = (e: MouseEvent) => {
      if (e.target === passwordInputRef.current) {
        setIsMasked(false)
        setTimeout(() => setIsMasked(true), 2000)
      }
    }

    document.addEventListener('dblclick', handleDoubleClick)
    return () => document.removeEventListener('dblclick', handleDoubleClick)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password')
      setLoading(false)
      return
    }

    try {
      console.log('Attempting login with:', { email: email.trim() })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      console.log('Login response:', { data, error })

      if (error) {
        console.error('Login error details:', error)
        
        // More specific error messages
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please confirm your email address before logging in.')
        } else {
          setError(error.message || 'An error occurred during login')
        }
        return
      }

      if (data?.user) {
        console.log('Login successful, redirecting...')
        
        // Show success message briefly
        setError(null)
        
        // Add a small delay for better UX
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 500)
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  // Quick login button for testing - FIXED VERSION
  const handleQuickTestLogin = async () => {
    setLoading(true)
    setError(null)
    
    // Set values and trigger UI update
    setEmail('admin@learnlynk.com')
    setPassword('admin123')
    setAutoFilled(true)
    
    // Force React to update the DOM immediately
    setTimeout(() => {
      if (emailInputRef.current) {
        emailInputRef.current.value = 'admin@learnlynk.com'
        // Trigger change event
        emailInputRef.current.dispatchEvent(new Event('input', { bubbles: true }))
      }
      
      if (passwordInputRef.current) {
        passwordInputRef.current.value = 'admin123'
        // Trigger change event
        passwordInputRef.current.dispatchEvent(new Event('input', { bubbles: true }))
      }
      
      // Show password briefly for verification
      setIsMasked(false)
      
      // Show auto-filled confirmation
      setTimeout(() => {
        setIsMasked(true)
        setLoading(false)
        
        // Auto-submit the form
        const form = document.querySelector('form')
        if (form) {
          const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement
          if (submitButton) {
            submitButton.click()
          }
        }
      }, 1000)
    }, 100)
  }

  // Handle demo user creation
  const handleCreateDemoUser = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Try to sign up a demo user
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@learnlynk.com',
        password: 'admin123',
        options: {
          data: {
            role: 'admin'
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        // If user already exists, try to update password
        if (error.message.includes('already registered')) {
          setError('User already exists. Please use: admin@learnlynk.com / admin123')
        } else {
          setError(`Failed to create user: ${error.message}`)
        }
      } else {
        if (data.user?.identities?.length === 0) {
          setError('User already exists. Please use: admin@learnlynk.com / admin123')
        } else {
          setError('Demo user created! Please check your email to confirm, or try logging in directly.')
        }
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle copy to clipboard
  const handleCopyToClipboard = (text: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text)
    alert(`${type === 'email' ? 'Email' : 'Password'} copied to clipboard!`)
    
    if (type === 'email') {
      setEmail(text)
      if (emailInputRef.current) {
        emailInputRef.current.focus()
      }
    } else {
      setPassword(text)
      setIsMasked(false)
      setTimeout(() => setIsMasked(true), 2000)
      if (passwordInputRef.current) {
        passwordInputRef.current.focus()
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">L</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your LearnLynk CRM account</p>
            
            {/* Test credentials notice */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-left w-full">
                  <p className="text-sm font-medium text-blue-800 mb-2">Test Credentials</p>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-700">Email:</span>
                      <button
                        onClick={() => handleCopyToClipboard('admin@learnlynk.com', 'email')}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded font-mono transition-colors"
                      >
                        admin@learnlynk.com
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-700">Password:</span>
                      <button
                        onClick={() => handleCopyToClipboard('admin123', 'password')}
                        className={`text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded font-mono transition-colors ${isMasked && !autoFilled ? 'blur-[2px] hover:blur-0' : ''}`}
                        title="Click to copy, double-click to reveal"
                      >
                        {isMasked && !autoFilled ? '••••••••' : 'admin123'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleQuickTestLogin}
                      disabled={loading}
                      className="flex-1 min-w-[140px] text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading && autoFilled ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Auto-filling...
                        </>
                      ) : (
                        <>
                          {autoFilled ? <CheckCircle className="w-4 h-4 mr-2" /> : null}
                          Auto-fill & Sign In
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCreateDemoUser}
                      disabled={loading}
                      className="flex-1 min-w-[140px] text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    >
                      Create Demo User
                    </button>
                  </div>
                  
                  {autoFilled && (
                    <div className="mt-2 flex items-center text-green-600 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Credentials auto-filled! Click "Sign in" or wait...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-red-800 text-sm font-medium">Login Error</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                  <p className="text-red-600 text-xs mt-2">
                    Need help? Check if the user exists in Supabase Auth
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setAutoFilled(false)
                  }}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-500 transition-all text-gray-900"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                  style={{ borderColor: autoFilled ? '#3b82f6' : '#d1d5db' }}
                />
                {email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  ref={passwordInputRef}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setAutoFilled(false)
                  }}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-900 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 disabled:bg-gray-500 transition-all text-gray-900"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  title="Double-click to reveal password"
                  style={{ borderColor: autoFilled ? '#3b82f6' : '#d1d5db' }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">
                  {password && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:bg-gray-100 rounded p-1 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                Double-click password field to temporarily reveal
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <button
                onClick={handleCreateDemoUser}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Create demo account
              </button>
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <a
                href="https://supabase.com/docs/guides/auth#create-a-new-user"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                How to create users in Supabase →
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Setup Instructions:</h3>
              <ol className="mt-2 text-sm text-yellow-700 list-decimal list-inside space-y-1">
                <li>Go to Supabase Dashboard → Authentication → Users</li>
                <li>Click "Add User" and create: admin@learnlynk.com / admin123</li>
                <li>Disable "Confirm email" in Authentication → Settings</li>
                <li>Set Site URL to your deployed URL</li>
                <li>Refresh this page and login</li>
              </ol>
              {/* <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => window.open('https://app.supabase.com/project/_/auth/users', '_blank')}
                  className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded hover:bg-yellow-200 border border-yellow-300"
                >
                  Go to Supabase Auth
                </button>
                <button
                  onClick={() => {
                    const url = `https://app.supabase.com/project/${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').split('.')[0]}/auth/users`
                    window.open(url, '_blank')
                  }}
                  className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded hover:bg-blue-200 border border-blue-300"
                >
                  Open Your Project
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}