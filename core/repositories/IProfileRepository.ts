import { User, UserSettings, SocialLinks, PrivacySettings, NotificationSettings } from '@/core/entities/User'

export interface IProfileRepository {
  findByUsername(username: string): Promise<User | null>
  findByUserId(userId: string): Promise<User | null>
  updateProfile(userId: string, updates: Partial<User>): Promise<User>
  updateSocialLinks(userId: string, links: SocialLinks): Promise<User>
  updatePrivacySettings(userId: string, privacy: PrivacySettings): Promise<User>
  updateNotificationSettings(userId: string, notifications: NotificationSettings): Promise<User>
  getUserSettings(userId: string): Promise<UserSettings | null>
  updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings>
  uploadAvatar(userId: string, file: File): Promise<string>
  deleteAvatar(userId: string): Promise<void>
  checkUsernameAvailability(username: string, excludeUserId?: string): Promise<boolean>
}