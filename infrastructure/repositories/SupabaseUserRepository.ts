import { IUserRepository } from '@/core/repositories/IUserRepository'
import { supabase } from '@/infrastructure/database/SupabaseClient'
import { User, SocialLinks, PrivacySettings, NotificationSettings, UserSettings } from '@/core/entities/User'

export class SupabaseUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()
    return data ? this.mapToUser(data) : null
  }

  async getFollowStats(userId: string): Promise<{ followers: number, following: number }> {
    return { followers: 0, following: 0 }; // Stub for now
  }

  async findByUsername(username: string): Promise<User | null> {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()
    return data ? this.mapToUser(data) : null
  }

  async findById(userId: string): Promise<User | null> {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return data ? this.mapToUser(data) : null
  }

  async checkUsernameAvailability(username: string, excludeUserId?: string): Promise<boolean> {
    let query = supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
    
    if (excludeUserId) {
      query = query.neq('id', excludeUserId)
    }
    
    const { data } = await query.single()
    return !data
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const updateData: any = {}
    if (data.username !== undefined) updateData.username = data.username
    if (data.fullName !== undefined) updateData.full_name = data.fullName
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl
    if (data.bio !== undefined) updateData.bio = data.bio
    if (data.location !== undefined) updateData.location = data.location
    if (data.occupation !== undefined) updateData.occupation = data.occupation
    if (data.socialLinks !== undefined) {
      updateData.github_url = data.socialLinks.github
      updateData.twitter_url = data.socialLinks.twitter
      updateData.linkedin_url = data.socialLinks.linkedin
      updateData.website = data.socialLinks.website
    }
    if (data.privacy !== undefined) {
      updateData.is_private = data.privacy.isPrivate
      updateData.show_email = data.privacy.showEmail
    }
    if (data.notifications !== undefined) {
      updateData.email_notifications = data.notifications.emailNotifications
    }
    
    updateData.updated_at = new Date().toISOString()

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return this.mapToUser(updated)
  }

  // ADD MISSING METHODS:
  async updateSocialLinks(userId: string, links: SocialLinks): Promise<User> {
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({
        github_url: links.github || null,
        twitter_url: links.twitter || null,
        linkedin_url: links.linkedin || null,
        website: links.website || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return this.mapToUser(updated)
  }

  async updatePrivacySettings(userId: string, privacy: PrivacySettings): Promise<User> {
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({
        is_private: privacy.isPrivate,
        show_email: privacy.showEmail,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return this.mapToUser(updated)
  }

  async updateNotificationSettings(userId: string, notifications: NotificationSettings): Promise<User> {
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({
        email_notifications: notifications.emailNotifications,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return this.mapToUser(updated)
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error || !data) return null
    
    return {
      theme: data.theme,
      language: data.language,
      aiModelPreference: data.ai_model_preference,
    }
  }

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    const updateData: any = {}
    if (settings.theme !== undefined) updateData.theme = settings.theme
    if (settings.language !== undefined) updateData.language = settings.language
    if (settings.aiModelPreference !== undefined) updateData.ai_model_preference = settings.aiModelPreference
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('user_settings')
      .upsert({ user_id: userId, ...updateData })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      theme: data.theme,
      language: data.language,
      aiModelPreference: data.ai_model_preference,
    }
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    const filePath = fileName

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    await this.updateProfile(userId, { avatarUrl: publicUrl })

    return publicUrl
  }

  async deleteAvatar(userId: string): Promise<void> {
    const user = await this.findById(userId)
    if (user?.avatarUrl) {
      const urlParts = user.avatarUrl.split('/avatars/')
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        await supabase.storage.from('avatars').remove([filePath])
      }
    }
    
    await this.updateProfile(userId, { avatarUrl: null })
  }

  private mapToUser(data: any): User {
    return {
      id: data.id,
      email: data.email,
      username: data.username,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      bio: data.bio || null,
      location: data.location || null,
      occupation: data.occupation || null,
      socialLinks: {
        github: data.github_url || null,
        twitter: data.twitter_url || null,
        linkedin: data.linkedin_url || null,
        website: data.website || null,
      },
      privacy: {
        isPrivate: data.is_private || false,
        showEmail: data.show_email || false,
      },
      notifications: {
        emailNotifications: data.email_notifications !== false,
      },
      emailConfirmed: true,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }
}