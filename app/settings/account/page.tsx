'use client'

import { useState } from 'react'
import { useAuth } from '@/presentation/hooks/useAuth'
import { supabase } from '@/infrastructure/database/SupabaseClient'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

export default function AccountSettingsPage() {
  const { user, logout } = useAuth()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      
      toast.success('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error('Failed to update password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    
    try {
      // Delete profile (cascade will handle auth user via trigger)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)
      
      if (error) throw error
      
      await logout()
      toast.success('Account deleted successfully')
      // Redirect will happen via logout
    } catch (error) {
      toast.error('Failed to delete account')
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href={`/profile/${user.username}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        <div className="space-y-6">
          {/* Change Password */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-900/20 backdrop-blur-sm rounded-2xl p-8 border border-red-700">
            <h2 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h2>
            <p className="text-gray-300 mb-4">
              Once you delete your account, there is no going back. All your prompts, likes, and data will be permanently removed.
            </p>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete Account
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Are you absolutely sure?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Yes, delete my account
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}