'use client'

import { useState } from 'react'
import { Mail, User, UserPlus, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/infrastructure/database/SupabaseClient'
import { PasswordInput } from './PasswordInput'

interface SignupFormProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const [loading, setLoading] = useState(false)
  const [requiresConfirmation, setRequiresConfirmation] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isChecking, setIsChecking] = useState(false)

  const emailIsValid = !!formData.email && /\S+@\S+\.\S+/.test(formData.email)

  // Returns an errors object for basic fields
  const validateBasic = (currentErrors: Record<string, string>) => {
    if (!formData.username) {
      currentErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      currentErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      currentErrors.username = 'Only letters, numbers, and underscores'
    }

    if (!formData.email) {
      currentErrors.email = 'Email is required'
    } else if (!emailIsValid) {
      currentErrors.email = 'Please enter a valid email address'
    }
  }

  // Appends password errors to the passing errors object
  const validatePassword = (currentErrors: Record<string, string>) => {
    if (!formData.password) {
      currentErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      currentErrors.password = 'Password must be at least 8 characters'
    } else if (!/[A-Z]/.test(formData.password)) {
      currentErrors.password = 'Password must contain at least one uppercase letter'
    } else if (!/[a-z]/.test(formData.password)) {
      currentErrors.password = 'Password must contain at least one lowercase letter'
    } else if (!/[0-9]/.test(formData.password)) {
      currentErrors.password = 'Password must contain at least one number'
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      currentErrors.password = 'Password must contain at least one special character (!@#$%^&*)'
    }

    if (formData.password !== formData.confirmPassword) {
      currentErrors.confirmPassword = 'Passwords do not match'
    }
  }

  // De-duped: only used in onBlur now; submit relies on its own single call
  const checkEmailExists = async (email: string): Promise<boolean> => {
    const { data } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle()
    return !!data
  }

  const checkUsernameExists = async (username: string): Promise<boolean> => {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle()
    return !!data
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Start fresh on every single submission
    const currentErrors: Record<string, string> = {}

    // STEP 1: Basic synchronous validation
    validateBasic(currentErrors)
    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors)
      toast.error('Please fix the errors in the form')
      return
    }

    // STEP 2 & 3: Database availability checks
    setLoading(true)
    try {
      setIsChecking(true)
      const [emailExists, usernameExists] = await Promise.all([
        checkEmailExists(formData.email),
        checkUsernameExists(formData.username)
      ])
      setIsChecking(false)

      if (emailExists) {
        currentErrors.email = 'An account with this email already exists. Please login instead.'
      }
      if (usernameExists) {
        currentErrors.username = 'Username is already taken. Please choose another one.'
      }

      if (Object.keys(currentErrors).length > 0) {
        setErrors(currentErrors)
        toast.error('Registration details are unavailable')
        setLoading(false)
        return
      }

      // STEP 4: Password validation — always runs on submit regardless of
      // whether the email field is filled, so users can't bypass it.
      validatePassword(currentErrors)
      if (Object.keys(currentErrors).length > 0) {
        setErrors(currentErrors)
        toast.error('Please fix the password issues')
        setLoading(false)
        return
      }

      // STEP 5: Create account
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.fullName
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        throw error
      }

      if (data.user) {
        setRegisteredEmail(formData.email)
        setRequiresConfirmation(true)
        toast.success('Account created successfully! Please check your email.', { duration: 6000 })
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      setIsChecking(false)
      if (error.message?.includes('already registered')) {
        setErrors({ email: 'An account with this email already exists.' })
      } else if (error.message?.includes('password')) {
        setErrors({ password: 'Password is too weak.' })
      } else if (error.message?.includes('rate_limit')) {
        toast.error('Too many attempts. Please wait a few minutes.')
      } else {
        toast.error(error.message || 'Failed to create account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const resendConfirmation = async () => {
    setResending(true)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: registeredEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    setResending(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Verification email resent! Please check your inbox.')
    }
  }

  if (requiresConfirmation) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
          <Mail className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-white">Verify Your Email</h3>
        <p className="text-gray-400">
          We sent a confirmation link to <strong className="text-white">{registeredEmail}</strong>
        </p>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-sm text-blue-300">
            Click the link in the email to verify your account. After verification, you can log in.
          </p>
        </div>
        <button
          onClick={resendConfirmation}
          disabled={resending}
          className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          {resending ? 'Sending...' : 'Resend Confirmation Email'}
        </button>
        <button onClick={onSwitchToLogin} className="text-blue-500 hover:underline text-sm">
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isChecking && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-500 text-sm">Checking profile availability...</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Username *</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={formData.username}
            onChange={(e) => {
              setFormData({ ...formData, username: e.target.value.toLowerCase() })
              if (errors.username) setErrors(prev => ({ ...prev, username: '' }))
            }}
            className={`w-full pl-10 pr-4 py-2.5 bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 ${
              errors.username ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="johndoe"
          />
        </div>
        {errors.username && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {errors.username}
          </p>
        )}
        <p className="text-gray-500 text-xs mt-1">Letters, numbers, and underscores only</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name (Optional)</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
            placeholder="John Doe"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value })
              if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
            }}
            onBlur={async () => {
              // Only check on blur — submit has its own single check
              if (emailIsValid) {
                setIsChecking(true)
                const exists = await checkEmailExists(formData.email)
                setIsChecking(false)
                if (exists) {
                  setErrors(prev => ({ ...prev, email: 'An account with this email already exists. Please login instead.' }))
                }
              }
            }}
            className={`w-full pl-10 pr-4 py-2.5 bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 ${
              errors.email ? 'border-red-500' : 'border-gray-700'
            }`}
            placeholder="you@example.com"
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {errors.email}
          </p>
        )}
      </div>

      {/*
        Password fields always render so users can fill them without a valid
        email. The strength indicator only appears once the email looks valid,
        keeping the UX clean without hiding inputs that submit will validate.
      */}
      <PasswordInput
        value={formData.password}
        onChange={(e) => {
          setFormData({ ...formData, password: e.target.value })
          if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
        }}
        showStrength={emailIsValid}
        label="Password"
        error={errors.password}
      />

      <PasswordInput
        value={formData.confirmPassword}
        onChange={(e) => {
          setFormData({ ...formData, confirmPassword: e.target.value })
          if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }))
        }}
        placeholder="Confirm password"
        label="Confirm Password"
        error={errors.confirmPassword}
      />

      <button
        type="submit"
        disabled={loading || isChecking}
        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white shadow-lg"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </div>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Create Account
          </>
        )}
      </button>

      <p className="text-center text-sm text-gray-400">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="text-blue-500 hover:underline font-medium">
          Sign in
        </button>
      </p>
    </form>
  )
}