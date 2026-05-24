import { IUserRepository } from '@/core/repositories/IUserRepository'
import { User, SocialLinks, PrivacySettings, NotificationSettings, UserSettings } from '@/core/entities/User'
import { UpdateProfileDTO, UpdateSocialLinksDTO, UpdatePrivacyDTO, UpdateNotificationsDTO, UpdateUserSettingsDTO } from '@/application/dto/ProfileDTO'

export class ProfileService {
  constructor(private profileRepository: IUserRepository) {}

  async getProfileByUsername(username: string): Promise<User | null> {
    return await this.profileRepository.findByUsername(username)
  }

  async getProfileByUserId(userId: string): Promise<User | null> {
    return await this.profileRepository.findById(userId)  // 👈 Changed from findByUserId to findById
  }

  async updateProfile(userId: string, updates: UpdateProfileDTO): Promise<User> {
    return await this.profileRepository.updateProfile(userId, updates)
  }

  async updateSocialLinks(userId: string, links: UpdateSocialLinksDTO): Promise<User> {
    const socialLinks: SocialLinks = {
      github: links.github || undefined,
      twitter: links.twitter || undefined,
      linkedin: links.linkedin || undefined,
      website: links.website || undefined,
    }
    return await this.profileRepository.updateSocialLinks(userId, socialLinks)
  }

  async updatePrivacySettings(userId: string, privacy: UpdatePrivacyDTO): Promise<User> {
    const privacySettings: PrivacySettings = {
      isPrivate: privacy.isPrivate,
      showEmail: privacy.showEmail,
    }
    return await this.profileRepository.updatePrivacySettings(userId, privacySettings)
  }

  async updateNotificationSettings(userId: string, notifications: UpdateNotificationsDTO): Promise<User> {
    const notificationSettings: NotificationSettings = {
      emailNotifications: notifications.emailNotifications,
    }
    return await this.profileRepository.updateNotificationSettings(userId, notificationSettings)
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    return await this.profileRepository.uploadAvatar(userId, file)
  }

  async deleteAvatar(userId: string): Promise<void> {
    return await this.profileRepository.deleteAvatar(userId)
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    return await this.profileRepository.getUserSettings(userId)
  }

  async updateUserSettings(userId: string, settings: UpdateUserSettingsDTO): Promise<UserSettings> {
    return await this.profileRepository.updateUserSettings(userId, settings)
  }

  async checkUsernameAvailability(username: string, userId?: string): Promise<boolean> {
    return await this.profileRepository.checkUsernameAvailability(username, userId)
  }
}