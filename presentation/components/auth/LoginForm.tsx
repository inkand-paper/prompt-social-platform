'use client'

import { useState } from 'react'
import { Mail, LogIn, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/infrastructure/database/SupabaseClient'
import { PasswordInput } from './PasswordInput'
import { ForgotPasswordForm } from './ForgotPasswordForm'

interface LoginFormProps {
  onSuccess: () => void
  onSwitchToSignup: () => void
}

export function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password')
      setLoading(false)
      return
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    setLoading(false)

    if (signInError) {
      console.error('Login error:', signInError)
      
      // Handle specific error messages
      if (signInError.message.includes('Invalid login credentials')) {
        const errorMsg = 'Invalid email or password. Please try again.'
        setError(errorMsg)
        toast.error(errorMsg)
      } else if (signInError.message.includes('Email not confirmed')) {
        const errorMsg = 'Please verify your email address before logging in. Check your inbox for the confirmation link.'
        setError(errorMsg)
        toast.error(errorMsg, { duration: 6000 })
      } else {
        const errorMsg = signInError.message || 'Login failed. Please try again.'
        setError(errorMsg)
        toast.error(errorMsg)
      }
      return
    }

    if (data.user) {
      // Double-check email confirmation
      if (!data.user.confirmed_at) {
        const errorMsg = 'Please verify your email before logging in.'
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }
      
      toast.success('Logged in successfully!')
      onSuccess()
    }
  }

  if (showForgotPassword) {
    return <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      <PasswordInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        label="Password"
      />

      <div className="text-right">
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white shadow-lg"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Logging in...
          </div>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Sign In
          </>
        )}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-800/50 text-gray-500">New to PromptSocial?</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onSwitchToSignup}
        className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors text-white"
      >
        Create New Account
      </button>
    </form>
  )
}