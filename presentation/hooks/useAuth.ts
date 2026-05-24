import { useEffect, useState } from 'react'
import { supabase } from '@/infrastructure/database/SupabaseClient'
import { User } from '@/core/entities/User'
import { SupabaseAuthRepository } from '@/infrastructure/repositories/SupabaseAuthRepository'
import { SupabaseUserRepository } from '@/infrastructure/repositories/SupabaseUserRepository'
import { AuthService } from '@/application/services/AuthService'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const authRepo = new SupabaseAuthRepository()
  const userRepo = new SupabaseUserRepository()
  const authService = new AuthService(authRepo, userRepo)

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        const fullUser = await userRepo.findById(currentUser.id)
        setUser(fullUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const currentUser = await authService.getCurrentUser()
        if (currentUser) {
          const fullUser = await userRepo.findById(currentUser.id)
          setUser(fullUser)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    const result = await authService.login({ email, password })
    if (result.success && result.data) {
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        const fullUser = await userRepo.findById(currentUser.id)
        setUser(fullUser)
      }
    }
    return result
  }

  const signup = async (email: string, password: string, username: string, fullName?: string) => {
    const result = await authService.signUp({ email, password, username, fullName })
    if (result.success && result.data) {
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        const fullUser = await userRepo.findById(currentUser.id)
        setUser(fullUser)
      }
    }
    return result
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  const getAuthToken = async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || null
  }

  return { 
    user, 
    loading, 
    login, 
    signup, 
    logout, 
    updateUser,
    getAuthToken
  }
}