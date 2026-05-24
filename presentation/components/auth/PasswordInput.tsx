'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  error?: string
  showStrength?: boolean
  label?: string
  required?: boolean
}

export function PasswordInput({ 
  value, 
  onChange, 
  placeholder = "••••••••", 
  error,
  showStrength = false,
  label = "Password",
  required = true
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const getStrength = () => {
    if (!value) return { label: '', color: '', width: '0%' }
    
    let score = 0
    if (value.length >= 8) score++
    if (/[A-Z]/.test(value)) score++
    if (/[a-z]/.test(value)) score++
    if (/[0-9]/.test(value)) score++
    if (/[!@#$%^&*]/.test(value)) score++
    
    const strengths = {
      0: { label: 'Very Weak', color: 'bg-red-500', width: '20%' },
      1: { label: 'Weak', color: 'bg-orange-500', width: '40%' },
      2: { label: 'Fair', color: 'bg-yellow-500', width: '60%' },
      3: { label: 'Good', color: 'bg-blue-500', width: '80%' },
      4: { label: 'Strong', color: 'bg-green-500', width: '100%' },
      5: { label: 'Very Strong', color: 'bg-green-600', width: '100%' }
    }
    return strengths[score as keyof typeof strengths] || strengths[0]
  }

  const strength = getStrength()

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && '*'}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      
      {showStrength && value && (
        <div className="mt-2">
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">Strength: {strength.label}</p>
        </div>
      )}
    </div>
  )
}