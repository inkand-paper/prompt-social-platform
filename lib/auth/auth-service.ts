// lib/auth/auth-service.ts
import { supabase } from '@/lib/supabase/client'
import { LoginInput, SignupInput, User } from '@/types/auth'
import { AuthResult } from '@/types/errors'
import { mapSupabaseError, mapCustomError } from './auth-errors'

export class AuthService {
  static async signup(data: SignupInput): Promise<AuthResult<{ user: User; requiresEmailConfirmation: boolean }>> {
    try {
      // Check if username is taken first
      const { data: existingUser, error: usernameCheckError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', data.username)
        .single()

      if (existingUser) {
        return {
          success: false,
          error: {
            code: 'USERNAME_TAKEN',
            message: 'Username already taken',
            userMessage: `Username "${data.username}" is already taken. Please choose another one.`,
          }
        }
      }

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.full_name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      if (authData.user) {
        const user: User = {
          id: authData.user.id,
          email: authData.user.email!,
          username: data.username,
          full_name: data.full_name || null,
          avatar_url: null,
        }

        // Check if email confirmation is required
        const requiresEmailConfirmation = !authData.user.confirmed_at
        
        return {
          success: true,
          data: {
            user,
            requiresEmailConfirmation
          }
        }
      }

      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Signup failed',
          userMessage: 'Unable to create account. Please try again.'
        }
      }
    } catch (error: any) {
      const mappedError = mapSupabaseError(error)
      return { success: false, error: mappedError }
    }
  }

  static async login(data: LoginInput): Promise<AuthResult<User>> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) throw error

      if (authData.user) {
        // Check if email is confirmed
        if (!authData.user.confirmed_at) {
          return {
            success: false,
            error: {
              code: 'EMAIL_NOT_CONFIRMED',
              message: 'Email not confirmed',
              userMessage: 'Please verify your email address before logging in. Check your inbox for the confirmation link.'
            }
          }
        }

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', authData.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError)
        }

        const user: User = {
          id: authData.user.id,
          email: authData.user.email!,
          username: profile?.username || '',
          full_name: profile?.full_name || null,
          avatar_url: profile?.avatar_url || null,
        }
        
        return { success: true, data: user }
      }

      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
          userMessage: 'Invalid email or password. Please try again.'
        }
      }
    } catch (error: any) {
      const mappedError = mapSupabaseError(error)
      return { success: false, error: mappedError }
    }
  }

  static async resendConfirmationEmail(email: string): Promise<AuthResult<void>> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      const mappedError = mapSupabaseError(error)
      return { success: false, error: mappedError }
    }
  }

  static async logout(): Promise<AuthResult<void>> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error: any) {
      const mappedError = mapSupabaseError(error)
      return { success: false, error: mappedError }
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .single()

      return {
        id: user.id,
        email: user.email!,
        username: profile?.username || '',
        full_name: profile?.full_name || null,
        avatar_url: profile?.avatar_url || null,
      }
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }
}