export interface UpdateProfileDTO {
  fullName?: string | null
  bio?: string | null
  location?: string | null
  occupation?: string | null
  avatarUrl?: string | null
}

export interface UpdateSocialLinksDTO {
  github?: string | null
  twitter?: string | null
  linkedin?: string | null
  website?: string | null
}

export interface UpdatePrivacyDTO {
  isPrivate: boolean
  showEmail: boolean
}

export interface UpdateNotificationsDTO {
  emailNotifications: boolean
}

export interface UpdateUserSettingsDTO {
  theme?: 'dark' | 'light' | 'system'
  language?: string
  aiModelPreference?: string
}

export interface ProfileResponse {
  success: boolean
  data?: any
  error?: string
}