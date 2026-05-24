export interface SocialLinks {
  github?: string | null
  twitter?: string | null
  linkedin?: string | null
  website?: string | null
}

export interface PrivacySettings {
  isPrivate: boolean
  showEmail: boolean
}

export interface NotificationSettings {
  emailNotifications: boolean
}

export interface User {
  id: string
  email: string
  username: string
  fullName: string | null
  avatarUrl: string | null
  bio: string | null
  location: string | null
  occupation: string | null
  socialLinks: SocialLinks
  privacy: PrivacySettings
  notifications: NotificationSettings
  emailConfirmed: boolean
  createdAt: Date
  updatedAt: Date
  followersCount?: number
  followingCount?: number
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system'
  language: string
  aiModelPreference?: string
}