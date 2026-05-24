import { User, SocialLinks, PrivacySettings, NotificationSettings, UserSettings } from '@/core/entities/User'

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
  findById(userId: string): Promise<User | null>  // 👈 This already exists
  checkUsernameAvailability(username: string, excludeUserId?: string): Promise<boolean>
  updateProfile(userId: string, data: Partial<User>): Promise<User>
  updateSocialLinks(userId: string, links: SocialLinks): Promise<User>
  updatePrivacySettings(userId: string, privacy: PrivacySettings): Promise<User>
  updateNotificationSettings(userId: string, notifications: NotificationSettings): Promise<User>
  getUserSettings(userId: string): Promise<UserSettings | null>
  updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings>
  uploadAvatar(userId: string, file: File): Promise<string>
  deleteAvatar(userId: string): Promise<void>
  getFollowStats(userId: string): Promise<{ followers: number, following: number }>
}
