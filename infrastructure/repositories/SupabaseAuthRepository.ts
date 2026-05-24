import { IAuthRepository } from '@/core/repositories/IAuthRepository'
import { supabase } from '@/infrastructure/database/SupabaseClient'
import { User } from '@/core/entities/User'
import { AuthSession } from '@/core/entities/AuthSession'

export class SupabaseAuthRepository implements IAuthRepository {
  async signUp(email: string, password: string, metadata: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata, emailRedirectTo: `${window.location.origin}/auth/callback` }
    })

    if (error) throw error

    return {
      user: this.mapToUser(data.user!),
      requiresConfirmation: !data.user?.confirmed_at
    }
  }

  async signIn(email: string, password: string): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (!data.user.confirmed_at) throw new Error('Email not confirmed')

    return {
      user: this.mapToUser(data.user),
      accessToken: data.session?.access_token || '',
      refreshToken: data.session?.refresh_token || '',
      expiresAt: new Date(data.session?.expires_at || 0)
    }
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    if (error) throw error
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    return this.mapToUser(user)
  }

  async resendConfirmationEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) throw error
  }

  private mapToUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      username: supabaseUser.user_metadata?.username || '',
      fullName: supabaseUser.user_metadata?.full_name || null,
      avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
      emailConfirmed: !!supabaseUser.confirmed_at,
      createdAt: new Date(supabaseUser.created_at),
      updatedAt: new Date(supabaseUser.updated_at),
      bio: null,
      location: null,
      occupation: null,
      socialLinks: { github: "", twitter: "", linkedin: "", website: null },
      privacy: { isPrivate: false, showEmail: false },
      notifications: { emailNotifications: false }
    }
  }
}