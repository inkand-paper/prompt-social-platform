'use client'

import { useState } from 'react'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

interface ForgotPasswordFormProps {
  onBackToLogin: () => void
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      setSubmitted(true)
      toast.success('Reset link sent! Check your email.')
    }
  }

  if (submitted) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
          <Mail className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-white">Check Your Email</h3>
        <p className="text-gray-400">
          We sent a password reset link to <strong className="text-white">{email}</strong>
        </p>
        <button
          onClick={onBackToLogin}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white">Forgot Password?</h3>
        <p className="text-gray-400 text-sm mt-2">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-2">Email Address *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-white"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Reset Link
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onBackToLogin}
        className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Login
      </button>
    </form>
  )
}