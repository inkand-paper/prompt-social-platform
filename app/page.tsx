'use client'

import { useState } from 'react'
import { LoginForm } from '@/presentation/components/auth/LoginForm'
import { SignupForm } from '@/presentation/components/auth/SignupForm'
import { Toaster } from 'sonner'

export default function Home() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const handleAuthSuccess = () => {
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <Toaster position="top-center" richColors />
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            PromptSocial
          </h1>
          <p className="text-gray-400 mt-3">Share, discover, and test AI prompts</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          {mode === 'login' ? (
            <LoginForm 
              onSuccess={handleAuthSuccess}
              onSwitchToSignup={() => setMode('signup')}
            />
          ) : (
            <SignupForm 
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setMode('login')}
            />
          )}
        </div>
      </div>
    </div>
  )
}